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
  const isCompleted = progress.status === 'completed';
  const isCancelled = progress.status === 'cancelled';
  const isUnknown = progress.status === 'unknown';
  const phaseCurrent = progress.phase_current ?? progress.current;
  const phaseTotal = progress.phase_total ?? progress.total;
  const overallCurrent = progress.overall_current ?? phaseCurrent;
  const overallTotal = progress.overall_total ?? phaseTotal;
  const startedAtRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progressReceivedAt, setProgressReceivedAt] = useState(Date.now());
  useEffect(() => {
    setProgressReceivedAt(Date.now());
  }, [progress.updated_at, progress.estimated_remaining_seconds, progress.wait_remaining_seconds]);
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
  const hasServerEstimate = typeof progress.estimated_remaining_seconds === 'number';
  const hasEstimate = isGenerating && (hasServerEstimate || (overallTotal > 0 && overallCurrent > 0 && overallCurrent < overallTotal));
  const progressAgeSeconds = currentTime > 0 ? Math.max(0, (currentTime - progressReceivedAt) / 1000) : 0;
  const remainingSeconds = hasServerEstimate
    ? Math.max(0, Math.ceil(progress.estimated_remaining_seconds! - progressAgeSeconds))
    : hasEstimate
      ? Math.ceil((elapsedSeconds / overallCurrent) * (overallTotal - overallCurrent))
      : 0;
  const expectedTime = hasEstimate && currentTime > 0 ? new Date(currentTime + remainingSeconds * 1000) : null;
  const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}분 ${String(seconds % 60).padStart(2, '0')}초`;
  const expectedDownloadLabel = expectedTime
    ? `예상 다운로드 가능: 약 ${Math.max(1, Math.ceil(remainingSeconds / 60))}분 후 (${expectedTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`
    : hasEstimate ? 'CSV 저장을 마무리하고 있습니다.' : '처리 속도를 확인해 예상 시간을 계산하고 있습니다.';
  const waitRemainingSeconds = Math.max(0, (progress.wait_remaining_seconds ?? 0) - progressAgeSeconds);
  const expectedLabel = progress.phase === 'batch_wait'
    ? `다음 배치까지 ${formatDuration(waitRemainingSeconds)} 대기 · ${expectedDownloadLabel}`
    : expectedDownloadLabel;

  return (
    <div className={compact ? 'generation-progress generation-progress-compact' : 'generation-progress'}>
      <div className="generation-progress-header">
        <strong>{title}</strong>
        {isGenerating && <button className="text-btn cancel-btn" onClick={onCancel} disabled={isCancelling}>
          <Square size={12} /> {isCancelling ? '중단 처리 중' : '생성 중단'}
        </button>}
      </div>
      <div className="generation-progress-count">
        {phaseTotal > 0
          ? `${phaseCurrent} / ${phaseTotal}개 키워드 · ${progress.phase === 'detail' ? '상세 조회' : progress.phase === 'basic' ? '기본 검색량' : progress.phase === 'batch_wait' ? '배치 간 대기' : 'CSV 처리'}${progress.batch_total ? ` · ${progress.batch_current ?? 0}/${progress.batch_total} 배치` : ''}`
          : '서버 준비 중'}
      </div>
      {!compact && isGenerating && <div className="server-progress-track" role="progressbar" aria-valuenow={overallCurrent} aria-valuemin={0} aria-valuemax={overallTotal || 1}>
        <div className="server-progress-bar" style={{ width: `${overallTotal > 0 ? Math.min(100, Math.round((overallCurrent / overallTotal) * 100)) : 0}%` }} />
      </div>}
      {!compact && isGenerating && <div className="server-progress-percent">전체 단계 {overallCurrent} / {overallTotal} · {overallTotal > 0 ? Math.min(100, Math.round((overallCurrent / overallTotal) * 100)) : 0}%</div>}
      <div className="generation-progress-keyword">{detail}</div>
      {(isGenerating || isCompleted) && <div className="generation-progress-elapsed">{elapsedLabel}</div>}
      {isGenerating && <div className="generation-progress-eta">{expectedLabel}</div>}
      {isGenerating && <div className="loading-spinner">네이버 조회 → CSV 저장 후, 페이지를 열어두면 CSV 다운로드가 자동으로 시작됩니다.</div>}
    </div>
  );
}
