import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Wallet,
  ClipboardList,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  FileText,
  Bell,
  BookMarked,
  History,
  Layers,
  CalendarClock,
  CalendarDays,
  MailCheck,
  Settings,
  User,
  UserCheck,
  Receipt,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../contexts';
import { dashboardService } from '../services';
import type { DashboardData } from '../types';
import { Card, Badge, Loading, ErrorState, EmptyState, ProgressBar, AnimatedCounter } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { ScrollReveal } from '../components/ScrollReveal';
import { formatDate } from '../utils/format';

interface SmartItem {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface SmartSection {
  letter: string;
  title: string;
  subtitle: string;
  letterColor: string;
  accent: string;
  items: SmartItem[];
}

const SMART_SECTIONS: SmartSection[] = [
  {
    letter: 'S',
    title: 'SOCIAL',
    subtitle: 'Tu identidad y comunicacion',
    letterColor: 'bg-amber-400/20 text-amber-400 border-amber-400/40',
    accent: 'border-amber-400',
    items: [
      { to: '/profile', label: 'Mi Perfil', description: 'Tus datos personales', icon: <User className="w-5 h-5" />, color: 'bg-amber-400/10 text-amber-500' },
      { to: '/notifications', label: 'Notificaciones', description: 'Avisos y alertas', icon: <Bell className="w-5 h-5" />, color: 'bg-amber-400/10 text-amber-500' },
    ],
  },
  {
    letter: 'M',
    title: 'MATERIA',
    subtitle: 'Gestion de tus asignaturas',
    letterColor: 'bg-blue-400/20 text-blue-300 border-blue-400/40',
    accent: 'border-blue-400',
    items: [
      { to: '/academic/courses', label: 'Mis Materias', description: 'Cursos inscritos', icon: <BookMarked className="w-5 h-5" />, color: 'bg-blue-400/10 text-blue-500' },
      { to: '/academic/assignments', label: 'Tareas', description: 'Actividades y entregas', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-blue-400/10 text-blue-500' },
    ],
  },
  {
    letter: 'A',
    title: 'ACADEMICA',
    subtitle: 'Tu rendimiento y progresa',
    letterColor: 'bg-green-400/20 text-green-300 border-green-400/40',
    accent: 'border-green-400',
    items: [
      { to: '/academic/grades', label: 'Calificaciones', description: 'Notas y promedios', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-green-400/10 text-green-500' },
      { to: '/academic/history', label: 'Historial', description: 'Tu trayectoria', icon: <History className="w-5 h-5" />, color: 'bg-green-400/10 text-green-500' },
      { to: '/academic/pensum', label: 'Pensum', description: 'Malla curricular', icon: <Layers className="w-5 h-5" />, color: 'bg-green-400/10 text-green-500' },
      { to: '/academic/schedule', label: 'Horario', description: 'Clases y aulas', icon: <CalendarClock className="w-5 h-5" />, color: 'bg-green-400/10 text-green-500' },
      { to: '/academic/attendance', label: 'Asistencia', description: 'Registro de clases', icon: <UserCheck className="w-5 h-5" />, color: 'bg-green-400/10 text-green-500' },
    ],
  },
  {
    letter: 'R',
    title: 'RECURSOS',
    subtitle: 'Finanzas, agenda y tramites',
    letterColor: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    accent: 'border-cyan-400',
    items: [
      { to: '/finance/account', label: 'Estado de Cuenta', description: 'Saldo y movimientos', icon: <Wallet className="w-5 h-5" />, color: 'bg-cyan-400/10 text-cyan-500' },
      { to: '/finance/payments', label: 'Pagos', description: 'Realiza tus pagos', icon: <FileText className="w-5 h-5" />, color: 'bg-cyan-400/10 text-cyan-500' },
      { to: '/finance/invoices', label: 'Facturas', description: 'Comprobantes', icon: <Receipt className="w-5 h-5" />, color: 'bg-cyan-400/10 text-cyan-500' },
      { to: '/calendar', label: 'Calendario', description: 'Agenda academica', icon: <CalendarDays className="w-5 h-5" />, color: 'bg-cyan-400/10 text-cyan-500' },
      { to: '/requests', label: 'Solicitudes', description: 'Tramites y pedidos', icon: <MailCheck className="w-5 h-5" />, color: 'bg-cyan-400/10 text-cyan-500' },
    ],
  },
  {
    letter: 'T',
    title: 'TIPS',
    subtitle: 'Configuracion y ayuda',
    letterColor: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
    accent: 'border-purple-400',
    items: [
      { to: '/settings', label: 'Configuracion', description: 'Preferencias y cuenta', icon: <Settings className="w-5 h-5" />, color: 'bg-purple-400/10 text-purple-500' },
      { to: '/profile', label: 'Ayuda', description: 'Soporte y contacto', icon: <Lightbulb className="w-5 h-5" />, color: 'bg-purple-400/10 text-purple-500' },
    ],
  },
];

export function DashboardPage() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await dashboardService.getDashboard();
      setData(result);
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Bienvenido a tu panel academico" />
        <Loading skeletonCount={5} message="Cargando informacion..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const firstName = student?.first_name || data.student.first_name;
  const lastName = student?.last_name || data.student.last_name;

  return (
    <div>
      <PageHeader
        title={`Bienvenido, ${firstName} ${lastName}`}
        subtitle={`Semestre ${data.student.semester} - ${data.student.career_name || ''}`}
      />

      <div className="mb-6">
        <ScrollReveal animation="fade-up">
          <div className="rounded-2xl bg-gradient-to-r from-brand-darker via-brand-dark to-blue-900 border border-white/10 p-5 sm:p-6 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Menu Inteligente</h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  Navega por secciones para acceder a todas las funciones del portal.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {SMART_SECTIONS.map((s) => (
                  <span
                    key={s.letter}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold ${s.letterColor}`}
                    title={s.title}
                  >
                    {s.letter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="space-y-6 mb-6">
        {SMART_SECTIONS.map((section, sectionIndex) => (
          <ScrollReveal key={section.title} animation="fade-up" delay={sectionIndex * 60}>
            <div className={`rounded-2xl border ${section.accent} border-opacity-30 dark:border-opacity-20 bg-white dark:bg-gray-900 p-5 shadow-card dark:shadow-none`}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-extrabold ${section.letterColor}`}>
                  {section.letter}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{section.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{section.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.to)}
                    className="text-left group bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 border border-gray-200 dark:border-gray-700 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col gap-2.5"
                    aria-label={`Ir a ${item.label}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.label}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ScrollReveal animation="fade-up" delay={100}>
            <Card
              title="Mis materias"
              action={
                <Link to="/academic/courses" className="text-sm text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                  Ver todas <ArrowRight className="w-4 h-4" />
                </Link>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.enrolledCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => navigate(`/academic/courses/${course.course_id}`)}
                    className="text-left group bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-card-hover hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Abrir materia ${course.course_name}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">{course.course_code}</p>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mt-0.5">{course.course_name}</h4>
                      </div>
                      <Badge className="ml-2 shrink-0">{course.group_code}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-3">
                      <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Docente: Grupo {course.group_code}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {course.credits} creditos</p>
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={course.final_grade ?? 0} max={10} label="Nota actual" />
                    </div>
                    <p className={`text-xs font-semibold mt-2 ${course.final_grade === null ? 'text-yellow-600 dark:text-yellow-400' : course.final_grade >= 6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {course.final_grade === null ? 'En curso' : `Nota: ${course.final_grade.toFixed(1)}`}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </div>

        <div className="space-y-6">
          <ScrollReveal animation="fade-up" delay={150}>
            <Card title="Progreso de la carrera">
              <div className="text-center mb-3">
                <AnimatedCounter target={data.advancePercent} suffix="%" className="text-4xl font-bold text-blue-700 dark:text-blue-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avance general del programa</p>
              </div>
              <ProgressBar value={data.advancePercent} max={100} label="Creditos" />
            </Card>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-700" aria-hidden="true" /> Proximas actividades
                </h3>
                <Link to="/academic/assignments" className="text-xs text-blue-700 dark:text-blue-400 hover:underline">Ver tareas</Link>
              </div>
              {data.upcomingAssignments.length > 0 ? (
                <ul className="space-y-2.5">
                  {data.upcomingAssignments.map((assignment) => (
                    <li key={assignment.id} className="flex items-start gap-2.5 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{assignment.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.course_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(assignment.due_date)} - {assignment.due_time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No tienes actividades pendientes.</p>
              )}
            </Card>
          </ScrollReveal>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollReveal animation="fade-up" delay={100}>
          <Card title="Proximas clases">
            {data.schedule.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Materia</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Hora</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Aula</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.schedule.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                          {entry.course_name}
                          <span className="block text-xs text-gray-400">{entry.course_code}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{entry.start_time} - {entry.end_time}</td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{entry.classroom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No tienes clases registradas." />
            )}
          </Card>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={150}>
          <Card title="Actividad reciente">
            {data.recentNotifications.length > 0 ? (
              <ul className="space-y-1">
                {data.recentNotifications.map((notification, index) => (
                  <li key={notification.id}>
                    <div className="flex items-start gap-3 py-2.5 relative">
                      {index < data.recentNotifications.length - 1 && (
                        <span className="absolute left-[18px] top-9 bottom-0 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                      )}
                      <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 z-10">
                        {notification.notification_type === 'financial' ? (
                          <FileText className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                        ) : notification.notification_type === 'administrative' ? (
                          <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                        ) : (
                          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{notification.description}</p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="Aun no hay actividad reciente." />
            )}
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}