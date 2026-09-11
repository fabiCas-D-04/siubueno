import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, MapPin, ClipboardList, UserCheck } from 'lucide-react';
import { courseService } from '../../services';
import { Card, Badge, Loading, ErrorState, EmptyState, ProgressBar, Tabs } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { formatDate, getStatusBadgeClass, getAttendanceStatus } from '../../utils/format';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await courseService.getCourseById(Number(id));
      setData(result);
    } catch {
      setError('No pudimos cargar la informacion de la materia.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  if (loading) return <Loading fullPage message="Cargando materia..." />;

  if (error || !data) {
    return <ErrorState message={error} onRetry={loadCourse} />;
  }

  const enrollment = data.enrollment;
  const attendance = data.attendance;
  const totalClasses = Number(attendance.total_classes) || 0;
  const attendedCount = Number(attendance.present) + Number(attendance.late);
  const attendanceRate = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 0;
  const attendanceStatus = getAttendanceStatus(totalClasses, attendedCount);

  const statusColor = attendanceStatus === 'excellent' ? 'text-green-600 dark:text-green-400'
    : attendanceStatus === 'regular' ? 'text-blue-600 dark:text-blue-400'
    : attendanceStatus === 'warning' ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400';

  const tabs = [
    { id: 'general', label: 'Informacion' },
    { id: 'grades', label: 'Calificaciones' },
    { id: 'attendance', label: 'Asistencia' },
    { id: 'assignments', label: 'Tareas' },
  ];

  return (
    <div>
      <button
        onClick={() => navigate('/academic/courses')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label="Volver a materias"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a materias
      </button>

      <PageHeader
        title={enrollment.course_name}
        subtitle={`${enrollment.course_code} - Grupo ${enrollment.group_code} - Semestre ${enrollment.semester}`}
        icon={<BookOpen className="w-5 h-5" aria-hidden="true" />}
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title="Informacion general">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Codigo</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.course_code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Creditos</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.credits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Semestre</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.semester}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                <Badge className={`mt-1 ${getStatusBadgeClass(enrollment.status)}`}>{enrollment.status}</Badge>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Descripcion</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{enrollment.description || 'Sin descripcion disponible.'}</p>
              </div>
            </div>
          </Card>

          <Card title="Horario">
            <div className="space-y-2">
              {data.schedule.length > 0 ? (
                data.schedule.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2.5 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      ['Lunes'].includes(s.day_of_week) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : ['Martes'].includes(s.day_of_week) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                      : ['Miercoles'].includes(s.day_of_week) ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                      : ['Jueves'].includes(s.day_of_week) ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                      : 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                    }`}>
                      <Clock className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.day_of_week}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.start_time} - {s.end_time}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" /> {s.classroom}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No hay horario registrado." />
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'grades' && (
        <Card title="Calificaciones">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            {[
              { label: '1er parcial', value: enrollment.partial1 },
              { label: '2do parcial', value: enrollment.partial2 },
              { label: 'Practicas', value: enrollment.practices },
              { label: 'Proyecto', value: enrollment.project },
              { label: 'Examen final', value: enrollment.final_exam },
              { label: 'Nota final', value: enrollment.final_grade },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className={`text-xl font-bold mt-1 ${
                  item.value === null ? 'text-gray-400 dark:text-gray-500'
                  : item.label === 'Nota final' && item.value >= 6 ? 'text-green-600 dark:text-green-400'
                  : item.label === 'Nota final' ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {item.value === null ? '-' : item.value.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
          {enrollment.final_grade !== null && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-sm text-blue-800 dark:text-blue-300">
              {enrollment.final_grade >= 6
                ? `Materia aprobada con nota final de ${enrollment.final_grade.toFixed(1)}.`
                : `Materia reprobada con nota final de ${enrollment.final_grade.toFixed(1)}.`}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card title="Asistencia">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Clases</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalClasses}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
              <p className="text-xs text-green-600 dark:text-green-400">Presente</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400 mt-1">{Number(attendance.present) || 0}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Llegadas tarde</p>
              <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mt-1">{Number(attendance.late) || 0}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
              <p className="text-xs text-red-600 dark:text-red-400">Faltas</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-400 mt-1">{Number(attendance.absent) || 0}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <p className="text-xs text-blue-600 dark:text-blue-400">Justificadas</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">{Number(attendance.justified) || 0}</p>
            </div>
          </div>
          <ProgressBar value={attendanceRate} max={100} label="Porcentaje de asistencia" />
          <p className={`text-sm font-semibold mt-3 ${statusColor}`}>
            Estado: {attendanceStatus === 'excellent' ? 'Excelente' : attendanceStatus === 'regular' ? 'Regular' : attendanceStatus === 'warning' ? 'Advertencia' : 'Riesgo'}
          </p>
        </Card>
      )}

      {activeTab === 'assignments' && (
        <Card title="Tareas de la materia">
          {data.assignments.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.assignments.map((assignment: any) => (
                <li key={assignment.id} className="py-3 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
                    <ClipboardList className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{assignment.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{assignment.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Entrega: {formatDate(assignment.due_date)} a las {assignment.due_time} - {assignment.max_score} pts
                    </p>
                  </div>
                  <div className="shrink-0">
                    {assignment.submission_status ? (
                      <Badge className={getStatusBadgeClass(assignment.submission_status)}>
                        {assignment.submission_status}
                      </Badge>
                    ) : (
                      <Badge>Pendiente</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="Esta materia no tiene tareas asignadas." />
          )}
        </Card>
      )}
    </div>
  );
}