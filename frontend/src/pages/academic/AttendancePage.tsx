import { useEffect, useState, useCallback } from 'react';
import { UserCheck } from 'lucide-react';
import { attendanceService } from '../../services';
import type { AttendanceSummaryItem } from '../../types';
import { Card, Badge, Loading, ErrorState, EmptyState, ProgressBar, Modal } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { getAttendanceStatus, formatDate, getStatusBadgeClass } from '../../utils/format';

export function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<AttendanceSummaryItem | null>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await attendanceService.getAttendance();
      setAttendance(data);
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const openDetails = async (courseId: number, summary: AttendanceSummaryItem) => {
    setSelectedCourse(summary);
    setDetailsLoading(true);
    setDetailsError('');
    try {
      const data = await attendanceService.getAttendanceByCourse(courseId);
      setDetails(data);
    } catch {
      setDetailsError('No pudimos cargar el detalle de asistencia.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const statusMeta = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      present: { label: 'Presente', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
      absent: { label: 'Falta', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
      justified: { label: 'Justificada', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
      late: { label: 'Tarde', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
    };
    return map[status] || { label: status, className: '' };
  };

  return (
    <div>
      <PageHeader
        title="Asistencia"
        subtitle="Control de asistencia por materia"
        icon={<UserCheck className="w-5 h-5" aria-hidden="true" />}
      />

      {loading && <Loading fullPage message="Cargando asistencia..." />}
      {error && <ErrorState message={error} onRetry={loadAttendance} />}

      {!loading && !error && attendance.length === 0 && (
        <EmptyState title="Sin registros" message="No tienes registros de asistencia." />
      )}

      {!loading && !error && attendance.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Materia</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clases</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Asistencias</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Faltas</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Justificadas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Porcentaje</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {attendance.map((item) => {
                  const total = Number(item.total_classes) || 0;
                  const attended = Number(item.present_count) + Number(item.late_count);
                  const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
                  const status = getAttendanceStatus(total, attended);
                  const statusLabel = status === 'excellent' ? 'Excelente' : status === 'regular' ? 'Regular' : status === 'warning' ? 'Advertencia' : 'Riesgo';
                  const statusClass = status === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    : status === 'regular' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';

                  return (
                    <tr key={item.enrollment_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.course_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.course_code}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{total}</td>
                      <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{attended}</td>
                      <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-medium">{Number(item.absent_count)}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{Number(item.justified_count)}</td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <ProgressBar value={pct} max={100} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={statusClass}>{statusLabel}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDetails(item.course_id, item)}
                          className="text-blue-700 dark:text-blue-400 text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse ? `Detalle de Asistencia - ${selectedCourse.course_name}` : 'Detalle'}
        size="lg"
      >
        {detailsLoading && <Loading message="Cargando detalle..." />}
        {detailsError && <ErrorState message={detailsError} />}
        {!detailsLoading && !detailsError && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {details.map((record) => {
                  const meta = statusMeta(record.status);
                  return (
                    <tr key={record.id}>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{formatDate(record.date)}</td>
                      <td className="px-3 py-2">
                        <Badge className={getStatusBadgeClass(record.status)}>{meta.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}