import { useRef, useEffect } from 'react';

interface CaptchaProps {
  text: string;
  onRefresh: () => void;
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCaptcha(length = 4): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export function Captcha({ text, onRefresh }: CaptchaProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 128;
    canvas.height = 44;

    ctx.fillStyle = '#0c2a49';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `hsla(${Math.floor(Math.random() * 360)}, 70%, 60%, 0.55)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 128, Math.random() * 44);
      ctx.lineTo(Math.random() * 128, Math.random() * 44);
      ctx.stroke();
    }

    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `hsla(${Math.floor(Math.random() * 360)}, 60%, 70%, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 44, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 24px Consolas, monospace';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(14 + i * 28, 24);
      ctx.rotate(Math.random() * 0.6 - 0.3);
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 60) + 170}, 75%, 72%)`;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  }, [text]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={ref}
        className="rounded-lg border border-white/20 shadow-inner"
        aria-label="Codigo de verificacion"
        role="img"
      />
      <button
        type="button"
        onClick={onRefresh}
        className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Generar nuevo captcha"
        title="Volver a generar el captcha"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      </button>
    </div>
  );
}