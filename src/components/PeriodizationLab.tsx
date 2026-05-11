import React, { useMemo, useState, useEffect } from 'react';
import { CalendarDays, Dumbbell, Layers3, Target, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { FatigueSnapshot, TrainingExercisePerformance, UserPeriodizationPlan } from '../types';
import { calcFatigueScore } from '../utils/fatigueUtils';
import { AutoProgressionPanel } from './AutoProgressionPanel';
import { FatigueMonitor } from './FatigueMonitor';
import { VolumeLandmarks } from './VolumeLandmarks';
import { periodizationService } from '../services/periodizationService';

interface Props {
  profileId?: string;
  performances?: TrainingExercisePerformance[];
  fatigue?: Partial<FatigueSnapshot>;
}

export function PeriodizationLab({ profileId, performances = [], fatigue }: Props) {
  const [planData, setPlanData] = useState<UserPeriodizationPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlan() {
      if (!profileId) return;
      setIsLoadingPlan(true);
      setError(null);
      try {
        const plan = await periodizationService.getUserTwelveWeekPlan(profileId);
        setPlanData(plan);
      } catch (err) {
        setError('Erro ao carregar o plano de periodização.');
      } finally {
        setIsLoadingPlan(false);
      }
    }

    loadPlan();
  }, [profileId]);

  const handleGeneratePlan = async () => {
    if (!profileId) return;
    setIsGeneratingPlan(true);
    setError(null);
    try {
      const newPlan = await periodizationService.generateAndSavePlan(profileId);
      if (newPlan) {
        setPlanData(newPlan);
      } else {
        setError('Não foi possível gerar o plano no momento.');
      }
    } catch (err) {
      setError('Erro ao gerar plano.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const fatigueSnapshot: Omit<FatigueSnapshot, 'fatigueScore'> = {
    date: fatigue?.date ?? new Date().toISOString(),
    readiness: fatigue?.readiness ?? 100,
    soreness: fatigue?.soreness ?? 0,
    sleep: fatigue?.sleep ?? 8,
    stress: fatigue?.stress ?? 0,
    hrv: fatigue?.hrv,
    weeklyVolume: fatigue?.weeklyVolume ?? 0,
    completedSessions: fatigue?.completedSessions ?? 0,
    missedSessions: fatigue?.missedSessions ?? 0,
  };

  const fatigueScore = useMemo(() => {
    return calcFatigueScore(fatigueSnapshot);
  }, [fatigueSnapshot]);

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
        {performances.length > 0 ? (
          <VolumeLandmarks performances={performances} />
        ) : (
          <div className="bg-brand-gray rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center text-center">
             <Activity className="text-brand-muted mb-4" size={40} />
             <h3 className="text-lg font-black text-white mb-2">Sem Dados de Volume</h3>
             <p className="text-sm text-brand-muted max-w-sm">
               Registre seus treinos para visualizar seu volume em relação ao MEV, MAV e MRV por grupo muscular.
             </p>
          </div>
        )}
        <FatigueMonitor initialSnapshot={fatigueSnapshot} />
      </div>

      {performances.length > 0 ? (
        <AutoProgressionPanel
          performances={performances}
          fatigueScore={fatigueScore}
        />
      ) : (
        <div className="bg-brand-gray rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center text-center">
           <Target className="text-brand-muted mb-4" size={40} />
           <h3 className="text-lg font-black text-white mb-2">Sem Dados de Progressão</h3>
           <p className="text-sm text-brand-muted max-w-sm">
             Realize exercícios e avalie o RPE para que o sistema possa sugerir progressões de carga e trocas de exercícios automaticamente.
           </p>
        </div>
      )}

      <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="text-brand-neon" size={20} />
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">
              Plano Automatizado de 12 Semanas
            </h2>
            <p className="text-sm text-brand-muted">
              Resistência, hipertrofia, deload, força, pico, taper e transição.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {isLoadingPlan ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-neon animate-spin mb-4" />
            <p className="text-brand-muted">Carregando seu plano periodizado...</p>
          </div>
        ) : !planData ? (
          <div className="bg-brand-dark rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center text-center">
            <CalendarDays className="text-brand-muted mb-4" size={48} />
            <h3 className="text-xl font-black text-white mb-2">Nenhum plano ativo</h3>
            <p className="text-brand-muted mb-6 max-w-md">
              Gere seu primeiro plano automatizado de 12 semanas. Ele será ajustado com base na sua fadiga e performance ao longo do tempo.
            </p>
            <button
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan || !profileId}
              className="px-6 py-3 bg-brand-neon text-black font-bold rounded-xl hover:bg-brand-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGeneratingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
              {isGeneratingPlan ? 'Gerando Plano...' : 'Gerar Plano de 12 Semanas'}
            </button>
            {!profileId && (
              <p className="text-xs text-yellow-400/80 mt-3">Faça login para salvar seu plano.</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {planData.plan_data.weeks.map(week => (
              <div key={week.week} className={`rounded-2xl border p-4 ${planData.current_week === week.week ? 'bg-brand-neon/10 border-brand-neon/30' : 'bg-brand-dark border-white/10'}`}>
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
        )}
      </section>
    </section>
  );
}
