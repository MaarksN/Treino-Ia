import React, { useRef, useState } from 'react';
import { Apple, BarChart3, Camera, Dumbbell, Heart, Plus, Star, Target } from 'lucide-react';
import { FavoriteFood, MacroTargets, MealEntry, SupplementEntry, UserProfile } from '../types';
import {
  analyzePhotoMacros,
  generateBasicNutritionPlan,
  generateMacroTargets,
  generatePostWorkoutSuggestion,
  generatePreWorkoutSuggestion,
  generateWeeklyNutritionAnalysis,
} from '../services/nutritionService';
import { MealLogger } from './MealLogger';

const MEAL_TYPES: MealEntry['mealType'][] = ['Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Pré-treino', 'Pós-treino'];
const MEAL_KEY = '@TreinoApp:meals';
const MACRO_KEY = '@TreinoApp:macros';
const SUPP_KEY = '@TreinoApp:supplements';
const FAVFOOD_KEY = '@TreinoApp:favFoods';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

type NutriTab = 'macros' | 'refeicoes' | 'foto' | 'favoritos' | 'suplementos' | 'analise';

interface Props {
  profile: UserProfile;
}

export function NutritionPanel({ profile }: Props) {
  const [tab, setTab] = useState<NutriTab>('macros');
  const [meals, setMeals] = useState<MealEntry[]>(() => loadJSON<MealEntry[]>(MEAL_KEY, []));
  const [macros, setMacros] = useState<MacroTargets | null>(() => loadJSON<MacroTargets | null>(MACRO_KEY, null));
  const [supplements, setSupplements] = useState<SupplementEntry[]>(() => loadJSON<SupplementEntry[]>(SUPP_KEY, []));
  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>(() => loadJSON<FavoriteFood[]>(FAVFOOD_KEY, []));
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);
  const [newMeal, setNewMeal] = useState<Partial<MealEntry>>({ mealType: 'Almoço' });
  const [newSupp, setNewSupp] = useState<Partial<SupplementEntry>>({});
  const [newFood, setNewFood] = useState<Partial<FavoriteFood>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  const persistMeals = (next: MealEntry[]) => {
    setMeals(next);
    saveJSON(MEAL_KEY, next);
  };

  const addMeal = (analyzed?: Partial<MealEntry>) => {
    const description = analyzed?.description || newMeal.description || '';
    if (!description.trim()) return;

    const meal: MealEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      mealType: newMeal.mealType || 'Almoço',
      description,
      estimatedCalories: analyzed?.estimatedCalories,
      estimatedProtein: analyzed?.estimatedProtein,
      estimatedCarbs: analyzed?.estimatedCarbs,
      estimatedFat: analyzed?.estimatedFat,
      photoBase64: analyzed?.photoBase64,
      aiAnalysis: analyzed?.aiAnalysis,
    };
    persistMeals([...meals, meal]);
    setNewMeal({ mealType: 'Almoço' });
  };

  const addFavoriteMeal = (food: FavoriteFood) => {
    const meal: MealEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      mealType: 'Lanche',
      description: food.name,
      estimatedCalories: food.calories,
      estimatedProtein: food.protein,
      estimatedCarbs: food.carbs,
      estimatedFat: food.fat,
    };
    persistMeals([...meals, meal]);
  };

  const addFavoriteFood = () => {
    if (!newFood.name) return;

    const food: FavoriteFood = {
      id: crypto.randomUUID(),
      name: newFood.name,
      calories: Number(newFood.calories || 0),
      protein: Number(newFood.protein || 0),
      carbs: Number(newFood.carbs || 0),
      fat: Number(newFood.fat || 0),
    };
    const updated = [...favoriteFoods, food];
    setFavoriteFoods(updated);
    saveJSON(FAVFOOD_KEY, updated);
    setNewFood({});
  };

  const addSupplement = () => {
    if (!newSupp.name) return;

    const supplement: SupplementEntry = {
      id: crypto.randomUUID(),
      name: newSupp.name,
      dose: newSupp.dose || '',
      timing: newSupp.timing || '',
    };
    const updated = [...supplements, supplement];
    setSupplements(updated);
    saveJSON(SUPP_KEY, updated);
    setNewSupp({});
  };

  const handleGenerateMacros = async () => {
    setLoading(true);
    try {
      const generated = await generateMacroTargets(profile);
      setMacros(generated);
      saveJSON(MACRO_KEY, generated);
    } catch {
      setAiText('Não consegui calcular os macros agora. Verifique a chave Gemini e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNutritionPlan = async () => {
    setLoading(true);
    try {
      setAiText(await generateBasicNutritionPlan(profile));
    } catch {
      setAiText('Não consegui gerar o plano nutricional agora.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoAnalysis = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setLoading(true);
      try {
        const analyzed = await analyzePhotoMacros(base64, file.type);
        setAiText(analyzed.aiAnalysis || '');
        addMeal({ ...analyzed, photoBase64: base64 });
      } catch {
        setAiText('Não consegui analisar a foto agora.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

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

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-brand-neon" />
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Nutrição</h3>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setAiText('');
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
          <button onClick={handleGenerateMacros} type="button" className="w-full bg-brand-neon text-brand-dark font-black py-3 border-brutal uppercase tracking-widest">
            {loading ? 'Calculando...' : 'Calcular metas de macros'}
          </button>

          {macros && (
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
          )}

          {todayCalories > 0 && (
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

          <button onClick={handleNutritionPlan} type="button" className="w-full bg-brand-dark border-2 border-brand-light/10 text-brand-light font-semibold py-3 hover:border-brand-neon transition-colors">
            {loading ? 'Gerando...' : 'Gerar plano nutricional básico'}
          </button>
          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap font-mono">{aiText}</div>}
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
            <button onClick={() => addMeal()} type="button" className="inline-flex items-center gap-2 bg-brand-neon text-brand-dark font-bold px-5 py-2 border-brutal text-sm uppercase">
              <Plus className="w-4 h-4" /> Registrar
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <button onClick={async () => { setLoading(true); setAiText(await generatePreWorkoutSuggestion(profile, profile.preferredTime || '18h')); setLoading(false); }} type="button" className="bg-brand-dark border-2 border-brand-light/10 text-brand-light py-2 text-sm hover:border-brand-neon transition-colors">
              Sugestão pré-treino
            </button>
            <button onClick={async () => { setLoading(true); setAiText(await generatePostWorkoutSuggestion(profile)); setLoading(false); }} type="button" className="bg-brand-dark border-2 border-brand-light/10 text-brand-light py-2 text-sm hover:border-brand-neon transition-colors">
              Sugestão pós-treino
            </button>
          </div>

          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap bg-brand-dark p-3 border-2 border-brand-light/10 font-mono">{loading ? 'Gerando...' : aiText}</div>}
          <MealLogger meals={meals} />
        </div>
      )}

      {tab === 'foto' && (
        <div className="space-y-4">
          <p className="text-brand-muted text-sm">Use uma foto do prato para estimar macros automaticamente.</p>
          <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={event => event.target.files?.[0] && handlePhotoAnalysis(event.target.files[0])} className="hidden" />
          <button onClick={() => photoRef.current?.click()} type="button" className="w-full inline-flex items-center justify-center gap-2 bg-brand-neon text-brand-dark font-black py-4 border-brutal uppercase tracking-widest">
            <Camera className="w-5 h-5" /> Fotografar prato
          </button>
          {loading && <p className="text-brand-muted text-sm">Analisando foto...</p>}
          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap bg-brand-dark p-3 border-2 border-brand-light/10 font-mono">{aiText}</div>}
        </div>
      )}

      {tab === 'favoritos' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-5 gap-2 p-4 bg-brand-dark border-2 border-brand-light/10">
            <input placeholder="Alimento" value={newFood.name || ''} onChange={event => setNewFood(current => ({ ...current, name: event.target.value }))} className="md:col-span-2 bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            {(['calories', 'protein', 'carbs', 'fat'] as const).map(field => (
              <input key={field} type="number" placeholder={field} value={newFood[field] || ''} onChange={event => setNewFood(current => ({ ...current, [field]: Number(event.target.value) }))} className="bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            ))}
            <button onClick={addFavoriteFood} type="button" className="md:col-span-5 bg-brand-neon text-brand-dark font-bold px-5 py-2 border-brutal text-sm uppercase">Salvar favorito</button>
          </div>
          <div className="space-y-2">
            {favoriteFoods.map(food => (
              <div key={food.id} className="flex items-center justify-between gap-3 p-3 bg-brand-dark border-2 border-brand-light/10">
                <div>
                  <p className="text-brand-light font-semibold text-sm">{food.name}</p>
                  <p className="text-brand-muted text-xs">{food.calories} kcal | P {food.protein}g | C {food.carbs}g | G {food.fat}g</p>
                </div>
                <button onClick={() => addFavoriteMeal(food)} type="button" className="px-3 py-2 bg-brand-neon text-brand-dark text-xs font-black uppercase">Usar</button>
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
            <button onClick={addSupplement} type="button" className="bg-brand-neon text-brand-dark font-bold px-5 py-2 border-brutal text-sm uppercase">Adicionar</button>
          </div>
          <div className="space-y-2">
            {supplements.map(supplement => (
              <div key={supplement.id} className="p-3 bg-brand-dark border-2 border-brand-light/10">
                <p className="text-brand-light font-semibold text-sm">{supplement.name}</p>
                <p className="text-brand-muted text-xs">{supplement.dose} | {supplement.timing}</p>
              </div>
            ))}
            {supplements.length === 0 && <p className="text-brand-muted text-sm">Nenhum suplemento registrado.</p>}
          </div>
        </div>
      )}

      {tab === 'analise' && (
        <div className="space-y-4">
          <button
            onClick={async () => {
              if (!macros) return;
              setLoading(true);
              try {
                setAiText(await generateWeeklyNutritionAnalysis(meals, macros));
              } finally {
                setLoading(false);
              }
            }}
            type="button"
            className="w-full bg-brand-neon text-brand-dark font-black py-3 border-brutal uppercase tracking-widest disabled:opacity-60"
            disabled={!macros || loading}
          >
            {loading ? 'Analisando...' : 'Análise semanal de nutrição'}
          </button>
          {!macros && <p className="text-orange-400 text-sm">Calcule suas metas de macros primeiro.</p>}
          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap font-mono">{aiText}</div>}
        </div>
      )}
    </div>
  );
}
