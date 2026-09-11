import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  visible: boolean;
}

export function SplashScreen({ visible }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-blue-950 via-brand-darker to-brand-dark overflow-hidden ${
        visible ? '' : 'animate-fade-out'
      }`}
    >
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative animate-logo-scale-in">
          <span className="absolute inset-0 rounded-2xl bg-blue-500/30 animate-logo-ring" aria-hidden="true" />
          <div className="relative w-24 h-24 rounded-2xl bg-blue-800/80 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-blue-800/40 animate-splash-pulse">
            <GraduationCap className="w-13 h-13 text-white" aria-hidden="true" />
          </div>
        </div>

        <div className="text-center animate-logo-fade-in">
          <h1 className="text-3xl font-bold text-white tracking-tight animate-letter-space">
            UNIVALLE
          </h1>
          <p className="text-xs text-blue-300/70 uppercase tracking-[0.3em] mt-2 animate-logo-fade-in">
            Academic
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-3 animate-logo-fade-in">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}