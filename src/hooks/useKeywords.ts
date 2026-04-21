import { useState, useEffect } from 'react';
import type { Keyword } from '../components/KeywordItem';
import type { ApiResult } from '../types';
import { API_BASE_URL } from '../utils';

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

      if (!response.ok) throw new Error('API 호출 실패');
      
      const data = await response.json();
      setApiResult(data);
    } catch (err) {
      console.error('API 에러:', err);
      setApiResult({ error: '조회 중 오류가 발생했습니다.' });
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
