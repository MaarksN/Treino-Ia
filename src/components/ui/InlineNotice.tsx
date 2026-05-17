import { AlertTriangle, Info } from 'lucide-react';

interface InlineNoticeProps {
  type?: 'info' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export function InlineNotice({ type = 'info', title, children }: InlineNoticeProps) {
  const isWarning = type === 'warning';
  
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-xl border-l-4 p-4 ${
      isWarning 
        ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta' 
        : 'border-brand-neon bg-brand-neon/10 text-brand-neon'
    }`}>
      <div className="mt-0.5 flex-shrink-0">
        {isWarning ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
      </div>
      <div>
        {title && <h4 className="mb-1 font-mono text-sm font-bold uppercase tracking-wide">{title}</h4>}
        <div className="font-mono text-xs leading-relaxed text-brand-light/80">
          {children}
        </div>
      </div>
    </div>
  );
}
