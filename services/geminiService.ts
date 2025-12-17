import { GoogleGenAI, Tool } from "@google/genai";
import { TrendAnalysisResult, VideoItem, SearchParams, ContentIdea } from "../types";
import { searchYouTubeVideos } from "./youtubeService";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

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
  const { keyword, language, dateRange, youtubeApiKey } = params;

  if (!apiKey) {
    throw new Error("Gemini API 키가 누락되었습니다.");
  }

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
  if (!apiKey) {
    throw new Error("API 키가 없습니다.");
  }
  
  const modelId = "gemini-2.5-flash";

  // Calculate acceptable range (Target +/- 150 characters)
  const minLen = Math.max(300, targetLength - 150);
  const maxLen = targetLength + 150;

  const systemInstruction = `
    You are a professional YouTube Script Writer.
    Your goal is to write engaging, viral-worthy scripts in Korean (한국어).
    Always follow the 'Ki-Seung-Jeon-Gyeol' (Introduction, Development, Twist, Conclusion) structure.
  `;

  const prompt = `
    Write a **pure spoken script** (Narration/Dialogue ONLY) in KOREAN (한국어).

    ### Input Details
    - Title: ${idea.title}
    - Style: ${scriptStyle}
    - Target Length: **${targetLength} characters** (Strict Range: ${minLen} ~ ${maxLen})

    ### Structure Instructions (5-Part Structure)
    Organize the script into **5 distinct sections** and **USE HEADERS** for each section to clearly distinguish them.
    
    1. **[후킹]**: 
       - Start with a shocking fact, provocative question, or a counter-intuitive statement.
       - Hint at a "twist" or "secret" to be revealed later.
    
    2. **[기 (Setup)]**: 
       - Introduce the topic and context. Why is this important now?
    
    3. **[승 (Rising)]**: 
       - The core content. Detailed explanation, storytelling, or examples. 
       - This should be the longest section.
    
    4. **[전 (Twist/Turn)]**: 
       - A surprising insight, a hidden pro-tip, or a reversal of common belief. 
    
    5. **[결 (Resolution)]**: 
       - Summary of key points.
       - Clear Call to Action (Subscribe, Like, Check description).

    ### Formatting Rules (Strict)
    - **Language**: Korean (한국어) Only.
    - **Separation**: Use blank lines between sections.
    - **Headers**: You MUST use the exact headers: "[후킹]", "[기 (Setup)]", "[승 (Rising)]", "[전 (Twist)]", "[결 (Resolution)]".
    - **Content**: Under each header, write the spoken script. No stage directions like (Action), [Visual].
    - **Length**: Ensure the total length is within the ${minLen} ~ ${maxLen} character range.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8, 
      }
    });

    return response.text || "대본 생성에 실패했습니다.";
  } catch (error) {
    console.error("Script Generation Error:", error);
    throw error;
  }
};