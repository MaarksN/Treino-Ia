import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import type { StreakData, WorkoutHistoryEntry, WorkoutPlan } from '../types';
import { ExportPanel } from './ExportPanel';

const exportMocks = vi.hoisted(() => ({
  buildAppBackup: vi.fn(),
  downloadFile: vi.fn(),
  generateHistoryCSV: vi.fn(),
  generateJSONBackup: vi.fn(),
  generateWorkoutMarkdown: vi.fn(),
  importJSONBackup: vi.fn(),
  restoreFromBackup: vi.fn(),
}));

vi.mock('./PremiumPaywall', () => ({
  PremiumFeatureGate: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('../utils/exportUtils', () => ({
  buildAppBackup: (...args: unknown[]) => exportMocks.buildAppBackup(...args),
  downloadFile: (...args: unknown[]) => exportMocks.downloadFile(...args),
  generateHistoryCSV: (...args: unknown[]) => exportMocks.generateHistoryCSV(...args),
  generateJSONBackup: (...args: unknown[]) => exportMocks.generateJSONBackup(...args),
  generateWorkoutMarkdown: (...args: unknown[]) => exportMocks.generateWorkoutMarkdown(...args),
  importJSONBackup: (...args: unknown[]) => exportMocks.importJSONBackup(...args),
  restoreFromBackup: (...args: unknown[]) => exportMocks.restoreFromBackup(...args),
}));

const plans: WorkoutPlan[] = [
  {
    id: 'plan-1',
    createdAt: 1779667200000,
    planName: 'Upper Progressivo',
    goalDescription: 'Hipertrofia',
    days: [
      {
        id: 'day-1',
        dayName: 'Upper A',
        focus: 'Peito e costas',
        exercises: [{ id: 'ex-1', name: 'Supino Reto', sets: 3, reps: '8', rest: '90s' }],
      },
    ],
  },
];

const history: WorkoutHistoryEntry[] = [
  {
    id: 'history-1',
    planId: 'plan-1',
    planName: 'Upper Progressivo',
    date: '2026-05-24',
    dayFocus: 'Peito e costas',
    exerciseCount: 3,
    completedCount: 3,
    totalVolume: 1200,
    durationMinutes: 48,
  },
];

const streak: StreakData = {
  currentStreak: 3,
  longestStreak: 5,
  lastWorkoutDate: '2026-05-24',
  totalWorkouts: 12,
  workoutDates: ['2026-05-22', '2026-05-23', '2026-05-24'],
};

function renderExportPanel(overrides: Partial<Parameters<typeof ExportPanel>[0]> = {}) {
  return renderWithProviders(
    <ExportPanel plans={plans} history={history} streak={streak} {...overrides} />,
  );
}

describe('ExportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
    exportMocks.buildAppBackup.mockReturnValue({ version: 1, plans, history, streak });
    exportMocks.generateHistoryCSV.mockReturnValue('date,totalVolume\n2026-05-24,1200');
    exportMocks.generateJSONBackup.mockReturnValue('{"version":1}');
    exportMocks.generateWorkoutMarkdown.mockReturnValue(
      '# Upper Progressivo\n\n| Exercicio | Series |\n| --- | --- |\n| Supino | **3x8** |',
    );
    exportMocks.importJSONBackup.mockReturnValue({ version: 1, restored: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders plan, history, and backup actions through the premium gate', () => {
    renderExportPanel();

    expect(screen.getByRole('heading', { name: /exportar & backup/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upper progressivo/i })).toBeInTheDocument();
    expect(screen.getByText('1 dias')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exportar como csv/i })).toBeInTheDocument();
    expect(screen.getByText('1 sessões registradas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar backup/i })).toBeInTheDocument();
  });

  it('shows the empty plan state without hiding history and backup controls', () => {
    renderExportPanel({ plans: [] });

    expect(screen.getByText('Nenhum plano criado ainda.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exportar como csv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar backup/i })).toBeInTheDocument();
  });

  it('exports workout history as a BOM-prefixed CSV download', () => {
    renderExportPanel();

    fireEvent.click(screen.getByRole('button', { name: /exportar como csv/i }));

    expect(exportMocks.generateHistoryCSV).toHaveBeenCalledWith(history);
    expect(exportMocks.downloadFile).toHaveBeenCalledWith(
      '\uFEFFdate,totalVolume\n2026-05-24,1200',
      'historico-treinos-2026-05-25.csv',
      'text/csv;charset=utf-8',
    );
  });

  it('downloads a complete JSON backup using the current app data', () => {
    renderExportPanel();

    fireEvent.click(screen.getByRole('button', { name: /baixar backup/i }));

    expect(exportMocks.buildAppBackup).toHaveBeenCalledWith(plans, history, streak);
    expect(exportMocks.generateJSONBackup).toHaveBeenCalledWith({
      version: 1,
      plans,
      history,
      streak,
    });
    expect(exportMocks.downloadFile).toHaveBeenCalledWith(
      '{"version":1}',
      'treino-app-backup-2026-05-25.json',
      'application/json;charset=utf-8',
    );
  });

  it('renders printable workout HTML and prints it in a new window', () => {
    vi.useFakeTimers();
    const write = vi.fn();
    const close = vi.fn();
    const print = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write, close },
      print,
    } as unknown as Window);

    renderExportPanel({ isPremium: false });

    fireEvent.click(screen.getByRole('button', { name: /upper progressivo/i }));
    vi.advanceTimersByTime(500);

    expect(exportMocks.generateWorkoutMarkdown).toHaveBeenCalledWith(plans[0]);
    expect(write).toHaveBeenCalledWith(expect.stringContaining('<strong>3x8</strong>'));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('GERADO POR TREINOAPP FREE'));
    expect(close).toHaveBeenCalledTimes(1);
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('restores a valid backup file and reports invalid backup files', async () => {
    const { container } = renderExportPanel();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['{"version":1}'], 'backup.json', { type: 'application/json' })] },
    });

    expect(await screen.findByText('Backup restaurado. Recarregue a página.')).toBeInTheDocument();
    expect(exportMocks.importJSONBackup).toHaveBeenCalledWith('{"version":1}');
    expect(exportMocks.restoreFromBackup).toHaveBeenCalledWith({ version: 1, restored: true });

    exportMocks.importJSONBackup.mockImplementationOnce(() => {
      throw new Error('invalid backup');
    });
    fireEvent.change(input, {
      target: { files: [new File(['not-json'], 'backup.json', { type: 'application/json' })] },
    });

    await waitFor(() => expect(screen.getByText('Arquivo inválido.')).toBeInTheDocument());
  });
});
