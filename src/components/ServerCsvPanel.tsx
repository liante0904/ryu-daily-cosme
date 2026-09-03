import { Download, RefreshCw, Square } from 'lucide-react';
import type { ServerCsvFile, ServerProgress } from '../hooks/useKeywords';

type ServerCsvPanelProps = {
  files: ServerCsvFile[];
  progress: ServerProgress;
  onRefresh: () => void;
  onCancel: () => Promise<void>;
  onDownload: (filename: string) => void;
};

export function ServerCsvPanel({ files, progress, onRefresh, onCancel, onDownload }: ServerCsvPanelProps) {
  const isRunning = progress.status === 'running' || progress.status === 'cancelling';
  const isCancelling = progress.status === 'cancelling';
  const progressPercent = progress.total > 0
    ? Math.min(100, Math.round((progress.current / progress.total) * 100))
    : 0;

  const handleCancel = async () => {
    await onCancel();
  };

  return (
    <div className="server-files-panel">
      {isRunning && (
        <div className="server-progress-panel">
          <div className="server-progress-header">
            <strong>CSV 생성 중</strong>
            <button className="text-btn cancel-btn" onClick={handleCancel} disabled={isCancelling}>
              <Square size={12} /> {isCancelling ? '중단 처리 중' : '생성 중단'}
            </button>
          </div>
          {isCancelling && <div className="server-cancelling-message">중단 요청 전송됨 · 현재 요청이 끝나면 생성을 중단합니다.</div>}
          <div className="server-progress-count">
            {progress.current} / {progress.total}
          </div>
          <div className="server-progress-track" role="progressbar" aria-valuenow={progress.current} aria-valuemin={0} aria-valuemax={progress.total}>
            <div className="server-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="server-progress-percent">{progressPercent}%</div>
          <div className="server-progress-keyword">{progress.keyword || '준비 중'}</div>
          <div className="server-progress-loading">데이터를 가져오는 중입니다...</div>
        </div>
      )}

      <div className="server-files-header">
        <div>
          <h4>서버 저장 CSV</h4>
          <span>5분마다 자동 갱신 · 재접속 후에도 다운로드 가능</span>
        </div>
        <button className="text-btn" onClick={onRefresh} title="파일 목록 새로고침">
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>
      {progress.status === 'completed' && progress.message && (
        <div className="server-progress-message">최근 생성 완료: {progress.message}</div>
      )}
      {progress.status === 'cancelled' && (
        <div className="server-progress-message server-cancelled-message">생성이 중단되었습니다. 새 CSV는 저장되지 않았습니다.</div>
      )}
      {progress.status === 'interrupted' && progress.message && (
        <div className="server-progress-message server-cancelled-message">{progress.message}</div>
      )}
      {files.length > 0 ? (
        <div className="server-file-list">
          {files.map((file) => (
            <button key={file.filename} className="server-file-item" onClick={() => onDownload(file.filename)}>
              <Download size={15} />
              <span className="server-file-name">{file.filename}</span>
              <span className="server-file-date">{new Date(file.created_at * 1000).toLocaleString('ko-KR')}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="server-files-empty">저장된 CSV 파일이 없습니다.</div>
      )}
    </div>
  );
}
