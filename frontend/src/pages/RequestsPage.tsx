import { useEffect, useState, useCallback } from 'react';
import React from 'react';
import { MailCheck, Plus, Clock, CheckCircle2, XCircle, FileSignature } from 'lucide-react';
import { requestService } from '../services';
import type { AppRequest } from '../types';
import { Card, Badge, Loading, ErrorState, EmptyState, Button, Modal, Select, Input } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { formatDateTime, getStatusBadgeClass } from '../utils/format';

const REQUEST_TYPES = [
  { value: 'Certificado de Notas', label: 'Certificado de Notas' },
  { value: 'Certificado de Estudiante Regular', label: 'Certificado de Estudiante Regular' },
  { value: 'Constancia de Estudios', label: 'Constancia de Estudios' },
  { value: 'Solicitud de Revision de Nota', label: 'Solicitud de Revision de Nota' },
  { value: 'Solicitud de Documentos', label: 'Solicitud de Documentos' },
  { value: 'Solicitud Academica', label: 'Solicitud Academica' },
  { value: 'Cambio de Grupo', label: 'Cambio de Grupo' },
];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" aria-hidden="true" />,
  in_process: <FileSignature className="w-4 h-4" aria-hidden="true" />,
  approved: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
  rejected: <XCircle className="w-4 h-4" aria-hidden="true" />,
};

export function RequestsPage() {
  const [requests, setRequests] = useState<AppRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ request_type: REQUEST_TYPES[0].value, description: '' });
  const [formErrors, setFormErrors] = useState<{ description?: string }>({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await requestService.getRequests();
      setRequests(data);
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = statusFilter ? requests.filter((r) => r.status === statusFilter) : requests;

  const handleCreate = async () => {
    const errors: { description?: string } = {};
    if (!form.description.trim()) errors.description = 'La descripcion es requerida';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreating(true);
    setCreateError('');
    try {
      await requestService.create(form.request_type, form.description.trim());
      setIsCreateOpen(false);
      setForm({ request_type: REQUEST_TYPES[0].value, description: '' });
      setSuccessMessage('Tu solicitud fue creada exitosamente.');
      setTimeout(() => setSuccessMessage(''), 4000);
      loadRequests();
    } catch {
      setCreateError('Ocurrio un error al crear tu solicitud.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        subtitle="Tramites y solicitudes administrativas"
        icon={<MailCheck className="w-5 h-5" aria-hidden="true" />}
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Crear Solicitud
          </Button>
        }
      />

      {successMessage && (
        <div className="mb-5 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300" role="status">
          {successMessage}
        </div>
      )}

      <div className="mb-5">
        <Select
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'pending', label: 'Pendiente' },
            { value: 'in_process', label: 'En proceso' },
            { value: 'approved', label: 'Aprobada' },
            { value: 'rejected', label: 'Rechazada' },
          ]}
          aria-label="Filtrar por estado"
          className="w-full sm:w-56"
        />
      </div>

      {loading && <Loading skeletonCount={3} message="Cargando solicitudes..." />}
      {error && <ErrorState message={error} onRetry={loadRequests} />}

      {!loading && !error && filteredRequests.length === 0 && (
        <EmptyState
          title="Sin solicitudes"
          message="No tienes solicitudes registradas. Crea una para iniciar un tramite."
          action={<Button onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4" /> Crear Solicitud</Button>}
        />
      )}

      {!loading && !error && filteredRequests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    request.status === 'approved' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : request.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : request.status === 'in_process' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {statusIcons[request.status]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{request.request_type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Codigo: SOL-{String(request.id).padStart(4, '0')}</p>
                  </div>
                </div>
                <Badge className={getStatusBadgeClass(request.status)}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{request.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Fecha: {formatDateTime(request.created_at)}</p>
              {request.observations && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-1">Observaciones</span>
                  {request.observations}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Solicitud"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} isLoading={creating}>
              {creating ? 'Enviando...' : 'Crear solicitud'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300" role="alert">
              {createError}
            </div>
          )}
          <Select
            label="Tipo de solicitud"
            value={form.request_type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((prev) => ({ ...prev, request_type: e.target.value }))}
            options={REQUEST_TYPES}
          />
          <Input
            label="Descripcion"
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe el motivo de tu solicitud..."
            error={formErrors.description}
          />
        </div>
      </Modal>
    </div>
  );
}