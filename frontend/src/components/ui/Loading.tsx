import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
  skeletonCount?: number;
}

export function Loading({ message = 'Cargando informacion...', fullPage = false, skeletonCount }: LoadingProps) {
  if (skeletonCount) {
    return (
      <div className="space-y-4" role="status" aria-label={message}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 overflow-hidden relative"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
          </div>
        ))}
      </div>
    );
  }

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label={message}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-blue-700 dark:text-blue-400 animate-spin" />
            <div className="absolute inset-0 w-8 h-8 rounded-full bg-blue-700/20 dark:bg-blue-400/20 animate-ping" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-10" role="status" aria-label={message}>
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 text-blue-700 dark:text-blue-400 animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{message}</span>
      </div>
    </div>
  );
}