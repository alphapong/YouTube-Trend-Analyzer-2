export interface TrendTopic {
  topic: string;
  score: number;
}

export interface VideoItem {
  title: string;
  channel: string;
  views: string;
  publishedDate: string;
  url: string;
  videoId: string;
  duration: string;
}

export interface ContentIdea {
  title: string;
  hook: string;
  description: string;
  type: string;
}

export interface TrendAnalysisResult {
  growthScore: number;
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
  geminiApiKey: string;
  youtubeApiKey?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
