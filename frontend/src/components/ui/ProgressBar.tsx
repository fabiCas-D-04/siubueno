interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, max = 100, color, className = '', label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = color || (pct >= 90 ? 'bg-green-500' : pct >= 80 ? 'bg-blue-600' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500');

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1 text-xs">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}