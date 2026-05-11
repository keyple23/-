
import React from 'react';
import { RankEntry } from '../types';

interface RankingTableProps {
  data: RankEntry[];
}

export const RankingTable: React.FC<RankingTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  const getRankBadge = (rank: number | '미노출' | 'Checking...') => {
    if (rank === 'Checking...') {
      return <span className="text-slate-400 italic">확인 중...</span>;
    }
    // Fix: Consolidate 'unranked' status to '미노출' and remove 'N/A' check
    if (rank === '미노출') {
      return <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100">미노출</span>;
    }
    if (typeof rank === 'number') {
      if (rank <= 3) {
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded border border-green-200">TOP {rank}</span>;
      }
      if (rank <= 10) {
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded border border-blue-200">{rank}위</span>;
      }
      return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200">{rank}위</span>;
    }
    return <span className="text-slate-400 italic">확인 불가</span>;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200 mt-8">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">키워드</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">대상 URL</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">순위 (1-20위)</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((item, idx) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">{idx + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{item.keyword}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 truncate max-w-xs" title={item.targetUrl}>
                {item.targetUrl}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getRankBadge(item.rank)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.status === 'completed' && <span className="text-green-500 text-sm font-medium">● 완료</span>}
                {item.status === 'processing' && <span className="text-blue-500 animate-pulse text-sm font-medium">● 처리중</span>}
                {item.status === 'pending' && <span className="text-slate-300 text-sm font-medium">● 대기</span>}
                {item.status === 'error' && <span className="text-red-500 text-sm font-medium">● 오류</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};