/**
 * Storage boundary for the work hub.
 * The browser repository is used until the owning backend API and auth contract
 * are confirmed. Add an API-backed implementation of WorkHubRepository after
 * the endpoint and persistence rules are agreed; no remote routes are assumed.
 */
export type HubArea = '개인' | '회사';
export type HubStatus = '할 일' | '진행 중' | '보류' | '완료';
export type HubPriority = '높음' | '보통' | '낮음';

export interface HubWorkItem {
  id: string;
  area: HubArea;
  category: string;
  title: string;
  status: HubStatus;
  priority: HubPriority;
  owner: string;
  due: string;
  memo: string;
  link: string;
  attachment: string;
  updated: string;
  channel: string;
  spend: string;
  revenue: string;
  roas: string;
  cvr: string;
  ctr: string;
  creative: string;
  setup: string;
  agency: string;
}

export interface WorkHubRepository {
  list(): Promise<HubWorkItem[]>;
  save(item: HubWorkItem): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createBrowserWorkHubRepository(storage: Storage = window.localStorage): WorkHubRepository {
  const key = 'jiyoung-work-hub-v1';
  const read = (): HubWorkItem[] => {
    try { return JSON.parse(storage.getItem(key) ?? '[]') as HubWorkItem[]; }
    catch { return []; }
  };
  return {
    async list() { return read(); },
    async save(item) {
      const items = read();
      const next = items.some(existing => existing.id === item.id)
        ? items.map(existing => existing.id === item.id ? item : existing)
        : [item, ...items];
      storage.setItem(key, JSON.stringify(next));
    },
    async remove(id) { storage.setItem(key, JSON.stringify(read().filter(item => item.id !== id))); },
  };
}
