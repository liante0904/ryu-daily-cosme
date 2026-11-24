import { useState } from 'react';
import { Check, CircleHelp, X } from 'lucide-react';
import type { HubArea, HubWorkItem } from '../../api/workHubRepository';
import { HUB_CATEGORIES, HUB_PRIORITIES, HUB_SETUP_OPTIONS, HUB_STATUSES } from '../../workHubConfig';

type WorkHubItemModalProps = {
  item: HubWorkItem;
  onClose: () => void;
  onSave: (item: HubWorkItem) => Promise<void>;
  onDelete: () => Promise<void>;
  isExisting: boolean;
};

export function WorkHubItemModal({ item, onClose, onSave, onDelete, isExisting }: WorkHubItemModalProps) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const put = (key: keyof HubWorkItem, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value, updated: new Date().toISOString() }));
  const isCompanyMarketing = form.area === '회사' && form.category === '더샘 마케팅';

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setFormError('');
    try {
      await onSave(form);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setFormError('');
    try {
      await onDelete();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '삭제하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="item-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              {form.area} · {form.category}
            </span>
            <h2>{isExisting ? '항목 편집' : '새 항목'}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form">
          <label className="wide">
            제목
            <input
              autoFocus
              value={form.title}
              onChange={(event) => put('title', event.target.value)}
              placeholder="예: 다음 주 캠페인 리포트 확인"
            />
          </label>
          <div className="form-grid">
            <label>
              영역
              <select
                value={form.area}
                onChange={(event) => {
                  const nextArea = event.target.value as HubArea;
                  setForm((prev) => ({
                    ...prev,
                    area: nextArea,
                    category: nextArea === '개인' ? '실험실' : '더샘 마케팅',
                  }));
                }}
              >
                <option>개인</option>
                <option>회사</option>
              </select>
            </label>
            <label>
              카테고리
              <select value={form.category} onChange={(event) => put('category', event.target.value)}>
                {HUB_CATEGORIES[form.area].map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </label>
            <label>
              상태
              <select value={form.status} onChange={(event) => put('status', event.target.value)}>
                {HUB_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label>
              우선순위
              <select value={form.priority} onChange={(event) => put('priority', event.target.value)}>
                {HUB_PRIORITIES.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label>
              담당자
              <input
                value={form.owner}
                onChange={(event) => put('owner', event.target.value)}
                placeholder="담당자"
              />
            </label>
            <label>
              마감일
              <input type="date" value={form.due} onChange={(event) => put('due', event.target.value)} />
            </label>
          </div>
          <label>
            메모
            <textarea
              value={form.memo}
              onChange={(event) => put('memo', event.target.value)}
              rows={3}
              placeholder="내용과 다음 행동을 기록하세요"
            />
          </label>
          <div className="form-grid">
            <label>
              링크
              <input
                value={form.link}
                onChange={(event) => put('link', event.target.value)}
                placeholder="https://"
              />
            </label>
            <label>
              첨부 메모
              <input
                value={form.attachment}
                onChange={(event) => put('attachment', event.target.value)}
                placeholder="파일명 또는 참고 메모"
              />
            </label>
          </div>

          {isCompanyMarketing && (
            <>
              <div className="form-divider">
                <span>더샘 퍼포먼스 마케팅</span>
              </div>
              <div className="form-grid three">
                <label>
                  채널
                  <input
                    value={form.channel}
                    onChange={(event) => put('channel', event.target.value)}
                    placeholder="Meta, Naver…"
                  />
                </label>
                <label>
                  광고비 (원)
                  <input
                    type="number"
                    value={form.spend}
                    onChange={(event) => put('spend', event.target.value)}
                  />
                </label>
                <label>
                  매출 (원)
                  <input
                    type="number"
                    value={form.revenue}
                    onChange={(event) => put('revenue', event.target.value)}
                  />
                </label>
                <label>
                  ROAS{' '}
                  <input
                    value={
                      form.spend && form.revenue
                        ? (Number(form.revenue) / Number(form.spend)).toFixed(2)
                        : form.roas
                    }
                    onChange={(event) => put('roas', event.target.value)}
                    placeholder="자동 계산"
                  />
                </label>
                <label>
                  CVR (%)
                  <input
                    type="number"
                    value={form.cvr}
                    onChange={(event) => put('cvr', event.target.value)}
                  />
                </label>
                <label>
                  CTR (%)
                  <input
                    type="number"
                    value={form.ctr}
                    onChange={(event) => put('ctr', event.target.value)}
                  />
                </label>
              </div>
              <label>
                소재
                <input
                  value={form.creative}
                  onChange={(event) => put('creative', event.target.value)}
                  placeholder="소재명 / 버전"
                />
              </label>
              <div className="form-grid">
                <label>
                  세팅 상태
                  <select value={form.setup || '미정'} onChange={(event) => put('setup', event.target.value)}>
                    {HUB_SETUP_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
                <label>
                  대행사 이슈
                  <input
                    value={form.agency}
                    onChange={(event) => put('agency', event.target.value)}
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
          )}
        </div>

        {formError && (
          <div className="modal-error" role="alert">
            {formError}
          </div>
        )}
        <div className="modal-actions">
          {isExisting && (
            <button className="delete-btn" onClick={() => void remove()} disabled={saving}>
              삭제
            </button>
          )}
          <span />
          <button className="secondary-btn" onClick={onClose} disabled={saving}>
            취소
          </button>
          <button className="primary-btn" onClick={() => void submit()} disabled={saving}>
            <Check size={16} />
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
