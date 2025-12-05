/**
 * React Query hook for XANDSCOPE Stats Service
 * 
 * This hook fetches aggregated network stats from the XANDSCOPE stats service,
 * which collects data from pNodes that have opted-in to stats reporting.
 * 
 * The stats service provides:
 * - Total storage capacity across reporting pNodes
 * - Storage dedicated to Xandeum
 * - Count of reporting pNodes
 * - Last update timestamp
 */

'use client';

import { useQuery } from '@tanstack/react-query';

// Stats service URL - will use deployed service in production
const STATS_SERVICE_URL = process.env.NEXT_PUBLIC_STATS_SERVICE_URL || 'https://stats.xandscope.io';

/**
 * Response type from stats service
 */
export interface StatsServiceResponse {
  ok: boolean;
  data?: {
    totalPNodes: number;
    onlinePNodes: number;
    totalStorageCapacity: number;
    totalStorageUsed: number;
    totalStorageDedicated: number;
    averageStoragePerNode: number;
    lastUpdated: string;
  };
  error?: string;
}

/**
 * Normalized stats from the service
 */
export interface ServiceStats {
  reportingPNodes: number;
  onlineReportingPNodes: number;
  totalStorageCapacity: number;
  totalStorageUsed: number;
  totalStorageDedicated: number;
  averageStoragePerNode: number;
  lastUpdated: Date;
  isAvailable: boolean;
}

/**
 * Fetch network stats from the XANDSCOPE stats service
 */
async function fetchStatsServiceData(): Promise<ServiceStats | null> {
  try {
    const response = await fetch(`${STATS_SERVICE_URL}/api/network/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't wait too long - gracefully degrade if service is down
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn('[StatsService] HTTP error:', response.status);
      return null;
    }

    const data: StatsServiceResponse = await response.json();

    if (!data.ok || !data.data) {
      console.warn('[StatsService] Invalid response:', data.error);
      return null;
    }

    return {
      reportingPNodes: data.data.totalPNodes,
      onlineReportingPNodes: data.data.onlinePNodes,
      totalStorageCapacity: data.data.totalStorageCapacity,
      totalStorageUsed: data.data.totalStorageUsed,
      totalStorageDedicated: data.data.totalStorageDedicated,
      averageStoragePerNode: data.data.averageStoragePerNode,
      lastUpdated: new Date(data.data.lastUpdated),
      isAvailable: true,
    };
  } catch (error) {
    // Service might not be deployed yet - this is fine, gracefully degrade
    if (error instanceof Error) {
      // Don't log timeout errors as warnings in development
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        console.log('[StatsService] Request timed out - service may not be available');
      } else {
        console.warn('[StatsService] Fetch error:', error.message);
      }
    }
    return null;
  }
}

/**
 * Query key for stats service
 */
export const STATS_SERVICE_QUERY_KEY = ['statsService'] as const;

/**
 * Hook to fetch stats from XANDSCOPE stats service
 * 
 * Features:
 * - Graceful degradation if service unavailable
 * - Aggressive caching (data doesn't change that fast)
 * - Background refresh every 60 seconds
 */
export function useStatsService() {
  return useQuery({
    queryKey: STATS_SERVICE_QUERY_KEY,
    queryFn: fetchStatsServiceData,
    // Stats don't change rapidly - keep fresh for 30 seconds
    staleTime: 30 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Refresh every 60 seconds
    refetchInterval: 60 * 1000,
    // Don't refetch on focus - data isn't that time-sensitive
    refetchOnWindowFocus: false,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
    // Only retry once - if service is down, don't spam
    retry: 1,
    retryDelay: 3000,
  });
}

/**
 * Check if stats service is available
 */
export function useStatsServiceStatus() {
  const { data, isLoading, error } = useStatsService();
  
  return {
    isAvailable: data?.isAvailable ?? false,
    isLoading,
    hasError: !!error || (data === null && !isLoading),
  };
}



