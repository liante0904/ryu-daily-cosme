import { useState, useEffect, useRef, useCallback } from 'react';
import type { Keyword } from '../components/KeywordItem';
import type { ApiResult } from '../types';
import { API_BASE_URL } from '../utils';

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

const triggerBrowserDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

export function useKeywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverFiles, setServerFiles] = useState<ServerCsvFile[]>([]);
  const [serverProgress, setServerProgress] = useState<ServerProgress>({
    status: 'idle', current: 0, total: 0, keyword: '', message: '',
  });
  const [hasGenerationRun, setHasGenerationRun] = useState(false);
  const cancelRequestedRef = useRef(false);
  const previousProgressStatusRef = useRef(serverProgress.status);
  const generationRunIdRef = useRef(0);
  const generationRequestActiveRef = useRef(false);

  const refreshServerFiles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ryu/mapia/files/`);
      if (!response.ok) throw new Error('서버 파일 목록 로딩 실패');
      const data = await response.json();
      setServerFiles(Array.isArray(data.files) ? data.files : []);
    } catch (err) {
      console.error('서버 파일 목록 로딩 실패:', err);
    }
  }, []);

  const downloadServerFile = async (filename: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ryu/mapia/files/${encodeURIComponent(filename)}`
      );
      if (!response.ok) throw new Error('파일 다운로드 실패');
      const blob = await response.blob();
      triggerBrowserDownload(blob, filename);
      return true;
    } catch (err) {
      console.error('서버 파일 다운로드 실패:', err);
      setApiResult({ error: '파일 다운로드에 실패했습니다.' });
      return false;
    }
  };

  const refreshServerProgress = useCallback(async (): Promise<ServerProgress | null> => {
    const requestRunId = generationRunIdRef.current;
    try {
      const response = await fetch(`${API_BASE_URL}/ryu/mapia/status/`);
      if (!response.ok) throw new Error('작업 상태 로딩 실패');
      const nextProgress = await response.json();
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

  const cancelServerGeneration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ryu/mapia/cancel/`, { method: 'POST' });
      if (!response.ok) throw new Error('생성 중단 요청 실패');
      cancelRequestedRef.current = true;
      setIsLoading(false);
      setApiResult(null);
      setServerProgress({ ...serverProgress, status: 'cancelling', message: '중단 요청을 처리 중입니다.' });
    } catch (err) {
      console.error('생성 중단 요청 실패:', err);
      setApiResult({ error: '생성 중단 요청에 실패했습니다.' });
    }
  };

  useEffect(() => {
    refreshServerFiles();
    const isGenerating = isLoading || serverProgress.status === 'running' || serverProgress.status === 'cancelling';
    // 생성 중에는 새 파일을 빠르게 반영하고, 대기 중에도 목록이 오래된 상태로 남지 않게 합니다.
    const interval = window.setInterval(refreshServerFiles, isGenerating ? 2000 : 30 * 1000);
    return () => window.clearInterval(interval);
  }, [isLoading, serverProgress.status, refreshServerFiles]);

  useEffect(() => {
    refreshServerProgress();
    const isMonitoring = isLoading || serverProgress.status === 'running' || serverProgress.status === 'cancelling';
    const interval = window.setInterval(refreshServerProgress, isMonitoring ? 2000 : 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [isLoading, serverProgress.status, refreshServerProgress]);

  // Initial Data Fetch (History)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ryu/mapia/history/`);
        if (!response.ok) throw new Error('히스토리 로딩 실패');

        const rawData = await response.json();
        const keywordList: string[] = Array.isArray(rawData)
          ? rawData
          : (rawData.keywords || rawData.data || rawData.history || []);

        if (keywordList.length > 0) {
          setKeywords(keywordList.map((text, index) => ({
            id: `history-${index}-${Date.now()}`,
            text: text.trim(),
          })));
        }
      } catch (err) {
        console.error('히스토리 로딩 실패:', err);
        const saved = localStorage.getItem('mafia-keywords');
        if (saved) setKeywords(JSON.parse(saved));
      }
    };
    fetchHistory();
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (keywords.length > 0) {
      localStorage.setItem('mafia-keywords', JSON.stringify(keywords));
    }
  }, [keywords]);

  const addKeywords = (newTexts: string[]) => {
    const newItems = newTexts.map(text => ({
      id: Date.now().toString() + Math.random(),
      text: text.trim()
    }));
    setKeywords(prev => [...prev, ...newItems]);
  };

  const removeKeyword = (id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
  };

  const updateKeyword = (id: string, newText: string) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, text: newText.trim() } : k));
  };

  const clearKeywords = () => {
    setKeywords([]);
  };

  const callMafiaApi = async () => {
    if (keywords.length === 0 || generationRequestActiveRef.current) return;
    
    generationRequestActiveRef.current = true;
    generationRunIdRef.current += 1;
    setHasGenerationRun(true);
    cancelRequestedRef.current = false;
    setServerProgress({
      status: 'running',
      current: 0,
      total: keywords.length,
      keyword: '',
      message: '데이터 수집을 시작했습니다.',
    });
    previousProgressStatusRef.current = 'running';
    setIsLoading(true);
    setApiResult(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/ryu/mapia/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywords.map(k => k.text) }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const errorBody = contentType.includes('application/json')
          ? await response.json()
          : { detail: await response.text() };
        throw new Error(errorBody.detail || errorBody.message || 'API 호출 실패');
      }

      const accepted = await response.json();
      if (accepted.status !== 'accepted') {
        throw new Error(accepted.detail || accepted.message || '조회 작업을 시작하지 못했습니다.');
      }

      // POST returns 202 JSON; wait for the background CSV job and download its actual file.
      let completedProgress: ServerProgress | null = null;
      while (!cancelRequestedRef.current) {
        await new Promise(resolve => window.setTimeout(resolve, 2000));
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
        throw new Error('CSV 생성은 완료됐지만 파일명을 확인할 수 없습니다. 서버 파일 목록을 새로고침해 주세요.');
      }
      const downloaded = await downloadServerFile(filename);
      await refreshServerFiles();
      if (!downloaded) throw new Error('CSV 파일 다운로드에 실패했습니다. 서버 파일 목록에서 다시 받아 주세요.');

      setApiResult({
        message: 'CSV 생성이 완료되어 브라우저 다운로드를 시작했습니다.',
        filename,
      });
    } catch (err) {
      console.error('API 에러:', err);
      if (cancelRequestedRef.current) return;
      const latestStatus = await refreshServerProgress();
      const isServerJobRunning = latestStatus?.status === 'running' || latestStatus?.status === 'cancelling';
      setApiResult(isServerJobRunning
        ? { message: '브라우저 연결은 끊겼지만 서버에서 CSV 생성을 계속 진행 중입니다.' }
        : { error: err instanceof TypeError ? '서버 연결이 끊겼습니다. 잠시 후 상태를 다시 확인해 주세요.' : (err instanceof Error ? err.message : '조회 중 오류가 발생했습니다.') });
    } finally {
      setIsLoading(false);
      generationRequestActiveRef.current = false;
    }
  };

  return {
    keywords,
    setKeywords,
    apiResult,
    setApiResult,
    isLoading,
    addKeywords,
    removeKeyword,
    updateKeyword,
    clearKeywords,
    callMafiaApi,
    serverFiles,
    refreshServerFiles,
    downloadServerFile,
    serverProgress,
    hasGenerationRun,
    refreshServerProgress,
    cancelServerGeneration,
  };
}
