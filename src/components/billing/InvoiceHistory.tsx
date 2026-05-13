import React from 'react';
import { Download, FileText } from 'lucide-react';
import { InvoiceRecord } from '../../types/billing';

interface Props {
  invoices: InvoiceRecord[];
}

export function InvoiceHistory({ invoices }: Props) {
  if (invoices.length === 0) {
    return (
      <div className="bg-brand-gray border border-white/10 rounded-2xl p-6 text-center">
        <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-brand-muted text-sm">Nenhuma fatura encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h3 className="text-white font-bold text-lg">Histórico de Faturas</h3>
      </div>

      <div className="divide-y divide-white/5">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-brand-dark p-2 rounded-lg text-brand-muted">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-white font-medium">{new Date(invoice.date).toLocaleDateString('pt-BR')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-brand-neon font-mono text-sm">
                    R$ {invoice.amount.toFixed(2)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    invoice.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {invoice.status === 'paid' ? 'Pago' : invoice.status === 'open' ? 'Aberto' : 'Cancelado'}
                  </span>
                </div>
              </div>
            </div>

            {invoice.downloadUrl && (
              <a
                href={invoice.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white/50 hover:text-brand-neon p-2"
                title="Download PDF"
              >
                <Download size={18} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
