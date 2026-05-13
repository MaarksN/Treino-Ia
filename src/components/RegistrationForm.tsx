import React, { useState } from 'react';
import { User } from '../types';
import { UserCircle, ArrowRight } from 'lucide-react';

interface Props {
  onRegister: (user: User) => void;
}

export function RegistrationForm({ onRegister }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const registeredUser = { name: name.trim(), email: email.trim(), avatarUrl: avatar || undefined };
      localStorage.setItem('@TreinoIA:starterUser', JSON.stringify({
        ...registeredUser,
        createdAt: Date.now(),
      }));
      onRegister(registeredUser);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 md:p-8 mt-12 bg-brand-gray border-4 border-brand-neon shadow-brutal-neon">
      <div className="text-center mb-10">
        <label className="cursor-pointer inline-block group mb-8">
          {avatar ? (
             <img src={avatar} alt="Avatar" className="w-28 h-28 object-cover rounded-full border-4 border-brand-neon mx-auto hover:brightness-110 transition-all shadow-[0_0_20px_var(--color-brand-neon)]" />
          ) : (
             <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-brand-neon text-brand-dark border-brutal group-hover:bg-brand-light transition-colors shadow-[0_0_20px_var(--color-brand-neon)]">
               <UserCircle className="w-14 h-14" />
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase text-brand-light bg-brand-magenta whitespace-nowrap shadow-md z-10">Adicionar Foto</div>
             </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        <h1 className="font-display font-black text-6xl sm:text-7xl tracking-normal uppercase text-brand-light mb-2 text-shadow-neon text-stroke-black leading-none">INICIAR</h1>
        <p className="text-brand-magenta font-mono font-bold text-sm">Crie seu perfil para gerar treinos brutais com IA.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">🔥 Qual seu nome?</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Ex: João da Silva"
            required
            className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon focus:shadow-brutal-neon transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">📧 Qual seu e-mail?</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="joao@example.com"
            required
            className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon focus:shadow-brutal-neon transition-all"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-brand-neon hover:bg-brand-light text-brand-dark font-display font-black text-3xl uppercase tracking-tighter py-4 border-brutal transition-colors flex justify-center items-center group mt-4"
        >
          Cadastrar e continuar
          <ArrowRight className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform" />
        </button>
      </form>
    </div>
  );
}
