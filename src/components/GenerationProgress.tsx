import { useEffect, useRef, useState } from 'react';
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
  const isCompleted = progress.status === 'completed';
  const isCancelled = progress.status === 'cancelled';
  const isUnknown = progress.status === 'unknown';
  const startedAtRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    if (!isGenerating) return;
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
    const updateElapsed = () => {
      const now = Date.now();
      setCurrentTime(now);
      setElapsedSeconds(Math.floor((now - (startedAtRef.current || now)) / 1000));
    };
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [isGenerating]);
  if (!isGenerating && !isCompleted && !isCancelled && !isUnknown) return null;

  const title = isGenerating ? (isCancelling ? '생성 중단 처리 중' : 'CSV 생성 중')
    : isCompleted ? 'CSV 생성 완료' : isCancelled ? 'CSV 생성 취소됨' : '생성 상태 확인 필요';
  const detail = isGenerating
    ? (progress.keyword ? `현재 조회 중: ${progress.keyword}` : progress.message || '서버 작업을 시작하는 중입니다.')
    : (isCompleted
      ? `${progress.message || 'CSV 파일이 생성되었습니다.'} · 오른쪽 서버 저장 CSV 목록에 반영되었습니다.`
      : progress.message || (isCancelled ? '사용자가 생성을 중단했습니다.' : '서버 상태를 확인해 주세요.'));
  const elapsedLabel = `${Math.floor(elapsedSeconds / 60)}분 ${String(elapsedSeconds % 60).padStart(2, '0')}초 경과`;
  const hasEstimate = isGenerating && progress.total > 0 && progress.current > 0 && progress.current < progress.total;
  const remainingSeconds = hasEstimate
    ? Math.ceil((elapsedSeconds / progress.current) * (progress.total - progress.current))
    : 0;
  const expectedTime = hasEstimate && currentTime > 0 ? new Date(currentTime + remainingSeconds * 1000) : null;
  const expectedLabel = expectedTime
    ? `예상 다운로드 가능: 약 ${Math.max(1, Math.ceil(remainingSeconds / 60))}분 후 (${expectedTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`
    : isGenerating ? '첫 키워드 처리 후 예상 다운로드 시간을 계산합니다.' : '';

  return (
    <div className={compact ? 'generation-progress generation-progress-compact' : 'generation-progress'}>
      <div className="generation-progress-header">
        <strong>{title}</strong>
        {isGenerating && <button className="text-btn cancel-btn" onClick={onCancel} disabled={isCancelling}>
          <Square size={12} /> {isCancelling ? '중단 처리 중' : '생성 중단'}
        </button>}
      </div>
      <div className="generation-progress-count">
        {progress.total > 0
          ? progress.current > 0 ? `${progress.current} / ${progress.total}개 키워드` : '기본 검색량 수집 중'
          : '서버 준비 중'}
      </div>
      {!compact && isGenerating && <div className="server-progress-track" role="progressbar" aria-valuenow={progress.current} aria-valuemin={0} aria-valuemax={progress.total || 1}>
        <div className="server-progress-bar" style={{ width: `${percent}%` }} />
      </div>}
      {!compact && isGenerating && <div className="server-progress-percent">{percent}%</div>}
      <div className="generation-progress-keyword">{detail}</div>
      {(isGenerating || isCompleted) && <div className="generation-progress-elapsed">{elapsedLabel}</div>}
      {isGenerating && <div className="generation-progress-eta">{expectedLabel}</div>}
      {isGenerating && <div className="loading-spinner">네이버 조회 → CSV 저장 후, 페이지를 열어두면 CSV 다운로드가 자동으로 시작됩니다.</div>}
    </div>
  );
}
