import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowUpDown, ArrowUp, ArrowDown, Clock, MapPin } from 'lucide-react';
import { courseService } from '../../services';
import type { Enrollment } from '../../types';
import { Card, Badge, SearchBar, Select, Loading, ErrorState, EmptyState, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { getStatusBadgeClass } from '../../utils/format';

type SortKey = 'course_name' | 'course_code' | 'credits' | 'final_grade';
type SortDir = 'asc' | 'desc';

export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('course_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await courseService.getCourses({ semester: semesterFilter || undefined, search: search || undefined });
      setCourses(data);
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, [semesterFilter, search]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const semesters = useMemo(() => {
    const unique = new Set(courses.map((c) => c.semester));
    return Array.from(unique).sort().reverse();
  }, [courses]);

  const rawData = useMemo(() => {
    let filtered = courses;
    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    return filtered;
  }, [courses, statusFilter]);

  const sortedData = useMemo(() => {
    const data = [...rawData];
    data.sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [rawData, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3.5 h-3.5" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  return (
    <div>
      <PageHeader
        title="Mis Materias"
        subtitle="Materias inscritas en tus semestres"
        icon={<BookOpen className="w-5 h-5" aria-hidden="true" />}
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar materia o codigo..." className="w-full sm:w-64" />
        <Select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          options={[{ value: '', label: 'Todos los semestres' }, ...semesters.map((s) => ({ value: s, label: s }))]}
          aria-label="Filtrar por semestre"
          className="w-full sm:w-48"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'enrolled', label: 'Cursando' },
            { value: 'completed', label: 'Completada' },
            { value: 'dropped', label: 'Retirada' },
          ]}
          aria-label="Filtrar por estado"
          className="w-full sm:w-48"
        />
      </div>

      {loading && <Loading skeletonCount={4} message="Cargando materias..." />}

      {error && !loading && <ErrorState message={error} onRetry={loadCourses} />}

      {!loading && !error && sortedData.length === 0 && (
        <EmptyState title="No se encontraron materias" message="No hay materias que coincidan con tus filtros de busqueda." />
      )}

      {!loading && !error && sortedData.length > 0 && (
        <>
          <div className="hidden lg:block">
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('course_name')} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200">
                          Materia {sortIcon('course_name')}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('course_code')} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200">
                          Codigo {sortIcon('course_code')}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Grupo</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('credits')} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200">
                          Creditos {sortIcon('credits')}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Semestre</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('final_grade')} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200">
                          Nota {sortIcon('final_grade')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sortedData.map((course) => (
                      <tr
                        key={course.id}
                        onClick={() => navigate(`/academic/courses/${course.course_id}`)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{course.course_name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.course_code}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.group_code}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.credits}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.semester}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusBadgeClass(course.status)}>{course.status}</Badge>
                        </td>
                        <td className={`px-4 py-3 font-semibold ${course.final_grade === null ? 'text-yellow-600 dark:text-yellow-400' : course.final_grade >= 6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {course.final_grade === null ? '-' : course.final_grade.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="lg:hidden grid grid-cols-1 gap-4">
            {sortedData.map((course) => (
              <Card key={course.id} className="cursor-pointer hover:shadow-card-hover transition-shadow">
                <button
                  onClick={() => navigate(`/academic/courses/${course.course_id}`)}
                  className="w-full text-left"
                  aria-label={`Abrir materia ${course.course_name}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase">{course.course_code}</p>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{course.course_name}</h3>
                    </div>
                    <Badge className={getStatusBadgeClass(course.status)}>{course.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Grupo {course.group_code}</span>
                    <span>{course.credits} creditos</span>
                    <span>{course.semester}</span>
                    <span className={course.final_grade === null ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : course.final_grade >= 6 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                      Nota: {course.final_grade === null ? '-' : course.final_grade.toFixed(1)}
                    </span>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}