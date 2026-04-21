import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Download, Eraser } from 'lucide-react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import './App.css';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SortableKeywordItem } from './components/KeywordItem';
import type { Keyword } from './components/KeywordItem';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useKeywords } from './hooks/useKeywords';

// Types & Utils
import { adjustHeight } from './utils';

function App() {
  // UI Hooks
  const { isDarkMode, toggleTheme } = useTheme();
  // Removed: const isAtTop = useScrollAtTop(10);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showFloating, setShowFloating] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Business Logic Hook
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
  } = useKeywords();

  // Scroll Behavior Detection
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      setIsAtBottom(scrollTop + windowHeight >= documentHeight - 100);

      if (scrollTop < 10) {
        setShowFloating(true);
      } else if (scrollTop > lastScrollY) {
        setShowFloating(false);
      } else if (scrollTop < lastScrollY - 5) {
        setShowFloating(true);
      }

      setLastScrollY(scrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Input Data States
  const [singleInput, setSingleInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Refs
  const singleRef = useRef<HTMLTextAreaElement>(null);
  const bulkRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // --- UI Handlers ---

  const handleAddKeyword = () => {
    if (!singleInput.trim()) return;
    addKeywords([singleInput]);
    setSingleInput('');
  };
  const handleAddBulkKeywords = () => {
      // 실제 엔터 대신 \n 문자열을 사용해야 합니다.
      const lines = bulkInput.split(/[\n,]+/).filter(t => t.trim());
      
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

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // Effects
  useEffect(() => {
    if (!isBulkMode) {
      adjustHeight(singleRef.current);
    } else {
      setTimeout(() => adjustHeight(bulkRef.current), 0);
    }
  }, [isBulkMode, bulkInput, singleInput]);

  useEffect(() => {
    if (isLoading || apiResult) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [isLoading, apiResult]);

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
          <section className="dashboard-section">
            <div className="section-header">
              <h1>마피아 (네이버 키워드 검색량)</h1>
              <p className="subtitle">키워드를 관리하고 검색량을 분석하세요.</p>
            </div>

            <div className="mafia-controls">
              <div className="mode-toggle">
                <button className={!isBulkMode ? 'active' : ''} onClick={() => setIsBulkMode(false)}>단일 입력</button>
                <button className={isBulkMode ? 'active' : ''} onClick={() => setIsBulkMode(true)}>일괄 입력</button>
              </div>

              <div className="input-group">
                <textarea 
                  ref={isBulkMode ? bulkRef : singleRef}
                  value={isBulkMode ? bulkInput : singleInput}
                  onChange={(e) => isBulkMode ? setBulkInput(e.target.value) : setSingleInput(e.target.value)}
                  placeholder={isBulkMode ? "키워드1, 키워드2 또는 줄바꿈으로 구분..." : "키워드 입력..."}
                  rows={1}
                />
                <button 
                  onClick={isBulkMode ? handleAddBulkKeywords : handleAddKeyword} 
                  className="add-button"
                >
                  <Plus size={18} /> {isBulkMode ? '일괄 추가' : '추가'}
                </button>
              </div>
            </div>

            <div className="list-container">
              <div className="list-header">
                <h3>키워드 목록 <span>{keywords.length}</span></h3>
                <div className="list-actions">
                  <button 
                    onClick={() => {
                      setBulkInput(keywords.map(k => k.text).join(', '));
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
                        setBulkInput(keywords.map(k => k.text).join(', '));
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

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="keyword-list">
                  <SortableContext items={keywords.map(k => k.id)} strategy={verticalListSortingStrategy}>
                    {keywords.map((keyword) => (
                      <SortableKeywordItem 
                        key={keyword.id} keyword={keyword} onRemove={removeKeyword} onStartEdit={handleStartEdit}
                        isEditing={editingId === keyword.id} editText={editText} setEditText={setEditText}
                        onSaveEdit={handleSaveEdit} onCancelEdit={() => setEditingId(null)}
                      />
                    ))}
                  </SortableContext>
                  {keywords.length === 0 && (
                    <div className="empty-state"><p>등록된 키워드가 없습니다.</p></div>
                  )}
                </div>
              </DndContext>

              <div className="list-footer-action" style={{ opacity: isAtBottom ? 0 : 1, transition: 'opacity 0.5s' }}>
                <button 
                  onClick={callMafiaApi} 
                  className={`run-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading || keywords.length === 0}
                >
                  {isLoading ? <span>조회 중...</span> : <><Search size={18} /> <span>키워드 검색량 조회하기</span></>}
                </button>
              </div>

              {(apiResult || isLoading) && (
                <div className="result-container" ref={resultRef}>
                  <div className="result-header">
                    <h4>💡 분석 결과</h4>
                    {apiResult && <button onClick={() => setApiResult(null)} className="close-result">닫기</button>}
                  </div>
                  <div className="result-content">
                    {isLoading ? (
                      <div className="loading-spinner">데이터를 가져오는 중입니다...</div>
                    ) : (
                      <pre>{JSON.stringify(apiResult, null, 2)}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="footer">
          <p>&copy; 2024 Ryu Routine Dashboard. Minimalist Design by Ryu.</p>
        </footer>
      </div>

      <div className={`search-action ${!showFloating ? 'hidden' : ''} ${isAtBottom ? 'at-bottom' : ''}`}>
        <button 
          onClick={callMafiaApi} 
          className={`run-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || keywords.length === 0}
        >
          {isLoading ? <span>조회 중...</span> : <><Search size={18} /> <span>키워드 검색량 조회하기</span></>}
        </button>
      </div>
    </>
  );
}

export default App;
