import React, { useMemo } from 'react';
import { DailyCheckin, WorkoutHistoryEntry } from '../types';

interface Props {
  history: WorkoutHistoryEntry[];
  checkins?: DailyCheckin[];
  weeksBack?: number;
}

export function ConsistencyHeatmap({ history, checkins = [], weeksBack = 16 }: Props) {
  const { cells, months } = useMemo(() => {
    const workoutDates = new Set(history.map(entry => entry.date));
    const checkinDates = new Set(checkins.map(checkin => checkin.date));
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - weeksBack * 7);

    while (startDate.getDay() !== 0) startDate.setDate(startDate.getDate() - 1);

    const allCells: Array<{ date: string; level: number }> = [];
    const monthLabels: Array<{ label: string; col: number }> = [];
    let previousMonth = -1;
    let col = 0;
    const cursor = new Date(startDate);

    while (cursor <= today) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const month = cursor.getMonth();

      if (cursor.getDay() === 0) {
        if (month !== previousMonth) {
          monthLabels.push({ label: cursor.toLocaleString('pt-BR', { month: 'short' }), col });
          previousMonth = month;
        }
        col++;
      }

      const hasWorkout = workoutDates.has(dateStr);
      const hasCheckin = checkinDates.has(dateStr);
      allCells.push({ date: dateStr, level: hasWorkout ? 3 : hasCheckin ? 1 : 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return { cells: allCells, months: monthLabels };
  }, [history, checkins, weeksBack]);

  const colors = ['rgba(255,255,255,0.06)', 'rgba(163,230,53,0.25)', 'rgba(163,230,53,0.5)', '#a3e635'];
  const dayLabels = ['Dom', '', 'Ter', '', 'Qui', '', 'Sáb'];
  const totalCols = Math.ceil(cells.length / 7);

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Consistência</h3>
        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <span>Menos</span>
          {[0, 1, 2, 3].map(level => (
            <div key={level} className="w-3 h-3" style={{ background: colors[level] }} />
          ))}
          <span>Mais</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="relative" style={{ width: `${totalCols * 16 + 34}px` }}>
          <div className="ml-8 mb-1 relative h-5">
            {months.map(month => (
              <span key={`${month.label}-${month.col}`} className="absolute text-[10px] text-brand-muted" style={{ left: `${month.col * 16}px` }}>
                {month.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-0.5 mr-1 w-7">
              {dayLabels.map((day, index) => (
                <div key={index} className="h-3 text-[9px] text-brand-muted leading-3">{day}</div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {Array.from({ length: totalCols }).map((_, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-0.5">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                    const cell = cells[colIdx * 7 + dayIdx];
                    if (!cell) return <div key={dayIdx} className="w-3 h-3" />;
                    return (
                      <div
                        key={dayIdx}
                        title={`${cell.date}${cell.level >= 3 ? ' - treino' : cell.level >= 1 ? ' - check-in' : ''}`}
                        className="w-3 h-3 cursor-pointer transition-opacity hover:opacity-80"
                        style={{ background: colors[cell.level] }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4 text-xs text-brand-muted">
        <span><strong className="text-brand-light">{history.length}</strong> treinos</span>
        <span><strong className="text-brand-light">{checkins.length}</strong> check-ins</span>
      </div>
    </div>
  );
}
