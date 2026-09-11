import { useEffect, useState, useCallback } from 'react';
import { FileText, Download, Eye, Receipt } from 'lucide-react';
import { paymentService } from '../../services';
import type { Payment } from '../../types';
import { Card, Badge, Loading, ErrorState, EmptyState, Button, Modal } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/format';

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch {
      setError('No pudimos cargar la informacion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleDownload = (payment: Payment) => {
    const content = [
      'UNIVALLE ACADEMIC - Comprobante de Pago',
      '-----------------------------------',
      `Referencia: ${payment.reference}`,
      `Concepto: ${payment.concept}`,
      `Monto: ${formatCurrency(Number(payment.amount))}`,
      `Metodo: ${payment.payment_method || 'No especificado'}`,
      `Fecha: ${formatDate(payment.payment_date)}`,
      `Estado: ${payment.status}`,
      '-----------------------------------',
      'Gracias por su pago. Este comprobante es valido para fines academicos.',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante-${payment.reference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Pagos"
        subtitle="Historial de pagos realizados"
        icon={<FileText className="w-5 h-5" aria-hidden="true" />}
      />

      {loading && <Loading fullPage message="Cargando pagos..." />}
      {error && <ErrorState message={error} onRetry={loadPayments} />}

      {!loading && !error && payments.length === 0 && (
        <EmptyState title="Sin pagos registrados" message="No hay pagos en tu historial." />
      )}

      {!loading && !error && payments.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Referencia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Concepto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Metodo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(payment.payment_date)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{payment.reference}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{payment.concept}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(payment.amount))}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{payment.payment_method || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getStatusBadgeClass(payment.status)}>{payment.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelected(payment)}>
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(payment)}>
                          <Download className="w-3.5 h-3.5" /> Descargar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Comprobante de Pago"
        size="lg"
        footer={
          selected && (
            <Button onClick={() => { handleDownload(selected); }}>
              <Download className="w-4 h-4" /> Descargar comprobante
            </Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-700" aria-hidden="true" />
                  <span className="font-bold text-gray-900 dark:text-gray-100">UNIVALLE ACADEMIC</span>
                </div>
                <Badge className={getStatusBadgeClass(selected.status)}>{selected.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Referencia</p>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{selected.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de pago</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(selected.payment_date)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Concepto</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selected.concept}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Metodo de pago</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selected.payment_method || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(Number(selected.amount))}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Comprobante generado para fines de demostracion. La integracion con proveedores de pago esta preparada para futura conexion.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}