import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  message = 'No hay informacion disponible por el momento.',
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      </div>
      {title && <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">{title}</h3>}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}