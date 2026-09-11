import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({ label, error, icon, rightElement, className = '', id, ...props }: InputProps) {
  const computedId = id || `input-${props.name || Math.random().toString(36).slice(2)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={computedId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={computedId}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={`${computedId}-error`}>{error}</p>}
    </div>
  );
}