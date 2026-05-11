import React, { useState } from 'react';
import { Database, Download, FileText, Upload } from 'lucide-react';
import { StreakData, WorkoutHistoryEntry, WorkoutPlan } from '../types';
import { PremiumFeatureGate } from './PremiumPaywall';
import {
  buildAppBackup,
  downloadFile,
  generateHistoryCSV,
  generateJSONBackup,
  generateWorkoutMarkdown,
  importJSONBackup,
  restoreFromBackup,
} from '../utils/exportUtils';

interface Props {
  plans: WorkoutPlan[];
  history: WorkoutHistoryEntry[];
  streak: StreakData;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(value: string): string {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const html: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) continue;
    if (line.startsWith('# ')) {
      html.push(`<h1>${renderInline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      html.push(`<h2>${renderInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('> ')) {
      html.push(`<blockquote>${renderInline(line.slice(2))}</blockquote>`);
      continue;
    }
    if (line.startsWith('| ')) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].startsWith('| ')) {
        const current = lines[index];
        if (!/^\|\s*-/.test(current)) {
          rows.push(current.split('|').slice(1, -1).map(cell => cell.trim()));
        }
        index += 1;
      }
      index -= 1;

      const [header, ...body] = rows;
      if (header) {
        html.push('<table>');
        html.push(`<thead><tr>${header.map(cell => `<th>${renderInline(cell)}</th>`).join('')}</tr></thead>`);
        html.push(`<tbody>${body.map(row => `<tr>${row.map(cell => `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`);
        html.push('</table>');
      }
      continue;
    }

    html.push(`<p>${renderInline(line)}</p>`);
  }

  return html.join('\n');
}

export function ExportPanel({ plans, history, streak }: Props) {
  const [restoreStatus, setRestoreStatus] = useState('');

  const handleExportPDF = (plan: WorkoutPlan) => {
    const markdown = generateWorkoutMarkdown(plan);
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(plan.planName)}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #111827; }
    h1 { color: #111827; border-bottom: 3px solid #a3e635; padding-bottom: 8px; }
    h2 { color: #1f2937; margin-top: 28px; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0 20px; font-size: 13px; }
    th { background: #f3f4f6; text-align: left; padding: 8px; border-bottom: 1px solid #d1d5db; }
    td { border-bottom: 1px solid #e5e7eb; padding: 8px; vertical-align: top; }
    blockquote { border-left: 4px solid #a3e635; margin: 0 0 16px; padding-left: 16px; color: #4b5563; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${markdownToHtml(markdown)}
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleExportCSV = () => {
    const csv = `\uFEFF${generateHistoryCSV(history)}`;
    downloadFile(csv, `historico-treinos-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
  };

  const handleBackup = () => {
    const backup = buildAppBackup(plans, history, streak);
    downloadFile(
      generateJSONBackup(backup),
      `treino-app-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8'
    );
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = importJSONBackup(String(reader.result || '{}'));
        restoreFromBackup(backup);
        setRestoreStatus('Backup restaurado. Recarregue a página.');
      } catch {
        setRestoreStatus('Arquivo inválido.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <h3 className="text-white font-bold text-lg mb-5">Exportar & Backup</h3>

      <PremiumFeatureGate feature="export_data">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest text-brand-muted mb-3">Planos de treino (PDF)</p>
        <div className="space-y-2">
          {plans.length === 0 && (
            <p className="text-brand-muted text-sm">Nenhum plano criado ainda.</p>
          )}
          {plans.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleExportPDF(plan)}
              className="w-full flex items-center justify-between p-3 bg-brand-dark rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className="text-brand-neon shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{plan.planName}</p>
                  <p className="text-brand-muted text-xs">{plan.days?.length || 0} dias</p>
                </div>
              </div>
              <Download size={16} className="text-brand-muted shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest text-brand-muted mb-3">Histórico de treinos</p>
        <button
          type="button"
          onClick={handleExportCSV}
          className="w-full flex items-center gap-3 p-4 bg-brand-dark rounded-xl border border-white/10 hover:border-white/20 transition-all"
        >
          <Download size={18} className="text-blue-400" />
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Exportar como CSV</p>
            <p className="text-brand-muted text-xs">{history.length} sessões registradas</p>
          </div>
        </button>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-brand-muted mb-3">Backup completo</p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleBackup}
            className="w-full flex items-center gap-3 p-4 bg-brand-dark rounded-xl border border-white/10 hover:border-white/20 transition-all"
          >
            <Database size={18} className="text-orange-400" />
            <div className="text-left">
              <p className="text-white text-sm font-semibold">Baixar backup (.json)</p>
              <p className="text-brand-muted text-xs">Todos os dados do app</p>
            </div>
          </button>

          <label className="w-full flex items-center gap-3 p-4 bg-brand-dark rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <Upload size={18} className="text-purple-400" />
            <div className="text-left">
              <p className="text-white text-sm font-semibold">Restaurar backup</p>
              <p className="text-brand-muted text-xs">Importar arquivo .json</p>
            </div>
            <input type="file" accept=".json,application/json" onChange={handleRestore} className="hidden" />
          </label>

          {restoreStatus && (
            <p className={`text-sm mt-2 ${restoreStatus.startsWith('Backup') ? 'text-green-400' : 'text-red-400'}`}>
              {restoreStatus}
            </p>
          )}
        </div>
      </div>
      </PremiumFeatureGate>
    </div>
  );
}
