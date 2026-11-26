import {
  Activity,
  ArrowDownUp,
  BriefcaseBusiness,
  ChevronDown,
  FlaskConical,
  House,
  Plus,
  Settings2,
  Share2,
  Sparkles,
} from 'lucide-react';
import type { HubArea } from '../../api/workHubRepository';
import { HUB_CATEGORIES } from '../../workHubConfig';

type WorkHubSidebarProps = {
  area: HubArea;
  category: string;
  view: string;
  mobileNav: boolean;
  onCloseMobileNav: () => void;
  onChooseArea: (area: HubArea) => void;
  onGo: (view: string, category?: string) => void;
  onSelectPersonalCategory: (category: string) => void;
  onSelectCompanyCategory: (category: string) => void;
  onNewPersonalItem: () => void;
};

export function WorkHubSidebar({
  area,
  category,
  view,
  mobileNav,
  onCloseMobileNav,
  onChooseArea,
  onGo,
  onSelectPersonalCategory,
  onSelectCompanyCategory,
  onNewPersonalItem,
}: WorkHubSidebarProps) {
  return (
    <>
      <aside className={`hub-sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">j</div>
          <div>
            <b>jiyoung space</b>
            <small>MY WORKSPACE</small>
          </div>
        </div>

        <button
          className={`workspace-select ${area === '개인' ? 'selected' : ''}`}
          onClick={() => onChooseArea('개인')}
        >
          <House size={16} /> 개인 <ChevronDown size={14} />
        </button>

        <div className="nav-label">PERSONAL SPACE</div>
        <button
          className={`nav-item ${view === '대시보드' ? 'active' : ''}`}
          onClick={() => onGo('대시보드')}
        >
          <Activity size={16} /> 대시보드
        </button>
        <div className="nav-label nav-label-row">
          개인 프로젝트{' '}
          <button aria-label="새 개인 프로젝트" onClick={onNewPersonalItem}>
            <Plus size={14} />
          </button>
        </div>
        {HUB_CATEGORIES.개인.filter((cat) => cat !== 'SNS 캘린더').map((cat) => (
          <button
            key={cat}
            className={`nav-item sub ${area === '개인' && category === cat && view !== '대시보드' ? 'active' : ''}`}
            onClick={() => onSelectPersonalCategory(cat)}
          >
            {cat === '실험실' ? <FlaskConical size={15} /> : <span className="nav-dot" />}
            {cat}
          </button>
        ))}
        <div className="nav-label">SNS</div>
        <button
          className={`nav-item sub ${area === '개인' && category === 'SNS 캘린더' && view !== '대시보드' ? 'active' : ''}`}
          onClick={() => onSelectPersonalCategory('SNS 캘린더')}
        >
          <Share2 size={15} /> 캘린더
        </button>

        <button
          className={`workspace-select company-select ${area === '회사' ? 'selected' : ''}`}
          onClick={() => onChooseArea('회사')}
        >
          <BriefcaseBusiness size={16} /> 회사 <ChevronDown size={14} />
        </button>

        <div className="nav-label">WORKSPACE</div>
        <button
          className={`nav-item ${area === '회사' && category === '더샘 마케팅' ? 'active' : ''}`}
          onClick={() => onSelectCompanyCategory('더샘 마케팅')}
        >
          <Sparkles size={15} /> 더샘 마케팅
        </button>
        <button
          className={`nav-item sub ${category === 'mafia' ? 'active' : ''}`}
          onClick={() => onSelectCompanyCategory('mafia')}
        >
          <span className="nav-dot" /> mafia
        </button>
        <button className="nav-item" onClick={() => onGo('mafia-tool')}>
          <ArrowDownUp size={15} /> 키워드 도구
        </button>

        <div className="sidebar-bottom">
          <div className="avatar">지</div>
          <div>
            <b>지영</b>
            <small>Personal workspace</small>
          </div>
          <Settings2 size={16} />
        </div>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={onCloseMobileNav} aria-label="메뉴 닫기" />}
    </>
  );
}
