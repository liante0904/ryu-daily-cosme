import { Square } from 'lucide-react';
import type { ServerProgress } from '../hooks/useKeywords';

type GenerationProgressProps = {
  progress: ServerProgress;
  isRequestActive?: boolean;
  onCancel: () => Promise<void>;
  compact?: boolean;
};

export function GenerationProgress({ progress, isRequestActive = false, onCancel, compact = false }: GenerationProgressProps) {
  const isGenerating = isRequestActive || progress.status === 'running' || progress.status === 'cancelling';
  const isCancelling = progress.status === 'cancelling';
  const percent = progress.total > 0 ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;
  if (!isGenerating) return null;

  return (
    <div className={compact ? 'generation-progress generation-progress-compact' : 'generation-progress'}>
      <div className="generation-progress-header">
        <strong>CSV 생성 중</strong>
        <button className="text-btn cancel-btn" onClick={onCancel} disabled={isCancelling}>
          <Square size={12} /> {isCancelling ? '중단 처리 중' : '생성 중단'}
        </button>
      </div>
      <div className="generation-progress-count">
        {progress.total > 0 ? `${progress.current} / ${progress.total}` : '준비 중'}
      </div>
      {!compact && <div className="server-progress-track" role="progressbar" aria-valuenow={progress.current} aria-valuemin={0} aria-valuemax={progress.total || 1}>
        <div className="server-progress-bar" style={{ width: `${percent}%` }} />
      </div>}
      {!compact && <div className="server-progress-percent">{percent}%</div>}
      <div className="generation-progress-keyword">{progress.keyword || '서버 작업을 시작하는 중입니다.'}</div>
      <div className="loading-spinner">데이터를 가져오는 중입니다...</div>
    </div>
  );
}
