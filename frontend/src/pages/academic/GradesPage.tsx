import { useEffect, useState, useMemo, useCallback } from 'react';
import { GraduationCap } from 'lucide-react';
import { gradeService } from '../../services';
import type { GradeRow } from '../../types';
import { Card, Badge, Loading, ErrorState, EmptyState, ProgressBar } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';

function computeFinal(row: GradeRow): number | null {
  const { partial1, partial2, practices, project, final_exam } = row;
  if (partial1 === null || partial2 === null || practices === null || project === null || final_exam === null) {
    return null;
  }
  const value = partial1 * 0.2 + partial2 * 0.2 + practices * 0.15 + project * 0.15 + final_exam * 0.3;
  return Math.round(value * 10) / 10;
}

export function GradesPage() {
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGrades = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await gradeService.getGrades();
      setGrades(data);
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  const currentSemesterGrades = useMemo(
    () => grades.filter((g) => g.semester === '2026-1'),
    [grades]
  );

  const generalAverage = useMemo(() => {
    const withGrades = grades.filter((g) => computeFinal(g) !== null);
    if (withGrades.length === 0) return 0;
    const total = withGrades.reduce((sum, g) => sum + (computeFinal(g) as number), 0);
    return total / withGrades.length;
  }, [grades]);

  const semesterAverage = useMemo(() => {
    const withGrades = currentSemesterGrades.filter((g) => computeFinal(g) !== null);
    if (withGrades.length === 0) return 0;
    const total = withGrades.reduce((sum, g) => sum + (computeFinal(g) as number), 0);
    return total / withGrades.length;
  }, [currentSemesterGrades]);

  if (loading) return <Loading fullPage message="Cargando calificaciones..." />;
  if (error) return <ErrorState message={error} onRetry={loadGrades} />;

  return (
    <div>
      <PageHeader
        title="Calificaciones"
        subtitle="Notas del semestre 2026-1 y promedio general"
        icon={<GraduationCap className="w-5 h-5" aria-hidden="true" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Promedio general acumulado</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">{generalAverage.toFixed(1)}</p>
          <div className="mt-3">
            <ProgressBar value={generalAverage} max={10} />
          </div>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Promedio del semestre 2026-1</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{semesterAverage.toFixed(1)}</p>
          <div className="mt-3">
            <ProgressBar value={semesterAverage} max={10} />
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {grades.length === 0 ? (
          <EmptyState title="Sin calificaciones" message="Aun no tienes calificaciones registradas." />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Materia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Semestre</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">1er Parcial</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">2do Parcial</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Practicas</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proyecto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Final</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nota Final</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {grades.map((course, index) => {
                  const finalGrade = computeFinal(course) ?? course.final_grade;
                  const state = finalGrade === null ? 'pendiente' : finalGrade >= 6 ? 'aprobado' : 'reprobado';
                  return (
                    <tr key={`${course.course_code}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{course.course_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{course.course_code}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.semester}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{course.partial1?.toFixed(1) ?? '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{course.partial2?.toFixed(1) ?? '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{course.practices?.toFixed(1) ?? '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{course.project?.toFixed(1) ?? '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{course.final_exam?.toFixed(1) ?? '-'}</td>
                      <td className={`px-4 py-3 text-center font-bold ${
                        finalGrade === null ? 'text-gray-400 dark:text-gray-500'
                        : finalGrade >= 6 ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                      }`}>
                        {finalGrade === null ? '-' : finalGrade.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={
                          state === 'aprobado' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                          : state === 'reprobado' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }>
                          {state}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}