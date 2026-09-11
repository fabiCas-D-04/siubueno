import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Moon, Sun, Shield, Bell, User, Monitor, KeyRound, LogOut } from 'lucide-react';
import { useTheme, useAuth } from '../contexts';
import { Card, Button, Input, Tabs, Badge } from '../components/ui';
import { PageHeader } from '../components/PageHeader';

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { logout, student, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');

  const [profileForm, setProfileForm] = useState({
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    email: student?.email || '',
    phone: student?.phone || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({ academic: true, financial: true, administrative: true, general: false });
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({ push: true, email: true, sms: false });
  const [notifSaved, setNotifSaved] = useState(false);

  const saveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};
    if (!passwordForm.current) errors.current = 'La contrasena actual es requerida';
    if (passwordForm.new.length < 8) errors.new = 'Minimo 8 caracteres';
    if (passwordForm.confirm !== passwordForm.new) errors.confirm = 'Las contrasenas no coinciden';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const savePassword = () => {
    if (!validatePassword()) return;
    setPasswordForm({ current: '', new: '', confirm: '' });
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const tabs = [
    { id: 'account', label: 'Cuenta' },
    { id: 'security', label: 'Seguridad' },
    { id: 'notifications', label: 'Notificaciones' },
    { id: 'preferences', label: 'Preferencias' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div>
      <PageHeader
        title="Configuracion"
        subtitle="Administra tu cuenta, seguridad y preferencias"
        icon={<Settings className="w-5 h-5" aria-hidden="true" />}
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'account' && (
        <div className="max-w-2xl">
          <Card title="Informacion de la cuenta">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombres" value={profileForm.first_name} onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))} icon={<User className="w-4 h-4" aria-hidden="true" />} />
                <Input label="Apellidos" value={profileForm.last_name} onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))} icon={<User className="w-4 h-4" aria-hidden="true" />} />
              </div>
              <Input label="Correo institucional" type="email" value={profileForm.email} onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))} />
              <Input label="Telefono" value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} />
              {profileSaved && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300" role="status">
                  Los cambios se guardaron correctamente.
                </div>
              )}
              <Button onClick={saveProfile}>Guardar cambios</Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-2xl space-y-6">
          <Card title="Cambiar contrasena">
            <div className="space-y-4">
              <Input
                label="Contrasena actual"
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                error={passwordErrors.current}
                icon={<KeyRound className="w-4 h-4" aria-hidden="true" />}
                autoComplete="current-password"
              />
              <Input
                label="Nueva contrasena"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, new: e.target.value }))}
                error={passwordErrors.new}
                icon={<Shield className="w-4 h-4" aria-hidden="true" />}
                autoComplete="new-password"
              />
              <Input
                label="Confirmar nueva contrasena"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                error={passwordErrors.confirm}
                icon={<Shield className="w-4 h-4" aria-hidden="true" />}
                autoComplete="new-password"
              />
              {passwordSaved && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300" role="status">
                  Contrasena actualizada exitosamente.
                </div>
              )}
              <Button onClick={savePassword}>Actualizar contrasena</Button>
            </div>
          </Card>

          <Card title="Sesiones activas">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sesion actual</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Usuario: {user?.username} - Navegador: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Navegador'}
                  </p>
                </div>
                <Badge className="">Activa</Badge>
              </div>
              <Button variant="danger" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Cerrar todas las sesiones
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-2xl space-y-6">
          <Card title="Preferencias de notificacion">
            <div className="space-y-3">
              {[
                { key: 'academic', label: 'Noticias academicas' },
                { key: 'financial', label: 'Avisos financieros' },
                { key: 'administrative', label: 'Anuncios administrativos' },
                { key: 'general', label: 'Informacion general' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={emailPrefs[item.key as keyof typeof emailPrefs]}
                    onChange={() => setEmailPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card title="Canal de notificaciones">
            <div className="space-y-3">
              {[
                { key: 'push', label: 'Notificaciones push en el navegador' },
                { key: 'email', label: 'Notificaciones por correo' },
                { key: 'sms', label: 'Notificaciones por SMS' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                    onChange={() => setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
                  />
                </label>
              ))}
              <Button
                onClick={() => {
                  setNotifSaved(true);
                  setTimeout(() => setNotifSaved(false), 3000);
                }}
              >
                Guardar preferencias
              </Button>
              {notifSaved && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300" role="status">
                  Preferencias guardadas.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="max-w-2xl space-y-6">
          <Card title="Apariencia">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {isDark ? <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" /> : <Sun className="w-5 h-5 text-yellow-500" aria-hidden="true" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Modo oscuro</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cambia la apariencia de toda la aplicacion.</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                role="switch"
                aria-checked={isDark}
                aria-label="Activar modo oscuro"
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}