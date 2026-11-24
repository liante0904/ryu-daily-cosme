import { CalendarDays, LogOut } from 'lucide-react';
import type { HubArea } from '../../api/workHubRepository';

type WorkHubTopbarProps = {
  area: HubArea;
  view: string;
  category: string;
  onOpenMobileNav: () => void;
  onLogout: () => void;
};

export function WorkHubTopbar({
  area,
  view,
  category,
  onOpenMobileNav,
  onLogout,
}: WorkHubTopbarProps) {
  return (
    <header className="hub-topbar">
      <button className="mobile-menu" onClick={onOpenMobileNav}>
        ☰
      </button>
      <div className="breadcrumbs">
        지영의 워크스페이스 <span>/</span> {area} <span>/</span>{' '}
        {view === '대시보드' ? '대시보드' : category}
      </div>
      <div className="top-actions">
        <span className="today-label">
          <CalendarDays size={15} />
          {new Date().toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </span>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={14} /> 로그아웃
        </button>
        <button className="avatar small">지</button>
      </div>
    </header>
  );
}
