import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  BookOpen,
  GraduationCap,
  History,
  Layers,
  CalendarClock,
  UserCheck,
  ClipboardList,
  CalendarDays,
  Wallet,
  FileText,
  Receipt,
  MailCheck,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  GraduationCap as Logo,
  BookMarked,
  ShieldQuestion,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts';
import { Modal, Button } from '../components/ui';
import { AlertTriangle } from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const SMART_GROUPS = [
  {
    key: 'social',
    letter: 'S',
    title: 'SOCIAL',
    color: 'text-amber-400',
    items: [
      { to: '/profile', icon: User, label: 'Mi Perfil' },
      { to: '/notifications', icon: Bell, label: 'Notificaciones' },
    ],
  },
  {
    key: 'materia',
    letter: 'M',
    title: 'MATERIA',
    color: 'text-blue-300',
    items: [
      { to: '/academic/courses', icon: BookMarked, label: 'Mis Materias' },
      { to: '/academic/assignments', icon: ClipboardList, label: 'Tareas' },
    ],
  },
  {
    key: 'academica',
    letter: 'A',
    title: 'ACADEMICA',
    color: 'text-green-300',
    items: [
      { to: '/academic/grades', icon: GraduationCap, label: 'Calificaciones' },
      { to: '/academic/history', icon: History, label: 'Historial' },
      { to: '/academic/pensum', icon: Layers, label: 'Pensum' },
      { to: '/academic/schedule', icon: CalendarClock, label: 'Horario' },
      { to: '/academic/attendance', icon: UserCheck, label: 'Asistencia' },
    ],
  },
  {
    key: 'recursos',
    letter: 'R',
    title: 'RECURSOS',
    color: 'text-cyan-300',
    finance: true,
    items: [
      { to: '/finance/account', icon: Wallet, label: 'Estado de Cuenta' },
      { to: '/finance/payments', icon: FileText, label: 'Pagos' },
      { to: '/finance/invoices', icon: Receipt, label: 'Facturas' },
    ],
  },
  {
    key: 'tips',
    letter: 'T',
    title: 'TIPS',
    color: 'text-purple-300',
    items: [{ to: '/settings', icon: Settings, label: 'Configuracion' }],
  },
];

export function Sidebar({ isMobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ social: true, materia: true, academica: true, recursos: false, tips: true });
  const [financeOpen, setFinanceOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    setConfirmLogout(false);
    await logout();
    navigate('/', { replace: true });
  };

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
    }`;

  const groupLabel = (letter: string, title: string, color: string, key: string, isOpen: boolean) => {
    return (
      <button
        onClick={() => toggleGroup(key)}
        aria-expanded={isOpen}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-gray-300 hover:bg-gray-800 ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? `${letter} · ${title}` : undefined}
      >
        <span className={`w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
          {letter}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-[11px] tracking-widest">{title}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          </>
        )}
      </button>
    );
  };

  const content = (
    <div className="flex flex-col h-full bg-gradient-to-b from-brand-darker via-brand-darker to-blue-950 text-gray-300">
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
          <Logo className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-bold text-white text-sm">UNIVALLE</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Academic</p>
          </div>
        )}
      </div>

      <div className={`flex items-center gap-2.5 px-4 pt-3 pb-1 ${collapsed ? 'justify-center' : ''}`}>
        <span className={`w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold ${collapsed ? '' : 'text-gray-400'}`}>SMART</span>
        {!collapsed && (
          <span className="text-[10px] tracking-widest text-gray-500 uppercase">Menu Inteligente</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-1" aria-label="Menu principal">
        <NavLink to="/dashboard" className={navLinkClass} onClick={onMobileClose} title="Dashboard">
          <LayoutDashboard className="w-5 h-5 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {SMART_GROUPS.map((group) => {
          const isOpen = expanded[group.key] ?? false;
          const visibleItems = group.finance && financeOpen ? group.items : group.finance ? [] : group.items;
          return (
            <div key={group.key} className="group relative">
              {groupLabel(group.letter, group.title, group.color, group.key, isOpen)}
              {!collapsed && isOpen && (
                <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
                  {group.finance && (
                    <>
                      <button
                        onClick={() => setFinanceOpen((prev) => !prev)}
                        aria-expanded={financeOpen}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                      >
                        <Wallet className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 text-left">Finanzas</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${financeOpen ? '' : '-rotate-90'}`} />
                      </button>
                      {financeOpen && (
                        <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
                          {group.items.map((item) => (
                            <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={onMobileClose}>
                              <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span>{item.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {!group.finance &&
                    visibleItems.map((item) => (
                      <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={onMobileClose}>
                        <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-1.5 text-[10px] tracking-widest text-gray-500 uppercase">
            <span className="w-4 h-4 rounded bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-[9px] font-bold">R</span> Accesos rapidos
          </div>
          <NavLink to="/calendar" className={navLinkClass} onClick={onMobileClose}>
            <CalendarDays className="w-5 h-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Calendario</span>}
          </NavLink>
          <NavLink to="/requests" className={navLinkClass} onClick={onMobileClose}>
            <MailCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Solicitudes</span>}
          </NavLink>
        </div>

        <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-1.5 text-[10px] tracking-widest text-gray-500 uppercase">
            <ShieldQuestion className="w-3.5 h-3.5" aria-hidden="true" /> Ayuda y soporte
          </div>
          <button
            onClick={() => setConfirmLogout(true)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-red-400 hover:bg-red-500/10 ${collapsed ? 'justify-center' : ''}`}
            title="Cerrar Sesion"
          >
            <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Cerrar Sesion</span>}
          </button>
        </div>
      </nav>

      <div className={`px-3 py-3 border-t border-white/10 ${collapsed ? 'text-center' : ''}`}>
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors w-full flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="text-sm">Colapsar</span>}
        </button>
      </div>

      {isMobileOpen && (
        <button
          onClick={onMobileClose}
          className="absolute inset-0 z-[-1] bg-black/60 md:hidden"
          aria-label="Cerrar menu"
        />
      )}

      <Modal
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Cerrar sesion"
        size="sm"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => setConfirmLogout(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="flex-1"
            >
              Si, cerrar sesion
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ¿Estas seguro de que deseas cerrar sesion? Deberas iniciar sesion nuevamente para acceder al portal.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );

  if (isMobileOpen) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <button
          onClick={onMobileClose}
          className="absolute inset-0 bg-black/60"
          aria-label="Cerrar menu"
          aria-hidden="true"
        />
        <div className="absolute left-0 top-0 bottom-0 w-72">{content}</div>
      </div>
    );
  }

  return <div className={`h-screen sticky top-0 shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} hidden md:block`}>{content}</div>;
}