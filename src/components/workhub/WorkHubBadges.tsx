import { Check } from 'lucide-react';
import type { HubPriority, HubStatus, HubWorkItem } from '../../api/workHubRepository';

export function StatusPill({ status }: { status: HubStatus }) {
  return <span className={`status-pill ${status.replace(' ', '')}`}>{status}</span>;
}

export function PriorityLabel({ priority }: { priority: HubPriority }) {
  return (
    <span className={`priority ${priority}`}>
      {priority === '높음' ? '↑ ' : priority === '낮음' ? '↓ ' : ''}
      {priority}
    </span>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <span>✦</span>
      {text}
    </div>
  );
}

type WorkRowProps = {
  item: HubWorkItem;
  onEdit: () => void;
  onStatus?: (status: HubStatus) => void;
  compact?: boolean;
};

export function WorkRow({ item, onEdit, onStatus, compact = false }: WorkRowProps) {
  return (
    <div className="work-row">
      <button
        className="row-check"
        aria-label="완료 상태 전환"
        onClick={() => onStatus?.(item.status === '완료' ? '할 일' : '완료')}
      >
        {item.status === '완료' ? <Check size={13} /> : null}
      </button>
      <button className="row-body" onClick={onEdit}>
        <span className="row-title">{item.title}</span>
        <span className="row-sub">
          {item.category} · {item.due || '날짜 미정'}
          {!compact && <StatusPill status={item.status} />}
        </span>
      </button>
      <PriorityLabel priority={item.priority} />
    </div>
  );
}
