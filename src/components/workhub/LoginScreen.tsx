import type { FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';

type LoginScreenProps = {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  error: string;
  showTestEntry?: boolean;
  onTestEntry?: () => void;
};

export function LoginScreen({
  username,
  setUsername,
  password,
  setPassword,
  onSubmit,
  busy,
  error,
  showTestEntry = false,
  onTestEntry,
}: LoginScreenProps) {
  return (
    <main className={showTestEntry ? 'login-screen test-login-screen' : 'login-screen'}>
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-mark">j</div>
          <div>
            <b>jiyoung space</b>
            <small>PRIVATE WORKSPACE</small>
          </div>
        </div>
        <div className="login-lock">
          <LockKeyhole size={20} />
        </div>
        <h1>지영의 업무 허브</h1>
        <p>개인 및 회사 업무를 보려면 로그인해 주세요.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="work-hub-username">아이디</label>
          <input
            id="work-hub-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoFocus
            placeholder="아이디 입력"
          />
          <label htmlFor="work-hub-password">접속 비밀번호</label>
          <input
            id="work-hub-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="비밀번호 입력"
          />
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          {showTestEntry ? (
            <div className="login-actions">
              <button className="primary-btn login-submit" disabled={busy}>
                {busy ? '확인 중…' : '로그인'}
              </button>
              <button className="test-entry-btn" type="button" onClick={onTestEntry}>
                로그인 없이 입장
              </button>
            </div>
          ) : (
            <button className="primary-btn login-submit" disabled={busy}>
              {busy ? '확인 중…' : '로그인'}
            </button>
          )}
        </form>
        <small className="login-footnote">
          {showTestEntry ? '테스트 항목은 이 브라우저에만 저장됩니다.' : '로그인 세션은 이 브라우저 탭에서만 유지됩니다.'}
        </small>
      </section>
      {showTestEntry && <span className="login-test-note">&lt;테스트 공간임&gt;</span>}
    </main>
  );
}

export function WorkHubLoadingScreen() {
  return (
    <div className="login-screen">
      <div className="login-card loading-card">
        <div className="brand-mark">j</div>
        <h1>업무 데이터를 불러오는 중</h1>
        <p>PostgreSQL에 안전하게 연결하고 있습니다.</p>
      </div>
    </div>
  );
}
