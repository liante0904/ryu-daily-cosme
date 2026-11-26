import type { HubArea, HubPriority, HubStatus, HubWorkItem } from './api/workHubRepository';
import { createUuid } from './utils';

export const HUB_CATEGORIES: Record<HubArea, string[]> = {
  개인: ['실험실', '콘텐츠 제작', '경제 인스타', '블로그', '여행·호캉스', '집', '차량', '통신', '캘린더', 'SNS 캘린더'],
  회사: ['더샘 마케팅', 'mafia'],
};

export const HUB_STATUSES: HubStatus[] = ['할 일', '진행 중', '보류', '완료'];
export const HUB_PRIORITIES: HubPriority[] = ['높음', '보통', '낮음'];
export const HUB_SETUP_OPTIONS = ['미정', '직접 확인 필요', '준비 중', '운영 중', '중단'] as const;

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getIsoDateInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createBlankWorkItem(area: HubArea, category: string): HubWorkItem {
  return {
    id: createUuid(),
    area,
    category,
    title: '',
    status: '할 일',
    priority: '보통',
    owner: '지영',
    due: '',
    memo: '',
    link: '',
    attachment: '',
    updated: new Date().toISOString(),
    channel: '',
    spend: '',
    revenue: '',
    roas: '',
    cvr: '',
    ctr: '',
    creative: '',
    setup: '미정',
    agency: '',
  };
}

export function calcAverageMetric(items: HubWorkItem[], key: 'roas' | 'cvr' | 'ctr'): string {
  const nums = items.map((item) => Number(item[key])).filter((value) => value > 0);
  return nums.length ? (nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(1) : '—';
}
