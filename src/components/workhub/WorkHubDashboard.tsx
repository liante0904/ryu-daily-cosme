import { BriefcaseBusiness, CalendarDays, CircleHelp, FlaskConical, ListTodo, Sparkles } from 'lucide-react';
import type { HubArea, HubStatus, HubWorkItem } from '../../api/workHubRepository';
import { getIsoDateInDays, getTodayIsoDate } from '../../workHubConfig';
import { EmptyState, WorkRow } from './WorkHubBadges';

type WorkHubDashboardProps = {
  items: HubWorkItem[];
  onEditItem: (item: HubWorkItem) => void;
  onStatusChange: (item: HubWorkItem, status: HubStatus) => void;
  onOpenAllTasks: (statusFilter: string) => void;
  onOpenCategory: (area: HubArea, category: string) => void;
};

export function WorkHubDashboard({
  items,
  onEditItem,
  onStatusChange,
  onOpenAllTasks,
  onOpenCategory,
}: WorkHubDashboardProps) {
  const today = getTodayIsoDate();
  const dueLimit = getIsoDateInDays(3);
  const dueSoon = items.filter((item) => item.status !== '완료' && item.due && item.due <= dueLimit);
  const todayItems = items.filter((item) => item.status !== '완료' && item.due === today);
  const holdItems = items.filter((item) => item.status === '보류');
  const recentItems = [...items].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 5);

  return (
    <>
      <div className="overview-grid">
        <button onClick={() => onOpenAllTasks('전체')} className="overview-card">
          <span className="overview-heading">
            <span className="overview-icon lavender">
              <ListTodo size={18} />
            </span>
            <span className="ov-label">오늘 할 일</span>
          </span>
          <strong>{todayItems.length}</strong>
          <small>오늘 마감 항목</small>
        </button>
        <button onClick={() => onOpenAllTasks('보류')} className="overview-card">
          <span className="overview-heading">
            <span className="overview-icon peach">
              <CircleHelp size={18} />
            </span>
            <span className="ov-label">보류 중</span>
          </span>
          <strong>{holdItems.length}</strong>
          <small>확인 후 다시 시작</small>
        </button>
        <button onClick={() => onOpenAllTasks('전체')} className="overview-card">
          <span className="overview-heading">
            <span className="overview-icon blue">
              <CalendarDays size={18} />
            </span>
            <span className="ov-label">마감 임박</span>
          </span>
          <strong>{dueSoon.length}</strong>
          <small>3일 이내 마감</small>
        </button>
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>오늘의 우선순위</h2>
              <p>오늘과 가까운 마감 항목</p>
            </div>
            <button className="text-action" onClick={() => onOpenAllTasks('전체')}>
              전체 보기 →
            </button>
          </div>
          {dueSoon.slice(0, 4).map((item) => (
            <WorkRow
              key={item.id}
              item={item}
              onEdit={() => onEditItem(item)}
              onStatus={(status) => onStatusChange(item, status)}
            />
          ))}
          {dueSoon.length === 0 && <EmptyState text="마감이 가까운 항목이 없습니다." />}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>최근 수정</h2>
              <p>마지막으로 업데이트한 업무</p>
            </div>
            <span className="live-pill">
              <i /> LIVE
            </span>
          </div>
          {recentItems.map((item) => (
            <WorkRow key={item.id} item={item} onEdit={() => onEditItem(item)} compact />
          ))}
        </section>
      </div>

      <section className="panel quick-panel">
        <div className="panel-head">
          <div>
            <h2>공간 바로가기</h2>
            <p>프로젝트별로 이어서 관리하세요</p>
          </div>
        </div>
        <div className="quick-links">
          <button onClick={() => onOpenCategory('개인', '실험실')}>
            <span className="quick-icon lavender">
              <FlaskConical size={17} />
            </span>
            <b>실험실</b>
            <small>아이디어와 실험 기록</small>
            <span className="quick-count">
              {items.filter((item) => item.category === '실험실').length}개 →
            </span>
          </button>
          <button onClick={() => onOpenCategory('회사', '더샘 마케팅')}>
            <span className="quick-icon green">
              <BriefcaseBusiness size={17} />
            </span>
            <b>더샘 마케팅</b>
            <small>캠페인 · 데일리 리포트</small>
            <span className="quick-count">
              {items.filter((item) => item.category === '더샘 마케팅').length}개 →
            </span>
          </button>
          <button onClick={() => onOpenCategory('개인', '콘텐츠 제작')}>
            <span className="quick-icon peach">
              <Sparkles size={17} />
            </span>
            <b>콘텐츠 제작</b>
            <small>블로그와 릴스 아이디어</small>
            <span className="quick-count">
              {
                items.filter(
                  (item) => item.category === '콘텐츠 제작' || item.category === '블로그·릴스 아이디어'
                ).length
              }
              개 →
            </span>
          </button>
        </div>
      </section>
    </>
  );
}
