/**
 * View Toggle Component
 * Switch between Table view and Globe view
 */

'use client';

import { cn } from '@/lib/utils';
import { LayoutList, Globe2 } from 'lucide-react';

export type ViewMode = 'table' | 'globe';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ currentView, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-1 sm:gap-1', className)}>
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:py-2 sm:text-sm',
          currentView === 'table'
            ? 'bg-amber-500 text-black'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        )}
      >
        <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">Table</span>
      </button>
      <button
        onClick={() => onViewChange('globe')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:py-2 sm:text-sm',
          currentView === 'globe'
            ? 'bg-amber-500 text-black'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        )}
      >
        <Globe2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">Globe</span>
        <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[8px] font-bold text-amber-400 sm:ml-1 sm:px-1.5 sm:text-[10px]">
          SOON
        </span>
      </button>
    </div>
  );
}


