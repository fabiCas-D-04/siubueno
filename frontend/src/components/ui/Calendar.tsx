import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AcademicEvent } from '../../types';

interface CalendarProps {
  events: AcademicEvent[];
  mode?: 'month' | 'week' | 'day';
}

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const eventColors: Record<string, string> = {
  exam: 'bg-red-500',
  assignment: 'bg-purple-500',
  class: 'bg-blue-500',
  event: 'bg-blue-300',
  holiday: 'bg-green-500',
};

function getColor(eventType: string): string {
  return eventColors[eventType] || 'bg-blue-400';
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function Calendar({ events, mode = 'month' }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [currentMode, setCurrentMode] = useState(mode);

  const eventMap: Record<string, AcademicEvent[]> = {};
  for (const event of events) {
    const key = event.start_date;
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push(event);
  }

  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (currentMode === 'month') {
      d.setMonth(d.getMonth() + dir);
    } else if (currentMode === 'week') {
      d.setDate(d.getDate() + dir * 7);
    } else {
      d.setDate(d.getDate() + dir);
    }
    setCurrentDate(d);
  };

  const switchMode = (newMode: 'month' | 'week' | 'day') => {
    setCurrentMode(newMode);
    setCurrentDate(new Date());
  };

  const renderDayCell = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayEvents = eventMap[dateStr] || [];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const isCurrentMonth = date.getMonth() === currentDate.getMonth() && currentMode === 'month';

    return (
      <div
        className={`min-h-[6rem] p-1.5 border border-gray-100 dark:border-gray-800 ${isCurrentMonth ? '' : 'opacity-40'} ${
          isToday ? 'bg-blue-50 dark:bg-blue-950/40' : ''
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1 ${
            isToday ? 'bg-blue-700 text-white font-semibold' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {date.getDate()}
        </span>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className={`${getColor(event.event_type)} text-white text-[10px] rounded px-1.5 py-0.5 truncate cursor-pointer`}
              title={`${event.title} - ${event.event_type}`}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 pl-1">+{dayEvents.length - 3} mas</div>
          )}
        </div>
      </div>
    );
  };

  const renderMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = startOfWeek(firstDay);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return cells;
  };

  const renderWeek = () => {
    const start = startOfWeek(currentDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  };

  const headerLabel = () => {
    if (currentMode === 'month') return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (currentMode === 'week') {
      const start = startOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.getDate()} - ${end.getDate()} de ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    return `${currentDate.getDate()} de ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchMode('month')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              currentMode === 'month'
                ? 'bg-blue-700 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Vista mensual"
          >
            Mes
          </button>
          <button
            onClick={() => switchMode('week')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              currentMode === 'week'
                ? 'bg-blue-700 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Vista semanal"
          >
            Semana
          </button>
          <button
            onClick={() => switchMode('day')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              currentMode === 'day'
                ? 'bg-blue-700 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Vista diaria"
          >
            Dia
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 min-w-[10rem] text-center">
            {headerLabel()}
          </span>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex-wrap">
        {(['exam', 'assignment', 'class', 'event', 'holiday'] as const).map((type) => (
          <span key={type} className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className={`w-2.5 h-2.5 rounded-full ${getColor(type)}`} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>

      {currentMode === 'month' && (
        <div>
          <div className="grid grid-cols-7">
            {DAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center border-b border-gray-100 dark:border-gray-800">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderMonth().map((date, i) => (
              <div key={i}>{renderDayCell(date)}</div>
            ))}
          </div>
        </div>
      )}

      {currentMode === 'week' && (
        <div>
          <div className="grid grid-cols-7">
            {DAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center border-b border-gray-100 dark:border-gray-800">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderWeek().map((date, i) => (
              <div key={i}>{renderDayCell(date)}</div>
            ))}
          </div>
        </div>
      )}

      {currentMode === 'day' && (
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {currentDate.getDate()} de {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          {events
            .filter((e) => {
              const [y, m, d] = e.start_date.split('-').map(Number);
              return y === currentDate.getFullYear() && m === currentDate.getMonth() + 1 && d === currentDate.getDate();
            })
            .sort((a, b) => a.start_date.localeCompare(b.start_date))
            .map((event) => (
              <div key={event.id} className="flex items-start gap-3 border-l-4 border-gray-200 dark:border-gray-700 pl-3 py-2">
                <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${getColor(event.event_type)}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.description}</p>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">{event.event_type}</span>
                </div>
              </div>
            ))}
          {events.filter((e) => {
            const [y, m, d] = e.start_date.split('-').map(Number);
            return y === currentDate.getFullYear() && m === currentDate.getMonth() + 1 && d === currentDate.getDate();
          }).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No hay eventos para este dia.</p>
          )}
        </div>
      )}
    </div>
  );
}