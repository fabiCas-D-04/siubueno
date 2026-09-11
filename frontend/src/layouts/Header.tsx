import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, LogOut, User, Settings, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts';
import { Avatar, Dropdown, Modal, Button } from '../components/ui';
import { notificationService } from '../services';
import type { AppNotification } from '../types';
import { getNotificationTypeClass } from '../utils/format';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<AppNotification[]>([]);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setRecentNotifications(data.slice(0, 5));
        setUnreadCount(data.filter((n) => !n.is_read).length);
      } catch {
        // silent fail on header badge
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fullName = student ? `${student.first_name} ${student.last_name}` : 'Estudiante';
  const career = student?.career_name || '';

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-lg font-bold text-blue-800 dark:text-blue-400">UNIVALLE</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Academic</span>
        </div>

        <div className="flex-1 max-w-md ml-2 md:ml-6">
          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar materias, tareas..."
              aria-label="Buscar en el sistema"
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        <div className="flex-1" />

        <Dropdown
          width="w-80"
          trigger={
            <button
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Notificaciones, ${unreadCount} sin leer`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          }
        >
          {(close) => (
            <div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notificaciones</span>
                <Link to="/notifications" onClick={close} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Ver todas
                </Link>
              </div>
              <div className="py-1 max-h-72 overflow-y-auto scrollbar-thin">
                {recentNotifications.map((n) => (
                  <div key={n.id} className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600'}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {recentNotifications.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No tienes notificaciones</p>
                )}
              </div>
            </div>
          )}
        </Dropdown>

        <Dropdown
          width="w-72"
          trigger={
            <button
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Menu de usuario"
            >
              <Avatar firstName={student?.first_name || 'E'} lastName={student?.last_name || 'S'} photoUrl={student?.photo_url} size="sm" />
              <span className="hidden lg:block text-left leading-tight">
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{fullName}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">{career}</span>
              </span>
            </button>
          }
        >
          {(close) => (
            <div>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {career} - {student?.student_code}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { close(); navigate('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <User className="w-4 h-4" /> Mi Perfil
                </button>
                <button
                  onClick={() => { close(); navigate('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Settings className="w-4 h-4" /> Configuracion
                </button>
                <button
                  onClick={() => { close(); setConfirmLogout(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesion
                </button>
              </div>
            </div>
          )}
        </Dropdown>
      </div>

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
              onClick={() => {
                setConfirmLogout(false);
                handleLogout();
              }}
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
    </header>
  );
}