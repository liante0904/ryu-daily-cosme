import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearStoredSession,
  createApiWorkHubRepository,
  LEGACY_IMPORT_KEY,
  LEGACY_ITEMS_KEY,
  readLegacyWorkHubItems,
  readStoredSession,
  WorkHubApiError,
  writeStoredSession,
} from '../api/workHubRepository';
import type { HubWorkItem, WorkHubSession } from '../api/workHubRepository';
import { createTestWorkHubRepository } from '../api/testWorkHubRepository';
import { createUuid } from '../utils';

/**
 * Manage Work Hub session authentication, legacy localStorage migration, and PostgreSQL CRUD.
 */
export function useWorkHub() {
  const testMode = import.meta.env.VITE_TEST_LOGIN_BYPASS === 'true';
  const apiRepository = useMemo(() => createApiWorkHubRepository(), []);
  const testRepository = useMemo(() => createTestWorkHubRepository(), []);
  const [session, setSession] = useState<WorkHubSession | null>(() => readStoredSession());
  const token = session?.token ?? null;
  const localPreview = testMode && Boolean(token?.startsWith('test-preview-'));
  const repository = localPreview ? testRepository : apiRepository;

  const [items, setItems] = useState<HubWorkItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(Boolean(token));
  const [syncError, setSyncError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');

  const expireSession = useCallback((message = '세션이 만료되었습니다. 다시 로그인해 주세요.') => {
    clearStoredSession();
    setSession(null);
    setItems([]);
    setSyncError('');
    setLoginError(message);
  }, []);

  const loadItems = useCallback(
    async (accessToken: string) => {
      setItemsLoading(true);
      setSyncError('');
      try {
        let remoteItems = await repository.list(accessToken);
        if (!testMode && localStorage.getItem(LEGACY_IMPORT_KEY) !== '1') {
          const localItems = readLegacyWorkHubItems();
          const existingIds = new Set(remoteItems.map((item) => item.id));
          let importedAny = false;
          for (const localItem of localItems) {
            if (existingIds.has(localItem.id)) continue;
            await repository.save(accessToken, localItem);
            existingIds.add(localItem.id);
            importedAny = true;
          }
          localStorage.removeItem(LEGACY_ITEMS_KEY);
          localStorage.setItem(LEGACY_IMPORT_KEY, '1');
          if (importedAny) remoteItems = await repository.list(accessToken);
        }
        setItems(remoteItems);
      } catch (error) {
        if (error instanceof WorkHubApiError && error.status === 401) {
          expireSession();
        } else {
          setSyncError(error instanceof Error ? error.message : '업무 데이터를 불러오지 못했습니다.');
        }
      } finally {
        setItemsLoading(false);
      }
    },
    [repository, expireSession, testMode]
  );

  useEffect(() => {
    if (!session) {
      setItems([]);
      setItemsLoading(false);
      return;
    }
    if (session.expiresAt !== null && session.expiresAt <= Math.floor(Date.now() / 1000)) {
      expireSession();
      return;
    }
    void loadItems(session.token);
  }, [session, loadItems, expireSession]);

  const reloadItems = useCallback(async () => {
    if (!token) return;
    await loadItems(token);
  }, [token, loadItems]);

  const saveItem = useCallback(
    async (item: HubWorkItem) => {
      if (!token) return;
      setSyncError('');
      try {
        const saved = await repository.save(token, item);
        setItems((prev) =>
          prev.some((existing) => existing.id === saved.id)
            ? prev.map((existing) => (existing.id === saved.id ? saved : existing))
            : [saved, ...prev]
        );
      } catch (error) {
        if (error instanceof WorkHubApiError && error.status === 401) {
          expireSession();
          return;
        }
        const message =
          error instanceof Error ? `저장 실패: ${error.message}` : '저장하지 못했습니다. 다시 시도해 주세요.';
        setSyncError(message);
        throw error;
      }
    },
    [token, repository, expireSession]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!token) return;
      setSyncError('');
      try {
        await repository.remove(token, id);
        setItems((prev) => prev.filter((existing) => existing.id !== id));
      } catch (error) {
        if (error instanceof WorkHubApiError && error.status === 401) {
          expireSession();
          return;
        }
        const message =
          error instanceof Error ? `삭제 실패: ${error.message}` : '삭제하지 못했습니다. 다시 시도해 주세요.';
        setSyncError(message);
        throw error;
      }
    },
    [token, repository, expireSession]
  );

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setLoginBusy(true);
      setLoginError('');
      try {
        const auth = await apiRepository.login(username, password);
        const nextSession = writeStoredSession(auth.token, auth.expires_at);
        setItemsLoading(true);
        setSession(nextSession);
        return true;
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : '로그인하지 못했습니다.');
        return false;
      } finally {
        setLoginBusy(false);
      }
    },
    [apiRepository]
  );

  const enterTestMode = useCallback(() => {
    const expiresAt = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
    const nextSession = writeStoredSession(`test-preview-${createUuid()}`, expiresAt);
    setItemsLoading(true);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setItems([]);
    setSyncError('');
    setLoginError('');
  }, []);

  return {
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
  };
}
