import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Bell, Camera, Droplets, Loader, Utensils } from 'lucide-react';
import { type MealEntry } from '../types';
import { type TrainingPlan, type UserProfile, type WorkoutSession } from '../services/database';
import { analyzePhotoMacros } from '../services/nutritionService';
import {
  estimateMacroTargetsForLifestyleProfile,
  getDynamicNutritionRecommendation,
  selectRecipesForMacroTargets,
  summarizeMealScanForTargets,
  type MealScanInsight,
} from '../services/nutritionLifestyleService';
import { getTodayHydration, loadHydrationEntries, loadHydrationGoal } from '../utils/biometricUtils';
import { HYDRATION_QUICK_ADD_EVENT } from '../utils/hydrationQuickActions';
import { getPhaseForDate, loadCycleEntries, PHASE_CONFIG } from '../utils/hormonalUtils';
import { showHydrationReminderNotification } from '../utils/pwaUtils';
import { HormonalCycleTracker } from './HormonalCycleTracker';
import { HydrationTracker } from './HydrationTracker';

interface Props {
  profile: UserProfile;
  plan: TrainingPlan;
  history: WorkoutSession[];
}

export function NutritionLifestyleHub({ profile, plan, history }: Props) {
  const [fatigue, setFatigue] = useState(3);
  const [bodyWeightKg, setBodyWeightKg] = useState(75);
  const [hydrationVersion, setHydrationVersion] = useState(0);
  const [cycleVersion, setCycleVersion] = useState(0);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [scanText, setScanText] = useState('');
  const [scanInsight, setScanInsight] = useState<MealScanInsight | null>(null);
  const [hydrationNotice, setHydrationNotice] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refreshHydration = () => setHydrationVersion(value => value + 1);
    const refreshCycle = () => setCycleVersion(value => value + 1);

    window.addEventListener(HYDRATION_QUICK_ADD_EVENT, refreshHydration);
    window.addEventListener('cycle:updated', refreshCycle);

    return () => {
      window.removeEventListener(HYDRATION_QUICK_ADD_EVENT, refreshHydration);
      window.removeEventListener('cycle:updated', refreshCycle);
    };
  }, []);

  const hydrationGoal = useMemo(() => loadHydrationGoal(), [hydrationVersion]);
  const todayHydration = useMemo(() => getTodayHydration(loadHydrationEntries()), [hydrationVersion]);
  const todayPhase = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return getPhaseForDate(today, loadCycleEntries());
  }, [cycleVersion]);
  const macros = useMemo(() => estimateMacroTargetsForLifestyleProfile({
    goal: profile.goal,
    bodyWeightKg,
    trainingDays: profile.daysPerWeek,
    workoutMinutes: profile.timePerWorkout,
  }), [bodyWeightKg, profile.daysPerWeek, profile.goal, profile.timePerWorkout]);
  const recommendation = useMemo(() => getDynamicNutritionRecommendation({
    goal: profile.goal,
    workoutTime: 'treino de hoje',
    bodyWeightKg,
    fatigue,
    hydrationMl: todayHydration,
    hydrationGoalMl: hydrationGoal.dailyMl,
    menstrualPhase: todayPhase?.phase ?? null,
  }), [bodyWeightKg, fatigue, hydrationGoal.dailyMl, profile.goal, todayHydration, todayPhase?.phase]);
  const recipes = useMemo(() => selectRecipesForMacroTargets(macros, {
    maxRecipes: 3,
    preferTags: recommendation.level === 'alto' ? ['fadiga', 'pre-treino'] : ['performance', 'base'],
  }), [macros, recommendation.level]);
  const latestSession = history[0];

  const handleHydrationNotification = async () => {
    await showHydrationReminderNotification(todayHydration, hydrationGoal.dailyMl);
    setHydrationNotice('Lembrete enviado com ações rápidas de +250ml e +500ml.');
  };

  const handlePhotoAnalysis = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setPhotoLoading(true);
      setScanText('');
      setScanInsight(null);

      try {
        const analyzed = await analyzePhotoMacros(base64, file.type);
        setScanText(analyzed.aiAnalysis || analyzed.description || 'Scan concluído.');
        setScanInsight(summarizeMealScanForTargets(analyzed as Partial<MealEntry>, macros));
      } catch {
        setScanText('Não consegui analisar a foto agora. Verifique a chave Gemini e tente novamente.');
      } finally {
        setPhotoLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const phaseConfig = todayPhase ? PHASE_CONFIG[todayPhase.phase] : null;

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Lote 05</p>
          <h2 className="mt-2 font-display text-5xl uppercase text-brand-light">Nutrição e lifestyle</h2>
          <p className="mt-3 max-w-3xl font-mono text-sm leading-7 text-brand-light/75">
            {plan.planName} usa {profile.daysPerWeek} dias por semana; último treino: {latestSession ? latestSession.dayName : 'sem sessão finalizada'}.
          </p>
        </div>
        <label className="w-full rounded-[20px] border-2 border-brand-light/10 bg-brand-dark p-3 md:w-40">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-brand-muted">Peso kg</span>
          <input
            type="number"
            min={35}
            max={180}
            value={bodyWeightKg}
            onChange={event => setBodyWeightKg(Math.min(180, Math.max(35, Number(event.target.value) || 75)))}
            className="mt-2 w-full bg-transparent font-display text-3xl font-black text-brand-light outline-none"
          />
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-brand-neon" />
                <h3 className="font-display text-2xl uppercase text-brand-light">Pre-treino dinâmico</h3>
              </div>
              <span className="rounded-full border border-brand-neon/40 px-3 py-1 font-mono text-xs uppercase text-brand-neon">
                Fadiga {recommendation.level}
              </span>
            </div>

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-widest text-brand-muted">Fadiga reportada</span>
              <input
                type="range"
                min={1}
                max={5}
                value={fatigue}
                onChange={event => setFatigue(Number(event.target.value))}
                className="mt-3 w-full"
              />
              <span className="mt-1 block font-display text-4xl text-brand-light">{fatigue}/5</span>
            </label>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="border border-brand-light/10 bg-white/5 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">{recommendation.title}</p>
                <p className="mt-2 text-sm leading-6 text-brand-light/85">{recommendation.preWorkout}</p>
              </div>
              <div className="border border-brand-light/10 bg-white/5 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">Ajuste de treino</p>
                <p className="mt-2 text-sm leading-6 text-brand-light/85">{recommendation.trainingAdjustment}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {recommendation.mealIdeas.map(idea => (
                <span key={idea} className="border border-brand-light/10 bg-brand-gray px-3 py-2 font-mono text-xs text-brand-light/80">
                  {idea}
                </span>
              ))}
            </div>

            {phaseConfig && todayPhase && (
              <div className="mt-4 border border-brand-light/10 bg-white/5 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">Ciclo atual</p>
                <p className="mt-1 font-bold text-brand-light" style={{ color: phaseConfig.color }}>
                  {phaseConfig.label} · dia {todayPhase.dayOfCycle} · energia {todayPhase.energyExpected}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5">
            <div className="mb-4 flex items-center gap-3">
              <Utensils className="h-5 w-5 text-brand-neon" />
              <h3 className="font-display text-2xl uppercase text-brand-light">Receitas e mercado</h3>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-2 text-center">
              {[
                ['Kcal', macros.calories],
                ['Proteína', `${macros.protein}g`],
                ['Carbo', `${macros.carbs}g`],
                ['Gordura', `${macros.fat}g`],
              ].map(([label, value]) => (
                <div key={label} className="border border-brand-light/10 bg-white/5 p-3">
                  <p className="font-mono text-[10px] uppercase text-brand-muted">{label}</p>
                  <p className="font-display text-2xl text-brand-light">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {recipes.recipes.map(recipe => (
                <div key={recipe.id} className="border border-brand-light/10 bg-brand-gray p-4">
                  <p className="font-bold text-brand-light">{recipe.title}</p>
                  <p className="mt-2 font-mono text-xs text-brand-muted">
                    {recipe.calories} kcal · P {recipe.proteinG}g · C {recipe.carbsG}g · G {recipe.fatG}g
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {recipes.shoppingList.slice(0, 8).map(item => (
                <div key={`${item.name}-${item.unit}`} className="flex items-center justify-between border border-brand-light/10 bg-white/5 px-3 py-2">
                  <span className="text-sm text-brand-light/85">{item.name}</span>
                  <span className="font-mono text-xs text-brand-neon">{Math.round(item.amount)}{item.unit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-brand-neon" />
                <h3 className="font-display text-2xl uppercase text-brand-light">Scan de refeição</h3>
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={event => event.target.files?.[0] && handlePhotoAnalysis(event.target.files[0])}
              />
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                disabled={photoLoading}
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-neon bg-brand-neon px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-dark disabled:opacity-60"
              >
                {photoLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Analisar
              </button>
            </div>

            {scanInsight && (
              <div className="mb-3 border border-brand-neon/30 bg-brand-neon/10 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-brand-neon">Veredito {scanInsight.verdict}</p>
                <p className="mt-2 text-sm text-brand-light/85">{scanInsight.message} {scanInsight.nextAction}</p>
              </div>
            )}
            {scanText && <p className="whitespace-pre-wrap font-mono text-sm leading-6 text-brand-light/75">{scanText}</p>}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Droplets className="h-5 w-5 text-brand-neon" />
                <h3 className="font-display text-2xl uppercase text-brand-light">Atalho de água</h3>
              </div>
              <button
                type="button"
                onClick={handleHydrationNotification}
                className="inline-flex items-center gap-2 rounded-full border border-brand-light/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-brand-light"
              >
                <Bell className="h-3 w-3" />
                Lembrete
              </button>
            </div>
            <p className="text-sm leading-6 text-brand-light/75">{recommendation.hydration}</p>
            {hydrationNotice && <p className="mt-3 font-mono text-xs text-brand-neon">{hydrationNotice}</p>}
          </div>

          <HydrationTracker weightKg={bodyWeightKg} workoutMinutes={profile.timePerWorkout} />
          <HormonalCycleTracker />
        </aside>
      </div>
    </section>
  );
}
