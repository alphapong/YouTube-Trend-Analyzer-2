import { GoogleGenAI, Tool } from "@google/genai";
import { TrendAnalysisResult, VideoItem, SearchParams, ContentIdea } from "../types";
import { searchYouTubeVideos } from "./youtubeService";

// Store API key in module scope for script generation
let currentApiKey = '';

export const setGeminiApiKey = (key: string) => {
  currentApiKey = key;
};

// Helper to extract YouTube Video ID robustly (Fallback method)
const extractVideoId = (url: string): string => {
  if (!url) return '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v') || '';
    }
  } catch (e) {
    // Ignore
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export const analyzeTrends = async (params: SearchParams): Promise<TrendAnalysisResult> => {
  const { keyword, language, dateRange, youtubeApiKey, geminiApiKey } = params;

  if (!geminiApiKey) {
    throw new Error("Gemini API 키가 누락되었습니다.");
  }

  // Store for later use in script generation
  setGeminiApiKey(geminiApiKey);
  
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  const modelId = "gemini-2.5-flash";
  
  // Decide whether to ask Gemini for videos or just analysis
  // If we have a YouTube API Key, we don't need Gemini to halluncinate video lists as much.
  const askForVideos = !youtubeApiKey; 

  const videoInstruction = askForVideos 
    ? `
      "relatedVideos": [ 
        {
          "title": string, 
          "channel": string, 
          "views": string, 
          "publishedDate": string, 
          "url": string (Must be a valid https://www.youtube.com/watch?v= link found via search),
          "duration": string 
        } 
      ] (Find 12 real trending videos via Google Search),`
    : `"relatedVideos": [], (Leave empty, I will populate this from external API)`;

  const prompt = `
    You are a YouTube Trend Expert. Analyze the current trends for the keyword "${keyword}" in the language "${language}" considering the timeframe "${dateRange}".
    
    ${askForVideos ? 'Use Google Search to find REAL, existing YouTube videos.' : ''}

    Return the result strictly as a JSON object (inside a markdown code block) with the following structure.
    IMPORTANT: Write the 'summary' and 'contentIdeas' in KOREAN (한국어).

    {
      "growthScore": number (0-100),
      "competitionLevel": string ("Low", "Medium", "High", "Very High"),
      "summary": string (a concise paragraph summarizing the trend in Korean),
      "trendTopics": [ {"topic": string, "score": number (0-100)} ] (top 5 related sub-topics),
      ${videoInstruction}
      "contentIdeas": [
        {"title": string, "hook": string, "description": string, "type": string}
      ] (generate 8 viral content ideas in Korean based on the analysis)
    }
  `;

  // Only use tools if we don't have a YouTube Key or need grounding for the summary
  // We always use grounding for better summary accuracy
  const tools: Tool[] = [{ googleSearch: {} }];

  try {
    // 1. Run Gemini Request
    const geminiPromise = ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: tools,
        temperature: 0.7,
      }
    });

    // 2. Run YouTube API Request (if key exists) in parallel
    // Request 12 videos explicitly
    const youtubePromise = youtubeApiKey 
      ? searchYouTubeVideos(youtubeApiKey, keyword, 12) 
      : Promise.resolve([]);

    const [response, realVideos] = await Promise.all([geminiPromise, youtubePromise]);

    const text = response.text;
    if (!text) throw new Error("Gemini 응답 없음");

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    const parsedData = JSON.parse(jsonString);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.map((chunk) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
      .filter((item): item is { uri: string; title: string } => item !== null) || [];

    // 3. Merge Data
    let finalVideos: VideoItem[] = [];

    if (youtubeApiKey && realVideos.length > 0) {
      // Use Real Data
      finalVideos = realVideos;
    } else {
      // Use Gemini Data (Fallback)
      finalVideos = (parsedData.relatedVideos || []).map((v: any) => {
        let url = v.url;
        if (url && !url.startsWith('http')) url = `https://${url}`;
        const videoId = extractVideoId(url || '');
        const safeUrl = (url && videoId) ? url : `https://www.youtube.com/results?search_query=${encodeURIComponent(v.title || keyword)}`;
        
        return {
          title: v.title || "제목 없음",
          channel: v.channel || "정보 없음",
          views: v.views || "-",
          publishedDate: v.publishedDate || "-",
          url: safeUrl,
          duration: v.duration || "00:00",
          videoId: videoId
        };
      });
    }

    return {
      growthScore: parsedData.growthScore || 50,
      competitionLevel: parsedData.competitionLevel || 'Medium',
      summary: parsedData.summary || "분석 완료",
      trendTopics: parsedData.trendTopics || [],
      relatedVideos: finalVideos,
      contentIdeas: parsedData.contentIdeas || [],
      sources
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const generateVideoScript = async (idea: ContentIdea, targetLength: number = 1500, scriptStyle: string = '나레이션'): Promise<string> => {
  if (!currentApiKey) {
    throw new Error("API 키가 없습니다. 먼저 트렌드 분석을 실행해주세요.");
  }
  
  const ai = new GoogleGenAI({ apiKey: currentApiKey });
  const modelId = "gemini-2.5-flash";

  // Calculate acceptable range (Target +/- 150 characters)
  const minLen = Math.max(300, targetLength - 150);
  const maxLen = targetLength + 150;

  const prompt = `
    You are a professional YouTube Script Writer.
    Write a **pure spoken script** (Narration/Dialogue ONLY) in KOREAN (한국어).

    ### Input Details
    - Title: ${idea.title}
    - Style: ${scriptStyle}
    - Target Length: **${targetLength} characters** (Strict Range: ${minLen} ~ ${maxLen})

    ### Structure Instructions (Ki-Seung-Jeon-Gyeol 5-Part Structure)
    Organize the script into **5 distinct paragraphs** (separated by blank lines).
    
    1. **Hook (후킹)**: 
       - Start with a shocking fact, provocative question, or a counter-intuitive statement.
       - **Crucial**: Hint at a "twist" or "secret" to be revealed later to create a curiosity gap (e.g., "But the truth is opposite...").
    
    2. **Ki (기 - Setup)**: 
       - Introduce the topic and context. Why is this important now?
    
    3. **Seung (승 - Rising)**: 
       - The core content. Detailed explanation, storytelling, or examples. 
       - This should be the longest section to meet the character count.
    
    4. **Jeon (전 - Twist/Turn)**: 
       - A surprising insight, a hidden pro-tip, or a reversal of common belief. 
       - "Most people think X, but actually Y."
    
    5. **Gyeol (결 - Resolution)**: 
       - Summary of key points.
       - Clear Call to Action (Subscribe, Like, Check description).

    ### Formatting Rules (Strict)
    - **Output ONLY the Korean spoken text.** 
    - **DO NOT use headers** like "### Hook" or "Part 1".
    - **DO NOT use scene cues** like [Visual], (Audio), <Cut to>.
    - **DO NOT use English explanations.**
    - Just pure paragraphs of text to be read aloud.
    - Ensure the total length is within the ${minLen} ~ ${maxLen} character range.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        temperature: 0.8, 
      }
    });

    return response.text || "대본 생성에 실패했습니다.";
  } catch (error) {
    console.error("Script Generation Error:", error);
    throw error;
  }
};
