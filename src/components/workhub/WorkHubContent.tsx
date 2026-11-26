import { CircleHelp, Plus } from 'lucide-react';
import type { HubArea, HubWorkItem } from '../../api/workHubRepository';
import { WorkHubDashboard } from './WorkHubDashboard';
import { WorkHubCalendar } from './WorkHubCalendar';
import { EconomicInstagramWorkspace } from './EconomicInstagramWorkspace';
import { BlogReviewWorkspace } from './BlogReviewWorkspace';
import { WorkHubTableView } from './WorkHubTableView';
import { createBlankWorkItem } from '../../workHubConfig';

interface WorkHubContentProps {
  area: HubArea;
  category: string;
  view: string;
  items: HubWorkItem[];
  filteredItems: HubWorkItem[];
  query: string;
  statusFilter: string;
  testMode: boolean;
  syncError: string | null;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onReload: () => void;
  onEdit: (item: HubWorkItem) => void;
  onSave: (item: HubWorkItem) => Promise<void>;
  onAddNew: () => void;
  onOpenAllTasks: (status: string) => void;
  onOpenCategory: (area: HubArea, category: string) => void;
  onStatusChange: (item: HubWorkItem, status: HubWorkItem['status']) => void;
}

export function WorkHubContent({
  area,
  category,
  view,
  items,
  filteredItems,
  query,
  statusFilter,
  testMode,
  syncError,
  onQueryChange,
  onStatusFilterChange,
  onReload,
  onEdit,
  onSave,
  onAddNew,
  onOpenAllTasks,
  onOpenCategory,
  onStatusChange,
}: WorkHubContentProps) {
  const isCalendar =
    view === '목록' && area === '개인' && (category === '캘린더' || category === 'SNS 캘린더');
  const isEconomicInstagram = view === '목록' && area === '개인' && category === '경제 인스타';
  const isBlogWorkspace = view === '목록' && area === '개인' && category === '블로그';

  return (
    <section className="hub-content">
      {syncError && (
        <div className="sync-banner" role="alert">
          <CircleHelp size={16} />
          <span>{syncError}</span>
          <button onClick={onReload}>다시 시도</button>
        </div>
      )}

      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            {view === '대시보드' ? 'MONDAY, YOUR SPACE' : `WORKSPACE · ${area.toUpperCase()}`}
          </div>
          <h1>{view === '대시보드' ? '안녕하세요, 지영님' : ` ${view === '목록' ? category : view}`}</h1>
          <p>
            {view === '대시보드'
              ? '오늘의 흐름을 확인하고, 중요한 일부터 시작해 보세요.'
              : isEconomicInstagram
                ? '콘텐츠 일정을 달력에 바로 적고 업로드 계획을 관리해 보세요.'
                : '업무와 기록을 한곳에서 정리하고 바로 업데이트하세요.'}
          </p>
        </div>
        {!isCalendar && !isEconomicInstagram && !isBlogWorkspace && (
          <button className="primary-btn" onClick={onAddNew}>
            <Plus size={17} /> 새 항목
          </button>
        )}
      </div>

      {view === '대시보드' ? (
        <WorkHubDashboard
          items={items}
          onEditItem={onEdit}
          onStatusChange={onStatusChange}
          onOpenAllTasks={onOpenAllTasks}
          onOpenCategory={onOpenCategory}
        />
      ) : isCalendar ? (
        <WorkHubCalendar
          category={category as '캘린더' | 'SNS 캘린더'}
          items={items}
          onAdd={(date) => onEdit({ ...createBlankWorkItem(area, category), due: date })}
          onEdit={onEdit}
        />
      ) : isEconomicInstagram ? (
        <EconomicInstagramWorkspace
          items={items}
          filteredItems={filteredItems}
          query={query}
          statusFilter={statusFilter}
          onQueryChange={onQueryChange}
          onStatusFilterChange={onStatusFilterChange}
          onAdd={(date) => onEdit({ ...createBlankWorkItem('개인', '경제 인스타'), due: date })}
          onQuickAdd={async (date, title, format) => {
            await onSave({
              ...createBlankWorkItem('개인', '경제 인스타'),
              due: date,
              title,
              channel: format,
            });
          }}
          onEdit={onEdit}
        />
      ) : isBlogWorkspace ? (
        <BlogReviewWorkspace
          items={items}
          onAdd={() => onEdit(createBlankWorkItem('개인', '블로그'))}
          onEdit={(item) => onEdit({ ...item, area: '개인', category: '블로그' })}
          onToggleCompleted={async (item) => {
            await onSave({
              ...item,
              area: '개인',
              category: '블로그',
              status: item.status === '완료' ? '진행 중' : '완료',
              updated: new Date().toISOString(),
            });
          }}
        />
      ) : (
        <WorkHubTableView
          area={area}
          category={category}
          allItems={items}
          filteredItems={filteredItems}
          query={query}
          statusFilter={statusFilter}
          onQueryChange={onQueryChange}
          onStatusFilterChange={onStatusFilterChange}
          onAddNew={onAddNew}
          onEditItem={onEdit}
        />
      )}

      <footer className="hub-footer">
        <span>
          {testMode ? '테스트 모드 · 이 브라우저의 테스트 저장소' : '저장 위치: PostgreSQL · 로그인 세션 유지 중'}
        </span>
        <span>자동 연동 방식은 미정 · 직접 확인 필요</span>
      </footer>
    </section>
  );
}
