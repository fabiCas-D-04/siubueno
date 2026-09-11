import { useEffect, useState, useCallback } from 'react';
import { CalendarDays } from 'lucide-react';
import { calendarService, assignmentService } from '../services';
import type { AcademicEvent, Assignment } from '../types';
import { Calendar, Loading, ErrorState } from '../components/ui';
import { PageHeader } from '../components/PageHeader';

export function CalendarPage() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [eventsData, assignmentsData] = await Promise.all([
        calendarService.getCalendar(),
        assignmentService.getAssignments(),
      ]);
      setEvents(eventsData);
      setAssignments(assignmentsData);
    } catch {
      setError('No pudimos cargar el calendario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const combinedEvents: AcademicEvent[] = [
    ...events,
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: `${a.course_name} - Tarea`,
      event_type: 'assignment' as const,
      start_date: a.due_date,
      end_date: null,
      course_id: a.course_id,
      color: '#8B5CF6',
    })),
  ];

  return (
    <div>
      <PageHeader
        title="Calendario Academico"
        subtitle="Clases, tareas, examenes y eventos"
        icon={<CalendarDays className="w-5 h-5" aria-hidden="true" />}
      />

      {loading && <Loading fullPage message="Cargando calendario..." />}
      {error && <ErrorState message={error} onRetry={loadCalendar} />}

      {!loading && !error && <Calendar events={combinedEvents} />}
    </div>
  );
}