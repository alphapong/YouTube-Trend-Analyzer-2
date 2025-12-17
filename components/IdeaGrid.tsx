import React from 'react';
import { ContentIdea } from '../types';

interface IdeaGridProps {
  ideas: ContentIdea[];
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
  onOpenScript: () => void;
}

const IdeaGrid: React.FC<IdeaGridProps> = ({ ideas, selectedIdx, onSelect, onOpenScript }) => {
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="bg-yellow-100 p-2 rounded-lg mr-3">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
          </span>
          주간 콘텐츠 아이디어 (AI 생성)
        </h2>
        
        <div className="w-full sm:w-auto">
          {selectedIdx !== null ? (
            <button 
              onClick={onOpenScript}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center animate-fade-in"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              대본 생성하기
            </button>
          ) : (
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full inline-block">
              👆 아이디어를 선택하면 대본 생성이 가능합니다
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ideas.map((idea, idx) => {
          const isSelected = selectedIdx === idx;
          
          return (
            <div 
              key={idx} 
              onClick={() => onSelect(idx)}
              className={`
                relative rounded-xl shadow-lg p-6 text-white cursor-pointer transition-all duration-300 overflow-hidden transform
                ${isSelected 
                  ? 'bg-gradient-to-br from-indigo-700 to-purple-800 ring-4 ring-offset-2 ring-indigo-500 scale-[1.02]' 
                  : 'bg-gradient-to-br from-violet-600 to-indigo-700 hover:-translate-y-1 hover:shadow-xl'
                }
              `}
            >
              {/* Selection Checkmark Overlay */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-20 bg-white text-indigo-600 rounded-full p-1 shadow-md">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              )}

              {/* Card Decor */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isSelected ? 'bg-white text-indigo-700' : 'bg-white bg-opacity-20'}`}>
                  아이디어 #{idx + 1}
                </span>
                {!isSelected && (
                   <svg className="w-5 h-5 text-yellow-300 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                )}
              </div>

              <h3 className="text-lg font-bold mb-3 leading-snug relative z-10 min-h-[56px]">
                {idea.title}
              </h3>

              <div className="space-y-3 relative z-10">
                <div className={`rounded-lg p-3 ${isSelected ? 'bg-black bg-opacity-30' : 'bg-black bg-opacity-20'}`}>
                  <span className="block text-xs text-indigo-200 uppercase font-semibold mb-1">훅 (Hook)</span>
                  <p className="text-sm italic opacity-90">"{idea.hook}"</p>
                </div>
                
                <div>
                  <span className="block text-xs text-indigo-200 uppercase font-semibold mb-1">설명</span>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {idea.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white border-opacity-10 flex items-center justify-between relative z-10">
                <span className="text-xs font-medium text-indigo-100 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                  유형: {idea.type || 'Video'}
                </span>
                <span className={`text-xs ${isSelected ? 'text-white font-bold' : 'text-indigo-200 opacity-0 group-hover:opacity-100'}`}>
                  {isSelected ? '선택됨' : '클릭하여 선택'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IdeaGrid;