import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import VideoGrid from './components/VideoGrid';
import IdeaGrid from './components/IdeaGrid';
import ScriptGenerator from './components/ScriptGenerator';
import { TrendAnalysisResult, SearchParams, LoadingState } from './types';
import { analyzeTrends } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [data, setData] = useState<TrendAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<SearchParams | null>(null);
  
  // State for Script Generator
  const [selectedIdeaIdx, setSelectedIdeaIdx] = useState<number | null>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Reset selection when new data arrives
    if (status === LoadingState.SUCCESS) {
      setSelectedIdeaIdx(null);
      setIsScriptModalOpen(false);
    }
  }, [data, status]);

  const handleAnalyze = async (params: SearchParams) => {
    setStatus(LoadingState.LOADING);
    setError(null);
    setCurrentParams(params); // Store current search params
    setSelectedIdeaIdx(null); // Reset selection on new search
    try {
      const result = await analyzeTrends(params);
      setData(result);
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "트렌드를 가져오는 중 예상치 못한 오류가 발생했습니다.");
      setStatus(LoadingState.ERROR);
    }
  };

  const handleOpenScript = () => {
    if (selectedIdeaIdx !== null) {
      setIsScriptModalOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Fixed Sidebar */}
      <Sidebar onAnalyze={handleAnalyze} isAnalyzing={status === LoadingState.LOADING} />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-80 p-4 md:p-8 lg:p-12 transition-all duration-300 relative">
        
        {/* State: Idle / Welcome */}
        {status === LoadingState.IDLE && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-20">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">분석할 준비가 되셨나요?</h2>
            <p className="text-gray-500 max-w-md">
              사이드바에 틈새 키워드를 입력하여 Gemini가 제공하는 실시간 유튜브 트렌드, 인기 동영상, 그리고 바이럴 콘텐츠 아이디어를 발견하세요.
            </p>
          </div>
        )}

        {/* State: Error */}
        {status === LoadingState.ERROR && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md my-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">분석 실패</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-2 text-xs">API 키 문제일 수 있습니다. Gemini API 키와 YouTube API 키(사용 시)가 올바른지 확인하세요.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State: Success / Loading */}
        {status === LoadingState.SUCCESS && data && (
          <div className="animate-fade-in-up pb-20">
            <DashboardHeader data={data} searchParams={currentParams} />
            
            <div className="border-t border-gray-200 my-8"></div>
            <VideoGrid videos={data.relatedVideos} />
            
            <div className="border-t border-gray-200 my-8"></div>
            <IdeaGrid 
              ideas={data.contentIdeas} 
              selectedIdx={selectedIdeaIdx}
              onSelect={setSelectedIdeaIdx}
              onOpenScript={handleOpenScript}
            />
            
            {/* Modal - Conditionally Rendered */}
            {isScriptModalOpen && selectedIdeaIdx !== null && (
              <ScriptGenerator 
                selectedIdea={data.contentIdeas[selectedIdeaIdx]} 
                onClose={() => setIsScriptModalOpen(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;