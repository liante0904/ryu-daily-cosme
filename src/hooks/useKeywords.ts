import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchKeywordHistory } from '../api/mapiaApi';
import type { Keyword } from '../components/KeywordItem';
import { useServerGeneration } from './useServerGeneration';

export type { ServerCsvFile, ServerProgress } from '../types';

const STORAGE_KEY = 'mafia-keywords';

function loadKeywordsFromStorage(): Keyword[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useKeywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const historyLoadedRef = useRef(false);
  const server = useServerGeneration();

  // Initial Data Fetch (History)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const keywordList = await fetchKeywordHistory();
        if (keywordList.length > 0) {
          setKeywords(
            keywordList.map((text, index) => ({
              id: `history-${index}-${Date.now()}`,
              text: text.trim(),
            }))
          );
        }
      } catch (err) {
        console.error('히스토리 로딩 실패:', err);
        const restored = loadKeywordsFromStorage();
        if (restored.length > 0) setKeywords(restored);
      } finally {
        historyLoadedRef.current = true;
      }
    };
    loadHistory();
  }, []);

  // Sync to LocalStorage after initial hydration
  useEffect(() => {
    if (!historyLoadedRef.current) return;
    if (keywords.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [keywords]);

  const addKeywords = useCallback((newTexts: string[]) => {
    const newItems = newTexts.map((text) => ({
      id: Date.now().toString() + Math.random(),
      text: text.trim(),
    }));
    setKeywords((prev) => [...prev, ...newItems]);
  }, []);

  const removeKeyword = useCallback((id: string) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  }, []);

  const updateKeyword = useCallback((id: string, newText: string) => {
    setKeywords((prev) => prev.map((k) => (k.id === id ? { ...k, text: newText.trim() } : k)));
  }, []);

  const clearKeywords = useCallback(() => {
    setKeywords([]);
  }, []);

  const callMafiaApi = useCallback(
    () => server.runGeneration(keywords.map((k) => k.text)),
    [keywords, server]
  );

  return {
    keywords,
    setKeywords,
    apiResult: server.apiResult,
    setApiResult: server.setApiResult,
    isLoading: server.isLoading,
    addKeywords,
    removeKeyword,
    updateKeyword,
    clearKeywords,
    callMafiaApi,
    serverFiles: server.serverFiles,
    refreshServerFiles: server.refreshServerFiles,
    downloadServerFile: server.downloadServerFile,
    serverProgress: server.serverProgress,
    hasGenerationRun: server.hasGenerationRun,
    refreshServerProgress: server.refreshServerProgress,
    cancelServerGeneration: server.cancelServerGeneration,
  };
}
