import { useEffect, useRef, useState } from 'react';
import { Download, Eraser, Search } from 'lucide-react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import './App.css';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ServerCsvPanel } from './components/ServerCsvPanel';
import { KeywordInputControls } from './components/mafia/KeywordInputControls';
import { KeywordListSection } from './components/mafia/KeywordListSection';
import type { Keyword } from './components/KeywordItem';
import { useTheme } from './hooks/useTheme';
import { useKeywords } from './hooks/useKeywords';
import { useScrollVisibility } from './hooks/useScrollVisibility';
import { adjustHeight } from './utils';

export function LegacyMafiaApp() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAtBottom, showFloating } = useScrollVisibility();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const {
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
  } = useKeywords();

  const isServerGenerating =
    isLoading || serverProgress.status === 'running' || serverProgress.status === 'cancelling';
  const hasGenerationStatus =
    hasGenerationRun &&
    (isServerGenerating ||
      serverProgress.status === 'completed' ||
      serverProgress.status === 'cancelled' ||
      serverProgress.status === 'unknown');

  const [singleInput, setSingleInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const singleRef = useRef<HTMLTextAreaElement>(null);
  const bulkRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAddKeyword = () => {
    if (!singleInput.trim()) return;
    addKeywords([singleInput]);
    setSingleInput('');
  };

  const handleAddBulkKeywords = () => {
    // 실제 엔터 대신 \n 문자열을 사용해야 합니다.
    const lines = bulkInput.split(/[\n,]+/).filter((t) => t.trim());
    if (lines.length === 0) return;
    addKeywords(lines);
    setBulkInput('');
    setIsBulkMode(false);
  };

  const handleStartEdit = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditText(keyword.text);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateKeyword(editingId, editText);
    setEditingId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setKeywords((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    if (!isBulkMode) {
      adjustHeight(singleRef.current);
    } else {
      setTimeout(() => adjustHeight(bulkRef.current), 0);
    }
  }, [isBulkMode, bulkInput, singleInput]);

  return (
    <>
      <div className="app-container">
        <Header
          isMenuOpen={isMenuOpen}
          toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        <Sidebar isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(false)} />

        <main className="main-content">
          <section className="dashboard-section" id="mafia">
            <div className="section-header">
              <h1>마피아 (네이버 키워드 검색량)</h1>
              <p className="subtitle">키워드를 관리하고 검색량을 분석하세요.</p>
            </div>

            <KeywordInputControls
              isBulkMode={isBulkMode}
              setIsBulkMode={setIsBulkMode}
              singleInput={singleInput}
              setSingleInput={setSingleInput}
              bulkInput={bulkInput}
              setBulkInput={setBulkInput}
              singleRef={singleRef}
              bulkRef={bulkRef}
              resultRef={resultRef}
              onAddKeyword={handleAddKeyword}
              onAddBulkKeywords={handleAddBulkKeywords}
              hasGenerationStatus={hasGenerationStatus}
              apiResult={apiResult}
              setApiResult={setApiResult}
              isServerGenerating={isServerGenerating}
              serverProgress={serverProgress}
              isLoading={isLoading}
              onCancelGeneration={cancelServerGeneration}
            />

            <div className="list-container">
              <div className="list-header">
                <h3>
                  키워드 목록 <span>{keywords.length}</span>
                </h3>
                <div className="list-actions">
                  <button
                    onClick={() => {
                      setBulkInput(keywords.map((k) => k.text).join(', '));
                      setIsBulkMode(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-btn"
                  >
                    <Download size={14} /> 일괄 추출
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('전체 삭제하시겠습니까? (삭제 전 일괄 추출됩니다.)')) {
                        setBulkInput(keywords.map((k) => k.text).join(', '));
                        setIsBulkMode(true);
                        clearKeywords();
                      }
                    }}
                    className="text-btn delete"
                  >
                    <Eraser size={14} /> 일괄 삭제
                  </button>
                </div>
              </div>

              <div className="list-content-layout">
                <KeywordListSection
                  keywords={keywords}
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                  onRemove={removeKeyword}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDragEnd={handleDragEnd}
                  isAtBottom={isAtBottom}
                  isLoading={isLoading}
                  onRunSearch={callMafiaApi}
                />

                <ServerCsvPanel
                  files={serverFiles}
                  progress={serverProgress}
                  hasGenerationRun={hasGenerationRun}
                  isRequestActive={isLoading}
                  onRefresh={() => {
                    refreshServerFiles();
                    refreshServerProgress();
                  }}
                  onCancel={cancelServerGeneration}
                  onDownload={downloadServerFile}
                />
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <p>&copy; 2024 Ryu Routine Dashboard. Minimalist Design by Ryu.</p>
        </footer>
      </div>

      <div
        className={`search-action ${!showFloating ? 'hidden' : ''} ${isAtBottom ? 'at-bottom' : ''}`}
      >
        <button
          onClick={callMafiaApi}
          className={`run-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || keywords.length === 0}
        >
          {isLoading ? (
            <span>조회 중...</span>
          ) : (
            <>
              <Search size={18} /> <span>키워드 검색량 조회하기</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
