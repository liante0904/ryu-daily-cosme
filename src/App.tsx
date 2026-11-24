import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, CircleHelp, LogOut, Plus } from 'lucide-react';
import { LegacyMafiaApp } from './LegacyMafiaApp';
import type { HubArea, HubWorkItem } from './api/workHubRepository';
import { LoginScreen, WorkHubLoadingScreen } from './components/workhub/LoginScreen';
import { WorkHubDashboard } from './components/workhub/WorkHubDashboard';
import { WorkHubItemModal } from './components/workhub/WorkHubItemModal';
import { WorkHubSidebar } from './components/workhub/WorkHubSidebar';
import { WorkHubTableView } from './components/workhub/WorkHubTableView';
import { useWorkHub } from './hooks/useWorkHub';
import { createBlankWorkItem } from './workHubConfig';
import './Hub.css';

function App() {
  const {
    token,
    items,
    itemsLoading,
    syncError,
    loginBusy,
    loginError,
    login,
    logout,
    reloadItems,
    saveItem,
    deleteItem,
  } = useWorkHub();

  const [password, setPassword] = useState('');
  const [area, setArea] = useState<HubArea>('개인');
  const [category, setCategory] = useState('실험실');
  const [view, setView] = useState('대시보드');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [modal, setModal] = useState<HubWorkItem | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await login(password);
    if (ok) setPassword('');
  };

  const handleLogout = () => {
    setModal(null);
    logout();
  };

  const chooseArea = (nextArea: HubArea) => {
    setArea(nextArea);
    setCategory(nextArea === '개인' ? '실험실' : '더샘 마케팅');
    setView('대시보드');
    setMobileNav(false);
  };

  const go = (nextView: string, nextCategory?: string) => {
    setView(nextView);
    if (nextCategory) setCategory(nextCategory);
    setMobileNav(false);
  };

  const filtered = useMemo(
    () =>
      items
        .filter(
          (item) =>
            (view === '대시보드' || view === '전체 업무'
              ? true
              : item.area === area && item.category === category) &&
            (!query ||
              `${item.title} ${item.category} ${item.memo} ${item.channel} ${item.agency}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (statusFilter === '전체' || item.status === statusFilter)
        )
        .sort((a, b) => b.updated.localeCompare(a.updated)),
    [items, view, area, category, query, statusFilter]
  );

  if (!token) {
    return (
      <LoginScreen
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
        busy={loginBusy}
        error={loginError}
      />
    );
  }
  if (itemsLoading) return <WorkHubLoadingScreen />;
  if (view === 'mafia-tool') {
    return (
      <>
        <button className="back-hub" onClick={() => go('대시보드')}>
          ← 업무 허브로
        </button>
        <LegacyMafiaApp />
      </>
    );
  }

  return (
    <div className="hub-shell">
      <WorkHubSidebar
        area={area}
        category={category}
        view={view}
        mobileNav={mobileNav}
        onCloseMobileNav={() => setMobileNav(false)}
        onChooseArea={chooseArea}
        onGo={go}
        onSelectPersonalCategory={(cat) => {
          setArea('개인');
          go('목록', cat);
        }}
        onSelectCompanyCategory={(cat) => {
          setArea('회사');
          go('목록', cat);
        }}
        onNewPersonalItem={() => {
          setArea('개인');
          setModal(createBlankWorkItem('개인', category));
        }}
      />

      <main className="hub-main">
        <header className="hub-topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}>
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
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={14} /> 로그아웃
            </button>
            <button className="avatar small">지</button>
          </div>
        </header>

        <section className="hub-content">
          {syncError && (
            <div className="sync-banner" role="alert">
              <CircleHelp size={16} />
              <span>{syncError}</span>
              <button onClick={() => void reloadItems()}>다시 시도</button>
            </div>
          )}

          <div className="welcome-row">
            <div>
              <div className="eyebrow">
                {view === '대시보드' ? 'MONDAY, YOUR SPACE' : `WORKSPACE · ${area.toUpperCase()}`}
              </div>
              <h1>
                {view === '대시보드' ? '안녕하세요, 지영님' : ` ${view === '목록' ? category : view}`}
              </h1>
              <p>
                {view === '대시보드'
                  ? '오늘의 흐름을 확인하고, 중요한 일부터 시작해 보세요.'
                  : '업무와 기록을 한곳에서 정리하고 바로 업데이트하세요.'}
              </p>
            </div>
            <button className="primary-btn" onClick={() => setModal(createBlankWorkItem(area, category))}>
              <Plus size={17} /> 새 항목
            </button>
          </div>

          {view === '대시보드' ? (
            <WorkHubDashboard
              items={items}
              onEditItem={setModal}
              onStatusChange={(item, status) => {
                void saveItem({ ...item, status, updated: new Date().toISOString() }).catch(
                  () => undefined
                );
              }}
              onOpenAllTasks={(nextStatus) => {
                setStatusFilter(nextStatus);
                go('전체 업무');
              }}
              onOpenCategory={(nextArea, nextCategory) => {
                setArea(nextArea);
                go('목록', nextCategory);
              }}
            />
          ) : (
            <WorkHubTableView
              area={area}
              category={category}
              allItems={items}
              filteredItems={filtered}
              query={query}
              statusFilter={statusFilter}
              onQueryChange={setQuery}
              onStatusFilterChange={setStatusFilter}
              onAddNew={() => setModal(createBlankWorkItem(area, category))}
              onEditItem={setModal}
            />
          )}

          <footer className="hub-footer">
            <span>저장 위치: PostgreSQL · 로그인 세션 유지 중</span>
            <span>자동 연동 방식은 미정 · 직접 확인 필요</span>
          </footer>
        </section>
      </main>

      {modal && (
        <WorkHubItemModal
          item={modal}
          onClose={() => setModal(null)}
          onSave={async (nextItem) => {
            await saveItem(nextItem);
            setModal(null);
          }}
          onDelete={async () => {
            await deleteItem(modal.id);
            setModal(null);
          }}
          isExisting={items.some((item) => item.id === modal.id)}
        />
      )}
    </div>
  );
}

export default App;
