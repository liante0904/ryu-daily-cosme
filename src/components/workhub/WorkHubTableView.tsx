import { CircleHelp, Filter, FlaskConical, Plus, Search } from 'lucide-react';
import type { HubArea, HubWorkItem } from '../../api/workHubRepository';
import { calcAverageMetric, HUB_STATUSES } from '../../workHubConfig';
import { EmptyState, PriorityLabel, StatusPill } from './WorkHubBadges';

type WorkHubTableViewProps = {
  area: HubArea;
  category: string;
  allItems: HubWorkItem[];
  filteredItems: HubWorkItem[];
  query: string;
  statusFilter: string;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onAddNew: () => void;
  onEditItem: (item: HubWorkItem) => void;
};

export function WorkHubTableView({
  area,
  category,
  allItems,
  filteredItems,
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  onAddNew,
  onEditItem,
}: WorkHubTableViewProps) {
  const isCompanyMarketing = category === '더샘 마케팅' && area === '회사';
  const isPersonalLab = category === '실험실' && area === '개인';

  return (
    <>
      {isCompanyMarketing && (
        <div className="metrics-grid">
          {[
            ['광고비', `${filteredItems.reduce((sum, item) => sum + (Number(item.spend) || 0), 0).toLocaleString()}원`],
            ['매출', `${filteredItems.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0).toLocaleString()}원`],
            ['평균 ROAS', `${calcAverageMetric(filteredItems, 'roas')}x`],
            ['평균 CVR / CTR', `${calcAverageMetric(filteredItems, 'cvr')}% / ${calcAverageMetric(filteredItems, 'ctr')}%`],
          ].map(([label, value]) => (
            <div className="metric" key={label}>
              <small>{label}</small>
              <b>{value}</b>
            </div>
          ))}
        </div>
      )}

      {isPersonalLab && (
        <div className="lab-banner">
          <span className="lab-symbol">
            <FlaskConical size={20} />
          </span>
          <div>
            <b>지영의 실험실</b>
            <p>아이디어를 작게 시험하고, 결과를 기록해 다음 시도로 연결해 보세요.</p>
          </div>
          <span className="lab-tag">
            실험 기록 {allItems.filter((item) => item.category === '실험실').length}
          </span>
        </div>
      )}

      <div className="panel table-panel">
        <div className="toolbar">
          <div className="searchbox">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="제목, 메모, 채널 검색"
            />
          </div>
          <div className="filterbox">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
            >
              {['전체', ...HUB_STATUSES].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <button className="primary-btn compact-btn" onClick={onAddNew}>
            <Plus size={16} /> 항목 추가
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>업무</th>
                <th>상태</th>
                <th>우선순위</th>
                <th>담당자</th>
                <th>마감일</th>
                {isCompanyMarketing && (
                  <>
                    <th>채널 / 소재</th>
                    <th>광고비</th>
                    <th>매출</th>
                    <th>ROAS</th>
                    <th>CVR · CTR</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} onClick={() => onEditItem(item)}>
                  <td>
                    <div className="task-title">{item.title || '제목 없음'}</div>
                    <div className="task-meta">
                      {item.category}
                      {item.memo && ` · ${item.memo}`}
                    </div>
                  </td>
                  <td>
                    <StatusPill status={item.status} />
                  </td>
                  <td>
                    <PriorityLabel priority={item.priority} />
                  </td>
                  <td>{item.owner || '—'}</td>
                  <td>{item.due || '—'}</td>
                  {isCompanyMarketing && (
                    <>
                      <td>
                        {item.channel || '—'}
                        {item.creative && <small className="table-sub">{item.creative}</small>}
                      </td>
                      <td>{item.spend ? `${Number(item.spend).toLocaleString()}원` : '—'}</td>
                      <td>{item.revenue ? `${Number(item.revenue).toLocaleString()}원` : '—'}</td>
                      <td>{item.roas ? `${item.roas}x` : '—'}</td>
                      <td>
                        {item.cvr || '—'}% · {item.ctr || '—'}%
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredItems.length && (
            <EmptyState text="조건에 맞는 항목이 없습니다. 새 항목을 추가해 보세요." />
          )}
        </div>

        {isCompanyMarketing && (
          <div className="integration-note">
            <CircleHelp size={15} />
            <span>
              광고 플랫폼 자동 연동·수치 수집 방식: <b>미정</b> · 현재 입력 데이터 기준으로 요약합니다.
            </span>
          </div>
        )}
      </div>
    </>
  );
}
