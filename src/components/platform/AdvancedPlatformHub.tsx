import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  CreditCard,
  Database,
  Download,
  Dumbbell,
  Eye,
  Flag,
  Gauge,
  Gift,
  Globe2,
  HeartPulse,
  Lock,
  Moon,
  QrCode,
  Rocket,
  ShieldCheck,
  Smartphone,
  Timer,
  ToggleLeft,
  UploadCloud,
  Utensils,
  Watch,
  Zap,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BILLING_PLANS } from '../../config/plans';
import { FeatureFlagKey, loadFeatureFlags, setFeatureFlag } from '../../config/featureFlags';
import { getPublicEnvStatus } from '../../config/env';
import { PLATFORM_BLOCKS, getCoverageSummary } from '../../data/platformBlocks';
import { FITNESS_GLOSSARY } from '../../data/fitnessGlossary';
import { SCIENTIFIC_REFERENCES } from '../../data/scientificReferences';
import { MacroPlan, NutritionProfile } from '../../types/nutrition';
import { PlatformBlockDefinition, PlatformBlockId } from '../../types/platformBlocks';
import { UserProfile, WorkoutPlan } from '../../types';
import { validateCoupon, applyDiscount } from '../../utils/coupons';
import { getEntitlementsForTier } from '../../utils/entitlements';
import { nutritionProfileFromUser } from '../../utils/tdee';
import { calculateMacroPlan } from '../../utils/macros';
import { scoreNutritionDay } from '../../utils/nutritionScore';
import { calculateRecoveryScore } from '../../utils/recoveryScore';
import { detectOvertrainingRisk } from '../../utils/overtraining';
import { estimateOneRepMax, calculateBmi } from '../../utils/calculators';
import { getCsrfToken } from '../../utils/csrf';
import { checkRateLimit } from '../../utils/rateLimit';
import { sanitizeText } from '../../utils/inputSanitizer';
import { detectPlateau, forecastPr } from '../../utils/predictiveTraining';
import { COACH_PERSONAS } from '../../utils/coachPersonas';
import { applyFontScale, applyHighContrast, FontScale } from '../../utils/accessibility';
import { ADAPTIVE_EXERCISES } from '../../utils/adaptiveExercises';
import { SupportedLocale, t } from '../../utils/i18n';
import { searchFoods, sumFoods } from '../../services/foodDatabase';
import { buildFallbackMealPlan, getWorkoutNutritionTiming } from '../../services/nutritionAiService';
import { buildMobilityProtocol } from '../../services/recoveryAiService';
import { INTEGRATION_CONNECTIONS, buildPlanQrPayload, getHeartRateZoneRows } from '../../services/integrationsService';
import { recordWebhookDelivery, loadWebhookDeliveries } from '../../services/webhookService';
import { logAuditEvent, loadAuditEvents } from '../../services/auditLogService';
import { deleteLocalAccountData, exportPrivacyData, loadCookieConsent, saveCookieConsent } from '../../services/privacyService';
import { getActiveSessions } from '../../services/sessionService';
import { buildCooldownProtocol, buildExerciseTip, buildWarmupProtocol } from '../../services/educationAiService';
import { addAiMemoryCloud, loadAiMemory, loadAiMemoryCloud } from '../../services/aiMemoryService';
import { buildQuarterlyAiReport } from '../../services/aiReportService';

interface Props {
  userName?: string;
  profile?: UserProfile | null;
  currentPlan?: WorkoutPlan | null;
}

const DEFAULT_NUTRITION_PROFILE: NutritionProfile = {
  age: 32,
  gender: 'masculino',
  weightKg: 82,
  heightCm: 178,
  workoutsPerWeek: 4,
  goal: 'bulking',
};

const EDUCATION_EXERCISES = [
  {
    id: 'supino',
    name: 'Supino reto',
    muscle: 'Peito',
    equipment: 'Barra',
    difficulty: 'intermediario',
    mistakes: ['Cotovelos muito abertos', 'Perder retracao escapular'],
    substitutes: ['Flexao de bracos', 'Supino com halteres'],
  },
  {
    id: 'agachamento',
    name: 'Agachamento livre',
    muscle: 'Quadriceps',
    equipment: 'Barra',
    difficulty: 'avancado',
    mistakes: ['Colapso do joelho', 'Perder brace abdominal'],
    substitutes: ['Goblet squat', 'Leg press'],
  },
  {
    id: 'remada',
    name: 'Remada curvada',
    muscle: 'Costas',
    equipment: 'Barra',
    difficulty: 'intermediario',
    mistakes: ['Puxar com biceps', 'Arredondar lombar'],
    substitutes: ['Remada unilateral', 'Remada baixa'],
  },
  {
    id: 'terra',
    name: 'Levantamento terra romeno',
    muscle: 'Posteriores',
    equipment: 'Halteres',
    difficulty: 'intermediario',
    mistakes: ['Flexionar demais o joelho', 'Perder coluna neutra'],
    substitutes: ['Mesa flexora', 'Hip hinge com elastico'],
  },
];

