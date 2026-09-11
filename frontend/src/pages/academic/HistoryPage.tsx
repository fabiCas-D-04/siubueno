import { useEffect, useState, useCallback } from 'react';
import { History, ChevronDown, ChevronRight, Award, XCircle, TrendingUp } from 'lucide-react';
import { historyService } from '../../services';
import { Card, Badge, Loading, ErrorState, EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { getStatusBadgeClass } from '../../utils/format';

interface HistoryItem {
  semester: string;
  course_name: string;
  course_code: string;
  credits: number;
  partial1: number | null;
  partial2: number | null;
  practices: number | null;
  project: number | null;
  final_exam: number | null;
  final_grade: number | null;
  enrollment_status: string;
}

interface HistoryData {
  semesters: Record<string, HistoryItem[]>;
  stats: {
    approved_credits: string;
    failed_credits: string;
    approved_courses: string;
    failed_courses: string;
  };
}

export function HistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await historyService.getHistory();
      setData(result);
      setExpanded(Object.fromEntries(Object.keys(result.semesters).map((s) => [s, true])));
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (loading) return <Loading fullPage message="Cargando historial academico..." />;
  if (error) return <ErrorState message={error} onRetry={loadHistory} />;

  const semesters = data ? Object.keys(data.semesters) : [];

  const stats = [
    { label: 'Creditos aprobados', value: data?.stats.approved_credits ?? '0', icon: <Award className="w-5 h-5" aria-hidden="true" />, color: 'bg-green-600' },
    { label: 'Creditos pendientes', value: data?.stats.failed_credits ?? '0', icon: <XCircle className="w-5 h-5" aria-hidden="true" />, color: 'bg-red-600' },
    { label: 'Materias aprobadas', value: data?.stats.approved_courses ?? '0', icon: <TrendingUp className="w-5 h-5" aria-hidden="true" />, color: 'bg-blue-700' },
    { label: 'Materias reprobadas', value: data?.stats.failed_courses ?? '0', icon: <XCircle className="w-5 h-5" aria-hidden="true" />, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <PageHeader
        title="Historial Academico"
        subtitle="Todos tus semestres cursados"
        icon={<History className="w-5 h-5" aria-hidden="true" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl shadow-card dark:shadow-none border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {semesters.length === 0 && <EmptyState message="No hay historial academico disponible." />}
        {semesters.map((semester) => {
          const items = data!.semesters[semester];
          const isExpanded = expanded[semester];
          const graded = items.filter((i) => i.final_grade !== null);
          const semesterGpa = graded.length > 0
            ? (graded.reduce((sum, i) => sum + (i.final_grade || 0), 0) / graded.length).toFixed(1)
            : '0.0';
          const approved = items.filter((i) => i.final_grade !== null && i.final_grade >= 6).length;

          return (
            <Card key={semester} className="p-0">
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [semester]: !prev[semester] }))}
                className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-xl"
                aria-expanded={isExpanded}
                aria-label={`Expandir semestre ${semester}`}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" /> : <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{semester}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{items.length} materias - {approved} aprobadas</p>
                  </div>
                </div>
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Promedio: {semesterGpa}</Badge>
              </button>
              {isExpanded && (
                <div className="px-5 pb-4 overflow-x-auto scrollbar-thin animate-fade-in">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Materia</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Codigo</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Creditos</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nota</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {items.map((item, index) => (
                        <tr key={`${item.course_code}-${index}`}>
                          <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200">{item.course_name}</td>
                          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{item.course_code}</td>
                          <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400">{item.credits}</td>
                          <td className={`px-3 py-2.5 text-center font-bold ${
                            item.final_grade === null ? 'text-gray-400 dark:text-gray-500'
                            : item.final_grade >= 6 ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                          }`}>
                            {item.final_grade === null ? '-' : item.final_grade.toFixed(1)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge className={getStatusBadgeClass(item.enrollment_status)}>{item.enrollment_status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}