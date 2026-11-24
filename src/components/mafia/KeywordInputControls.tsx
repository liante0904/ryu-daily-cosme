import type { RefObject } from 'react';
import { Plus } from 'lucide-react';
import type { ApiResult, ServerProgress } from '../../types';
import { GenerationProgress } from '../GenerationProgress';

type KeywordInputControlsProps = {
  isBulkMode: boolean;
  setIsBulkMode: (bulk: boolean) => void;
  singleInput: string;
  setSingleInput: (value: string) => void;
  bulkInput: string;
  setBulkInput: (value: string) => void;
  singleRef: RefObject<HTMLTextAreaElement | null>;
  bulkRef: RefObject<HTMLTextAreaElement | null>;
  resultRef: RefObject<HTMLDivElement | null>;
  onAddKeyword: () => void;
  onAddBulkKeywords: () => void;
  hasGenerationStatus: boolean;
  apiResult: ApiResult | null;
  setApiResult: (result: ApiResult | null) => void;
  isServerGenerating: boolean;
  serverProgress: ServerProgress;
  isLoading: boolean;
  onCancelGeneration: () => Promise<void>;
};

export function KeywordInputControls({
  isBulkMode,
  setIsBulkMode,
  singleInput,
  setSingleInput,
  bulkInput,
  setBulkInput,
  singleRef,
  bulkRef,
  resultRef,
  onAddKeyword,
  onAddBulkKeywords,
  hasGenerationStatus,
  apiResult,
  setApiResult,
  isServerGenerating,
  serverProgress,
  isLoading,
  onCancelGeneration,
}: KeywordInputControlsProps) {
  return (
    <div className="mafia-controls">
      <div className="mode-toggle">
        <button className={!isBulkMode ? 'active' : ''} onClick={() => setIsBulkMode(false)}>
          단일 입력
        </button>
        <button className={isBulkMode ? 'active' : ''} onClick={() => setIsBulkMode(true)}>
          일괄 입력
        </button>
      </div>

      <div className="input-group">
        <textarea
          ref={isBulkMode ? bulkRef : singleRef}
          value={isBulkMode ? bulkInput : singleInput}
          onChange={(e) =>
            isBulkMode ? setBulkInput(e.target.value) : setSingleInput(e.target.value)
          }
          placeholder={isBulkMode ? '키워드1, 키워드2 또는 줄바꿈으로 구분...' : '키워드 입력...'}
          rows={1}
        />
        <button
          onClick={isBulkMode ? onAddBulkKeywords : onAddKeyword}
          className="add-button"
        >
          <Plus size={18} /> {isBulkMode ? '일괄 추가' : '추가'}
        </button>
      </div>

      {(hasGenerationStatus || apiResult) && (
        <div className="result-container result-container-inline" ref={resultRef}>
          <div className="result-header">
            <h4>💡 조회 상태</h4>
            {apiResult && !isServerGenerating && (
              <button onClick={() => setApiResult(null)} className="close-result">
                닫기
              </button>
            )}
          </div>
          <div className="result-content">
            {hasGenerationStatus ? (
              <GenerationProgress
                progress={serverProgress}
                isRequestActive={isLoading}
                onCancel={onCancelGeneration}
              />
            ) : apiResult ? (
              <div className={apiResult.error ? 'status-message error' : 'status-message success'}>
                {String(apiResult.error || apiResult.message || '')}
                {typeof apiResult.filename === 'string' && (
                  <span className="status-detail">파일: {apiResult.filename}</span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