const BLOCK_ICONS: Record<PlatformBlockId, React.ReactNode> = {
  'bloco-11': <CreditCard className="w-5 h-5" />,
  'bloco-12': <Smartphone className="w-5 h-5" />,
  'bloco-13': <Utensils className="w-5 h-5" />,
  'bloco-14': <Moon className="w-5 h-5" />,
  'bloco-15': <Watch className="w-5 h-5" />,
  'bloco-16': <Eye className="w-5 h-5" />,
  'bloco-17': <Lock className="w-5 h-5" />,
  'bloco-18': <BookOpen className="w-5 h-5" />,
  'bloco-19': <BrainCircuit className="w-5 h-5" />,
  'bloco-20': <Rocket className="w-5 h-5" />,
};

export function AdvancedPlatformHub({ userName = 'Atleta', profile, currentPlan }: Props) {
  const [activeId, setActiveId] = useState<PlatformBlockId>('bloco-11');
  const [flags, setFlags] = useState(loadFeatureFlags);

  const activeBlock = useMemo(
    () => PLATFORM_BLOCKS.find(block => block.id === activeId) ?? PLATFORM_BLOCKS[0],
    [activeId],
  );
  const coverage = getCoverageSummary(activeBlock);

  const toggleFlag = (key: FeatureFlagKey) => {
    setFlags(setFeatureFlag(key, !flags[key]));
  };

  return (
    <div className="max-w-7xl mx-auto pb-24" id="platform-content">
      <a
        href="#platform-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-brand-neon focus:text-brand-dark focus:px-4 focus:py-2 focus:font-black"
      >
        Ir para conteudo
      </a>

      <header className="bg-brand-gray border-4 border-brand-light shadow-[8px_8px_0px_var(--color-brand-light)] p-6 md:p-8 mb-8">
        <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-black">
          Blocos 11-20
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mt-3">
          <div>
            <h1 className="font-display text-5xl md:text-7xl uppercase text-brand-light text-shadow-neon">
              Plataforma Avancada
            </h1>
            <p className="text-brand-muted max-w-3xl mt-3">
              Monetizacao, mobile, nutricao, recovery, wearables, acessibilidade, seguranca,
              conteudo, IA avancada e DevOps integrados em uma area operacional.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <MetricPill label="Blocos" value="10" />
            <MetricPill label="Itens" value="200" />
            <MetricPill label="Flags" value={Object.values(flags).filter(Boolean).length} />
          </div>
        </div>
      </header>

      <nav className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8" aria-label="Blocos da plataforma">
        {PLATFORM_BLOCKS.map(block => (
          <button
            key={block.id}
            type="button"
            onClick={() => setActiveId(block.id)}
            className={`min-h-20 border-2 p-3 text-left transition-colors ${
              activeBlock.id === block.id
                ? 'bg-brand-neon text-brand-dark border-brand-neon shadow-brutal-neon'
                : 'bg-brand-gray text-brand-light border-white/10 hover:border-brand-neon'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              {BLOCK_ICONS[block.id]}
              <span className="font-mono text-xs font-black">B{block.number}</span>
            </span>
            <span className="block font-black uppercase text-sm mt-2">{block.shortTitle}</span>
          </button>
        ))}
      </nav>

      <section className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">
        <article className="bg-brand-gray border border-white/10 p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-brand-neon font-mono text-xs uppercase tracking-widest">
                Bloco {activeBlock.number}
              </p>
              <h2 className="text-3xl font-black text-brand-light mt-1">
                {activeBlock.title}
              </h2>
              <p className="text-brand-muted mt-2 max-w-3xl">{activeBlock.objective}</p>
            </div>
            <span
              className={`px-3 py-2 text-xs font-black border ${
                flags[activeBlock.featureFlag as FeatureFlagKey]
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-red-400/40 text-red-300'
              }`}
            >
              {flags[activeBlock.featureFlag as FeatureFlagKey] ? 'Flag ativa' : 'Flag pausada'}
            </span>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 mt-5">
            <MetricPill label="Ativos" value={coverage.active} />
            <MetricPill label="Fallback" value={coverage.fallback} />
            <MetricPill label="MVP" value={coverage.mvp} />
            <MetricPill label="Premium" value={coverage.premium} />
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {activeBlock.layers.map(layer => (
              <span key={layer} className="px-3 py-1 bg-white/5 border border-white/10 text-sm text-brand-light">
                {layer}
              </span>
            ))}
          </div>
        </article>

        <FeatureFlagPanel block={activeBlock} enabled={flags[activeBlock.featureFlag as FeatureFlagKey]} onToggle={toggleFlag} />
      </section>

      <section className="mb-8">
        <OperationalPanel
          blockId={activeBlock.id}
          profile={profile}
          currentPlan={currentPlan}
          userName={userName}
          flags={flags}
          onToggleFlag={toggleFlag}
        />
      </section>

      <FeatureCoverage block={activeBlock} />
    </div>
  );
}

function OperationalPanel({
  blockId,
  profile,
  currentPlan,
  userName,
  flags,
  onToggleFlag,
}: {
  blockId: PlatformBlockId;
  profile?: UserProfile | null;
  currentPlan?: WorkoutPlan | null;
  userName: string;
  flags: ReturnType<typeof loadFeatureFlags>;
  onToggleFlag: (key: FeatureFlagKey) => void;
}) {
  if (blockId === 'bloco-11') return <MonetizationPanel />;
  if (blockId === 'bloco-12') return <PwaMobilePanel />;
  if (blockId === 'bloco-13') return <NutritionOpsPanel profile={profile} />;
  if (blockId === 'bloco-14') return <RecoveryOpsPanel />;
  if (blockId === 'bloco-15') return <IntegrationsOpsPanel userName={userName} currentPlan={currentPlan} profile={profile} />;
  if (blockId === 'bloco-16') return <AccessibilityOpsPanel />;
  if (blockId === 'bloco-17') return <SecurityOpsPanel userName={userName} />;
  if (blockId === 'bloco-18') return <EducationOpsPanel />;
  if (blockId === 'bloco-19') return <AiPersonalizationOpsPanel />;
  return <DevOpsPanel flags={flags} onToggleFlag={onToggleFlag} />;
}

function MonetizationPanel() {
  const [tier, setTier] = useState(BILLING_PLANS[1].id);
  const [coupon, setCoupon] = useState('');
  const [couponResult, setCouponResult] = useState(validateCoupon('BRUTAL40'));
  const selectedPlan = BILLING_PLANS.find(plan => plan.id === tier) ?? BILLING_PLANS[0];
  const entitlements = getEntitlementsForTier(tier);
  const discountedAnnual = applyDiscount(selectedPlan.annualPrice, couponResult.ok ? couponResult.discountPercent : 0);

  return (
    <PanelShell title="Plano comercial" kicker="Bloco 11" icon={<CreditCard />}>
      <div className="grid lg:grid-cols-4 gap-4">
        {BILLING_PLANS.map(plan => (
          <button
            type="button"
            key={plan.id}
            onClick={() => setTier(plan.id)}
            className={`border p-4 text-left min-h-52 ${
              tier === plan.id ? 'border-brand-neon bg-brand-neon/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-brand-light">{plan.name}</h3>
              {tier === plan.id && <Check className="text-brand-neon" />}
            </div>
            <p className="text-3xl font-black mt-4 text-white">R${plan.monthlyPrice.toFixed(2)}</p>
            <p className="text-xs text-brand-muted">por mes</p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {plan.features.slice(0, 4).map(item => (
                <li key={item} className="flex gap-2">
                  <Check className="w-4 h-4 text-brand-neon shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white flex items-center gap-2">
            <Gift className="text-brand-neon" /> Cupom e bundle anual
          </h4>
          <div className="flex gap-2 mt-4">
            <input
              value={coupon}
              onChange={event => setCoupon(event.target.value)}
              placeholder="BRUTAL40"
              className="min-w-0 flex-1 bg-brand-dark border border-white/10 px-3 py-2 text-white"
            />
            <button
              type="button"
              onClick={() => setCouponResult(validateCoupon(coupon))}
              className="bg-brand-neon text-brand-dark font-black px-4"
            >
              OK
            </button>
          </div>
          <p className="text-sm text-brand-neon mt-3">{couponResult.message}</p>
          <p className="text-sm text-brand-muted mt-2">
            Anual com desconto: <span className="text-white font-black">R${discountedAnnual.toFixed(2)}</span>
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-brand-neon" /> Entitlements
          </h4>
          <div className="flex flex-wrap gap-2 mt-4">
            {entitlements.map(item => (
              <span key={item} className="bg-brand-dark border border-white/10 px-2 py-1 text-xs text-white">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white flex items-center gap-2">
            <Database className="text-brand-neon" /> Billing dashboard
          </h4>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <p>Status: <span className="text-brand-neon">trialing</span></p>
            <p>Trial: 7 dias restantes</p>
            <p>Proxima renovacao: D-3 com aviso local</p>
            <p>Retencao: oferta de 40% no cancelamento</p>
          </div>
        </div>
      </div>

      <FeatureMatrix />
    </PanelShell>
  );
}

function FeatureMatrix() {
  const rows = ['Planos ilimitados', 'IA ilimitada', 'Coach alunos', 'Wearables avancados', 'PDF sem watermark'];
  const tiers = BILLING_PLANS.map(plan => plan.name);

  return (
    <div className="mt-5 overflow-x-auto border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-white/10 text-white">
          <tr>
            <th className="p-3 text-left">Recurso</th>
            {tiers.map(tier => <th key={tier} className="p-3 text-center">{tier}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row} className="border-t border-white/10">
              <td className="p-3 text-white/80">{row}</td>
              {BILLING_PLANS.map((plan, index) => (
                <td key={plan.id} className="p-3 text-center text-brand-neon">
                  {index >= Math.min(rowIndex + 1, 3) ? <Check className="inline w-4 h-4" /> : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PwaMobilePanel() {
  const [restSeconds, setRestSeconds] = useState(90);
  const [hapticMessage, setHapticMessage] = useState('');
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const vibrate = () => {
    navigator.vibrate?.([30, 40, 30]);
    setHapticMessage('Feedback haptico disparado.');
  };

  return (
    <PanelShell title="Mobile app-like" kicker="Bloco 12" icon={<Smartphone />}>
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatusTile label="Conexao" value={online ? 'Online' : 'Offline'} icon={<Activity />} />
          <StatusTile label="Instalavel" value="Manifest ativo" icon={<Download />} />
          <StatusTile label="Service worker" value="Cache app shell" icon={<Database />} />
        </div>

        <div className="bg-brand-dark border border-white/10 p-4">
          <p className="text-xs text-brand-muted uppercase tracking-widest">Timer descanso</p>
          <p className="text-5xl font-black text-white mt-2">{restSeconds}s</p>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setRestSeconds(90)} className="bg-white/10 px-3 py-2 text-white font-bold">90s</button>
            <button type="button" onClick={() => setRestSeconds(60)} className="bg-white/10 px-3 py-2 text-white font-bold">60s</button>
            <button type="button" onClick={vibrate} className="bg-brand-neon text-brand-dark px-3 py-2 font-black">Vibrar</button>
          </div>
          {hapticMessage && <p className="text-brand-neon text-sm mt-3">{hapticMessage}</p>}
        </div>
      </div>

      <div className="mt-5 bg-white/5 border border-white/10 p-4">
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-black text-white">Bottom nav preview</h4>
          <button
            type="button"
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="bg-white/10 text-white px-3 py-2 font-bold flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" /> Fullscreen
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2 mt-4 text-center">
          {['Treino', 'Feed', 'IA', 'Stats', 'Perfil'].map((item, index) => (
            <div key={item} className={`p-3 border ${index === 0 ? 'bg-brand-neon text-brand-dark border-brand-neon' : 'bg-brand-dark text-white border-white/10'}`}>
              <Dumbbell className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-bold">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

function NutritionOpsPanel({ profile }: { profile?: UserProfile | null }) {
  const nutritionProfile = profile ? nutritionProfileFromUser(profile) : DEFAULT_NUTRITION_PROFILE;
  const macros = calculateMacroPlan(nutritionProfile);
  const [query, setQuery] = useState('frango');
  const [selectedFoods, setSelectedFoods] = useState(['frango', 'arroz', 'banana']);
  const consumed = sumFoods(selectedFoods);
  const score = scoreNutritionDay(macros, consumed);
  const timing = getWorkoutNutritionTiming('18:30');
  const mealPlan = buildFallbackMealPlan(nutritionProfile, macros);

  return (
    <PanelShell title="Nutricao operacional" kicker="Bloco 13" icon={<Utensils />}>
      <div className="grid lg:grid-cols-4 gap-4">
        <MacroTile label="Kcal" value={macros.calories} />
        <MacroTile label="Proteina" value={`${macros.proteinG}g`} />
        <MacroTile label="Carbo" value={`${macros.carbsG}g`} />
        <MacroTile label="Agua" value={`${macros.waterMl}ml`} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 mt-5">
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Diario alimentar</h4>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="w-full mt-3 bg-brand-dark border border-white/10 px-3 py-2 text-white"
            placeholder="Buscar alimento"
          />
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {searchFoods(query).map(food => (
              <button
                key={food.id}
                type="button"
                onClick={() => setSelectedFoods(items => items.includes(food.id) ? items.filter(id => id !== food.id) : [...items, food.id])}
                className={`p-3 border text-left ${selectedFoods.includes(food.id) ? 'bg-brand-neon text-brand-dark border-brand-neon' : 'bg-brand-dark text-white border-white/10'}`}
              >
                <span className="font-black">{food.name}</span>
                <span className="block text-xs opacity-80">{food.serving} - {food.calories} kcal - {food.proteinG}g prot</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-brand-dark border border-white/10 p-4">
          <p className="text-xs text-brand-muted uppercase tracking-widest">Score diario</p>
          <p className="text-6xl font-black text-brand-neon mt-2">{score.grade}</p>
          <p className="text-white font-bold">{score.score}/100</p>
          <p className="text-sm text-brand-muted mt-3">{score.tip}</p>
          <div className="mt-4 text-sm text-white/80 space-y-2">
            <p>Pre: {timing.pre}</p>
            <p>Pos: {timing.post}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-3">
        {mealPlan.map(item => (
          <div key={item} className="bg-white/5 border border-white/10 p-3 text-white/80 text-sm">
            {item}
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function RecoveryOpsPanel() {
  const [wellness, setWellness] = useState({ date: new Date().toISOString(), mood: 4, energy: 4, stress: 2, soreness: 3, hrv: 58, sessionRpe: 7 });
  const score = calculateRecoveryScore(wellness);
  const risk = detectOvertrainingRisk([
    wellness,
    { ...wellness, stress: 4, energy: 3, soreness: 4 },
    { ...wellness, stress: 3, energy: 4, soreness: 3 },
  ]);
  const mobility = buildMobilityProtocol('quadril e ombros');

  return (
    <PanelShell title="Readiness e recovery" kicker="Bloco 14" icon={<HeartPulse />}>
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <div className="bg-brand-dark border border-white/10 p-5">
          <p className="text-xs text-brand-muted uppercase tracking-widest">Recovery score</p>
          <p className="text-7xl font-black text-brand-neon mt-3">{score.score}</p>
          <p className="text-white font-black uppercase">{score.label}</p>
          <p className="text-sm text-brand-muted mt-3">{score.recommendation}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['mood', 'energy', 'stress', 'soreness'] as const).map(key => (
            <label key={key} className="bg-white/5 border border-white/10 p-4 text-white">
              <span className="block text-xs uppercase tracking-widest text-brand-muted">{key}</span>
              <input
                type="range"
                min="1"
                max="5"
                value={wellness[key]}
                onChange={event => setWellness(prev => ({ ...prev, [key]: Number(event.target.value) }))}
                className="w-full mt-4"
              />
              <span className="text-3xl font-black">{wellness[key]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">DOMS heatmap</h4>
          {['Peito', 'Costas', 'Quadriceps', 'Posteriores', 'Ombros', 'Core'].map((muscle, index) => (
            <div key={muscle} className="mt-3">
              <div className="flex justify-between text-sm text-white/80">
                <span>{muscle}</span>
                <span>{index + 1}/5</span>
              </div>
              <div className="h-2 bg-brand-dark mt-1">
                <div className="h-full bg-brand-neon" style={{ width: `${(index + 1) * 18}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Overtraining</h4>
          <p className="text-4xl font-black text-brand-neon mt-3">{risk.risk}</p>
          <p className="text-sm text-brand-muted mt-2">{risk.reason}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Mobilidade IA fallback</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {mobility.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </PanelShell>
  );
}

function IntegrationsOpsPanel({ userName, currentPlan, profile }: { userName: string; currentPlan?: WorkoutPlan | null; profile?: UserProfile | null }) {
  const [deliveries, setDeliveries] = useState(loadWebhookDeliveries);
  const zones = getHeartRateZoneRows(profile?.age ?? 32);
  const qrPayload = buildPlanQrPayload(currentPlan?.id ?? 'demo-plan', userName);

  const sendWebhook = () => {
    recordWebhookDelivery({
      url: 'https://example.com/n8n/treino',
      event: 'workout.completed',
      payload: { planId: currentPlan?.id ?? 'demo-plan' },
    });
    setDeliveries(loadWebhookDeliveries());
  };

  return (
    <PanelShell title="Wearables e integracoes" kicker="Bloco 15" icon={<Watch />}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {INTEGRATION_CONNECTIONS.map(connection => (
          <div key={connection.provider} className="bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-black text-white">{connection.label}</h4>
              {connection.premium && <span className="text-xs text-brand-neon font-black">Premium</span>}
            </div>
            <p className="text-sm text-brand-muted mt-2">{connection.status}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <div className="bg-brand-dark border border-white/10 p-4">
          <h4 className="font-black text-white">Zonas de FC</h4>
          {zones.map(zone => (
            <p key={zone.zone} className="flex justify-between gap-3 text-sm text-white/80 mt-3">
              <span>{zone.zone} - {zone.label}</span>
              <span className="text-brand-neon">{zone.range}</span>
            </p>
          ))}
        </div>
        <div className="bg-brand-dark border border-white/10 p-4 flex flex-col items-center justify-center">
          <QrCode className="text-brand-neon mb-3" />
          <QRCodeSVG value={qrPayload} size={150} fgColor="#a3e635" bgColor="#0a0a0a" />
          <p className="text-xs text-brand-muted mt-3 text-center">QR Code do plano para personal trainer.</p>
        </div>
        <div className="bg-brand-dark border border-white/10 p-4">
          <h4 className="font-black text-white">Webhook</h4>
          <button type="button" onClick={sendWebhook} className="mt-3 bg-brand-neon text-brand-dark px-4 py-3 font-black">
            Simular entrega
          </button>
          <p className="text-sm text-brand-muted mt-3">{deliveries.length} entrega(s) registradas.</p>
        </div>
      </div>
    </PanelShell>
  );
}

function AccessibilityOpsPanel() {
  const [locale, setLocale] = useState<SupportedLocale>('pt-BR');
  const [contrast, setContrast] = useState(false);

  const setScale = (scale: FontScale) => {
    applyFontScale(scale);
  };

  const toggleContrast = () => {
    applyHighContrast(!contrast);
    setContrast(!contrast);
  };

  return (
    <PanelShell title="Acessibilidade e inclusao" kicker="Bloco 16" icon={<Eye />}>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white flex items-center gap-2"><Globe2 /> Idioma</h4>
          <select
            value={locale}
            onChange={event => setLocale(event.target.value as SupportedLocale)}
            className="w-full mt-4 bg-brand-dark border border-white/10 p-3 text-white"
          >
            <option value="pt-BR">PT-BR</option>
            <option value="en-US">EN-US</option>
            <option value="es">ES</option>
          </select>
          <p className="text-sm text-brand-muted mt-3">{t(locale, 'platform')} / {t(locale, 'security')}</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Escala de fonte</h4>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {(['s', 'm', 'l', 'xl'] as FontScale[]).map(scale => (
              <button key={scale} type="button" onClick={() => setScale(scale)} className="bg-brand-dark border border-white/10 p-3 text-white font-black uppercase">
                {scale}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Contraste e motion</h4>
          <button type="button" onClick={toggleContrast} className="mt-4 bg-brand-neon text-brand-dark px-4 py-3 font-black">
            {contrast ? 'Desativar contraste' : 'Ativar contraste'}
          </button>
          <p className="text-sm text-brand-muted mt-3">Respeita prefers-reduced-motion via utilitario.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-5">
        {ADAPTIVE_EXERCISES.map(item => (
          <div key={`${item.limitation}-${item.muscle}`} className="bg-brand-dark border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-brand-muted">{item.limitation} / {item.muscle}</p>
            <h4 className="text-white font-black mt-1">{item.replacement}</h4>
            <p className="text-sm text-brand-muted mt-2">{item.cue}</p>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function SecurityOpsPanel({ userName }: { userName: string }) {
  const [consent, setConsent] = useState(loadCookieConsent);
  const [audit, setAudit] = useState(loadAuditEvents);
  const [exportSize, setExportSize] = useState(0);
  const rate = checkRateLimit('ai-preview', 20, 60 * 1000);
  const sessions = getActiveSessions();
  const csrf = getCsrfToken();

  const updateConsent = (key: 'analytics' | 'personalization' | 'marketing') => {
    const next = saveCookieConsent({
      analytics: key === 'analytics' ? !consent.analytics : consent.analytics,
      personalization: key === 'personalization' ? !consent.personalization : consent.personalization,
      marketing: key === 'marketing' ? !consent.marketing : consent.marketing,
    });
    setConsent(next);
    setAudit(loadAuditEvents());
  };

  const exportData = () => {
    const data = exportPrivacyData();
    setExportSize(JSON.stringify(data).length);
    setAudit(loadAuditEvents());
  };

  const deleteData = () => {
    if (!window.confirm('Remover dados locais deste dispositivo?')) return;
    deleteLocalAccountData();
    setAudit(loadAuditEvents());
  };

  return (
    <PanelShell title="Seguranca e LGPD" kicker="Bloco 17" icon={<Lock />}>
      <div className="grid lg:grid-cols-4 gap-4">
        <StatusTile label="CSRF" value={csrf.slice(0, 8)} icon={<ShieldCheck />} />
        <StatusTile label="Rate limit IA" value={`${rate.remaining} restantes`} icon={<Gauge />} />
        <StatusTile label="Input sanitize" value={sanitizeText('<script>ok</script>')} icon={<Lock />} />
        <StatusTile label="Ator" value={userName} icon={<Activity />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Cookies granulares</h4>
          {(['analytics', 'personalization', 'marketing'] as const).map(key => (
            <button key={key} type="button" onClick={() => updateConsent(key)} className="w-full mt-3 flex items-center justify-between bg-brand-dark border border-white/10 p-3 text-white">
              <span>{key}</span>
              <span className="text-brand-neon">{String(consent[key])}</span>
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">LGPD</h4>
          <button type="button" onClick={exportData} className="mt-3 w-full bg-brand-neon text-brand-dark px-4 py-3 font-black">
            Exportar dados
          </button>
          <button type="button" onClick={deleteData} className="mt-3 w-full bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3 font-black">
            Excluir dados locais
          </button>
          {exportSize > 0 && <p className="text-sm text-brand-muted mt-3">Pacote gerado: {exportSize} caracteres.</p>}
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Sessoes ativas</h4>
          {sessions.map(session => (
            <div key={session.id} className="mt-3 border border-white/10 bg-brand-dark p-3">
              <p className="text-white font-bold">{session.device}</p>
              <p className="text-xs text-brand-muted">{session.current ? 'Atual' : 'Revogavel'} - {session.location}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 bg-brand-dark border border-white/10 p-4">
        <h4 className="font-black text-white">Auditoria</h4>
        <button
          type="button"
          onClick={() => { logAuditEvent('security.demo', 'Evento de auditoria criado pelo painel.'); setAudit(loadAuditEvents()); }}
          className="mt-3 bg-white/10 text-white px-4 py-2 font-bold"
        >
          Registrar evento
        </button>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {audit.slice(0, 4).map(event => (
            <div key={event.id} className="bg-white/5 border border-white/10 p-3 text-sm text-white/75">
              <p className="font-black text-white">{event.type}</p>
              <p>{event.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

function EducationOpsPanel() {
  const [muscle, setMuscle] = useState('Peito');
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(8);
  const exercises = EDUCATION_EXERCISES.filter(item => item.muscle === muscle);
  const warmup = buildWarmupProtocol(muscle);
  const cooldown = buildCooldownProtocol();

  return (
    <PanelShell title="Biblioteca e educacao" kicker="Bloco 18" icon={<BookOpen />}>
      <div className="flex flex-wrap gap-2 mb-5">
        {Array.from(new Set(EDUCATION_EXERCISES.map(item => item.muscle))).map(item => (
          <button key={item} type="button" onClick={() => setMuscle(item)} className={`px-4 py-2 font-black ${muscle === item ? 'bg-brand-neon text-brand-dark' : 'bg-white/10 text-white'}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {exercises.map(exercise => (
          <div key={exercise.id} className="bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-brand-muted">{exercise.equipment} / {exercise.difficulty}</p>
            <h4 className="text-xl font-black text-white mt-1">{exercise.name}</h4>
            <p className="text-sm text-brand-muted mt-3">{buildExerciseTip(exercise.name, exercise.difficulty)}</p>
            <p className="text-sm text-white/75 mt-3">Erros: {exercise.mistakes.join(', ')}</p>
            <p className="text-sm text-brand-neon mt-2">Substitutos: {exercise.substitutes.join(', ')}</p>
          </div>
        ))}

        <div className="bg-brand-dark border border-white/10 p-4">
          <h4 className="font-black text-white">Calculadora 1RM</h4>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <input type="number" value={weight} onChange={event => setWeight(Number(event.target.value))} className="bg-brand-gray border border-white/10 p-2 text-white" />
            <input type="number" value={reps} onChange={event => setReps(Number(event.target.value))} className="bg-brand-gray border border-white/10 p-2 text-white" />
          </div>
          <p className="text-4xl font-black text-brand-neon mt-4">{estimateOneRepMax(weight, reps)}kg</p>
          <p className="text-sm text-brand-muted">IMC exemplo 82/178: {calculateBmi(82, 178)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <ListBox title="Aquecimento" items={warmup} />
        <ListBox title="Volta a calma" items={cooldown} />
        <ListBox title="Glossario" items={FITNESS_GLOSSARY.slice(0, 3).map(item => `${item.term}: ${item.definition}`)} />
      </div>

      <div className="mt-5 grid md:grid-cols-3 gap-3">
        {SCIENTIFIC_REFERENCES.map(reference => (
          <div key={reference.doi} className="bg-white/5 border border-white/10 p-3 text-sm text-white/75">
            <p className="font-black text-white">{reference.topic}</p>
            <p>{reference.title}</p>
            <p className="text-brand-neon mt-2">{reference.doi}</p>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function AiPersonalizationOpsPanel() {
  const [personaId, setPersonaId] = useState(COACH_PERSONAS[0].id);
  const [memoryInput, setMemoryInput] = useState('Prefere treinar inferiores na segunda.');
  const [memory, setMemory] = useState(loadAiMemory);
  const [memoryMode, setMemoryMode] = useState<'supabase' | 'mock_dev_only'>('mock_dev_only');
  const [memoryWarning, setMemoryWarning] = useState('');
  const persona = COACH_PERSONAS.find(item => item.id === personaId) ?? COACH_PERSONAS[0];
  const plateau = detectPlateau('Supino reto', [80, 82.5, 82.5, 82.5, 82.5]);
  const forecast = forecastPr('Supino reto', 82.5, 90);
  const report = buildQuarterlyAiReport(plateau, forecast);

  useEffect(() => {
    let active = true;

    loadAiMemoryCloud()
      .then(result => {
        if (!active) return;
        setMemory(result.data);
        setMemoryMode(result.dataMode);
        setMemoryWarning(result.warning ?? '');
      });

    return () => {
      active = false;
    };
  }, []);

  const saveMemory = async () => {
    const result = await addAiMemoryCloud(memoryInput);
    setMemory(result.data);
    setMemoryMode(result.dataMode);
    setMemoryWarning(result.warning ?? '');
  };

  return (
    <PanelShell title="Coach IA personalizado" kicker="Bloco 19" icon={<BrainCircuit />}>
      <div className="grid lg:grid-cols-4 gap-4">
        {COACH_PERSONAS.map(item => (
          <button key={item.id} type="button" onClick={() => setPersonaId(item.id)} className={`text-left border p-4 ${personaId === item.id ? 'bg-brand-neon text-brand-dark border-brand-neon' : 'bg-white/5 text-white border-white/10'}`}>
            <h4 className="font-black">{item.name}</h4>
            <p className="text-sm opacity-80 mt-2">{item.tone}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Persona ativa</h4>
          <p className="text-3xl font-black text-brand-neon mt-2">{persona.name}</p>
          <p className="text-sm text-brand-muted mt-2">{persona.bestFor}</p>
          <p className="text-sm text-white/75 mt-2">{persona.promptHint}</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Plato e PR forecast</h4>
          <p className="text-sm text-brand-muted mt-3">{plateau.reason}</p>
          <p className="text-sm text-white/80 mt-2">{plateau.action}</p>
          <p className="text-brand-neon font-black mt-3">{forecast.targetKg}kg em {forecast.estimatedWeeks} semanas</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Memoria</h4>
          <input value={memoryInput} onChange={event => setMemoryInput(event.target.value)} className="w-full mt-3 bg-brand-dark border border-white/10 p-2 text-white" />
          <button type="button" onClick={saveMemory} className="mt-3 bg-brand-neon text-brand-dark px-4 py-2 font-black">Salvar memoria</button>
          <p className="text-sm text-brand-muted mt-3">{memory.length} nota(s) salvas. Modo: {memoryMode}</p>
          {memoryWarning && <p className="text-xs text-yellow-300 mt-2">{memoryWarning}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-5">
        {report.map(item => <div key={item} className="bg-brand-dark border border-white/10 p-3 text-white/80">{item}</div>)}
        <div className="bg-brand-neon text-brand-dark p-4 font-black">
          Modo turbo: 20 min, 5 exercicios, descanso curto, foco em eficiencia maxima.
        </div>
      </div>
    </PanelShell>
  );
}

function DevOpsPanel({ flags, onToggleFlag }: { flags: ReturnType<typeof loadFeatureFlags>; onToggleFlag: (key: FeatureFlagKey) => void }) {
  const envStatus = getPublicEnvStatus();
  const checks = [
    { label: 'CI/CD GitHub Actions', status: 'Config docs pronta' },
    { label: 'Vercel deploy', status: 'vercel.json previsto' },
    { label: 'Supabase RLS', status: 'schema documentado' },
    { label: 'Sentry/PostHog', status: 'env flags preparadas' },
    { label: 'Lighthouse CI', status: 'workflow base' },
    { label: 'Disaster recovery', status: 'runbook docs' },
  ];

  return (
    <PanelShell title="Operacao e escala" kicker="Bloco 20" icon={<Rocket />}>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Ambiente</h4>
          {envStatus.map(item => (
            <div key={item.key} className="mt-3 flex items-start justify-between gap-3 border-b border-white/10 pb-2">
              <div>
                <p className="text-white font-bold">{item.key}</p>
                <p className="text-xs text-brand-muted">{item.description}</p>
              </div>
              <span className={item.configured ? 'text-brand-neon' : 'text-red-300'}>
                {item.configured ? 'ok' : item.required ? 'faltando' : 'opcional'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Feature flags</h4>
          {(Object.keys(flags) as FeatureFlagKey[]).map(key => (
            <button key={key} type="button" onClick={() => onToggleFlag(key)} className="w-full mt-2 flex items-center justify-between bg-brand-dark border border-white/10 p-2 text-sm text-white">
              <span>{key}</span>
              <span className="text-brand-neon">{flags[key] ? 'on' : 'off'}</span>
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 p-4">
          <h4 className="font-black text-white">Checklist producao</h4>
          {checks.map(check => (
            <div key={check.label} className="mt-3 bg-brand-dark border border-white/10 p-3">
              <p className="text-white font-bold">{check.label}</p>
              <p className="text-xs text-brand-muted">{check.status}</p>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

function FeatureCoverage({ block }: { block: PlatformBlockDefinition }) {
  return (
    <section className="bg-brand-gray border border-white/10 p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-brand-neon text-xs uppercase tracking-widest font-black">Cobertura</p>
          <h3 className="text-2xl font-black text-white">20 itens representados</h3>
        </div>
        <Flag className="text-brand-neon" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        {block.features.map(item => (
          <div key={item.id} className="bg-brand-dark border border-white/10 p-3 min-h-32">
            <div className="flex items-start justify-between gap-2">
              <span className="text-brand-neon font-black">#{item.id}</span>
              <span className="text-[10px] uppercase text-brand-muted">{item.coverage}</span>
            </div>
            <p className="text-white font-bold mt-2">{item.title}</p>
            <div className="flex items-center justify-between gap-2 mt-3 text-xs">
              <span className="text-brand-muted">{item.priority}</span>
              <span className={item.status === 'active' ? 'text-brand-neon' : item.status === 'roadmap' ? 'text-yellow-300' : 'text-white/70'}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureFlagPanel({ block, enabled, onToggle }: { block: PlatformBlockDefinition; enabled: boolean; onToggle: (key: FeatureFlagKey) => void }) {
  return (
    <aside className="bg-brand-gray border border-white/10 p-5">
      <div className="flex items-center gap-2 text-brand-neon">
        <ToggleLeft />
        <h3 className="font-black text-white">Feature flag</h3>
      </div>
      <p className="text-sm text-brand-muted mt-3">{block.featureFlag}</p>
      <button
        type="button"
        onClick={() => onToggle(block.featureFlag as FeatureFlagKey)}
        className={`w-full mt-5 px-4 py-3 font-black ${enabled ? 'bg-brand-neon text-brand-dark' : 'bg-white/10 text-white'}`}
      >
        {enabled ? 'Ativo' : 'Pausado'}
      </button>
      <p className="text-xs text-brand-muted mt-3">
        Use para liberar o bloco gradualmente sem remover o codigo.
      </p>
    </aside>
  );
}

function PanelShell({ title, kicker, icon, children }: { title: string; kicker: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-brand-gray border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 bg-brand-neon text-brand-dark flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-brand-neon text-xs uppercase tracking-widest font-black">{kicker}</p>
          <h3 className="text-2xl font-black text-white">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-brand-dark border border-white/10 px-4 py-3">
      <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-brand-light">{value}</p>
    </div>
  );
}

function StatusTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4">
      <div className="text-brand-neon">{icon}</div>
      <p className="text-xs uppercase tracking-widest text-brand-muted mt-3">{label}</p>
      <p className="text-white font-black mt-1">{value}</p>
    </div>
  );
}

function MacroTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-brand-dark border border-white/10 p-4">
      <p className="text-xs uppercase tracking-widest text-brand-muted">{label}</p>
      <p className="text-3xl font-black text-brand-neon mt-2">{value}</p>
    </div>
  );
}

function ListBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4">
      <h4 className="font-black text-white">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-white/75">
        {items.map(item => <li key={item} className="flex gap-2"><ChevronRight className="w-4 h-4 text-brand-neon shrink-0" />{item}</li>)}
      </ul>
    </div>
  );
}
