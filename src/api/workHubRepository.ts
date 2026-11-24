import { API_BASE_URL } from '../utils';
import { normalizeWorkHubItem } from '../workHubConfig';

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

export interface LoginResponse {
  token: string;
  expires_at: number;
}

export interface WorkHubRepository {
  login(username: string, password: string): Promise<LoginResponse>;
  list(token: string): Promise<HubWorkItem[]>;
  save(token: string, item: HubWorkItem): Promise<HubWorkItem>;
  remove(token: string, id: string): Promise<void>;
}

export class WorkHubApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'WorkHubApiError';
  }
}

export const LEGACY_ITEMS_KEY = 'jiyoung-work-hub-v1';
export const LEGACY_IMPORT_KEY = 'jiyoung-work-hub-pg-imported-v1';

async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: string; message?: string };
    return payload.detail || payload.message || `요청 실패 (${response.status})`;
  } catch {
    return `요청 실패 (${response.status})`;
  }
}

async function authorizedFetch(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) throw new WorkHubApiError(await readError(response), response.status);
  return response;
}

export function createApiWorkHubRepository(): WorkHubRepository {
  return {
    async login(username, password) {
      const response = await fetch(`${API_BASE_URL}/ryu/workhub/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new WorkHubApiError(await readError(response), response.status);
      const payload = (await response.json()) as LoginResponse;
      return {
        token: payload.token,
        expires_at: payload.expires_at,
      };
    },
    async list(token) {
      const response = await authorizedFetch('/ryu/workhub/items', token);
      const payload = (await response.json()) as { items: HubWorkItem[] };
      return Array.isArray(payload.items) ? payload.items : [];
    },
    async save(token, item) {
      const response = await authorizedFetch(`/ryu/workhub/items/${encodeURIComponent(item.id)}`, token, {
        method: 'PUT',
        body: JSON.stringify(item),
      });
      return response.json() as Promise<HubWorkItem>;
    },
    async remove(token, id) {
      await authorizedFetch(`/ryu/workhub/items/${encodeURIComponent(id)}`, token, { method: 'DELETE' });
    },
  };
}

export function readLegacyWorkHubItems(): HubWorkItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEGACY_ITEMS_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is Partial<HubWorkItem> => Boolean(entry && typeof entry === 'object'))
      .map(normalizeWorkHubItem);
  } catch {
    return [];
  }
}
