import { useEffect, useState, useCallback } from 'react';
import { CalendarClock, List } from 'lucide-react';
import { scheduleService } from '../../services';
import type { ScheduleEntry } from '../../types';
import { Card, Loading, ErrorState, EmptyState, Badge } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

const DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const dayColors: Record<string, string> = {
  Lunes: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  Martes: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
  Miercoles: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
  Jueves: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
  Viernes: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
  Sabado: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await scheduleService.getSchedule();
      setSchedule(data);
    } catch {
      setError('No pudimos cargar el horario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  if (loading) return <Loading fullPage message="Cargando horario..." />;
  if (error) return <ErrorState message={error} onRetry={loadSchedule} />;

  const getClassesForDay = (day: string) => schedule.filter((s) => s.day_of_week === day);

  const grid = (day: string) => {
    const classes = getClassesForDay(day);
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const slotTime = TIME_SLOTS[i];
      const nextTime = TIME_SLOTS[i + 1] || '18:00';
      const matching = classes.find((c) => timeToMinutes(c.start_time) >= timeToMinutes(slotTime) && timeToMinutes(c.start_time) < timeToMinutes(nextTime));
      cells.push(
        <div key={`${day}-${slotTime}`} className="min-h-[64px] border-b border-gray-100 dark:border-gray-800 p-1">
          {matching && (
            <button
              className={`w-full h-full rounded-lg p-2 text-left border ${dayColors[day]} hover:shadow-card-hover transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label={`${matching.course_name} - ${matching.start_time} a ${matching.end_time}`}
            >
              <p className="text-[11px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{matching.course_name}</p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{matching.start_time} - {matching.end_time}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Aula: {matching.classroom}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Grupo {matching.group_code}</p>
            </button>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div>
      <PageHeader
        title="Horario"
        subtitle="Distribucion semanal de tus clases"
        icon={<CalendarClock className="w-5 h-5" aria-hidden="true" />}
        action={
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 text-sm font-medium ${view === 'grid' ? 'bg-blue-700 text-white' : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Vista de cuadricula"
            >
              <CalendarClock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium ${view === 'list' ? 'bg-blue-700 text-white' : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {schedule.length === 0 && <EmptyState message="No tienes clases registradas." />}

      {view === 'grid' && schedule.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-thin">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[70px_repeat(6,1fr)]">
              <div className="p-2 border-r border-b border-gray-200 dark:border-gray-700" />
              {DAYS.map((day) => (
                <div key={day} className="p-2 text-center border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{day}</span>
                </div>
              ))}
              {TIME_SLOTS.map((time) => (
                <div className="contents" key={time}>
                  <div className="p-2 border-r border-b border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-start justify-center">
                    {time}
                  </div>
                  {DAYS.map((day) => (
                    <div key={`${day}-${time}`}>
                      {grid(day)[TIME_SLOTS.indexOf(time)]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'list' && schedule.length > 0 && (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const classes = getClassesForDay(day);
            if (classes.length === 0) return null;
            return (
              <Card key={day} title={day}>
                <ul className="space-y-2">
                  {classes.map((entry) => (
                    <li key={entry.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <Badge className={dayColors[day].split(' ').slice(0, 2).join(' ')}>{entry.start_time} - {entry.end_time}</Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.course_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.course_code} - Grupo {entry.group_code}</p>
                      </div>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Aula: {entry.classroom}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}