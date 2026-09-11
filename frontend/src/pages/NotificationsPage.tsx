import { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, CheckCheck, Trash2, Mail, AlertTriangle, ClipboardList, GraduationCap, Wallet } from 'lucide-react';
import { notificationService } from '../services';
import type { AppNotification } from '../types';
import { Card, Badge, Loading, ErrorState, EmptyState, Button, Tabs } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { formatDateTime, getNotificationTypeClass } from '../utils/format';

const typeLabels: Record<string, string> = {
  academic: 'Academica',
  financial: 'Financiera',
  administrative: 'Administrativa',
  general: 'General',
};

const typeIcons: Record<string, React.ReactNode> = {
  academic: <GraduationCap className="w-4 h-4" aria-hidden="true" />,
  financial: <Wallet className="w-4 h-4" aria-hidden="true" />,
  administrative: <ClipboardList className="w-4 h-4" aria-hidden="true" />,
  general: <Bell className="w-4 h-4" aria-hidden="true" />,
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch {
      setError('No pudimos cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = activeTab === 'all'
    ? notifications
    : activeTab === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications.filter((n) => n.notification_type === activeTab);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const tabs = [
    { id: 'all', label: 'Todas', count: notifications.length },
    { id: 'unread', label: 'No leidas', count: unreadCount },
    { id: 'academic', label: 'Academicas', count: notifications.filter((n) => n.notification_type === 'academic').length },
    { id: 'financial', label: 'Financieras', count: notifications.filter((n) => n.notification_type === 'financial').length },
    { id: 'administrative', label: 'Administrativas', count: notifications.filter((n) => n.notification_type === 'administrative').length },
  ];

  const markRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setSuccessMessage('Todas las notificaciones fueron marcadas como leidas.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      // silent
    }
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      <PageHeader
        title="Notificaciones"
        subtitle="Avisos e informacion de tu vida academica"
        icon={<Bell className="w-5 h-5" aria-hidden="true" />}
        action={
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4" /> Marcar todas como leidas
          </Button>
        }
      />

      {successMessage && (
        <div className="mb-5 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300" role="status">
          {successMessage}
        </div>
      )}

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-6" />

      {loading && <Loading skeletonCount={4} message="Cargando notificaciones..." />}
      {error && <ErrorState message={error} onRetry={loadNotifications} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="Sin notificaciones"
          message={activeTab === 'unread' ? 'No tienes notificaciones sin leer.' : 'No hay notificaciones en esta categoria.'}
          icon={BellOff}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-card-hover transition-shadow ${!notification.is_read ? 'ring-1 ring-blue-300 dark:ring-blue-700' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => markRead(notification.id)}
                    className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 focus:outline-none ${notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600'}`}
                    aria-label={notification.is_read ? 'Marcada como leida' : 'Marcar como leida'}
                    title={notification.is_read ? 'Leida' : 'No leida'}
                  />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationTypeClass(notification.notification_type)}`}>
                    {typeIcons[notification.notification_type] || <Bell className="w-4 h-4" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm ${notification.is_read ? 'font-medium text-gray-800 dark:text-gray-200' : 'font-semibold text-gray-900 dark:text-gray-100'}`}>
                        {notification.title}
                      </h3>
                      <Badge className={getNotificationTypeClass(notification.notification_type)}>
                        {typeLabels[notification.notification_type] || notification.notification_type}
                      </Badge>
                      {!notification.is_read && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">Nueva</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDateTime(notification.created_at)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!notification.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead(notification.id)}>
                      <Mail className="w-3.5 h-3.5" /> Marcar leida
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('¿Deseas eliminar esta notificacion?')) {
                        removeNotification(notification.id);
                      }
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && unreadCount === 0 && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          No tienes notificaciones pendientes de lectura.
        </div>
      )}
    </div>
  );
}