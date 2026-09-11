import { useEffect, useState, useCallback } from 'react';
import { Layers, Lock, CheckCircle2, BookOpen, AlertTriangle } from 'lucide-react';
import { pensumService, dashboardService } from '../../services';
import { Card, Badge, Loading, ErrorState, ProgressBar } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

interface PensumCourse {
  id: number;
  name: string;
  code: string;
  semester: number;
  credits: number;
  status: string;
}

export function PensumPage() {
  const [coursesBySemester, setCoursesBySemester] = useState<Record<number, PensumCourse[]>>({});
  const [advancePercent, setAdvancePercent] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPensum = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pensumResult, dashboardResult] = await Promise.all([
        pensumService.getPensum(),
        dashboardService.getDashboard(),
      ]);
      setCoursesBySemester(pensumResult);
      setAdvancePercent(dashboardResult.advancePercent ?? 0);
      setTotalCredits(dashboardResult.student.total_credits ?? 0);
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPensum();
  }, [loadPensum]);

  const statusMeta: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
    approved: { label: 'Aprobada', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
    enrolled: { label: 'Cursando', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    pending: { label: 'Pendiente', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    failed: { label: 'Reprobada', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
    blocked: { label: 'Bloqueada', className: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
  };

  if (loading) return <Loading fullPage message="Cargando pensum..." />;
  if (error) return <ErrorState message={error} onRetry={loadPensum} />;

  const semesters = Object.keys(coursesBySemester).map(Number).sort((a, b) => a - b);

  return (
    <div>
      <PageHeader
        title="Pensum"
        subtitle="Plan de estudios de tu carrera"
        icon={<Layers className="w-5 h-5" aria-hidden="true" />}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Progreso general de la carrera</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{advancePercent}%</p>
          </div>
          <div className="w-full sm:w-96">
            <ProgressBar value={advancePercent} max={100} label={`Creditos completados / ${totalCredits} carrera`} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {semesters.map((semester) => {
          const courses = coursesBySemester[semester];
          const semesterState = courses.some((c) => c.status === 'enrolled') ? 'enrolled'
            : courses.every((c) => c.status === 'approved') ? 'approved'
            : courses.some((c) => c.status === 'failed') ? 'failed'
            : 'pending';

          const previousApproved = semesters.filter((s) => s < semester).every((s) =>
            coursesBySemester[s].every((c) => c.status === 'approved')
          );

          return (
            <Card
              key={semester}
              title={`${semester}o Semestre`}
              action={
                <Badge className={statusMeta[semesterState === 'enrolled' ? 'enrolled' : semesterState]?.className || statusMeta.pending.className}>
                  {semesterState === 'enrolled' ? 'Cursando' : semesterState === 'approved' ? 'Completado' : semesterState === 'failed' ? 'Con pendientes' : 'Pendiente'}
                </Badge>
              }
            >
              <ul className="space-y-2">
                {courses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {course.status === 'approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" aria-hidden="true" />
                      ) : course.status === 'enrolled' ? (
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
                      ) : course.status === 'failed' ? (
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" aria-hidden="true" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{course.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {course.code} - {course.credits} creditos
                        </p>
                      </div>
                    </div>
                    <Badge className={statusMeta[course.status]?.className || statusMeta.pending.className} title={course.status}>
                      {statusMeta[course.status]?.label || course.status}
                    </Badge>
                  </li>
                ))}
              </ul>
              {previousApproved && semesterState === 'pending' && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-right">Disponible</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}