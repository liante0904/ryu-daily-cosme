import { useMemo, useState } from 'react';
import { ExternalLink, Plus, Search } from 'lucide-react';
import type { HubWorkItem } from '../../api/workHubRepository';
import { LEGACY_BLOG_CATEGORY } from './blogReviewConfig';
import './BlogReviewWorkspace.css';

type BlogReviewWorkspaceProps = {
  items: HubWorkItem[];
  onAdd: () => void;
  onEdit: (item: HubWorkItem) => void;
  onToggleCompleted: (item: HubWorkItem) => Promise<void>;
};

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isBlogReview(item: HubWorkItem): boolean {
  return item.area === '개인' && (item.category === '블로그' || item.category === LEGACY_BLOG_CATEGORY);
}

export function BlogReviewWorkspace({ items, onAdd, onEdit, onToggleCompleted }: BlogReviewWorkspaceProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const today = toLocalIsoDate(new Date());
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const soonDate = toLocalIsoDate(soon);

  const records = useMemo(
    () => items.filter(isBlogReview),
    [items]
  );
  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records
      .filter((item) => {
        const completed = item.status === '완료';
        const matchesFilter = filter === 'all' || (filter === 'completed' ? completed : !completed);
        const haystack = `${item.title} ${item.agency} ${item.channel} ${item.attachment} ${item.memo}`.toLowerCase();
        return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
      })
      .sort((a, b) => {
        const aCompleted = a.status === '완료';
        const bCompleted = b.status === '완료';
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        if (a.due !== b.due) {
          if (!a.due) return 1;
          if (!b.due) return -1;
          return a.due.localeCompare(b.due);
        }
        return b.updated.localeCompare(a.updated);
      });
  }, [records, filter, query]);

  const activeCount = records.filter((item) => item.status !== '완료').length;
  const completedCount = records.length - activeCount;
  const dueSoonCount = records.filter(
    (item) => item.status !== '완료' && item.due && item.due <= soonDate
  ).length;

  const toggleCompleted = async (item: HubWorkItem) => {
    setSavingId(item.id);
    setError('');
    try {
      await onToggleCompleted(item);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : '완료 상태를 저장하지 못했습니다.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <section className="blog-review-workspace">
      <div className="blog-review-summary">
        <div className="blog-review-summary-card">
          <span>진행 중</span>
          <strong>{activeCount}</strong>
          <small>아직 리뷰가 끝나지 않은 건</small>
        </div>
        <div className="blog-review-summary-card due">
          <span>기한 확인</span>
          <strong>{dueSoonCount}</strong>
          <small>리뷰 기한이 7일 이내이거나 지난 건</small>
        </div>
        <div className="blog-review-summary-card done">
          <span>완료</span>
          <strong>{completedCount}</strong>
          <small>리뷰를 완료 처리한 건</small>
        </div>
      </div>

      <div className="panel blog-review-panel">
        <div className="blog-review-toolbar">
          <div className="blog-review-filters" aria-label="리뷰 상태 필터">
            {([
              ['active', '진행 중'],
              ['all', '전체'],
              ['completed', '완료'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? 'active' : ''}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="blog-review-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="업체명이나 대행사 검색"
              aria-label="업체명이나 대행사 검색"
            />
          </label>
          <button className="primary-btn" onClick={onAdd}><Plus size={16} /> 블로그 건 추가</button>
        </div>

        {error && <div className="blog-review-error" role="alert">{error}</div>}

        <div className="blog-review-table-wrap">
          <table className="blog-review-table">
            <thead>
              <tr>
                <th>리뷰 완료</th>
                <th>리뷰 기한</th>
                <th>업체명</th>
                <th>대행사</th>
                <th>분야</th>
                <th>제공 내역</th>
                <th>신청 링크</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((item) => {
                const completed = item.status === '완료';
                const overdue = !completed && Boolean(item.due) && item.due < today;
                const dueSoon = !completed && Boolean(item.due) && item.due >= today && item.due <= soonDate;
                return (
                  <tr key={item.id} className={completed ? 'completed' : ''}>
                    <td>
                      <button
                        type="button"
                        className={`blog-review-toggle ${completed ? 'checked' : ''}`}
                        role="switch"
                        aria-checked={completed}
                        aria-label={`${item.title || '업체'} 리뷰 ${completed ? '완료' : '미완료'}`}
                        disabled={savingId === item.id}
                        onClick={() => void toggleCompleted(item)}
                      >
                        <span />
                      </button>
                    </td>
                    <td>
                      <span className={`blog-review-due ${overdue ? 'overdue' : dueSoon ? 'soon' : ''}`}>
                        {item.due || '미정'}
                      </span>
                    </td>
                    <td>
                      <button className="blog-review-vendor" onClick={() => onEdit(item)}>
                        {item.title || '업체명 입력 필요'}
                      </button>
                    </td>
                    <td>{item.agency || '미정'}</td>
                    <td><span className="blog-review-category">{item.channel || '기타'}</span></td>
                    <td className="blog-review-provided" title={item.attachment}>{item.attachment || '미정'}</td>
                    <td>
                      {item.link ? (
                        <a className="blog-review-link" href={item.link} target="_blank" rel="noreferrer">
                          신청 보기 <ExternalLink size={13} />
                        </a>
                      ) : <span className="blog-review-muted">링크 없음</span>}
                    </td>
                  </tr>
                );
              })}
              {!visibleRecords.length && (
                <tr>
                  <td colSpan={7} className="blog-review-empty">
                    {query ? '검색 결과가 없습니다.' : records.length ? '이 상태의 블로그 건이 없습니다.' : '첫 블로그 체험 건을 추가해 보세요.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="blog-review-hint">진행 중인 건과 빠른 리뷰 기한을 위쪽에 모았습니다. 업체명을 누르면 제공 내역과 리뷰 메모를 수정할 수 있어요.</p>
      </div>
    </section>
  );
}
