import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: 'neutral' | 'warning' | 'info' | 'success';
  title?: string;
}

export default function InfoCard({ children, icon: Icon, variant = 'neutral', title }: InfoCardProps) {
  const variants = {
    neutral: {
      bg: 'bg-gray-50',
      border: 'border-l-4 border-gray-400',
      iconColor: 'text-gray-600',
      titleColor: 'text-gray-900',
      textColor: 'text-gray-800',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-l-4 border-warning',
      iconColor: 'text-warning',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-l-4 border-blue-500',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-900',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-l-4 border-success',
      iconColor: 'text-success',
      titleColor: 'text-green-900',
      textColor: 'text-green-900',
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.bg} ${style.border} rounded-r-lg p-4 my-2 print:border print:border-gray-300 print:my-4`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true" />}
        <div className="flex-1">
          {title && (
            <p 
              className={`font-semibold text-sm mb-2 ${style.titleColor}`}
              role="heading"
              aria-level={3}
            >
              {title}
            </p>
          )}
          <div className={`text-sm ${style.textColor} space-y-2`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

