import React, { useState, useEffect } from 'react';
import { ContentIdea } from '../types';
import { generateVideoScript } from '../services/geminiService';

interface ScriptGeneratorProps {
  selectedIdea: ContentIdea | null;
  onClose: () => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ selectedIdea, onClose }) => {
  const [script, setScript] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLength, setTargetLength] = useState<number>(1500);
  const [scriptStyle, setScriptStyle] = useState<string>('나레이션');

  const styles = [
    { id: '1인칭', label: '1인칭 (Vlog/유튜버)', desc: '내가 경험한 것처럼 이야기합니다.' },
    { id: '3인칭', label: '3인칭 (관찰자)', desc: '객관적인 사실 위주로 전달합니다.' },
    { id: '나레이션', label: '나레이션 (성우)', desc: '화면 해설 및 정보 전달에 적합합니다.' },
    { id: '진행자', label: '진행자 (MC)', desc: '쇼를 진행하듯 활기차게 말합니다.' }
  ];

  useEffect(() => {
    // Reset state when opening new idea
    setScript("");
    setError(null);
    setIsLoading(false);
    setScriptStyle('나레이션'); // Default style
  }, [selectedIdea]);

  const handleGenerate = async () => {
    if (!selectedIdea) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateVideoScript(selectedIdea, targetLength, scriptStyle);
      setScript(result);
    } catch (err) {
      setError("대본 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script).then(() => {
      alert("대본이 클립보드에 복사되었습니다!");
    });
  };

  // If no idea is selected, don't render (safety check, though parent handles this)
  if (!selectedIdea) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()} // Prevent close on clicking content
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-indigo-900 p-6 text-white flex-shrink-0 flex justify-between items-start">
          <div className="pr-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              AI 대본 생성기 (Script Generator)
            </h2>
            <div className="mt-2 text-indigo-100 text-sm opacity-90">
              <span className="font-semibold text-indigo-300">주제:</span> {selectedIdea.title}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
          
          {/* Action Bar (Only visible if no script yet or needs regeneration) */}
          {!script && !isLoading && (
             <div className="flex flex-col items-center justify-center py-6 space-y-6">
                
                <div className="text-center max-w-2xl w-full">
                  <div className="mb-8">
                     <h3 className="text-xl font-bold text-gray-800 mb-2">대본 설정</h3>
                     <p className="text-gray-500 text-sm">원하는 길이와 스타일을 선택하면 AI가 맞춤형 대본을 작성해드립니다.</p>
                  </div>

                  {/* Settings Container */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-left space-y-6">
                    
                    {/* Character Count Input */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        목표 글자수 (Target Length)
                      </label>
                      <div className="flex items-center gap-3 mb-3">
                        <input 
                          type="number" 
                          value={targetLength}
                          onChange={(e) => setTargetLength(Number(e.target.value))}
                          step={100}
                          min={300}
                          max={10000}
                          className="flex-1 appearance-none border border-gray-300 rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <span className="text-gray-500 text-sm font-medium whitespace-nowrap">자 (약 {Math.round(targetLength / 300)}분 내외)</span>
                      </div>
                      <div className="flex gap-2">
                        {[500, 1500, 3000].map(val => (
                          <button 
                            key={val}
                            onClick={() => setTargetLength(val)}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                              targetLength === val 
                              ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold' 
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {val === 500 ? '쇼츠 (500자)' : val === 1500 ? '기본 (1500자)' : '긴 영상 (3000자)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Script Style Selector */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        대본 스타일 (Format)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {styles.map((style) => (
                          <div 
                            key={style.id}
                            onClick={() => setScriptStyle(style.id)}
                            className={`
                              cursor-pointer rounded-lg border p-3 transition-all duration-200
                              ${scriptStyle === style.id 
                                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold text-sm ${scriptStyle === style.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                                {style.label}
                              </span>
                              {scriptStyle === style.id && (
                                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{style.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-lg font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    선택한 설정으로 대본 생성하기
                  </button>
                </div>
             </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center border border-red-200">
              <p className="font-bold">오류 발생</p>
              <p className="text-sm">{error}</p>
              <button onClick={handleGenerate} className="mt-2 text-red-700 underline text-sm">다시 시도하기</button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6 p-4">
              <div className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-indigo-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                   <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
                   <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="flex justify-center mt-8 text-center flex-col">
                 <p className="text-indigo-600 font-bold text-lg animate-pulse">AI가 대본을 작성 중입니다...</p>
                 <p className="text-indigo-400 text-sm mt-1">
                   목표 글자수({targetLength}자) • 스타일({scriptStyle})
                 </p>
              </div>
            </div>
          )}

          {/* Script Result */}
          {script && (
            <div className="relative animate-fade-in">
              <div className="absolute top-0 right-0 z-10">
                 <button 
                   onClick={copyToClipboard}
                   className="text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center"
                 >
                   <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                   전체 복사
                 </button>
              </div>
              
              <div className="prose prose-indigo max-w-none bg-white p-8 rounded-lg shadow-sm border border-gray-100 whitespace-pre-line">
                {script}
              </div>

              <div className="mt-8 flex justify-center pb-4 gap-4">
                 <button onClick={() => setScript("")} className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors">
                    다시 설정하기
                 </button>
                 <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-800 underline text-sm">
                    닫기
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptGenerator;