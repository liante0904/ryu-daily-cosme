import { Download, RefreshCw } from 'lucide-react';
import type { ServerCsvFile, ServerProgress } from '../hooks/useKeywords';
import { GenerationProgress } from './GenerationProgress';

type ServerCsvPanelProps = {
  files: ServerCsvFile[];
  progress: ServerProgress;
  isRequestActive: boolean;
  hasGenerationRun: boolean;
  onRefresh: () => void;
  onCancel: () => Promise<void>;
  onDownload: (filename: string) => void;
};

export function ServerCsvPanel({ files, progress, isRequestActive, hasGenerationRun, onRefresh, onCancel, onDownload }: ServerCsvPanelProps) {
  const isRunning = hasGenerationRun && (isRequestActive || progress.status === 'running' || progress.status === 'cancelling');
  const isToday = (createdAt: number) => {
    const date = new Date(createdAt * 1000);
    const today = new Date();
    return date.toLocaleDateString('ko-KR') === today.toLocaleDateString('ko-KR');
  };

  return (
    <div className="server-files-panel">
      {isRunning && (
        <GenerationProgress progress={progress} isRequestActive={isRequestActive} onCancel={onCancel} />
      )}

      <div className="server-files-header">
        <div>
          <h4>서버 저장 CSV</h4>
          <span>생성 중 2초 · 대기 중 30초 자동 갱신 · 재접속 후에도 다운로드 가능</span>
        </div>
        <button className="text-btn" onClick={onRefresh} title="파일 목록 새로고침">
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>
      {hasGenerationRun && progress.status === 'completed' && progress.message && (
        <div className="server-progress-message">최근 생성 완료 · 오른쪽 목록에 저장됨: {progress.message}</div>
      )}
      {files.length > 0 ? (
        <div className="server-file-list">
          {files.map((file) => (
            <button key={file.filename} className="server-file-item" onClick={() => onDownload(file.filename)}>
              <Download size={15} />
              <span className="server-file-name">{file.filename}</span>
              {isToday(file.created_at) && <span className="today-badge">오늘</span>}
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
