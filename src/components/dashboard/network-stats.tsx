/**
 * Network Stats Component
 * Displays overall network statistics
 * 
 * Data sources:
 * - On-chain data: pNode count, online status (from Xandeum RPC)
 * - Stats service: Storage capacity, dedicated storage (from reporting pNodes)
 */

'use client';

import { useNetworkStats, useConnectionStatus } from '@/hooks/use-pnodes';
import { useStatsService } from '@/hooks/use-stats-service';
import { StatCard } from './stat-card';
import { formatBytes, formatPercentage, formatNumber } from '@/lib/utils';
import { 
  Server, 
  Activity, 
  HardDrive, 
  Gauge, 
  Globe, 
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';

export function NetworkStats() {
  const { data: stats, isLoading } = useNetworkStats();
  const { data: connectionStatus } = useConnectionStatus();
  const { data: serviceStats, isLoading: isServiceLoading } = useStatsService();
  
  // Determine if we have storage data from the stats service
  const hasStorageData = serviceStats?.isAvailable && serviceStats.totalStorageDedicated > 0;

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {connectionStatus?.isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
              <span className="text-xs text-gray-300 sm:text-sm">
                Connected to Xandeum DevNet
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
              <span className="text-xs text-gray-300 sm:text-sm">
                Disconnected from network
              </span>
            </>
          )}
        </div>
        {connectionStatus?.latencyMs && (
          <span className="text-xs text-gray-500">
            Latency: {connectionStatus.latencyMs}ms
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard
          label="Total pNodes"
          value={stats ? formatNumber(stats.totalPNodes) : '—'}
          icon={<Server className="h-6 w-6" />}
          isLoading={isLoading}
        />
        
        <StatCard
          label="Online"
          value={stats ? formatNumber(stats.onlinePNodes) : '—'}
          subtitle={stats ? `${formatPercentage(stats.networkUptime)} uptime` : undefined}
          icon={<Activity className="h-6 w-6" />}
          trend={stats && stats.networkUptime >= 95 ? 'up' : 'neutral'}
          isLoading={isLoading}
        />
        
        <StatCard
          label="Offline"
          value={stats ? formatNumber(stats.offlinePNodes) : '—'}
          icon={<Server className="h-6 w-6" />}
          trend={stats && stats.offlinePNodes > 0 ? 'down' : 'up'}
          isLoading={isLoading}
        />
        
        <StatCard
          label="Total Storage"
          value={hasStorageData ? formatBytes(serviceStats.totalStorageDedicated) : '—'}
          subtitle={hasStorageData 
            ? `${serviceStats.onlineReportingPNodes} pNodes reporting` 
            : 'Coming Soon'
          }
          icon={<HardDrive className="h-6 w-6" />}
          isLoading={isLoading || isServiceLoading}
          isComingSoon={!hasStorageData}
        />
        
        <StatCard
          label="Avg Health"
          value={stats ? `${stats.averageHealthScore}%` : '—'}
          icon={<Gauge className="h-6 w-6" />}
          trend={stats && stats.averageHealthScore >= 70 ? 'up' : 'down'}
          isLoading={isLoading}
        />
        
        <StatCard
          label="Countries"
          value="Soon"
          subtitle="Location data pending"
          icon={<Globe className="h-6 w-6" />}
          isLoading={isLoading}
          isComingSoon
        />
      </div>
    </div>
  );
}


