import { useState } from 'react';
import { CalendarDays, ListTodo } from 'lucide-react';
import type { HubWorkItem } from '../../api/workHubRepository';
import { WorkHubCalendar } from './WorkHubCalendar';
import { WorkHubTableView } from './WorkHubTableView';
import './EconomicInstagramWorkspace.css';

type EconomicInstagramWorkspaceProps = {
  items: HubWorkItem[];
  filteredItems: HubWorkItem[];
  query: string;
  statusFilter: string;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onAdd: (date: string) => void;
  onQuickAdd: (date: string, title: string, format: string) => Promise<void>;
  onEdit: (item: HubWorkItem) => void;
};

export function EconomicInstagramWorkspace({
  items,
  filteredItems,
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  onAdd,
  onQuickAdd,
  onEdit,
}: EconomicInstagramWorkspaceProps) {
  const [sheet, setSheet] = useState<'calendar' | 'list'>('calendar');

  return (
    <section className="instagram-workspace">
      <div className="instagram-sheet-tabs" role="tablist" aria-label="경제 인스타 시트">
        <button
          className={sheet === 'calendar' ? 'active' : ''}
          role="tab"
          aria-selected={sheet === 'calendar'}
          onClick={() => setSheet('calendar')}
        >
          <CalendarDays size={16} /> 캘린더
        </button>
        <button
          className={sheet === 'list' ? 'active' : ''}
          role="tab"
          aria-selected={sheet === 'list'}
          onClick={() => setSheet('list')}
        >
          <ListTodo size={16} /> 기록 목록
        </button>
      </div>

      {sheet === 'calendar' ? (
        <WorkHubCalendar
          category="경제 인스타"
          items={items}
          onAdd={onAdd}
          onQuickAdd={onQuickAdd}
          onEdit={onEdit}
        />
      ) : (
        <WorkHubTableView
          area="개인"
          category="경제 인스타"
          allItems={items}
          filteredItems={filteredItems}
          query={query}
          statusFilter={statusFilter}
          onQueryChange={onQueryChange}
          onStatusFilterChange={onStatusFilterChange}
          onAddNew={() => onAdd('')}
          onEditItem={onEdit}
        />
      )}
    </section>
  );
}
