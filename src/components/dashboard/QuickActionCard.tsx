'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  badge?: string;
  primary?: boolean;
}

export function QuickActionCard({
  icon,
  title,
  description,
  buttonText,
  href,
  badge,
  primary = false,
}: QuickActionCardProps) {
  const router = useRouter();

  return (
    <div className="relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-thy-red hover:shadow-lg transition-all duration-300">
      {/* Badge in top right */}
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="bg-thy-red/10 text-thy-red text-xs font-semibold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
        primary ? 'bg-thy-red/10' : 'bg-gray-100'
      )}>
        <div className={cn(
          'h-6 w-6',
          primary ? 'text-thy-red' : 'text-gray-700'
        )}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 whitespace-pre-line">{description}</p>

      {/* Button */}
      <button
        onClick={() => router.push(href)}
        className={cn(
          'w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300',
          primary
            ? 'bg-thy-red hover:bg-thy-darkRed text-white shadow-md hover:shadow-xl'
            : 'border-2 border-gray-300 text-gray-700 hover:border-thy-red hover:text-thy-red'
        )}
      >
        {buttonText}
      </button>
    </div>
  );
}
