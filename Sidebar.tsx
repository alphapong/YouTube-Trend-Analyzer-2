import React, { useState } from 'react';
import { SearchParams } from '../types';

interface SidebarProps {
  onAnalyze: (params: SearchParams) => void;
  isAnalyzing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onAnalyze, isAnalyzing }) => {
  const [params, setParams] = useState<SearchParams>({
    language: 'Korean (한국어)',
    keyword: '재테크',
    dateRange: '이번 달',
    videoDuration: '10분 이상',
    geminiApiKey: '',
    youtubeApiKey: ''
  });

  const handleChange = (field: keyof SearchParams, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(params);
  };

  return (
    <aside className="w-full md:w-80 bg-white border-r border-gray-200 h-auto md:h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">유튜브<br/><span className="text-indigo-600">트렌드 분석기</span></h1>
        <p className="text-xs text-gray-500 mb-8">
          Gemini 2.5 기반. 데이터를 분석하여 다음 바이럴 영상을 찾아보세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🌍 타겟 언어
            </label>
            <div className="relative">
              <select 
                value={params.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option>Korean (한국어)</option>
                <option>English (영어)</option>
                <option>Spanish (스페인어)</option>
                <option>Japanese (일본어)</option>
                <option>French (프랑스어)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Keyword Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 키워드 분석
            </label>
            <input 
              type="text" 
              placeholder="예: 홈트, 주식, 여행 브이로그..."
              value={params.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 분석 기간
            </label>
            <div className="relative">
              <select 
                value={params.dateRange}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option>이번 주</option>
                <option>이번 달</option>
                <option>최근 3개월</option>
                <option>올해</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Video Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⏳ 영상 길이
            </label>
            <div className="relative">
              <select 
                value={params.videoDuration}
                onChange={(e) => handleChange('videoDuration', e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option>쇼츠 (1분 미만)</option>
                <option>짧은 영상 (1-5분)</option>
                <option>중간 영상 (5-15분)</option>
                <option>긴 영상 (15분 - 30분)</option>
                <option>장편 영상 (30분 이상)</option>
                <option>초장편 영상 (1시간 이상)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Gemini API Key (Required) */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔑 Gemini API Key <span className="text-red-500">*필수</span>
            </label>
            <input 
              type="password" 
              placeholder="Gemini API Key를 입력하세요"
              value={params.geminiApiKey}
              onChange={(e) => handleChange('geminiApiKey', e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                Google AI Studio
              </a>에서 무료로 발급받을 수 있습니다.
            </p>
          </div>

          {/* YouTube API Key (Optional) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              🎬 YouTube Data API Key (선택)
            </label>
            <input 
              type="password" 
              placeholder="API Key 입력 시 썸네일/링크 정확도 ↑"
              value={params.youtubeApiKey || ''}
              onChange={(e) => handleChange('youtubeApiKey', e.target.value)}
              className="appearance-none border border-gray-200 bg-gray-50 rounded-lg w-full py-2 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              키를 입력하면 실제 유튜브 데이터를 가져옵니다. 미입력 시 AI가 검색합니다.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isAnalyzing || !params.geminiApiKey}
            className={`w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center ${(isAnalyzing || !params.geminiApiKey) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
             {isAnalyzing ? (
               <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 분석 중...
               </>
             ) : (
               <>🚀 분석 시작</>
             )}
          </button>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-amber-700">
                  팁: 유튜브 API 키를 입력하면 "재생할 수 없는 동영상" 문제가 해결됩니다.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </aside>
  );
};

export default Sidebar;