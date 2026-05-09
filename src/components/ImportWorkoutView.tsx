import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, FileText, Activity } from 'lucide-react';

interface Props {
  onImport: (base64: string, mimeType: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function ImportWorkoutView({ onImport, onCancel, isLoading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onImport(base64, file.type);
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 mt-8">
      <div className="text-center mb-8">
        <h1 className="font-display font-black text-7xl tracking-tighter uppercase mb-2 text-shadow-neon">Importar Treino</h1>
        <p className="text-brand-magenta font-mono font-bold">Envie uma foto da sua ficha ou um arquivo PDF. A IA vai ler e organizar tudo para você.</p>
      </div>

      <div 
        className={`relative border-4 p-12 text-center transition-all ${dragActive ? 'border-brand-neon bg-brand-neon/10 scale-105 shadow-brutal-neon' : 'border-dashed border-brand-light/20 hover:border-brand-magenta hover:bg-brand-gray bg-brand-gray/50 hover:shadow-brutal-magenta'} ${isLoading ? 'opacity-50 pointer-events-none border-solid border-brand-neon bg-brand-dark' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*,application/pdf"
          className="hidden"
          onChange={e => e.target.files && handleFile(e.target.files[0])}
        />
        
        {isLoading ? (
           <div className="flex flex-col items-center justify-center">
             <Activity className="w-20 h-20 text-brand-neon animate-spin mb-6" />
             <p className="font-display text-4xl uppercase tracking-tighter text-brand-neon font-black">Escaneando Fibras...</p>
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="flex space-x-6 mb-8">
              <div className="w-20 h-20 bg-brand-dark border-2 border-brand-light/20 flex items-center justify-center text-brand-light/50 shadow-[4px_4px_0px_#fff]">
                <FileImage className="w-10 h-10" />
              </div>
              <div className="w-20 h-20 bg-brand-dark border-2 border-brand-light/20 flex items-center justify-center text-brand-light/50 shadow-[4px_4px_0px_#fff]">
                <FileText className="w-10 h-10" />
              </div>
            </div>
            <p className="text-2xl font-black font-display uppercase tracking-widest mb-2 text-brand-light">Arraste seu arquivo aqui</p>
            <p className="text-brand-muted font-mono text-sm mb-8">Formatos suportados: JPG, PNG, PDF</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-brand-light text-brand-dark px-8 py-4 font-black uppercase tracking-tighter border-brutal hover:bg-brand-neon hover:scale-105 transition-all text-xl"
            >
              Ou Selecione um Arquivo
            </button>
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="mt-12 text-center">
          <button onClick={onCancel} className="text-brand-muted hover:text-brand-magenta font-black uppercase tracking-widest text-sm transition-colors border-b-2 border-transparent hover:border-brand-magenta">
            CANCELAR
          </button>
        </div>
      )}
    </div>
  );
}
