import { useEffect, useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import { paymentService } from '../../services';
import type { Payment } from '../../types';
import { Card, Badge, Loading, ErrorState, EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/format';

export function AccountPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const paidAmount = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + Number(p.amount), 0);
  const nextDueDate = payments.find((p) => p.status === 'pending' || p.status === 'overdue');

  const stats = [
    { label: 'Monto total', value: formatCurrency(totalAmount), className: 'text-gray-900 dark:text-gray-100' },
    { label: 'Monto pagado', value: formatCurrency(paidAmount), className: 'text-green-600 dark:text-green-400' },
    { label: 'Saldo pendiente', value: formatCurrency(pendingAmount), className: 'text-red-600 dark:text-red-400' },
    { label: 'Proxima fecha de pago', value: nextDueDate ? formatDate(nextDueDate.payment_date) : 'Sin pendientes', className: '' },
  ];

  return (
    <div>
      <PageHeader
        title="Estado de Cuenta"
        subtitle="Resumen de tu situacion financiera"
        icon={<Wallet className="w-5 h-5" aria-hidden="true" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl shadow-card dark:shadow-none border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.className}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {loading && <Loading fullPage message="Cargando estado de cuenta..." />}
      {error && <ErrorState message={error} onRetry={loadPayments} />}

      {!loading && !error && payments.length === 0 && <EmptyState message="No hay movimientos en tu cuenta." />}

      {!loading && !error && payments.length > 0 && (
        <Card className="p-0 overflow-hidden" title="Movimientos" subtitle="Historial de conceptos y pagos">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Concepto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Referencia</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(payment.payment_date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{payment.concept}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{payment.reference}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${payment.status === 'paid' ? 'text-gray-900 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getStatusBadgeClass(payment.status)}>{payment.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}