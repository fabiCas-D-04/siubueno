import { useEffect, useState, useCallback } from 'react';
import { Receipt, Eye, Download } from 'lucide-react';
import { invoiceService } from '../../services';
import type { Invoice } from '../../types';
import { Card, Badge, Loading, ErrorState, EmptyState, Button, Modal } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/format';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch {
      setError('No pudimos cargar las facturas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleDownload = (invoice: Invoice) => {
    const content = [
      `UNIVALLE ACADEMIC - Factura ${invoice.invoice_number}`,
      '===================================',
      `Numero: ${invoice.invoice_number}`,
      `Fecha: ${formatDate(invoice.date)}`,
      `Concepto: ${invoice.concept}`,
      `Monto: ${formatCurrency(Number(invoice.amount))}`,
      `Estado: ${invoice.status}`,
      '===================================',
      'Universidad del Valle',
      'Campus Principal - Av. Principal #100',
      'Departamento de Finanzas',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factura-${invoice.invoice_number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Facturas"
        subtitle="Facturacion de tus conceptos academicos"
        icon={<Receipt className="w-5 h-5" aria-hidden="true" />}
      />

      {loading && <Loading fullPage message="Cargando facturas..." />}
      {error && <ErrorState message={error} onRetry={loadInvoices} />}

      {!loading && !error && invoices.length === 0 && (
        <EmptyState title="Sin facturas" message="No hay facturas emitidas para tu cuenta." />
      )}

      {!loading && !error && invoices.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Numero</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Concepto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-gray-100">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(invoice.date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{invoice.concept}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(invoice.amount))}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getStatusBadgeClass(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelected(invoice)}>
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(invoice)}>
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
        title={`Factura ${selected?.invoice_number || ''}`}
        size="lg"
        footer={
          selected && (
            <Button onClick={() => { handleDownload(selected); }}>
              <Download className="w-4 h-4" /> Descargar factura
            </Button>
          )
        }
      >
        {selected && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-blue-800 text-white px-6 py-4 flex flex-wrap items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5" aria-hidden="true" />
                <span className="font-bold">UNIVALLE ACADEMIC</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-blue-100">Factura</span>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Numero de factura</p>
                  <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">{selected.invoice_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de emision</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(selected.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                  <Badge className={`mt-1 ${getStatusBadgeClass(selected.status)}`}>{selected.status}</Badge>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Concepto</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selected.concept}</p>
              </div>
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total a pagar</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(Number(selected.amount))}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}