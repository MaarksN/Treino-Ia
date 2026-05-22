import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WeeklyReportCard } from './WeeklyReportCard';
import { generateWeeklyReport } from '../services/geminiService';

vi.mock('../services/geminiService', () => ({
  generateWeeklyReport: vi.fn()
}));

describe('WeeklyReportCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<WeeklyReportCard plans={[]} />);
    
    expect(screen.getByText('Relatório Semanal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerar/i })).toBeInTheDocument();
    expect(screen.getByText(/Clique em gerar para receber/i)).toBeInTheDocument();
  });

  it('calls generateWeeklyReport and displays the result', async () => {
    vi.mocked(generateWeeklyReport).mockResolvedValue('Mocked weekly report text');

    render(<WeeklyReportCard plans={[]} />);
    
    const generateBtn = screen.getByRole('button', { name: /Gerar/i });
    
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    expect(generateWeeklyReport).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Mocked weekly report text')).toBeInTheDocument();
  });

  it('handles errors from generateWeeklyReport gracefully', async () => {
    vi.mocked(generateWeeklyReport).mockRejectedValue(new Error('API error'));

    render(<WeeklyReportCard plans={[]} />);
    
    const generateBtn = screen.getByRole('button', { name: /Gerar/i });
    
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    expect(generateWeeklyReport).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Não consegui gerar o relatório agora/i)).toBeInTheDocument();
  });
});
