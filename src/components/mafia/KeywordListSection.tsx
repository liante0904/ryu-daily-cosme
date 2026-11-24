import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Search } from 'lucide-react';
import { SortableKeywordItem } from '../KeywordItem';
import type { Keyword } from '../KeywordItem';

type KeywordListSectionProps = {
  keywords: Keyword[];
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  onRemove: (id: string) => void;
  onStartEdit: (keyword: Keyword) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  isAtBottom: boolean;
  isLoading: boolean;
  onRunSearch: () => void;
};

export function KeywordListSection({
  keywords,
  editingId,
  editText,
  setEditText,
  onRemove,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDragEnd,
  isAtBottom,
  isLoading,
  onRunSearch,
}: KeywordListSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  return (
    <div className="keyword-list-column">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="keyword-list">
          <SortableContext
            items={keywords.map((k) => k.id)}
            strategy={verticalListSortingStrategy}
          >
            {keywords.map((keyword) => (
              <SortableKeywordItem
                key={keyword.id}
                keyword={keyword}
                onRemove={onRemove}
                onStartEdit={onStartEdit}
                isEditing={editingId === keyword.id}
                editText={editText}
                setEditText={setEditText}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
              />
            ))}
          </SortableContext>
          {keywords.length === 0 && (
            <div className="empty-state">
              <p>등록된 키워드가 없습니다.</p>
            </div>
          )}
        </div>
      </DndContext>

      <div
        className="list-footer-action"
        style={{ opacity: isAtBottom ? 0 : 1, transition: 'opacity 0.5s' }}
      >
        <button
          onClick={onRunSearch}
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
    </div>
  );
}
