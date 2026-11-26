import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleHelp, Plus } from 'lucide-react';
import type { HubWorkItem } from '../../api/workHubRepository';
import './WorkHubCalendar.css';

type WorkHubCalendarProps = {
  category: '캘린더' | 'SNS 캘린더';
  items: HubWorkItem[];
  onAdd: (date: string) => void;
  onEdit: (item: HubWorkItem) => void;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function WorkHubCalendar({ category, items, onAdd, onEdit }: WorkHubCalendarProps) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const today = toLocalIsoDate(new Date());
  const isSocial = category === 'SNS 캘린더';
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

  return (
    <section className="work-calendar">
      <div className="calendar-toolbar">
        <div className="calendar-heading">
          <span className={`calendar-icon ${isSocial ? 'social' : ''}`}><CalendarDays size={19} /></span>
          <div>
            <h2>{isSocial ? 'SNS 콘텐츠 캘린더' : '개인 스케줄'}</h2>
            <p>{isSocial ? '게시물 아이디어와 발행 일정을 관리해요.' : '일정을 날짜별로 확인하고 관리해요.'}</p>
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
