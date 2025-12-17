import { VideoItem } from '../types';

// Helper to format ISO 8601 duration (PT1H2M10S -> 1:02:10)
const parseDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  let result = '';
  if (hours) result += `${hours}:`;
  result += `${hours ? minutes.padStart(2, '0') : minutes || '0'}:`;
  result += seconds.padStart(2, '0');

  return result;
};

// Helper to format view counts
const formatViews = (viewCount: string): string => {
  const num = parseInt(viewCount, 10);
  if (isNaN(num)) return viewCount;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const searchYouTubeVideos = async (apiKey: string, keyword: string, maxResults: number = 12): Promise<VideoItem[]> => {
  try {
    // 1. Search for videos (get IDs)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=${maxResults}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      console.warn('YouTube Search API Error:', searchData);
      return [];
    }

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // 2. Get video details (contentDetails for duration, statistics for views)
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (!detailsRes.ok) {
      console.warn('YouTube Details API Error:', detailsData);
      return [];
    }

    // Map to VideoItem
    return detailsData.items.map((item: any) => {
      const snippet = item.snippet;
      const stats = item.statistics;
      
      return {
        title: snippet.title,
        channel: snippet.channelTitle,
        views: formatViews(stats.viewCount || '0'),
        publishedDate: new Date(snippet.publishedAt).toLocaleDateString(),
        url: `https://www.youtube.com/watch?v=${item.id}`,
        videoId: item.id,
        duration: parseDuration(item.contentDetails.duration)
      };
    });

  } catch (error) {
    console.error("Failed to fetch YouTube data", error);
    return [];
  }
};