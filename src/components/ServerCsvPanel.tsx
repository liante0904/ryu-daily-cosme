import { Download, RefreshCw } from 'lucide-react';
import type { ServerCsvFile, ServerProgress } from '../hooks/useKeywords';
import { GenerationProgress } from './GenerationProgress';

type ServerCsvPanelProps = {
  files: ServerCsvFile[];
  progress: ServerProgress;
  isRequestActive: boolean;
  onRefresh: () => void;
  onCancel: () => Promise<void>;
  onDownload: (filename: string) => void;
};

export function ServerCsvPanel({ files, progress, isRequestActive, onRefresh, onCancel, onDownload }: ServerCsvPanelProps) {
  const isRunning = isRequestActive || progress.status === 'running' || progress.status === 'cancelling';

  return (
    <div className="server-files-panel">
      {isRunning && (
        <GenerationProgress progress={progress} isRequestActive={isRequestActive} onCancel={onCancel} />
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
