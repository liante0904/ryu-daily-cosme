import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { HubWorkItem } from '../../api/workHubRepository';
import { BLOG_REVIEW_AGENCIES, BLOG_REVIEW_CATEGORIES } from './blogReviewConfig';

type BlogReviewModalProps = {
  item: HubWorkItem;
  isExisting: boolean;
  onClose: () => void;
  onSave: (item: HubWorkItem) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function BlogReviewModal({ item, isExisting, onClose, onSave, onDelete }: BlogReviewModalProps) {
  const [form, setForm] = useState<HubWorkItem>({ ...item, area: '개인', category: '블로그' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const completed = form.status === '완료';

  const put = (key: keyof HubWorkItem, value: string) =>
    setForm((current) => ({ ...current, [key]: value, updated: new Date().toISOString() }));

  const save = async () => {
    if (!form.title.trim()) {
      setError('업체명을 입력해 주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, title: form.title.trim(), area: '개인', category: '블로그' });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError('');
    try {
      await onDelete();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '삭제하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="item-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">개인 · 블로그 리뷰 관리</span>
            <h2>{isExisting ? '블로그 건 수정' : '블로그 건 추가'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="닫기"><X size={18} /></button>
        </div>

        <div className="modal-form">
          <label className="wide">
            업체명
            <input autoFocus value={form.title} onChange={(event) => put('title', event.target.value)} placeholder="예: 성수동 ○○ 에스테틱" required />
          </label>

          <div className="form-grid">
            <label>
              블로그 대행사
              <input list="blog-review-agencies" value={form.agency} onChange={(event) => put('agency', event.target.value)} placeholder="대행사를 선택하거나 입력" />
              <datalist id="blog-review-agencies">
                {BLOG_REVIEW_AGENCIES.map((agency) => <option key={agency} value={agency} />)}
              </datalist>
            </label>
            <label>
              리뷰 기한
              <input type="date" value={form.due} onChange={(event) => put('due', event.target.value)} />
            </label>
            <label>
              카테고리
              <select value={form.channel} onChange={(event) => put('channel', event.target.value)}>
                <option value="">선택</option>
                {form.channel && !BLOG_REVIEW_CATEGORIES.includes(form.channel) && <option value={form.channel}>{form.channel}</option>}
                {BLOG_REVIEW_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              신청 링크
              <input type="url" value={form.link} onChange={(event) => put('link', event.target.value)} placeholder="https://" />
            </label>
          </div>

          <label>
            제공 내역
            <textarea value={form.attachment} onChange={(event) => put('attachment', event.target.value)} rows={3} placeholder="예: 시술 1회, 음료 2잔, 5만원 식사권" />
          </label>
          <label>
            리뷰 메모
            <textarea value={form.memo} onChange={(event) => put('memo', event.target.value)} rows={3} placeholder="예약 방법, 필수 키워드, 방문 가능 시간 등" />
          </label>
          <div className="blog-modal-completion-row">
            <div>
              <b>리뷰 완료</b>
              <small>{completed ? '리뷰를 완료했어요.' : '아직 리뷰를 진행 중이에요.'}</small>
            </div>
            <button
              type="button"
              className={`blog-review-toggle ${completed ? 'checked' : ''}`}
              role="switch"
              aria-checked={completed}
              aria-label="리뷰 완료 여부"
              onClick={() => put('status', completed ? '진행 중' : '완료')}
            >
              <span />
            </button>
          </div>
        </div>

        {error && <div className="modal-error" role="alert">{error}</div>}
        <div className="modal-actions">
          {isExisting && <button className="delete-btn" onClick={() => void remove()} disabled={saving}>삭제</button>}
          <span />
          <button className="secondary-btn" onClick={onClose} disabled={saving}>취소</button>
          <button className="primary-btn" onClick={() => void save()} disabled={saving}>
            <Check size={16} /> {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
