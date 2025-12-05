/**
 * Stat Card Component
 * Displays a single statistic with label and optional trend
 */

'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  /** Label for the stat */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle or additional info */
  subtitle?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Trend value (e.g., "+5.2%") */
  trendValue?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Coming soon state */
  isComingSoon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  isLoading = false,
  isComingSoon = false,
  className,
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const trendArrows = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6',
          className
        )}
      >
        <div className="animate-pulse">
          <div className="h-3 w-16 rounded bg-white/10 sm:h-4 sm:w-24" />
          <div className="mt-2 h-6 w-20 rounded bg-white/10 sm:mt-3 sm:h-8 sm:w-32" />
          {subtitle && <div className="mt-1 h-3 w-16 rounded bg-white/10 sm:mt-2 sm:w-20" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.07] sm:p-6',
        isComingSoon && 'border-dashed border-amber-500/30',
        className
      )}
    >
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute -top-2 left-3 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 sm:left-4 sm:px-2 sm:text-xs">
          Soon
        </div>
      )}
      
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-400 sm:text-sm">{label}</p>
          <p className={cn(
            'mt-1 text-xl font-bold sm:mt-2 sm:text-3xl',
            isComingSoon ? 'text-gray-500' : 'text-white'
          )}>
            {isComingSoon ? '—' : value}
          </p>
          {subtitle && (
            <p className={cn(
              'mt-0.5 truncate text-xs sm:mt-1 sm:text-sm',
              isComingSoon ? 'text-amber-500/60' : 'text-gray-500'
            )}>
              {subtitle}
            </p>
          )}
          {trend && trendValue && !isComingSoon && (
            <div className={cn('mt-1 flex items-center gap-1 text-xs sm:mt-2 sm:text-sm', trendColors[trend])}>
              <span>{trendArrows[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'shrink-0 rounded-lg p-2 sm:p-3 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-6 sm:[&>svg]:w-6',
            isComingSoon 
              ? 'bg-gray-500/10 text-gray-500' 
              : 'bg-amber-500/10 text-amber-500'
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}


