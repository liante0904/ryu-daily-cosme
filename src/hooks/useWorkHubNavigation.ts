import { useMemo, useState } from 'react';
import type { HubArea, HubWorkItem } from '../api/workHubRepository';
import { LEGACY_BLOG_CATEGORY } from '../components/workhub/blogReviewConfig';

export function useWorkHubNavigation(items: HubWorkItem[]) {
  const [area, setArea] = useState<HubArea>('개인');
  const [category, setCategory] = useState('실험실');
  const [view, setView] = useState('대시보드');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [mobileNav, setMobileNav] = useState(false);

  const filteredItems = useMemo(
    () =>
      items
        .filter(
          (item) =>
            (view === '대시보드' || view === '전체 업무'
              ? true
              : item.area === area &&
                (item.category === category ||
                  (category === '블로그' && item.category === LEGACY_BLOG_CATEGORY))) &&
            (!query ||
              `${item.title} ${item.category} ${item.memo} ${item.channel} ${item.agency}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (statusFilter === '전체' || item.status === statusFilter)
        )
        .sort((a, b) => b.updated.localeCompare(a.updated)),
    [items, view, area, category, query, statusFilter]
  );

  const chooseArea = (nextArea: HubArea) => {
    setArea(nextArea);
    setCategory(nextArea === '개인' ? '실험실' : '더샘 마케팅');
    setView('대시보드');
    setMobileNav(false);
  };

  const go = (nextView: string, nextCategory?: string) => {
    setView(nextView);
    if (nextCategory) setCategory(nextCategory);
    setMobileNav(false);
  };

  return {
    area,
    setArea,
    category,
    setCategory,
    view,
    setView,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    mobileNav,
    setMobileNav,
    filteredItems,
    chooseArea,
    go,
  };
}
