export interface ApiResult {
  message?: string;
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

export type ServerCsvFile = {
  filename: string;
  size: number;
  created_at: number;
};

export type ServerProgress = {
  status: 'idle' | 'running' | 'completed' | 'cancelled' | 'unknown' | string;
  current: number;
  total: number;
  keyword: string;
  message: string;
  phase?: string;
  phase_current?: number;
  phase_total?: number;
  overall_current?: number;
  overall_total?: number;
  batch_current?: number;
  batch_total?: number;
  wait_remaining_seconds?: number;
  estimated_remaining_seconds?: number | null;
  updated_at?: number;
};
