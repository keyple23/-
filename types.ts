
export interface RankEntry {
  id: string;
  keyword: string;
  targetUrl: string;
  // Use '미노출' to match the service return type
  rank: number | '미노출' | 'Checking...';
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp?: string;
}

export interface CheckerStats {
  total: number;
  completed: number;
  top3: number;
  top10: number;
  outOfRank: number;
}