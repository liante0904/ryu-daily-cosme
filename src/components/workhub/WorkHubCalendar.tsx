import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleHelp, Plus } from 'lucide-react';
import type { HubWorkItem } from '../../api/workHubRepository';
import './WorkHubCalendar.css';

type WorkHubCalendarProps = {
  category: '캘린더' | 'SNS 캘린더' | '경제 인스타';
  items: HubWorkItem[];
  onAdd: (date: string) => void;
  onQuickAdd?: (date: string, title: string, format: string) => Promise<void>;
  onEdit: (item: HubWorkItem) => void;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function WorkHubCalendar({ category, items, onAdd, onQuickAdd, onEdit }: WorkHubCalendarProps) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const today = toLocalIsoDate(new Date());
  const [quickDate, setQuickDate] = useState(today);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickFormat, setQuickFormat] = useState('릴스');
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickError, setQuickError] = useState('');
  const isPersonalCalendar = category === '캘린더';
  const isSocial = !isPersonalCalendar;
  const isEconomicInstagram = category === '경제 인스타';
  const events = useMemo(
    () => items.filter((item) => item.category === category && item.due).sort((a, b) => a.due.localeCompare(b.due)),
    [items, category]
  );
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((startOffset + dayCount) / 7) * 7;
  const monthLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(month);

  const moveMonth = (amount: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const goToday = () => {
    const current = new Date();
    setMonth(new Date(current.getFullYear(), current.getMonth(), 1));
  };

  const submitQuickSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quickTitle.trim() || !onQuickAdd) return;
    setQuickSaving(true);
    setQuickError('');
    try {
      await onQuickAdd(quickDate, quickTitle.trim(), quickFormat);
      setQuickTitle('');
    } catch (error) {
      setQuickError(error instanceof Error ? error.message : '일정을 저장하지 못했습니다.');
    } finally {
      setQuickSaving(false);
    }
  };

  return (
    <section className="work-calendar">
      <div className="calendar-toolbar">
        <div className="calendar-heading">
          <span className={`calendar-icon ${isSocial ? 'social' : ''}`}><CalendarDays size={19} /></span>
          <div>
            <h2>{isPersonalCalendar ? '개인 스케줄' : isEconomicInstagram ? '경제 인스타 콘텐츠 캘린더' : 'SNS 콘텐츠 캘린더'}</h2>
            <p>{isPersonalCalendar ? '일정을 날짜별로 확인하고 관리해요.' : '콘텐츠 아이디어와 업로드 일정을 관리해요.'}</p>
          </div>
        </div>
        <div className="calendar-controls">
          <button className="secondary-btn" onClick={goToday}>오늘</button>
          <button className="calendar-arrow" onClick={() => moveMonth(-1)} aria-label="이전 달"><ChevronLeft size={18} /></button>
          <button className="calendar-arrow" onClick={() => moveMonth(1)} aria-label="다음 달"><ChevronRight size={18} /></button>
          <button className="primary-btn" onClick={() => onAdd(today)}><Plus size={16} /> 일정 추가</button>
        </div>
      </div>

      {!isSocial && (
        <div className="apple-calendar-note">
          <span className="apple-calendar-note-icon"><CalendarDays size={17} /></span>
          <div>
            <b>Apple 캘린더</b>
            <p>자동 연동을 설정하면 이 달력에 Apple 일정도 함께 표시됩니다.</p>
          </div>
          <span className="calendar-connection-pending">연결 설정 필요</span>
          <CircleHelp size={16} aria-hidden="true" />
        </div>
      )}

      {isEconomicInstagram && onQuickAdd && (
        <form className="quick-schedule-form" onSubmit={(event) => void submitQuickSchedule(event)}>
          <label>
            <span>날짜</span>
            <input type="date" value={quickDate} onChange={(event) => setQuickDate(event.target.value)} required />
          </label>
          <label className="quick-schedule-title">
            <span>콘텐츠 일정</span>
            <input
              type="text"
              value={quickTitle}
              onChange={(event) => setQuickTitle(event.target.value)}
              placeholder="예: 이번 주 물가 소식 릴스 업로드"
              maxLength={180}
              required
            />
          </label>
          <label className="quick-schedule-format">
            <span>형식</span>
            <select value={quickFormat} onChange={(event) => setQuickFormat(event.target.value)}>
              {['릴스', '피드', '스토리', '라이브', '기타'].map((format) => <option key={format}>{format}</option>)}
            </select>
          </label>
          <button className="primary-btn" type="submit" disabled={quickSaving || !quickTitle.trim()}>
            <Plus size={16} /> {quickSaving ? '저장 중…' : '바로 등록'}
          </button>
          {quickError && <p className="quick-schedule-error" role="alert">{quickError}</p>}
        </form>
      )}

      <div className="calendar-month-label">{monthLabel}</div>
      <div className="calendar-grid" role="grid" aria-label={monthLabel}>
        {WEEKDAYS.map((weekday, index) => (
          <div className={`calendar-weekday ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`} key={weekday} role="columnheader">
            {weekday}
          </div>
        ))}
        {Array.from({ length: cellCount }, (_, index) => {
          const dayNumber = index - startOffset + 1;
          const inMonth = dayNumber > 0 && dayNumber <= dayCount;
          const date = inMonth ? toLocalIsoDate(new Date(month.getFullYear(), month.getMonth(), dayNumber)) : '';
          const dayEvents = events.filter((event) => event.due === date);
          return (
            <div className={`calendar-day ${inMonth ? '' : 'outside'} ${date === today ? 'today' : ''}`} key={date || `blank-${index}`} role="gridcell">
              {inMonth && (
                <>
                  <div className="calendar-day-top">
                    <span className={index % 7 === 0 ? 'sunday' : index % 7 === 6 ? 'saturday' : ''}>{dayNumber}</span>
                    <button className="calendar-add-day" onClick={() => onAdd(date)} aria-label={`${date} 일정 추가`}><Plus size={14} /></button>
                  </div>
                  <div className="calendar-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        className={`calendar-event ${isSocial ? 'social' : ''} ${event.status === '완료' ? 'done' : ''}`}
                        key={event.id}
                        title={`${event.title || '제목 없음'}${event.memo ? ` · ${event.memo}` : ''}`}
                        onClick={() => onEdit(event)}
                      >
                        {isEconomicInstagram && event.channel && <span className="calendar-event-type">{event.channel}</span>}
                        {event.title || '제목 없음'}
                      </button>
                    ))}
                    {dayEvents.length > 3 && <span className="calendar-more">+{dayEvents.length - 3}개 더</span>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="calendar-footnote">날짜를 눌러 일정을 추가하고, 일정 제목을 누르면 내용을 수정할 수 있어요.</p>
    </section>
  );
}
