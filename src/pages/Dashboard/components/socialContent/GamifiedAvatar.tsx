import { memo } from 'react';

interface GamifiedAvatarProps {
  level: number;
}

export const GamifiedAvatar = memo(function GamifiedAvatar({ level }: GamifiedAvatarProps) {
  // Simple visual evolution logic based on level
  const baseRadius = 40;
  const rings = Math.min(Math.floor(level / 5) + 1, 5); // Up to 5 rings
  const colors = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00', '#FF4500'];

  return (
    <div className="flex flex-col items-center mr-4" aria-hidden="true" title="Avatar gamificado ilustrativo (sem fins médicos/físicos exatos)">
      <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
        {/* Base avatar shape */}
        <circle cx="50" cy="50" r={baseRadius} fill="#1A1A1A" stroke="#333" strokeWidth="2" />
        <path d="M50 30 Q60 50 50 70 Q40 50 50 30" fill={colors[Math.min(rings - 1, colors.length - 1)]} opacity="0.8" />

        {/* Evolution rings */}
        {Array.from({ length: rings }).map((_, index) => (
          <circle
            key={`ring-${index}`}
            cx="50"
            cy="50"
            r={baseRadius - (index * 8)}
            fill="none"
            stroke={colors[index % colors.length]}
            strokeWidth="1.5"
            strokeDasharray={`${(index + 1) * 5} ${index * 2}`}
            className="animate-spin"
            style={{ animationDuration: `${10 + index * 5}s`, transformOrigin: 'center' }}
          />
        ))}
      </svg>
      <span className="mt-1 text-[8px] text-brand-muted max-w-[80px] text-center leading-tight">Ilustrativo</span>
    </div>
  );
});
