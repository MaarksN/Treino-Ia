import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({ lines = 1, className = '', ...props }: SkeletonProps) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`.trim()} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 w-full rounded-md bg-brand-light/10" />
      ))}
    </div>
  );
}
