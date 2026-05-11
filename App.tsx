
import React, { useState, useMemo } from 'react';
import { InputSection } from './components/InputSection';
import { RankingTable } from './components/RankingTable';
import { checkNaverRank } from './services/geminiService';
import { RankEntry, CheckerStats } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<RankEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const stats = useMemo<CheckerStats>(() => {
    const total = results.length;
    const completed = results.filter(r => r.status === 'completed').length;
    const top3 = results.filter(r => typeof r.rank === 'number' && r.rank <= 3).length;
    const top10 = results.filter(r => typeof r.rank === 'number' && r.rank <= 10).length;
    // Fix: Remove comparison with 'N/A' as it is no longer in the type definition
    const outOfRank = results.filter(r => r.rank === '미노출').length;

    return { total, completed, top3, top10, outOfRank };
  }, [results]);

  const handleStart = async (keywords: string[], urls: string[]) => {
    const maxItems = Math.min(keywords.length, urls.length, 800);
    const initialResults: RankEntry[] = [];
    
    for (let i = 0; i < maxItems; i++) {
      initialResults.push({
        id: Math.random().toString(36).substr(2, 9),
        keyword: keywords[i],
        targetUrl: urls[i],
        rank: 'Checking...',
        status: 'pending',
      });
    }

    setResults(initialResults);
    setIsProcessing(true);
    setProgress(0);

    for (let i = 0; i < maxItems; i++) {
      setResults(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'processing' } : item
      ));

      try {
        const rank = await checkNaverRank(keywords[i], urls[i]);
        setResults(prev => prev.map((item, idx) => 
          idx === i ? { ...item, rank, status: 'completed' } : item
        ));
      } catch (error) {
        setResults(prev => prev.map((item, idx) => 
          // Fix: '미노출' is now a valid value for the rank property
          idx === i ? { ...item, rank: '미노출', status: 'error' } : item
        ));
      }
      
      setProgress(Math.round(((i + 1) / maxItems) * 100));
    }

    setIsProcessing(false);
  };

  const handleExport = () => {
    if (results.length === 0) return;
    
    const headers = ['#', 'Keyword', 'URL', 'Rank', 'Status'];
    const rows = results.map((r, idx) => [
      idx + 1,
      r.keyword,
      r.targetUrl,
      r.rank,
      r.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `naver_ranks_top20_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50">
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-600 p-2 rounded-lg shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Naver <span className="text-green-600">Rank</span> Pro</h1>
        </div>
        <p className="text-slate-500 font-medium">20위 권내 네이버 대량 순위 체크 - 엑셀 복사/붙여넣기 최적화</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <InputSection onStart={handleStart} isProcessing={isProcessing} />

        {results.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isProcessing && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-green-600 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(22,163,74,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="총 키워드" value={stats.total} color="slate" />
              <StatCard label="체크 완료" value={stats.completed} color="green" />
              <StatCard label="TOP 3" value={stats.top3} color="yellow" />
              <StatCard label="TOP 10" value={stats.top10} color="blue" />
              <StatCard label="미노출 (20위 밖)" value={stats.outOfRank} color="red" />
            </div>

            <div className="flex justify-between items-center px-2 pt-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                분석 결과
                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Top 20 Only</span>
              </h2>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                엑셀(CSV) 저장
              </button>
            </div>

            <RankingTable data={results} />
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm mb-10">
        &copy; {new Date().getFullYear()} Naver Rank Pro. SEO Dashboard.
      </footer>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  color: 'green' | 'blue' | 'yellow' | 'slate' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center shadow-sm transition-transform hover:-translate-y-1`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{label}</span>
      <span className="text-2xl font-black">{value}</span>
    </div>
  );
};

export default App;