export interface TrendTopic {
  topic: string;
  score: number;
}

export interface VideoItem {
  title: string;
  channel: string;
  views: string;
  publishedDate: string;
  url: string;       // Actual YouTube URL
  videoId: string;   // Extracted ID for thumbnail
  duration: string;  // e.g. "10:05"
}

export interface ContentIdea {
  title: string;
  hook: string;
  description: string;
  type: string;
}

export interface TrendAnalysisResult {
  growthScore: number; // 0-100
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  summary: string;
  trendTopics: TrendTopic[];
  relatedVideos: VideoItem[];
  contentIdeas: ContentIdea[];
  sources?: { uri: string; title: string }[];
}

export interface SearchParams {
  language: string;
  keyword: string;
  dateRange: string;
  videoDuration: string;
  youtubeApiKey?: string; // Optional API Key for Real Data
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}