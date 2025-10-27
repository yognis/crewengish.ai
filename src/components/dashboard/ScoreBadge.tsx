'use client';

import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  // Determine color based on score range
  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
      };
    } else if (score >= 60) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
      };
    } else {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
      };
    }
  };

  const colors = getScoreColor(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-full border',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size]
      )}
    >
      {Math.round(score)}
    </span>
  );
}
