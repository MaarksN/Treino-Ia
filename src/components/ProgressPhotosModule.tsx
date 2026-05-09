import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Image as ImageIcon, Camera, Loader, CheckCircle, Target, ArrowRight } from 'lucide-react';
import { analyzeBodyImage } from '../services/geminiService';
import Markdown from 'react-markdown';

interface Props {
  profile: UserProfile;
}

export function ProgressPhotosModule({ profile }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
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
      const currentUrl = URL.createObjectURL(file);
      setPhotoUrl(currentUrl);
      
      setIsAnalyzing(true);
      setAnalysisText(null);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        if (base64Data) {
           const result = await analyzeBodyImage(base64Data, file.type, profile);
           setAnalysisText(result);
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setAnalysisText("⚠️ Ocorreu um erro ao processar sua foto.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-brand-gray border border-white/5 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-neon tracking-widest blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display font-black text-2xl uppercase tracking-widest text-[#00f0ff] flex items-center">
          <ImageIcon className="w-6 h-6 mr-3" /> Scanner Corporal IA
        </h3>
        <span className="bg-brand-dark/50 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-mono px-3 py-1 uppercase tracking-widest font-bold">
          BioTracker 2.0
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0 flex flex-col w-full md:w-64">
           {photoUrl ? (
             <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#00f0ff]/30 mb-4 bg-brand-dark shadow-[0_0_20px_rgba(0,240,255,0.1)]">
               <img src={photoUrl} alt="Progress" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none flex flex-col justify-end p-4">
                 <p className="text-[#00f0ff] font-mono text-[10px] tracking-widest uppercase mb-1">Status Atleta:</p>
                 <p className="text-white font-bold text-sm tracking-wide">{profile.weight}kg</p>
               </div>
               
               {isAnalyzing && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                   <div className="flex flex-col items-center">
                     <div className="relative">
                       <Loader className="w-10 h-10 text-[#00f0ff] animate-spin" />
                       <div className="absolute inset-0 w-full h-full border-2 border-[#00f0ff]/50 rounded-full animate-ping"></div>
                     </div>
                     <p className="font-mono text-xs text-[#00f0ff] uppercase mt-4 font-bold tracking-widest">Calculando Proporções...</p>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <button 
               onClick={handleUploadClick}
               className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 hover:border-[#00f0ff] bg-brand-dark/30 hover:bg-[#00f0ff]/5 transition-all flex flex-col items-center justify-center text-white/50 hover:text-[#00f0ff] mb-4 group/upload"
             >
               <Camera className="w-12 h-12 mb-4 group-hover/upload:scale-110 transition-transform" />
               <span className="font-mono text-xs uppercase tracking-widest font-bold text-center px-4">Nova Carga de Imagem<br/>Mês Vigente</span>
             </button>
           )}

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
             className="w-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/50 hover:bg-[#00f0ff] hover:text-black transition-colors py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center disabled:opacity-50"
           >
             {photoUrl ? 'Atualizar Foto' : 'Capturar Shape'}
           </button>
        </div>

        <div className="flex-1 flex flex-col">
          {!analysisText && !isAnalyzing && (
            <div className="flex-1 border border-white/10 rounded-2xl bg-brand-dark/50 p-8 flex flex-col items-center justify-center text-center">
              <Target className="w-16 h-16 text-white/10 mb-4" />
              <h4 className="font-display text-white text-xl uppercase tracking-widest mb-2">Visão Computacional Inativa</h4>
              <p className="font-mono text-xs text-white/40 max-w-sm leading-relaxed">
                Envie uma foto de frente ou perfil (preferencialmente com boa iluminação nas fibras musculares).
                A IA irá gerar um mapeamento topográfico do seu desenvolvimento.
              </p>
            </div>
          )}

          {analysisText && (
            <div className="flex-1 border-2 border-[#00f0ff]/30 rounded-2xl bg-brand-dark overflow-hidden relative shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
              <div className="p-6 md:p-8 overflow-y-auto max-h-[500px]">
                <div className="flex items-center text-[#00f0ff] mb-6 border-b border-[#00f0ff]/20 pb-4">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <h4 className="font-mono font-bold uppercase tracking-widest text-sm text-shadow-neon">Relatório de Simetria Concluído</h4>
                </div>
                <div className="font-sans text-brand-light/90 [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-black [&>h1]:text-white [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-[#00f0ff] [&>h2]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>li]:mb-2 [&>strong]:text-[#00f0ff]">
                  <Markdown>{analysisText}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
