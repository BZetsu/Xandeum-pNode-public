/**
 * Main Dashboard Component
 * Combines all dashboard elements with view toggle
 */

'use client';

import { useState } from 'react';
import { NetworkStats } from './network-stats';
import { PNodeTable } from '@/components/pnode/pnode-table';
import { GlobeView } from './globe-view';
import { ViewToggle, type ViewMode } from './view-toggle';

export function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Network Stats Section */}
      <section>
        <NetworkStats />
      </section>

      {/* View Toggle */}
      <section className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white sm:text-xl">pNode Network</h2>
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </section>

      {/* Dynamic View Section */}
      <section>
        {viewMode === 'table' ? (
          <PNodeTable />
        ) : (
          <GlobeView className="h-[400px] sm:h-[500px] md:h-[600px]" />
        )}
      </section>
    </div>
  );
}

