import { ReactNode, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, ToastType } from '../../contexts/ToastContext';

const toastStyles: Record<ToastType, { container: string; icon: ReactNode; bar: string }> = {
  success: {
    container: 'border-green-200 dark:border-green-800 bg-white dark:bg-gray-900',
    icon: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" aria-hidden="true" />,
    bar: 'bg-green-500',
  },
  error: {
    container: 'border-red-200 dark:border-red-800 bg-white dark:bg-gray-900',
    icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />,
    bar: 'bg-red-500',
  },
  info: {
    container: 'border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900',
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />,
    bar: 'bg-blue-500',
  },
  warning: {
    container: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />,
    bar: 'bg-amber-500',
  },
};

function ToastItem({ id, message, type, duration }: { id: number; message: string; type: ToastType; duration: number }) {
  const { dismissToast } = useToast();
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 100 / (duration / 100)));
    }, 100);
    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setLeaving(true);
    window.setTimeout(() => dismissToast(id), 250);
  };

  const style = toastStyles[type];

  return (
    <div
      role="status"
      className={`w-80 max-w-full rounded-xl shadow-lg border overflow-hidden ${style.container} ${
        leaving ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <div className="flex items-start gap-3 px-4 pt-3.5">
        {style.icon}
        <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 leading-snug">{message}</p>
        <button
          onClick={handleClose}
          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
          aria-label="Cerrar notificacion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 pb-2 pt-2.5">
        <div className="h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${style.bar} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} id={toast.id} message={toast.message} type={toast.type} duration={toast.duration ?? 4500} />
      ))}
    </div>
  );
}