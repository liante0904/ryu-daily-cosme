import { useCallback, useEffect, useRef, useState } from 'react';
import {
  downloadServerFileBlob,
  fetchServerFiles,
  fetchServerProgress,
  requestCancelGeneration,
  startGeneration,
} from '../api/mapiaApi';
import type { ApiResult, ServerCsvFile, ServerProgress } from '../types';
import { triggerBrowserDownload } from '../utils';

const INITIAL_PROGRESS: ServerProgress = {
  status: 'idle',
  current: 0,
  total: 0,
  keyword: '',
  message: '',
};

/**
 * Manage server-side CSV generation lifecycle, polling, cancellation, and downloads.
 */
export function useServerGeneration() {
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverFiles, setServerFiles] = useState<ServerCsvFile[]>([]);
  const [serverProgress, setServerProgress] = useState<ServerProgress>(INITIAL_PROGRESS);
  const [hasGenerationRun, setHasGenerationRun] = useState(false);

  const cancelRequestedRef = useRef(false);
  const previousProgressStatusRef = useRef(serverProgress.status);
  const generationRunIdRef = useRef(0);
  const generationRequestActiveRef = useRef(false);

  const refreshServerFiles = useCallback(async () => {
    try {
      const files = await fetchServerFiles();
      setServerFiles(files);
    } catch (err) {
      console.error('서버 파일 목록 로딩 실패:', err);
    }
  }, []);

  const downloadServerFile = useCallback(async (filename: string): Promise<boolean> => {
    try {
      const blob = await downloadServerFileBlob(filename);
      triggerBrowserDownload(blob, filename);
      return true;
    } catch (err) {
      console.error('서버 파일 다운로드 실패:', err);
      setApiResult({ error: '파일 다운로드에 실패했습니다.' });
      return false;
    }
  }, []);

  const refreshServerProgress = useCallback(async (): Promise<ServerProgress | null> => {
    const requestRunId = generationRunIdRef.current;
    try {
      const nextProgress = await fetchServerProgress();
      // 조회 시작 전에 발송된 오래된 상태 응답이 새 실행 상태를 덮어쓰지 않게 합니다.
      if (requestRunId !== generationRunIdRef.current) return null;
      if (cancelRequestedRef.current && nextProgress.status === 'cancelled') {
        cancelRequestedRef.current = false;
        setServerProgress(nextProgress);
        return nextProgress;
      }
      if (nextProgress.status === 'running') {
        previousProgressStatusRef.current = 'running';
      }
      if (nextProgress.status === 'completed' && previousProgressStatusRef.current !== 'completed') {
        // 서버가 파일을 완성한 직후 목록에도 바로 표시되도록 갱신합니다.
        await refreshServerFiles();
      }
      previousProgressStatusRef.current = nextProgress.status;
      setServerProgress(nextProgress);
      return nextProgress;
    } catch (err) {
      console.error('작업 상태 로딩 실패:', err);
      return null;
    }
  }, [refreshServerFiles]);

  const cancelServerGeneration = useCallback(async () => {
    try {
      await requestCancelGeneration();
      cancelRequestedRef.current = true;
      setIsLoading(false);
      setApiResult(null);
      setServerProgress((prev) => ({
        ...prev,
        status: 'cancelling',
        message: '중단 요청을 처리 중입니다.',
      }));
    } catch (err) {
      console.error('생성 중단 요청 실패:', err);
      setApiResult({ error: '생성 중단 요청에 실패했습니다.' });
    }
  }, []);

  useEffect(() => {
    refreshServerFiles();
    const isGenerating =
      isLoading || serverProgress.status === 'running' || serverProgress.status === 'cancelling';
    // 생성 중에는 새 파일을 빠르게 반영하고, 대기 중에도 목록이 오래된 상태로 남지 않게 합니다.
    const interval = window.setInterval(refreshServerFiles, isGenerating ? 2000 : 30 * 1000);
    return () => window.clearInterval(interval);
  }, [isLoading, serverProgress.status, refreshServerFiles]);

  useEffect(() => {
    refreshServerProgress();
    const isMonitoring =
      isLoading || serverProgress.status === 'running' || serverProgress.status === 'cancelling';
    const interval = window.setInterval(refreshServerProgress, isMonitoring ? 2000 : 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [isLoading, serverProgress.status, refreshServerProgress]);

  const runGeneration = useCallback(
    async (keywordTexts: string[]) => {
      if (keywordTexts.length === 0 || generationRequestActiveRef.current) return;

      generationRequestActiveRef.current = true;
      generationRunIdRef.current += 1;
      setHasGenerationRun(true);
      cancelRequestedRef.current = false;
      setServerProgress({
        status: 'running',
        current: 0,
        total: keywordTexts.length,
        keyword: '',
        message: '데이터 수집을 시작했습니다.',
      });
      previousProgressStatusRef.current = 'running';
      setIsLoading(true);
      setApiResult(null);

      try {
        await startGeneration(keywordTexts);

        // POST returns 202 JSON; wait for the background CSV job and download its actual file.
        let completedProgress: ServerProgress | null = null;
        while (!cancelRequestedRef.current) {
          await new Promise((resolve) => window.setTimeout(resolve, 2000));
          const progress = await refreshServerProgress();
          if (!progress) continue;
          if (progress.status === 'completed') {
            completedProgress = progress;
            break;
          }
          if (['failed', 'interrupted', 'cancelled'].includes(progress.status)) {
            throw new Error(progress.message || 'CSV 생성이 완료되지 않았습니다.');
          }
        }
        if (cancelRequestedRef.current) return;

        const filename = completedProgress?.message;
        if (!filename || !filename.toLowerCase().endsWith('.csv')) {
          throw new Error(
            'CSV 생성은 완료됐지만 파일명을 확인할 수 없습니다. 서버 파일 목록을 새로고침해 주세요.'
          );
        }
        const downloaded = await downloadServerFile(filename);
        await refreshServerFiles();
        if (!downloaded) {
          throw new Error('CSV 파일 다운로드에 실패했습니다. 서버 파일 목록에서 다시 받아 주세요.');
        }

        setApiResult({
          message: 'CSV 생성이 완료되어 브라우저 다운로드를 시작했습니다.',
          filename,
        });
      } catch (err) {
        console.error('API 에러:', err);
        if (cancelRequestedRef.current) return;
        const latestStatus = await refreshServerProgress();
        const isServerJobRunning =
          latestStatus?.status === 'running' || latestStatus?.status === 'cancelling';
        setApiResult(
          isServerJobRunning
            ? { message: '브라우저 연결은 끊겼지만 서버에서 CSV 생성을 계속 진행 중입니다.' }
            : {
                error:
                  err instanceof TypeError
                    ? '서버 연결이 끊겼습니다. 잠시 후 상태를 다시 확인해 주세요.'
                    : err instanceof Error
                      ? err.message
                      : '조회 중 오류가 발생했습니다.',
              }
        );
      } finally {
        setIsLoading(false);
        generationRequestActiveRef.current = false;
      }
    },
    [downloadServerFile, refreshServerFiles, refreshServerProgress]
  );

  return {
    apiResult,
    setApiResult,
    isLoading,
    serverFiles,
    refreshServerFiles,
    downloadServerFile,
    serverProgress,
    hasGenerationRun,
    refreshServerProgress,
    cancelServerGeneration,
    runGeneration,
  };
}
