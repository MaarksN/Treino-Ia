import { AlertTriangle, CheckCircle2, ClipboardCheck, ShieldAlert } from 'lucide-react';
import {
  buildProductionReadinessSummary,
  type ProductionReadinessCheck,
  type ProductionReadinessStatus,
} from '../../services/productionReadiness';

const STATUS_STYLES: Record<ProductionReadinessStatus, string> = {
  pass: 'border-brand-neon/40 bg-brand-neon/10 text-brand-neon',
  blocked: 'border-brand-magenta/50 bg-brand-magenta/10 text-brand-magenta',
  manual: 'border-brand-light/30 bg-brand-light/10 text-brand-light',
};

const STATUS_LABELS: Record<ProductionReadinessStatus, string> = {
  pass: 'OK',
  blocked: 'Bloqueado',
  manual: 'Validacao manual',
};

function StatusIcon({ status }: { status: ProductionReadinessStatus }) {
  if (status === 'pass') return <CheckCircle2 className="h-5 w-5" />;
  if (status === 'blocked') return <ShieldAlert className="h-5 w-5" />;
  return <ClipboardCheck className="h-5 w-5" />;
}

function ReadinessCheckCard({ check }: { check: ProductionReadinessCheck }) {
  return (
    <article className={`rounded-2xl border p-4 ${STATUS_STYLES[check.status]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <StatusIcon status={check.status} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-80">
              {check.area}
            </p>
            <h3 className="mt-1 font-display text-2xl uppercase text-brand-light">{check.label}</h3>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-current px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
          {STATUS_LABELS[check.status]}
        </span>
      </div>
      <p className="mt-3 font-mono text-xs leading-5 text-brand-light/70">{check.evidence}</p>
      <p className="mt-3 font-mono text-xs leading-5 text-brand-light">
        Proximo passo: {check.nextAction}
      </p>
    </article>
  );
}

export function ProductionReadinessPanel() {
  const summary = buildProductionReadinessSummary();
  const progress = Math.round((summary.passCount / summary.totalCount) * 100);

  return (
    <section id="dashboard-production-readiness" className="mb-8 scroll-mt-24 space-y-6">
      <div className="border-b-2 border-brand-light/10 pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-magenta">
          Operacao interna
        </p>
        <h2 className="font-display text-4xl uppercase text-brand-light">Prontidao de producao</h2>
      </div>

      <div className="rounded-[28px] border-2 border-brand-magenta/40 bg-brand-gray p-5 shadow-brutal-magenta">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-6 w-6 text-brand-magenta" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-magenta">
                {summary.verdict === 'go' ? 'GO' : 'NO-GO'}
              </p>
              <h3 className="mt-1 font-display text-3xl uppercase text-brand-light">
                {summary.passCount}/{summary.totalCount} criterios com evidencia automatica
              </h3>
              <p className="mt-2 max-w-3xl font-mono text-xs leading-5 text-brand-light/70">
                Este painel nao exibe secrets. Ele consolida os bloqueios documentados e separa o
                que o runtime publico consegue confirmar do que precisa ser validado em CI/staging
                seguro.
              </p>
            </div>
          </div>
          <div className="min-w-44 rounded-2xl border border-brand-light/15 bg-brand-dark p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
              Progresso
            </p>
            <p className="mt-1 font-display text-5xl uppercase text-brand-neon">{progress}%</p>
            <p className="font-mono text-xs text-brand-light/60">
              {summary.blockedCount} bloqueado(s), {summary.manualCount} manual(is)
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {summary.checks.map((check) => (
          <ReadinessCheckCard key={check.id} check={check} />
        ))}
      </div>

      <p className="font-mono text-xs leading-5 text-brand-light/60">
        Fonte operacional: docs/qa/missing-items-before-production.md e
        docs/qa/technical-debt-execution-2026-06-05.md.
      </p>
    </section>
  );
}
