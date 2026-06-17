import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductionReadinessPanel } from './ProductionReadinessPanel';

describe('ProductionReadinessPanel', () => {
  it('renders the internal no-go production checklist without exposing secret values', () => {
    render(<ProductionReadinessPanel />);

    expect(screen.getByRole('heading', { name: 'Prontidao de producao' })).toBeInTheDocument();
    expect(screen.getByText('NO-GO')).toBeInTheDocument();
    expect(screen.getByText('Supabase URL publica configurada')).toBeInTheDocument();
    expect(
      screen.getByText('Secrets server-side provisionados fora do repositorio'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Fonte operacional:/)).toHaveTextContent(
      'docs/qa/missing-items-before-production.md',
    );
    expect(screen.queryByText(/SUPABASE_SERVICE_ROLE_KEY=/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /checklist/i })).not.toBeInTheDocument();
  });
});
