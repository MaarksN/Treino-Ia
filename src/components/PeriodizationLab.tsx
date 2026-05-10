import React, { useMemo } from 'react';
import { CalendarDays, Dumbbell, Layers3, Target } from 'lucide-react';
import { FatigueSnapshot, TrainingExercisePerformance } from '../types';
import { calcFatigueScore } from '../utils/fatigueUtils';
import { buildTwelveWeekPlan } from '../utils/periodizationUtils';
import { AutoProgressionPanel } from './AutoProgressionPanel';
import { FatigueMonitor } from './FatigueMonitor';
import { VolumeLandmarks } from './VolumeLandmarks';

const SAMPLE_PERFORMANCES: TrainingExercisePerformance[] = [
  {
    exerciseName: 'Supino Reto',
    muscle: 'Peito',
    sets: 4,
    currentLoad: 70,
    targetReps: 8,
    actualReps: 10,
    rpe: 7,
    rir: 2,
    completed: true,
  },
  {
    exerciseName: 'Remada Curvada',
    muscle: 'Costas',
    sets: 4,
    currentLoad: 65,
    targetReps: 10,
    actualReps: 9,
    rpe: 8,
    rir: 1,
    completed: true,
  },
  {
    exerciseName: 'Agachamento Livre',
    muscle: 'Quadríceps',
    sets: 5,
    currentLoad: 100,
    targetReps: 6,
    actualReps: 5,
    rpe: 9,
    rir: 1,
    completed: true,
  },
  {
    exerciseName: 'Stiff',
    muscle: 'Posteriores',
    sets: 3,
    currentLoad: 80,
    targetReps: 8,
    actualReps: 8,
    rpe: 8,
    rir: 2,
    completed: true,
  },
  {
    exerciseName: 'Desenvolvimento',
    muscle: 'Ombros',
    sets: 3,
    currentLoad: 35,
    targetReps: 10,
    actualReps: 12,
    rpe: 7,
    rir: 3,
    completed: true,
  },
];

const SAMPLE_FATIGUE: Omit<FatigueSnapshot, 'fatigueScore'> = {
  date: new Date().toISOString(),
  readiness: 68,
  soreness: 5,
  sleep: 7,
  stress: 4,
  hrv: 62,
  weeklyVolume: 58,
  completedSessions: 4,
  missedSessions: 0,
};

interface Props {
  performances?: TrainingExercisePerformance[];
  fatigue?: Partial<FatigueSnapshot>;
}

export function PeriodizationLab({ performances, fatigue }: Props) {
  const performanceRows = performances?.length ? performances : SAMPLE_PERFORMANCES;

  const fatigueSnapshot: Omit<FatigueSnapshot, 'fatigueScore'> = {
    ...SAMPLE_FATIGUE,
    ...fatigue,
    date: fatigue?.date ?? new Date().toISOString(),
  };

  const fatigueScore = useMemo(() => {
    return calcFatigueScore(fatigueSnapshot);
  }, [fatigueSnapshot]);

  const plan = useMemo(() => buildTwelveWeekPlan(), []);

  const phaseSummary = [
    {
      title: 'Ciclo de resistência',
      item: '165 / 167',
      description: 'Base técnica, tolerância de volume e condicionamento.',
      icon: Layers3,
    },
    {
      title: 'Ciclo de hipertrofia',
      item: '166',
      description: 'Acúmulo de volume em direção ao MAV sem ultrapassar MRV.',
      icon: Dumbbell,
    },
    {
      title: 'Ciclo de força',
      item: '165',
      description: 'Menos volume, mais intensidade e foco em compostos.',
      icon: Target,
    },
    {
      title: 'Pico e taper',
      item: '168 / 169',
      description: 'Reduz fadiga e prepara o atleta para melhor performance.',
      icon: CalendarDays,
    },
  ];

  return (
    <section className="space-y-6">
      <header>
        <p className="text-brand-neon font-mono font-bold uppercase tracking-[0.25em] text-xs">
          Bloco 8
        </p>

        <h2 className="font-display text-4xl uppercase tracking-widest text-brand-light text-shadow-neon mt-1">
          Periodização Científica Avançada
        </h2>

        <p className="text-brand-muted mt-2 max-w-3xl">
          MEV, MAV, MRV, fadiga acumulada, prontidão de sessão,
          progressão automática, deload e plano automatizado de 12 semanas.
        </p>
      </header>

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {phaseSummary.map(item => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="bg-brand-gray rounded-3xl border border-white/10 p-5">
              <Icon className="text-brand-neon mb-4" size={22} />
              <p className="text-xs text-brand-muted uppercase tracking-widest">
                Item {item.item}
              </p>
              <h3 className="text-lg font-black text-white mt-1">{item.title}</h3>
              <p className="text-sm text-white/60 mt-2">{item.description}</p>
            </div>
          );
        })}
      </section>

      <div className="grid xl:grid-cols-2 gap-6">
        <VolumeLandmarks performances={performanceRows} />
        <FatigueMonitor initialSnapshot={fatigueSnapshot} />
      </div>

      <AutoProgressionPanel
        performances={performanceRows}
        fatigueScore={fatigueScore}
      />

      <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="text-brand-neon" size={20} />
          <div>
            <h2 className="text-xl font-black text-white">
              Plano Automatizado de 12 Semanas
            </h2>
            <p className="text-sm text-brand-muted">
              Resistência, hipertrofia, deload, força, pico, taper e transição.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {plan.weeks.map(week => (
            <div key={week.week} className="rounded-2xl bg-brand-dark border border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-brand-neon uppercase tracking-widest">
                    Semana {week.week}
                  </p>
                  <h3 className="font-black text-white mt-1">{week.title}</h3>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                  {week.phase}
                </span>
              </div>

              <p className="text-sm text-white/70 mt-3">{week.focus}</p>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="rounded-xl bg-white/5 p-2">
                  <p className="text-[10px] text-brand-muted">Volume</p>
                  <p className="font-bold text-white">{week.volumeMultiplier}x</p>
                </div>

                <div className="rounded-xl bg-white/5 p-2">
                  <p className="text-[10px] text-brand-muted">Intensidade</p>
                  <p className="font-bold text-white">{week.intensityMultiplier}x</p>
                </div>

                <div className="rounded-xl bg-white/5 p-2">
                  <p className="text-[10px] text-brand-muted">RPE</p>
                  <p className="font-bold text-white">{week.targetRpe}</p>
                </div>
              </div>

              <p className="text-xs text-brand-muted mt-3">{week.notes}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
