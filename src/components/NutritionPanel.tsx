import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Apple, BarChart3, Camera, Dumbbell, Heart, Plus, Star, Target } from 'lucide-react';
import { FavoriteFood, MacroTargets, MealEntry, SupplementEntry, UserProfile } from '../types';
import { DataMode, PersistResult } from '../types/trainingExecution';
import {
  analyzePhotoMacros,
  generateBasicNutritionPlan,
  generateMacroTargets,
  generatePostWorkoutSuggestion,
  generatePreWorkoutSuggestion,
} from '../services/nutritionService';
import {
  addNutritionFavoriteFood,
  addNutritionMeal,
  addNutritionSupplement,
  buildWeeklyNutritionAdherence,
  loadNutritionTrackingState,
  modeLabel,
  saveNutritionMacros,
} from '../services/nutritionTrackingService';
import { MealLogger } from './MealLogger';
import { calculateMacroPlan } from '../utils/macros';
import { nutritionProfileFromUser } from '../utils/tdee';

const MEAL_TYPES: MealEntry['mealType'][] = ['Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Pré-treino', 'Pós-treino'];

type NutriTab = 'macros' | 'refeicoes' | 'foto' | 'favoritos' | 'suplementos' | 'analise';

interface Props {
  profile: UserProfile;
}

function deterministicMacros(profile: UserProfile): MacroTargets {
  const plan = calculateMacroPlan(nutritionProfileFromUser(profile));
  return {
    calories: plan.calories,
    protein: plan.proteinG,
    carbs: plan.carbsG,
    fat: plan.fatG,
  };
}

function buildPreWorkoutFallback(profile: UserProfile, workoutTime: string) {
  const hour = Number(workoutTime.split(':')[0] || 18);
  const timing = hour <= 9 ? '30-60 min antes' : '60-90 min antes';
  const carb = profile.goal.toLowerCase().includes('emag') ? 'banana pequena ou fruta + café' : 'banana com aveia ou pão com mel';
  return `Pré-treino sugerido para ${workoutTime}: ${carb}, ${timing}. Inclua 20-30g de proteína leve se a última refeição passou de 3h.`;
}

function buildPostWorkoutFallback(profile: UserProfile) {
  const goal = profile.goal.toLowerCase();
  if (goal.includes('emag')) {
    return 'Pós-treino: 30-40g de proteína, carbo moderado e vegetais. Mantenha o déficit sem zerar carbo após treinos pesados.';
  }
  if (goal.includes('força')) {
    return 'Pós-treino: proteína completa + carbo alto/moderado para recuperar glicogênio e sustentar cargas na próxima sessão.';
  }
  return 'Pós-treino: 30-45g de proteína e carbo suficiente para bater calorias do dia. Priorize refeição completa nas próximas 2h.';
}

