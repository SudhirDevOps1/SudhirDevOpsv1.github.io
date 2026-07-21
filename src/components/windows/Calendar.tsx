import React, { memo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Bell } from 'lucide-react';

interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time: string;
  color: string;
  note: string;
}

const EVENT_COLORS = ['#00FF88', '#00BFFF', '#FFB300', '#BF00FF', '#FF0055', '#FF8800'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const CalendarWindow = memo(() => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem('sudhi_calendar_events') || '[]'); }
    catch { return []; }
  });
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', time: '09:00', color: '#00FF88', note: '' });
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(todayStr); };

  const saveEvent = () => {
    if (!form.title.trim()) return;
    const ev: CalEvent = { id: Date.now().toString(), date: selectedDate, ...form };
    const updated = [...events, ev];
    setEvents(updated);
    localStorage.setItem('sudhi_calendar_events', JSON.stringify(updated));
    setShowForm(false);
    setForm({ title: '', time: '09:00', color: '#00FF88', note: '' });
  };

  const deleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem('sudhi_calendar_events', JSON.stringify(updated));
  };

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const selectedEvents = getEventsForDate(selectedDate);

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const makeDateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#08090e', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #15171f', background: '#0c0e18', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={prevMonth} style={navBtn}><ChevronLeft size={16} /></button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ color: 'var(--accent)', fontSize: 15, fontWeight: 'bold' }}>{MONTHS[month]} {year}</span>
        </div>
        <button onClick={nextMonth} style={navBtn}><ChevronRight size={16} /></button>
        <button onClick={goToday} style={{ ...navBtn, padding: '4px 10px', fontSize: 10 }}>Today</button>
        <button onClick={() => { setShowForm(true); }} style={{ ...navBtn, color: 'var(--accent)', borderColor: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 10 }}>
          <Plus size={12} /> Add
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Calendar Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12 }}>
          {/* Day Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#555', padding: '4px 0', fontWeight: 'bold' }}>{d}</div>
            ))}
          </div>

          {/* Date Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, flex: 1 }}>
            {cells.map((d, idx) => {
              if (d === null) return <div key={`empty-${idx}`} />;
              const dateStr = makeDateStr(d);
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <div key={dateStr} onClick={() => setSelectedDate(dateStr)}
                  style={{
                    background: isSelected ? 'rgba(var(--accent-rgb),0.2)' : isToday ? 'rgba(var(--accent-rgb),0.08)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid var(--accent)' : isToday ? '1px solid rgba(var(--accent-rgb),0.4)' : '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 6, cursor: 'pointer', padding: '6px 4px', minHeight: 52,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(var(--accent-rgb),0.08)' : 'rgba(255,255,255,0.02)'; }}
                >
                  <div style={{ fontSize: 11, color: isToday ? 'var(--accent)' : isSelected ? 'var(--accent)' : '#bbb', fontWeight: isToday ? 'bold' : 'normal', textAlign: 'center', marginBottom: 3 }}>{d}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} style={{ fontSize: 9, background: ev.color + '33', color: ev.color, padding: '1px 4px', borderRadius: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                    ))}
                    {dayEvents.length > 2 && <div style={{ fontSize: 8, color: '#666' }}>+{dayEvents.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Panel */}
        <div style={{ width: 220, borderLeft: '1px solid #15171f', background: '#0a0c14', display: 'flex', flexDirection: 'column', padding: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 'bold', marginBottom: 12 }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>

          {selectedEvents.length === 0 && (
            <div style={{ color: '#444', fontSize: 11, textAlign: 'center', marginTop: 20 }}>No events. Click "+ Add" to create one.</div>
          )}

          {selectedEvents.map(ev => (
            <div key={ev.id} style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 6, background: ev.color + '15', border: `1px solid ${ev.color}44` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: ev.color, fontWeight: 'bold', fontSize: 12 }}>{ev.title}</div>
                <button onClick={() => deleteEvent(ev.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
              </div>
              {ev.time && <div style={{ color: '#888', fontSize: 10, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />{ev.time}</div>}
              {ev.note && <div style={{ color: '#666', fontSize: 10, marginTop: 4 }}>{ev.note}</div>}
            </div>
          ))}

          {showForm && (
            <div style={{ marginTop: 8, padding: '10px', border: '1px solid rgba(var(--accent-rgb),0.3)', borderRadius: 8, background: '#0d0f1a' }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 8, fontWeight: 'bold' }}>NEW EVENT</div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title..."
                style={{ ...formInput, marginBottom: 6 }} autoFocus />
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                style={{ ...formInput, marginBottom: 6 }} />
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Notes..."
                rows={2} style={{ ...formInput, resize: 'none', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {EVENT_COLORS.map(c => (
                  <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ width: 18, height: 18, background: c, borderRadius: '50%', cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={saveEvent} style={{ ...accentBtn, flex: 1 }}>Save</button>
                <button onClick={() => setShowForm(false)} style={{ ...cancelBtn }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const navBtn: React.CSSProperties = {
  background: '#111', border: '1px solid #252530', color: '#aaa',
  borderRadius: 6, cursor: 'pointer', padding: '5px 8px',
  display: 'flex', alignItems: 'center',
};
const formInput: React.CSSProperties = {
  width: '100%', padding: '6px 8px', background: '#111', border: '1px solid #2a2a35',
  color: '#fff', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none',
  boxSizing: 'border-box',
};
const accentBtn: React.CSSProperties = {
  padding: '5px 10px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)',
  color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', fontSize: 11,
};
const cancelBtn: React.CSSProperties = {
  padding: '5px 10px', border: '1px solid #333', background: '#111',
  color: '#666', borderRadius: 4, cursor: 'pointer', fontSize: 11,
};

export default CalendarWindow;
