import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Apple, Flame, ChevronRight, Camera, Loader, CheckCircle } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import Markdown from 'react-markdown';
import { captureError } from '../utils/errorTelemetry';

interface Props {
  profile: UserProfile;
}

export function NutritionModule({ profile }: Props) {
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setAnalysisText(null);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        if (base64Data) {
           const result = await analyzeFoodImage(base64Data, file.type, profile);
           setAnalysisText(result);
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      captureError(err, 'NutritionModule.handleFileChange');
      setAnalysisText("⚠️ Erro ao processar imagem.");
      setIsAnalyzing(false);
    }
  };

  // BMR Calculation (Mifflin-St Jeor)
  // Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
  // Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
  const isMale = profile.gender.toLowerCase() === 'masculino';
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  bmr += isMale ? 5 : -161;

  // TDEE Calculation (Activity Level)
  // We'll estimate based on daysPerWeek
  const activityMultiplier = profile.daysPerWeek >= 5 ? 1.55 : profile.daysPerWeek >= 3 ? 1.375 : 1.2;
  const tdee = Math.round(bmr * activityMultiplier);

  // Goal adjustment
  let targetCalories = tdee;
  let proteinRatio = 0;
  let fatRatio = 0;

  if (profile.goal.toLowerCase().includes('hipertrofia')) {
    targetCalories += 300;
    proteinRatio = 2.2; // 2.2g per kg
    fatRatio = 1.0;
  } else if (profile.goal.toLowerCase().includes('emagrecimento')) {
    targetCalories -= 400;
    proteinRatio = 2.4; 
    fatRatio = 0.8;
  } else {
    proteinRatio = 2.0;
    fatRatio = 1.0; 
  }

  const protein = Math.round(profile.weight * proteinRatio);
  const fat = Math.round(profile.weight * fatRatio);
  const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

  return (
    <div className="bg-brand-dark border-4 border-brand-light p-6 mt-8 relative shadow-brutal-light flex flex-col md:flex-row items-center gap-8 group hover:border-brand-neon transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-magenta/10 blur-2xl rounded-full pointer-events-none group-hover:bg-brand-magenta/20 transition-colors"></div>
      
      <div className="flex-shrink-0 text-center flex flex-col items-center">
         <div className="w-16 h-16 bg-brand-light text-brand-dark flex flex-col items-center justify-center mb-2 shadow-brutal-light group-hover:bg-brand-neon group-hover:text-brand-dark transition-colors">
            <Flame className="w-8 h-8" />
         </div>
         <span className="font-display font-black text-3xl group-hover:text-brand-neon transition-colors leading-none">{targetCalories}</span>
         <span className="font-mono text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">KCAL / DIA</span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-2 w-full text-center">
        <div className="p-2 border-2 border-brand-light/10 flex flex-col">
          <span className="font-display font-black text-2xl text-brand-light">{protein}g</span>
          <span className="text-[10px] font-mono text-brand-neon font-bold uppercase tracking-widest mt-1">Proteína</span>
          <span className="text-[9px] text-brand-muted font-mono">{protein * 4} kcal</span>
        </div>
        <div className="p-2 border-2 border-brand-light/10 flex flex-col">
          <span className="font-display font-black text-2xl text-brand-light">{carbs}g</span>
          <span className="text-[10px] font-mono text-brand-magenta font-bold uppercase tracking-widest mt-1">Carboidrato</span>
          <span className="text-[9px] text-brand-muted font-mono">{carbs * 4} kcal</span>
        </div>
        <div className="p-2 border-2 border-brand-light/10 flex flex-col">
          <span className="font-display font-black text-2xl text-brand-light">{fat}g</span>
          <span className="text-[10px] font-mono text-[#D4AF37] font-bold uppercase tracking-widest mt-1">Gordura</span>
          <span className="text-[9px] text-brand-muted font-mono">{fat * 9} kcal</span>
        </div>
      </div>
      
      <div className="flex-shrink-0 text-right md:w-48">
        <h4 className="font-display text-lg uppercase font-bold text-brand-light flex items-center justify-end"><Apple className="w-4 h-4 mr-2 text-brand-light" /> IA Macro-Forge</h4>
        <p className="text-[10px] text-brand-muted font-mono mt-1 leading-relaxed text-right mb-4">
          Cálculo estimado para <span className="text-brand-light">{profile.goal}</span>. 
          Bata as proteínas. O resto é detalhe.
        </p>
        
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        
        <button 
          onClick={handleUploadClick}
          disabled={isAnalyzing}
          className="w-full text-[10px] font-bold font-mono uppercase tracking-widest bg-brand-dark border border-brand-light/20 text-brand-light hover:bg-brand-light hover:text-brand-dark transition-colors py-2 px-3 flex items-center justify-center disabled:opacity-50"
        >
          {isAnalyzing ? <Loader className="w-3 h-3 mr-2 animate-spin" /> : <Camera className="w-3 h-3 mr-2" />}
          Analisar Prato (IA)
        </button>
      </div>

      {/* AI Analysis Result Overlay */}
      {analysisText && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-brand-dark border-2 border-[#D4AF37] p-6 shadow-[0_0_20px_rgba(212,175,55,0.2)] z-20">
          <div className="flex items-center justify-between mb-4">
             <h4 className="font-display uppercase font-bold text-[#D4AF37] text-xl flex items-center">
               <CheckCircle className="w-5 h-5 mr-2" /> Veredito da I.A.
             </h4>
             <button onClick={() => setAnalysisText(null)} className="text-[#D4AF37] hover:text-white text-xs font-mono uppercase">
               Fechar
             </button>
          </div>
          <div className="font-sans text-sm text-brand-light/90 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3 [&>li]:mb-1 [&>strong]:text-[#D4AF37]">
            <Markdown>{analysisText}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
