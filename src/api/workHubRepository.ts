import { API_BASE_URL } from '../utils';

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

export interface WorkHubSession {
  token: string;
  expiresAt: number | null;
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
export const SESSION_TOKEN_KEY = 'jiyoung-work-hub-session-v1';

const FALLBACK_SESSION_TTL_SECONDS = 8 * 60 * 60;

export function readStoredSession(): WorkHubSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!raw) return null;

    let session: WorkHubSession;
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as Partial<WorkHubSession>;
      if (typeof parsed.token !== 'string' || !parsed.token) {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        return null;
      }
      session = {
        token: parsed.token,
        expiresAt: typeof parsed.expiresAt === 'number' ? parsed.expiresAt : null,
      };
    } else {
      session = { token: raw, expiresAt: null };
    }

    if (session.expiresAt !== null && session.expiresAt <= Math.floor(Date.now() / 1000)) {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    return null;
  }
}

export function writeStoredSession(token: string, expiresAt?: number): WorkHubSession {
  const resolvedExpiresAt =
    typeof expiresAt === 'number' && Number.isFinite(expiresAt)
      ? expiresAt
      : Math.floor(Date.now() / 1000) + FALLBACK_SESSION_TTL_SECONDS;
  const session: WorkHubSession = { token, expiresAt: resolvedExpiresAt };
  sessionStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(session));
  return session;
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

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

export function normalizeWorkHubItem(raw: Partial<HubWorkItem>): HubWorkItem {
  const area: HubArea = raw.area === '회사' ? '회사' : '개인';
  const status: HubStatus =
    raw.status === '진행 중' || raw.status === '보류' || raw.status === '완료' ? raw.status : '할 일';
  const priority: HubPriority =
    raw.priority === '높음' || raw.priority === '낮음' ? raw.priority : '보통';

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : crypto.randomUUID(),
    area,
    category: typeof raw.category === 'string' && raw.category ? raw.category : area === '개인' ? '실험실' : '더샘 마케팅',
    title: typeof raw.title === 'string' ? raw.title : '',
    status,
    priority,
    owner: typeof raw.owner === 'string' ? raw.owner : '지영',
    due: typeof raw.due === 'string' ? raw.due : '',
    memo: typeof raw.memo === 'string' ? raw.memo : '',
    link: typeof raw.link === 'string' ? raw.link : '',
    attachment: typeof raw.attachment === 'string' ? raw.attachment : '',
    updated: typeof raw.updated === 'string' && raw.updated ? raw.updated : new Date().toISOString(),
    channel: typeof raw.channel === 'string' ? raw.channel : '',
    spend: raw.spend != null ? String(raw.spend) : '',
    revenue: raw.revenue != null ? String(raw.revenue) : '',
    roas: raw.roas != null ? String(raw.roas) : '',
    cvr: raw.cvr != null ? String(raw.cvr) : '',
    ctr: raw.ctr != null ? String(raw.ctr) : '',
    creative: typeof raw.creative === 'string' ? raw.creative : '',
    setup: typeof raw.setup === 'string' && raw.setup ? raw.setup : '미정',
    agency: typeof raw.agency === 'string' ? raw.agency : '',
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