export function NutritionPanel({ profile }: Props) {
  const [tab, setTab] = useState<NutriTab>('macros');
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [macros, setMacros] = useState<MacroTargets | null>(null);
  const [supplements, setSupplements] = useState<SupplementEntry[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>([]);
  const [dataMode, setDataMode] = useState<DataMode>('mock_dev_only');
  const [modeWarning, setModeWarning] = useState('');
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newMeal, setNewMeal] = useState<Partial<MealEntry>>({ mealType: 'Almoço' });
  const [newSupp, setNewSupp] = useState<Partial<SupplementEntry>>({ taken: true });
  const [newFood, setNewFood] = useState<Partial<FavoriteFood>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadNutritionTrackingState()
      .then(state => {
        if (!mounted) return;
        setMeals(state.meals);
        setMacros(state.macros);
        setSupplements(state.supplements);
        setFavoriteFoods(state.favoriteFoods);
        setDataMode(state.dataMode);
        setModeWarning(state.warning || '');
        setError('');
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Falha ao carregar nutrição.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const weeklyAdherence = useMemo(() => buildWeeklyNutritionAdherence(meals, macros), [meals, macros]);
  const today = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter(meal => meal.date === today);
  const todayCalories = todayMeals.reduce((sum, meal) => sum + (meal.estimatedCalories || 0), 0);
  const todayProtein = todayMeals.reduce((sum, meal) => sum + (meal.estimatedProtein || 0), 0);

  const tabs: Array<{ id: NutriTab; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'macros', label: 'Macros', Icon: Target },
    { id: 'refeicoes', label: 'Refeições', Icon: Apple },
    { id: 'foto', label: 'Foto', Icon: Camera },
    { id: 'favoritos', label: 'Favoritos', Icon: Star },
    { id: 'suplementos', label: 'Suplementos', Icon: Dumbbell },
    { id: 'analise', label: 'Análise', Icon: BarChart3 },
  ];

  const applyPersistResult = (result: PersistResult) => {
    setDataMode(result.dataMode);
    setModeWarning(result.warning || '');
  };

  const runAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setActionLoading(false);
    }
  };

  const persistMeal = async (input: Partial<MealEntry>) => {
    const result = await addNutritionMeal(input);
    applyPersistResult(result);
    setMeals(current => [result.meal, ...current]);
    setSuccess('Refeição registrada.');
  };

  const addManualMeal = () => runAction(async () => {
    await persistMeal(newMeal);
    setNewMeal({ mealType: 'Almoço' });
  });

  const addFavoriteMeal = (food: FavoriteFood) => runAction(async () => {
    await persistMeal({
      mealType: 'Lanche',
      description: food.name,
      estimatedCalories: food.calories,
      estimatedProtein: food.protein,
      estimatedCarbs: food.carbs,
      estimatedFat: food.fat,
    });
  });

  const addFavoriteFood = () => runAction(async () => {
    const result = await addNutritionFavoriteFood(newFood);
    applyPersistResult(result);
    setFavoriteFoods(current => [result.food, ...current]);
    setNewFood({});
    setSuccess('Alimento favorito salvo.');
  });

  const addSupplement = () => runAction(async () => {
    const result = await addNutritionSupplement(newSupp);
    applyPersistResult(result);
    setSupplements(current => [result.supplement, ...current]);
    setNewSupp({ taken: true });
    setSuccess('Suplemento registrado.');
  });

  const handleGenerateMacros = () => runAction(async () => {
    let generated: MacroTargets;
    try {
      generated = await generateMacroTargets(profile);
      setAiText('Metas calculadas via IA segura pelo backend.');
    } catch {
      generated = deterministicMacros(profile);
      setAiText('Metas calculadas por fórmula determinística de TDEE porque a IA não está disponível nesta sessão.');
    }

    const result = await saveNutritionMacros(generated);
    applyPersistResult(result);
    setMacros(result.macros);
    setSuccess('Metas de macros salvas.');
  });

  const handleNutritionPlan = () => runAction(async () => {
    try {
      setAiText(await generateBasicNutritionPlan(profile));
    } catch {
      const fallback = deterministicMacros(profile);
      setAiText(`Plano base: distribua ${fallback.calories} kcal em 4-6 refeições, com ${fallback.protein}g de proteína ao dia. Use alimentos simples, ajuste carboidratos nos dias de treino e mantenha hidratação.`);
    }
  });

  const handlePreWorkoutSuggestion = () => runAction(async () => {
    const workoutTime = profile.preferredTime || '18:00';
    try {
      setAiText(await generatePreWorkoutSuggestion(profile, workoutTime));
    } catch {
      setAiText(buildPreWorkoutFallback(profile, workoutTime));
    }
  });

  const handlePostWorkoutSuggestion = () => runAction(async () => {
    try {
      setAiText(await generatePostWorkoutSuggestion(profile));
    } catch {
      setAiText(buildPostWorkoutFallback(profile));
    }
  });

  const handlePhotoAnalysis = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      void runAction(async () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const analyzed = await analyzePhotoMacros(base64, file.type);
        setAiText(analyzed.aiAnalysis || '');
        await persistMeal({ ...analyzed, photoBase64: base64 });
      });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
        <p className="font-mono text-sm text-brand-muted uppercase tracking-widest">Carregando nutrição...</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-brand-neon" />
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Nutrição</h3>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-1 ${dataMode === 'supabase' ? 'border-brand-neon text-brand-neon' : 'border-orange-400 text-orange-300'}`}>
          dataMode: {modeLabel(dataMode)}
        </span>
      </div>

      {modeWarning && (
        <p className="mb-3 text-xs text-orange-300 bg-orange-500/10 border border-orange-500/30 p-2 font-mono">
          {modeWarning}
        </p>
      )}

      {error && <p className="mb-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3">{error}</p>}
      {success && <p className="mb-3 text-sm text-brand-neon bg-brand-neon/10 border border-brand-neon/30 p-3">{success}</p>}

      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setAiText('');
              setError('');
              setSuccess('');
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold border-2 uppercase tracking-widest transition-colors ${
              tab === id
                ? 'bg-brand-neon text-brand-dark border-brand-neon'
                : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'macros' && (
        <div className="space-y-4">
          <button onClick={handleGenerateMacros} disabled={actionLoading} type="button" className="w-full bg-brand-neon text-brand-dark font-black py-3 border-brutal uppercase tracking-widest disabled:opacity-60">
            {actionLoading ? 'Calculando...' : 'Calcular e salvar metas de macros'}
          </button>

          {macros ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Calorias', value: `${macros.calories} kcal`, color: 'text-orange-400' },
                { label: 'Proteína', value: `${macros.protein}g`, color: 'text-brand-neon' },
                { label: 'Carboidrato', value: `${macros.carbs}g`, color: 'text-blue-400' },
                { label: 'Gordura', value: `${macros.fat}g`, color: 'text-yellow-400' },
              ].map(item => (
                <div key={item.label} className="bg-brand-dark border-2 border-brand-light/10 p-3 text-center">
                  <p className="text-xs text-brand-muted">{item.label}</p>
                  <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-muted text-sm bg-brand-dark border-2 border-brand-light/10 p-3">Nenhuma meta salva ainda.</p>
          )}

          {todayMeals.length > 0 && (
            <div className="bg-brand-dark border-2 border-brand-light/10 p-3">
              <p className="text-xs text-brand-muted mb-1">Consumido hoje</p>
              <p className="text-brand-light font-bold">{todayCalories} kcal | {todayProtein}g proteína</p>
              {macros && (
                <div className="mt-2 h-2 bg-white/10 overflow-hidden">
                  <div className="h-full bg-brand-neon transition-all" style={{ width: `${Math.min((todayCalories / macros.calories) * 100, 100)}%` }} />
                </div>
              )}
            </div>
          )}

          <button onClick={handleNutritionPlan} disabled={actionLoading} type="button" className="w-full bg-brand-dark border-2 border-brand-light/10 text-brand-light font-semibold py-3 hover:border-brand-neon transition-colors disabled:opacity-60">
            {actionLoading ? 'Gerando...' : 'Gerar plano nutricional básico'}
          </button>
          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap font-mono bg-brand-dark p-3 border-2 border-brand-light/10">{aiText}</div>}
        </div>
      )}

      {tab === 'refeicoes' && (
        <div className="space-y-4">
          <div className="space-y-2 p-4 bg-brand-dark border-2 border-brand-light/10">
            <select value={newMeal.mealType} onChange={event => setNewMeal(current => ({ ...current, mealType: event.target.value as MealEntry['mealType'] }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon">
              {MEAL_TYPES.map(type => <option key={type}>{type}</option>)}
            </select>
            <input
              placeholder="Descrição rápida da refeição"
              value={newMeal.description || ''}
              onChange={event => setNewMeal(current => ({ ...current, description: event.target.value }))}
              className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                ['estimatedCalories', 'kcal'],
                ['estimatedProtein', 'proteína g'],
                ['estimatedCarbs', 'carbo g'],
                ['estimatedFat', 'gordura g'],
              ].map(([field, label]) => (
                <input
                  key={field}
                  type="number"
                  min="0"
                  placeholder={label}
                  value={(newMeal[field as keyof MealEntry] as number) || ''}
                  onChange={event => setNewMeal(current => ({ ...current, [field]: Number(event.target.value) }))}
                  className="bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
                />
              ))}
            </div>
            <button onClick={addManualMeal} disabled={actionLoading} type="button" className="inline-flex items-center gap-2 bg-brand-neon text-brand-dark font-bold px-5 py-2 border-brutal text-sm uppercase disabled:opacity-60">
              <Plus className="w-4 h-4" /> Registrar
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <button onClick={handlePreWorkoutSuggestion} disabled={actionLoading} type="button" className="bg-brand-dark border-2 border-brand-light/10 text-brand-light py-2 text-sm hover:border-brand-neon transition-colors disabled:opacity-60">
              Sugestão pré-treino
            </button>
            <button onClick={handlePostWorkoutSuggestion} disabled={actionLoading} type="button" className="bg-brand-dark border-2 border-brand-light/10 text-brand-light py-2 text-sm hover:border-brand-neon transition-colors disabled:opacity-60">
              Sugestão pós-treino
            </button>
          </div>

          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap bg-brand-dark p-3 border-2 border-brand-light/10 font-mono">{aiText}</div>}
          <MealLogger meals={meals} />
        </div>
      )}

      {tab === 'foto' && (
        <div className="space-y-4">
          <p className="text-brand-muted text-sm">Use uma foto do prato para estimar macros automaticamente via proxy de IA.</p>
          <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={event => event.target.files?.[0] && handlePhotoAnalysis(event.target.files[0])} className="hidden" />
          <button onClick={() => photoRef.current?.click()} disabled={actionLoading} type="button" className="w-full inline-flex items-center justify-center gap-2 bg-brand-neon text-brand-dark font-black py-4 border-brutal uppercase tracking-widest disabled:opacity-60">
            <Camera className="w-5 h-5" /> Fotografar prato
          </button>
          {actionLoading && <p className="text-brand-muted text-sm">Analisando foto...</p>}
          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap bg-brand-dark p-3 border-2 border-brand-light/10 font-mono">{aiText}</div>}
        </div>
      )}

      {tab === 'favoritos' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-5 gap-2 p-4 bg-brand-dark border-2 border-brand-light/10">
            <input placeholder="Alimento" value={newFood.name || ''} onChange={event => setNewFood(current => ({ ...current, name: event.target.value }))} className="md:col-span-2 bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            {(['calories', 'protein', 'carbs', 'fat'] as const).map(field => (
              <input key={field} type="number" min="0" placeholder={field} value={newFood[field] || ''} onChange={event => setNewFood(current => ({ ...current, [field]: Number(event.target.value) }))} className="bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            ))}
            <button onClick={addFavoriteFood} disabled={actionLoading} type="button" className="md:col-span-5 bg-brand-neon text-brand-dark font-bold px-5 py-2 border-brutal text-sm uppercase disabled:opacity-60">Salvar favorito</button>
          </div>
          <div className="space-y-2">
            {favoriteFoods.map(food => (
              <div key={food.id} className="flex items-center justify-between gap-3 p-3 bg-brand-dark border-2 border-brand-light/10">
                <div>
                  <p className="text-brand-light font-semibold text-sm">{food.name}</p>
                  <p className="text-brand-muted text-xs">{food.calories} kcal | P {food.protein}g | C {food.carbs}g | G {food.fat}g</p>
                </div>
                <button onClick={() => addFavoriteMeal(food)} disabled={actionLoading} type="button" className="px-3 py-2 bg-brand-neon text-brand-dark text-xs font-black uppercase disabled:opacity-60">Usar</button>
              </div>
            ))}
            {favoriteFoods.length === 0 && <p className="text-brand-muted text-sm">Nenhum alimento favorito registrado.</p>}
          </div>
        </div>
      )}

      {tab === 'suplementos' && (
        <div className="space-y-4">
          <div className="space-y-2 p-4 bg-brand-dark border-2 border-brand-light/10">
            <input placeholder="Nome do suplemento" value={newSupp.name || ''} onChange={event => setNewSupp(current => ({ ...current, name: event.target.value }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <input placeholder="Dose" value={newSupp.dose || ''} onChange={event => setNewSupp(current => ({ ...current, dose: event.target.value }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <input placeholder="Horário" value={newSupp.timing || ''} onChange={event => setNewSupp(current => ({ ...current, timing: event.target.value }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <textarea placeholder="Observações" value={newSupp.notes || ''} onChange={event => setNewSupp(current => ({ ...current, notes: event.target.value }))} className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon resize-none" rows={2} />
            <button onClick={addSupplement} disabled={actionLoading} type="button" className="bg-brand-neon text-brand-dark font-bold px-5 py-2 border-brutal text-sm uppercase disabled:opacity-60">Adicionar</button>
          </div>
          <div className="space-y-2">
            {supplements.map(supplement => (
              <div key={supplement.id} className="p-3 bg-brand-dark border-2 border-brand-light/10">
                <p className="text-brand-light font-semibold text-sm">{supplement.name}</p>
                <p className="text-brand-muted text-xs">{supplement.dose || 'Dose não informada'} | {supplement.timing || 'Horário livre'} | {supplement.date}</p>
                {supplement.notes && <p className="text-brand-light/70 text-xs mt-1">{supplement.notes}</p>}
              </div>
            ))}
            {supplements.length === 0 && <p className="text-brand-muted text-sm">Nenhum suplemento registrado.</p>}
          </div>
        </div>
      )}

      {tab === 'analise' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-dark border-2 border-brand-light/10 p-4">
              <p className="text-2xl font-black text-brand-neon">{weeklyAdherence.averageAdherence}%</p>
              <p className="text-xs text-brand-muted">Aderência nutricional semanal</p>
            </div>
            <div className="bg-brand-dark border-2 border-brand-light/10 p-4">
              <p className="text-2xl font-black text-blue-400">{weeklyAdherence.days.filter(day => day.calories > 0).length}/7</p>
              <p className="text-xs text-brand-muted">Dias com refeições</p>
            </div>
          </div>

          <div className="space-y-2">
            {weeklyAdherence.days.map(day => (
              <div key={day.date} className="bg-brand-dark border border-brand-light/10 p-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-brand-light">{day.date}</span>
                  <span className="text-brand-neon font-bold">{day.adherence}%</span>
                </div>
                <div className="h-2 bg-white/10">
                  <div className="h-full bg-brand-neon" style={{ width: `${day.adherence}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-brand-light/80 font-mono bg-brand-dark p-3 border-2 border-brand-light/10">{weeklyAdherence.summary}</p>
          {!macros && <p className="text-orange-400 text-sm">Calcule suas metas de macros para ativar a análise de aderência completa.</p>}
        </div>
      )}
    </div>
  );
}
