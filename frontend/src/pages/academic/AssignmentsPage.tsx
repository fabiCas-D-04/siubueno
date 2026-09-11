import { useEffect, useState, useMemo, useCallback } from 'react';
import { ClipboardList, Upload, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { assignmentService } from '../../services';
import type { Assignment } from '../../types';
import { Card, Badge, SearchBar, Tabs, Loading, ErrorState, EmptyState, Button, Modal, Input } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { formatDate, getStatusBadgeClass } from '../../utils/format';

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitNotes, setSubmitNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await assignmentService.getAssignments({
        status: activeTab === 'all' ? undefined : activeTab,
        search: search || undefined,
      });
      setAssignments(data);
    } catch {
      setError('No pudimos cargar las tareas.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const counts = useMemo(() => {
    return {
      all: assignments.length,
      pending: assignments.filter((a) => !a.submission_status).length,
      submitted: assignments.filter((a) => a.submission_status === 'submitted' || a.submission_status === 'graded').length,
      overdue: assignments.filter((a) => !a.submission_status && new Date(a.due_date) < new Date()).length,
    };
  }, [assignments]);

  const getAssignmentState = (assignment: Assignment): 'submitted' | 'pending' | 'overdue' | 'graded' => {
    if (assignment.submission_status === 'graded') return 'graded';
    if (assignment.submission_status) return 'submitted';
    if (new Date(assignment.due_date) < new Date()) return 'overdue';
    return 'pending';
  };

  const openSubmit = (assignment: Assignment) => {
    setSelected(assignment);
    setSubmitNotes('');
    setSubmitError('');
    setIsSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    if (!submitNotes.trim()) {
      setSubmitError('Agrega una nota o comentario para tu entrega.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await assignmentService.submit(selected.id, submitNotes.trim());
      setIsSubmitOpen(false);
      setSuccessMessage('Tarea entregada exitosamente.');
      setTimeout(() => setSuccessMessage(''), 4000);
      loadAssignments();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSubmitError(axiosError.response?.data?.message || 'Ocurrio un error al entregar la tarea.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'Todas', count: counts.all },
    { id: 'pending', label: 'Pendientes', count: counts.pending },
    { id: 'submitted', label: 'Entregadas', count: counts.submitted },
    { id: 'overdue', label: 'Vencidas', count: counts.overdue },
  ];

  return (
    <div>
      <PageHeader
        title="Tareas"
        subtitle="Gestiona tus entregas academicas"
        icon={<ClipboardList className="w-5 h-5" aria-hidden="true" />}
      />

      {successMessage && (
        <div className="mb-5 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300" role="status">
          {successMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="flex-1" />
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar tarea..." className="w-full sm:w-56" />
      </div>

      {loading && <Loading skeletonCount={4} message="Cargando tareas..." />}
      {error && <ErrorState message={error} onRetry={loadAssignments} />}

      {!loading && !error && assignments.length === 0 && (
        <EmptyState
          title={activeTab === 'pending' ? 'No tienes tareas pendientes' : 'No tienes tareas'}
          message={activeTab === 'pending' ? 'Has completado todas tus tareas. Excelente trabajo.' : 'No hay tareas que coincidan con tu busqueda.'}
        />
      )}

      {!loading && !error && assignments.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {assignments.map((assignment) => {
              const state = getAssignmentState(assignment);
              const submitted = state === 'submitted' || state === 'graded';
              const stateBadge = state === 'graded'
                ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Calificada</Badge>
                : state === 'submitted'
                ? <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">Entregada</Badge>
                : state === 'overdue'
                ? <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">Vencida</Badge>
                : <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">Pendiente</Badge>;

              return (
                <div key={assignment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        state === 'overdue' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : submitted ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {state === 'overdue' ? <AlertCircle className="w-5 h-5" aria-hidden="true" />
                          : submitted ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                          : <ClipboardList className="w-5 h-5" aria-hidden="true" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{assignment.title}</h3>
                          {stateBadge}
                          {assignment.score !== null && (
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Nota: {assignment.score.toFixed(1)}/{assignment.max_score}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {assignment.course_name} <span className="text-gray-400 dark:text-gray-500">({assignment.course_code})</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{assignment.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Entrega: {formatDate(assignment.due_date)} - {assignment.due_time}
                          {assignment.submitted_at && ` | Entregada: ${formatDate(assignment.submitted_at)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setSelected(assignment)}>
                        <Eye className="w-4 h-4" /> Ver
                      </Button>
                      {!submitted && !assignment.submission_status && (
                        <Button size="sm" onClick={() => openSubmit(assignment)}>
                          <Upload className="w-4 h-4" /> Entregar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Modal
        isOpen={!!selected && !isSubmitOpen}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Detalle de tarea'}
        size="lg"
        footer={
          selected && !selected.submission_status && (
            <Button onClick={() => { setIsSubmitOpen(true); }}>
              <Upload className="w-4 h-4" /> Entregar Tarea
            </Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{selected.course_name}</Badge>
              <Badge className={getStatusBadgeClass('pending')}>{getAssignmentState(selected)}</Badge>
              {selected.score !== null && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Nota: {selected.score.toFixed(1)}</Badge>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Descripcion</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selected.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de entrega</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(selected.due_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hora limite</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selected.due_time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Puntaje maximo</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selected.max_score} pts</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estado de entrega</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {selected.submission_status || 'Pendiente'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isSubmitOpen && !!selected}
        onClose={() => setIsSubmitOpen(false)}
        title="Entregar Tarea"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>
              {submitting ? 'Enviando...' : 'Confirmar entrega'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nota de entrega"
            value={submitNotes}
            onChange={(e) => setSubmitNotes(e.target.value)}
            placeholder="Describe brevemente lo que entregas..."
            error={submitError}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selected?.title} - {selected?.course_name}
          </p>
        </div>
      </Modal>
    </div>
  );
}