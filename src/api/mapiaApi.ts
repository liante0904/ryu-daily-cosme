import type { ServerCsvFile, ServerProgress } from '../types';
import { API_BASE_URL } from '../utils';

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await response.json();
    return body.detail || body.message || fallback;
  }
  const text = await response.text();
  return text || fallback;
}

export async function fetchKeywordHistory(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/ryu/mapia/history/`);
  if (!response.ok) throw new Error('히스토리 로딩 실패');
  const rawData = await response.json();
  if (Array.isArray(rawData)) return rawData;
  return rawData.keywords || rawData.data || rawData.history || [];
}

export async function fetchServerFiles(): Promise<ServerCsvFile[]> {
  const response = await fetch(`${API_BASE_URL}/ryu/mapia/files/`);
  if (!response.ok) throw new Error('서버 파일 목록 로딩 실패');
  const data = await response.json();
  return Array.isArray(data.files) ? data.files : [];
}

export async function downloadServerFileBlob(filename: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/ryu/mapia/files/${encodeURIComponent(filename)}`
  );
  if (!response.ok) throw new Error('파일 다운로드 실패');
  return response.blob();
}

export async function fetchServerProgress(): Promise<ServerProgress> {
  const response = await fetch(`${API_BASE_URL}/ryu/mapia/status/`);
  if (!response.ok) throw new Error('작업 상태 로딩 실패');
  return response.json();
}

export async function requestCancelGeneration(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ryu/mapia/cancel/`, { method: 'POST' });
  if (!response.ok) throw new Error('생성 중단 요청 실패');
}

export async function startGeneration(keywords: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ryu/mapia/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, 'API 호출 실패'));
  }

  const accepted = await response.json();
  if (accepted.status !== 'accepted') {
    throw new Error(accepted.detail || accepted.message || '조회 작업을 시작하지 못했습니다.');
  }
}
