import React from 'react';
import { Home, Dumbbell, BarChart3, User } from 'lucide-react';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: 'home' | 'workout' | 'progress' | 'profile';
}

const ICONS = {
  home: Home,
  workout: Dumbbell,
  progress: BarChart3,
  profile: User,
} as const;

interface BottomNavProps {
  items?: BottomNavItem[];
  activeId?: string;
  onChange?: (id: string) => void;
}

const DEFAULT_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Início', icon: 'home' },
  { id: 'workout', label: 'Treino', icon: 'workout' },
  { id: 'progress', label: 'Progresso', icon: 'progress' },
  { id: 'profile', label: 'Perfil', icon: 'profile' },
];

export function BottomNav({ items = DEFAULT_ITEMS, activeId, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-brand-dark/95 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = item.id === activeId;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange?.(item.id)}
                className={`w-full py-2.5 flex flex-col items-center gap-1 text-xs ${
                  active ? 'text-brand-neon' : 'text-white/65'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
