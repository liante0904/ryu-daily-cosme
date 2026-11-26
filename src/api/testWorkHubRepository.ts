import type { HubWorkItem, WorkHubRepository } from './workHubRepository';

const TEST_ITEMS_KEY = 'ryu-test-work-hub-items-v1';

function readItems(): HubWorkItem[] {
  try {
    const items: unknown = JSON.parse(localStorage.getItem(TEST_ITEMS_KEY) ?? '[]');
    return Array.isArray(items) ? (items as HubWorkItem[]) : [];
  } catch {
    return [];
  }
}

function writeItems(items: HubWorkItem[]): void {
  localStorage.setItem(TEST_ITEMS_KEY, JSON.stringify(items));
}

export function createTestWorkHubRepository(): WorkHubRepository {
  return {
    async login() {
      throw new Error('테스트 환경에서는 “로그인 없이 입장”을 눌러 주세요.');
    },
    async list() {
      return readItems();
    },
    async save(_token, item) {
      const items = readItems();
      writeItems(items.some((entry) => entry.id === item.id)
        ? items.map((entry) => (entry.id === item.id ? item : entry))
        : [item, ...items]);
      return item;
    },
    async remove(_token, id) {
      writeItems(readItems().filter((item) => item.id !== id));
    },
  };
}
