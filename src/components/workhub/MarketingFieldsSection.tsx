import { CircleHelp } from 'lucide-react';
import type { HubWorkItem } from '../../api/workHubRepository';
import { HUB_SETUP_OPTIONS } from '../../workHubConfig';

type MarketingFieldsSectionProps = {
  form: HubWorkItem;
  onChange: (key: keyof HubWorkItem, value: string) => void;
};

export function MarketingFieldsSection({ form, onChange }: MarketingFieldsSectionProps) {
  const autoRoas =
    form.spend && form.revenue ? (Number(form.revenue) / Number(form.spend)).toFixed(2) : form.roas;

  return (
    <>
      <div className="form-divider">
        <span>더샘 퍼포먼스 마케팅</span>
      </div>
      <div className="form-grid three">
        <label>
          채널
          <input
            value={form.channel}
            onChange={(event) => onChange('channel', event.target.value)}
            placeholder="Meta, Naver…"
          />
        </label>
        <label>
          광고비 (원)
          <input
            type="number"
            value={form.spend}
            onChange={(event) => onChange('spend', event.target.value)}
          />
        </label>
        <label>
          매출 (원)
          <input
            type="number"
            value={form.revenue}
            onChange={(event) => onChange('revenue', event.target.value)}
          />
        </label>
        <label>
          ROAS{' '}
          <input
            value={autoRoas}
            onChange={(event) => onChange('roas', event.target.value)}
            placeholder="자동 계산"
          />
        </label>
        <label>
          CVR (%)
          <input
            type="number"
            value={form.cvr}
            onChange={(event) => onChange('cvr', event.target.value)}
          />
        </label>
        <label>
          CTR (%)
          <input
            type="number"
            value={form.ctr}
            onChange={(event) => onChange('ctr', event.target.value)}
          />
        </label>
      </div>
      <label>
        소재
        <input
          value={form.creative}
          onChange={(event) => onChange('creative', event.target.value)}
          placeholder="소재명 / 버전"
        />
      </label>
      <div className="form-grid">
        <label>
          세팅 상태
          <select
            value={form.setup || '미정'}
            onChange={(event) => onChange('setup', event.target.value)}
          >
            {HUB_SETUP_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label>
          대행사 이슈
          <input
            value={form.agency}
            onChange={(event) => onChange('agency', event.target.value)}
            placeholder="이슈, 회신 대기, 후속 조치"
          />
        </label>
      </div>
      <div className="integration-note inline">
        <CircleHelp size={15} />
        <span>
          채널 API, 계약 데이터 및 일정 연동 방식은 <b>미정 · 직접 확인 필요</b>합니다.
        </span>
      </div>
    </>
  );
}
