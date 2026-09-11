import { useEffect, useState, useCallback } from 'react';
import { User, Mail, Phone, CalendarDays, MapPin, GraduationCap, BookOpen, Pencil, BadgeCheck } from 'lucide-react';
import { useAuth } from '../contexts';
import { studentService } from '../services';
import type { Student } from '../types';
import { Card, Avatar, Button, Modal, Input, Loading, ErrorState, Badge } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { formatDate, getStatusBadgeClass } from '../utils/format';

export function ProfilePage() {
  const { student: contextStudent, updateStudent } = useAuth();
  const [student, setStudent] = useState<Student | null>(contextStudent);
  const [loading, setLoading] = useState(!contextStudent);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', email: '' });
  const [formErrors, setFormErrors] = useState<{ phone?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      const data = await studentService.getProfile();
      setStudent(data);
      setEditForm({ phone: data.phone || '', email: data.email || '' });
      setLoading(false);
    } catch {
      setError('No pudimos cargar la informacion.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!contextStudent) {
      loadProfile();
    } else {
      setEditForm({ phone: contextStudent.phone || '', email: contextStudent.email || '' });
    }
  }, [contextStudent, loadProfile]);

  const openEdit = () => {
    if (student) {
      setEditForm({ phone: student.phone || '', email: student.email || '' });
    }
    setFormErrors({});
    setSuccessMessage('');
    setIsEditOpen(true);
  };

  const validate = (): boolean => {
    const errors: { phone?: string; email?: string } = {};
    if (!editForm.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = 'Ingresa un correo valido';
    }
    if (!editForm.phone.trim()) {
      errors.phone = 'El telefono es requerido';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSuccessMessage('');
    try {
      const updated = await studentService.updateProfile(editForm);
      setStudent(updated);
      updateStudent(updated);
      setIsEditOpen(false);
      setSuccessMessage('Tu perfil se actualizo correctamente.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setError('Ocurrio un error al guardar tus cambios.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullPage message="Cargando tu perfil..." />;

  if (error && !student) return <ErrorState message={error} onRetry={loadProfile} />;

  if (!student) return <ErrorState message="No se encontro informacion del estudiante." onRetry={loadProfile} />;

  const infoItems = [
    { label: 'Codigo estudiantil', value: student.student_code, icon: <User className="w-4 h-4" aria-hidden="true" /> },
    { label: 'Carrera', value: student.career_name || '-', icon: <GraduationCap className="w-4 h-4" aria-hidden="true" /> },
    { label: 'Semestre', value: `${student.semester}to semestre`, icon: <BookOpen className="w-4 h-4" aria-hidden="true" /> },
    { label: 'Campus', value: student.campus, icon: <MapPin className="w-4 h-4" aria-hidden="true" /> },
    { label: 'Correo institucional', value: student.email, icon: <Mail className="w-4 h-4" aria-hidden="true" /> },
    { label: 'Telefono', value: student.phone || '-', icon: <Phone className="w-4 h-4" aria-hidden="true" /> },
    { label: 'Fecha de nacimiento', value: formatDate(student.birth_date), icon: <CalendarDays className="w-4 h-4" aria-hidden="true" /> },
    { label: 'Estado academico', value: student.status, icon: <BadgeCheck className="w-4 h-4" aria-hidden="true" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Mi Perfil"
        subtitle="Informacion academica y personal"
        icon={<User className="w-5 h-5" aria-hidden="true" />}
        action={<Button onClick={openEdit}><Pencil className="w-4 h-4" /> Editar Perfil</Button>}
      />

      {successMessage && (
        <div className="mb-6 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300" role="status">
          {successMessage}
        </div>
      )}

      {error && !successMessage && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center py-2">
            <Avatar firstName={student.first_name} lastName={student.last_name} photoUrl={student.photo_url} size="xl" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{student.career_name}</p>
            <Badge className={`mt-3 ${getStatusBadgeClass(student.status)}`}>{student.status}</Badge>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Informacion">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                    {item.value === 'active' ? 'Activo' : item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Perfil"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Telefono"
            value={editForm.phone}
            onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
            error={formErrors.phone}
            placeholder="Ej: 555-0101"
            icon={<Phone className="w-4 h-4" aria-hidden="true" />}
          />
          <Input
            label="Correo institucional"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
            error={formErrors.email}
            placeholder="nombre@univalle.edu"
            icon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Los datos como nombre, carrera y codigo son administrados por registros academicos y no pueden ser editados por el estudiante.
          </p>
        </div>
      </Modal>
    </div>
  );
}