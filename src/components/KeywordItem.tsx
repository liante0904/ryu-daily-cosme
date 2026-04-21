import { useEffect, useRef } from 'react';
import { Save, XCircle, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Keyword {
  id: string;
  text: string;
}

interface SortableKeywordItemProps {
  keyword: Keyword;
  onRemove: (id: string) => void;
  onStartEdit: (keyword: Keyword) => void;
  isEditing: boolean;
  editText: string;
  setEditText: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export function SortableKeywordItem({ 
  keyword, 
  onRemove, 
  onStartEdit, 
  isEditing, 
  editText, 
  setEditText, 
  onSaveEdit, 
  onCancelEdit 
}: SortableKeywordItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: keyword.id, disabled: isEditing });

  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1001 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`keyword-item ${isDragging ? 'dragging' : ''} ${isEditing ? 'editing' : ''}`}
    >
      {isEditing ? (
        <div className="edit-mode">
          <input 
            ref={editInputRef}
            type="text" 
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
          />
          <div className="edit-actions">
            <button onClick={onSaveEdit} className="icon-btn save" title="저장"><Save size={18} /></button>
            <button onClick={onCancelEdit} className="icon-btn cancel" title="취소"><XCircle size={18} /></button>
          </div>
        </div>
      ) : (
        <>
          <div className="keyword-left">
            <button className="drag-handle" {...attributes} {...listeners}>
              <GripVertical size={14} />
            </button>
            <span 
              className="keyword-text" 
              onClick={() => onStartEdit(keyword)}
            >
              {keyword.text}
            </span>
          </div>
          <div className="keyword-actions">
            <button onClick={() => onStartEdit(keyword)} className="icon-btn edit"><Edit2 size={12} /></button>
            <button onClick={() => onRemove(keyword.id)} className="icon-btn delete"><Trash2 size={12} /></button>
          </div>
        </>
      )}
    </div>
  );
}
