import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border-4 border-dashed border-brand-light/10 bg-brand-gray/50 p-8 text-center transition-colors hover:border-brand-light/20">
      {icon && <div className="mb-4 text-brand-light/40">{icon}</div>}
      <h3 className="mb-2 font-display text-2xl uppercase text-brand-light">{title}</h3>
      <p className="mb-6 max-w-md font-mono text-sm leading-6 text-brand-light/60">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
