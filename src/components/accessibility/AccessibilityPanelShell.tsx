import type { ReactNode } from 'react';

interface AccessibilityPanelShellProps {
  titleId: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AccessibilityPanelShell({
  titleId,
  title,
  description,
  children,
  footer,
}: AccessibilityPanelShellProps) {
  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby={titleId}
    >
      <h3 id={titleId} className="font-display text-3xl uppercase text-brand-light">
        {title}
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">{description}</p>

      {children}

      {footer && <p className="mt-3 font-mono text-[10px] text-brand-muted">{footer}</p>}
    </article>
  );
}
