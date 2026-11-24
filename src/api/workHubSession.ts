export const SESSION_TOKEN_KEY = 'jiyoung-work-hub-session-v1';
const FALLBACK_SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface WorkHubSession {
  token: string;
  expiresAt: number | null;
}

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
