import type { HubArea, HubPriority, HubStatus, HubWorkItem } from './api/workHubRepository';

export const HUB_CATEGORIES: Record<HubArea, string[]> = {
  개인: ['실험실', '콘텐츠 제작', '경제 인스타', '블로그·릴스 아이디어', '여행·호캉스', '집', '차량', '통신', '캘린더'],
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
    id: crypto.randomUUID(),
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

export function normalizeWorkHubItem(raw: Partial<HubWorkItem>): HubWorkItem {
  const area: HubArea = raw.area === '회사' ? '회사' : '개인';
  const status: HubStatus =
    raw.status === '진행 중' || raw.status === '보류' || raw.status === '완료' ? raw.status : '할 일';
  const priority: HubPriority =
    raw.priority === '높음' || raw.priority === '낮음' ? raw.priority : '보통';

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : crypto.randomUUID(),
    area,
    category:
      typeof raw.category === 'string' && raw.category
        ? raw.category
        : area === '개인'
          ? '실험실'
          : '더샘 마케팅',
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

export function filterAndSortWorkItems(
  items: HubWorkItem[],
  view: string,
  area: HubArea,
  category: string,
  query: string,
  statusFilter: string
): HubWorkItem[] {
  const normalizedQuery = query.toLowerCase();
  return items
    .filter(
      (item) =>
        (view === '대시보드' || view === '전체 업무'
          ? true
          : item.area === area && item.category === category) &&
        (!normalizedQuery ||
          `${item.title} ${item.category} ${item.memo} ${item.channel} ${item.agency}`
            .toLowerCase()
            .includes(normalizedQuery)) &&
        (statusFilter === '전체' || item.status === statusFilter)
    )
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

export function calcAverageMetric(items: HubWorkItem[], key: 'roas' | 'cvr' | 'ctr'): string {
  const nums = items.map((item) => Number(item[key])).filter((value) => value > 0);
  return nums.length ? (nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(1) : '—';
}
