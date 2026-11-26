import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, LogOut } from 'lucide-react';
import { LegacyMafiaApp } from './LegacyMafiaApp';
import type { HubArea, HubWorkItem } from './api/workHubRepository';
import { LoginScreen, WorkHubLoadingScreen } from './components/workhub/LoginScreen';
import { WorkHubContent } from './components/workhub/WorkHubContent';
import { WorkHubModalHost } from './components/workhub/WorkHubModalHost';
import { WorkHubSidebar } from './components/workhub/WorkHubSidebar';
import { useWorkHub } from './hooks/useWorkHub';
import { useWorkHubNavigation } from './hooks/useWorkHubNavigation';
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
    testMode,
    login,
    enterTestMode,
    logout,
    reloadItems,
    saveItem,
    deleteItem,
  } = useWorkHub();
  const navigation = useWorkHubNavigation(items);
  const {
    area,
    setArea,
    category,
    view,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    mobileNav,
    setMobileNav,
    filteredItems,
    chooseArea,
    go,
  } = navigation;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState<HubWorkItem | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      setUsername('');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setModal(null);
    logout();
  };

  const handleSaveItem = async (item: HubWorkItem) => {
    await saveItem(item);
    setModal(null);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
    setModal(null);
  };

  const openNewItem = () => setModal(createBlankWorkItem(area, category));

  if (!token) {
    return (
      <LoginScreen
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
        busy={loginBusy}
        error={loginError}
        showTestEntry={testMode}
        onTestEntry={enterTestMode}
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
        onSelectPersonalCategory={(nextCategory) => {
          setArea('개인');
          go('목록', nextCategory);
        }}
        onSelectCompanyCategory={(nextCategory) => {
          setArea('회사');
          go('목록', nextCategory);
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

        <WorkHubContent
          area={area}
          category={category}
          view={view}
          items={items}
          filteredItems={filteredItems}
          query={query}
          statusFilter={statusFilter}
          testMode={testMode}
          syncError={syncError}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
          onReload={() => void reloadItems()}
          onEdit={setModal}
          onSave={saveItem}
          onAddNew={openNewItem}
          onOpenAllTasks={(nextStatus) => {
            setStatusFilter(nextStatus);
            go('전체 업무');
          }}
          onOpenCategory={(nextArea: HubArea, nextCategory: string) => {
            setArea(nextArea);
            go('목록', nextCategory);
          }}
          onStatusChange={(item, status) => {
            void saveItem({ ...item, status, updated: new Date().toISOString() }).catch(
              () => undefined
            );
          }}
        />
      </main>

      <WorkHubModalHost
        item={modal}
        isExisting={items.some((item) => item.id === modal?.id)}
        onClose={() => setModal(null)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}

export default App;
