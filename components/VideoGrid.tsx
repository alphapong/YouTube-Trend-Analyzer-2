import React from 'react';
import { VideoItem } from '../types';

interface VideoGridProps {
  videos: VideoItem[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="bg-red-100 p-2 rounded-lg mr-3">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
        </span>
        참고한 인기 영상 (Top {videos.length})
      </h2>
      
      {/* 
         Changed grid-cols to max 3 on LG screens to match user request: 
         "한줄에 3개씩 4줄로 12개" -> grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, idx) => {
          // Determine Thumbnail URL
          // If we have a videoId, try standard resolution, fallback to placeholder on error
          const hasVideoId = !!video.videoId;
          const thumbnailUrl = hasVideoId 
            ? `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
            : `https://picsum.photos/400/225?random=${idx}`;

          return (
            <a 
              key={idx} 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block cursor-pointer relative z-0"
              onClick={(e) => {
                // Double check URL validity just in case
                if (!video.url || video.url === '#') {
                  e.preventDefault();
                  alert('유효한 동영상 링크를 찾을 수 없습니다.');
                }
              }}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 mb-3 shadow-sm group-hover:rounded-none transition-all duration-200">
                <img 
                  src={thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to random image if YouTube thumbnail fails to load
                    (e.target as HTMLImageElement).src = `https://picsum.photos/400/225?random=${idx}`;
                    // Optionally could set a class to indicate error
                  }}
                />
                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {video.duration || "0:00"}
                </div>
              </div>
              
              {/* Info Container */}
              <div className="flex items-start pr-4">
                 {/* Channel Icon Placeholder (Circle) */}
                 <div className="flex-shrink-0 mr-3 mt-0.5">
                   <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-xs font-bold uppercase select-none">
                     {(video.channel || "?").substring(0, 1)}
                   </div>
                 </div>

                 {/* Text Info */}
                 <div className="flex flex-col">
                   <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-indigo-600 transition-colors" title={video.title}>
                     {video.title}
                   </h3>
                   
                   <div className="text-[12px] text-gray-500">
                     <p className="hover:text-gray-800 transition-colors mb-0.5">{video.channel}</p>
                     <div className="flex items-center">
                       <span>조회수 {video.views}</span>
                       <span className="mx-1">•</span>
                       <span>{video.publishedDate}</span>
                     </div>
                   </div>
                 </div>
              </div>
            </a>
          );
        })}
      </div>
      
      {videos.length === 0 && (
         <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
           <p className="text-gray-500">검색 결과에서 동영상을 찾지 못했습니다.</p>
         </div>
      )}
    </div>
  );
};

export default VideoGrid;