import { useState, useEffect } from 'react';
import type { Keyword } from '../components/KeywordItem';
import type { ApiResult } from '../types';
import { API_BASE_URL } from '../utils';

const extractFilename = (contentDisposition: string | null) => {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const plainMatch = contentDisposition.match(/filename=([^;]+)/i);
  return plainMatch?.[1]?.trim() || null;
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
    if (keywords.length === 0) return;
    
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

      const contentDisposition = response.headers.get('content-disposition');
      const filename = extractFilename(contentDisposition) || `더샘_키워드_결과_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.csv`;
      const blob = await response.blob();
      triggerBrowserDownload(blob, filename);

      setApiResult({
        message: 'CSV 파일 다운로드를 시작했습니다.',
        filename,
      });
    } catch (err) {
      console.error('API 에러:', err);
      setApiResult({
        error: err instanceof Error ? err.message : '조회 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
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
  };
}
