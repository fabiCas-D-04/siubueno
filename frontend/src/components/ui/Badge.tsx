import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Badge({ children, className = '', title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}