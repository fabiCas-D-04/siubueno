import { ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

type AnimationType = 'fade-up' | 'fade-left' | 'fade-right' | 'scale-in' | 'fade-down';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  threshold?: number;
}

const animationClasses: Record<AnimationType, { hidden: string; visible: string }> = {
  'fade-up': { hidden: 'opacity-0 translate-y-6', visible: 'opacity-100 translate-y-0' },
  'fade-down': { hidden: 'opacity-0 -translate-y-5', visible: 'opacity-100 translate-y-0' },
  'fade-left': { hidden: 'opacity-0 -translate-x-6', visible: 'opacity-100 translate-x-0' },
  'fade-right': { hidden: 'opacity-0 translate-x-6', visible: 'opacity-100 translate-x-0' },
  'scale-in': { hidden: 'opacity-0 scale-95', visible: 'opacity-100 scale-100' },
};

export function ScrollReveal({ children, animation = 'fade-up', delay = 0, className = '', threshold }: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold });
  const anim = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={`${anim.hidden} ${isVisible ? anim.visible : ''} transition-all duration-500 ease-out ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}