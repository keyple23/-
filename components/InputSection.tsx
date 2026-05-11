
import React, { useState } from 'react';

interface InputSectionProps {
  onStart: (keywords: string[], urls: string[]) => void;
  isProcessing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onStart, isProcessing }) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleProcess = () => {
    const keywords = keywordInput.split('\n').map(s => s.trim()).filter(s => s !== '');
    const urls = urlInput.split('\n').map(s => s.trim()).filter(s => s !== '');
    onStart(keywords, urls);
  };

  const lineCount = (text: string) => text.split('\n').filter(s => s.trim() !== '').length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
            <span>키워드 (최대 800개)</span>
            <span className="text-slate-400 font-normal">{lineCount(keywordInput)} / 800</span>
          </label>
          <textarea
            className="w-full h-64 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
            placeholder="엑셀에서 키워드 열을 복사해서 붙여넣으세요..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
            <span>대상 URL (최대 800개)</span>
            <span className="text-slate-400 font-normal">{lineCount(urlInput)} / 800</span>
          </label>
          <textarea
            className="w-full h-64 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
            placeholder="엑셀에서 URL 열을 복사해서 붙여넣으세요..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isProcessing}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={handleProcess}
          disabled={isProcessing || !keywordInput || !urlInput}
          className={`px-8 py-3 rounded-full font-bold text-white transition-all shadow-lg ${
            isProcessing || !keywordInput || !urlInput
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-green-600 hover:bg-green-700 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              순위 체크 중...
            </div>
          ) : (
            '네이버 순위 대량 체크 시작'
          )}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          * 키워드와 URL은 1:1로 매칭됩니다. 순서가 일치하는지 확인해주세요.
        </p>
      </div>
    </div>
  );
};
