/**
 * React Query hooks for pNode data
 * 
 * CACHING STRATEGY:
 * - staleTime: Data considered fresh for this duration (no refetch)
 * - gcTime: Keep data in cache for this duration after unmount
 * - refetchOnWindowFocus: Refresh when user returns to tab
 * - placeholderData: Show cached data while fetching fresh data
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { 
  fetchAllPNodes, 
  fetchPNodeByPublicKey,
  checkConnectionStatus,
  calculateNetworkStats
} from '@/services/xandeum-rpc';
import { APP_CONFIG } from '@/config/xandeum';
import type { 
  PNode, 
  NetworkStats, 
  PNodeFilters,
  SortConfig
} from '@/types/pnode';

/**
 * Query keys for caching
 */
export const QUERY_KEYS = {
  pnodes: ['pnodes'] as const,
  pnode: (id: string) => ['pnode', id] as const,
  networkStats: ['networkStats'] as const,
  connectionStatus: ['connectionStatus'] as const,
} as const;

/**
 * Hook to fetch all pNodes
 * OPTIMIZED: Aggressive caching with stale-while-revalidate
 */
export function usePNodes() {
  return useQuery({
    queryKey: QUERY_KEYS.pnodes,
    queryFn: fetchAllPNodes,
    // Data is fresh for 30 seconds - no refetch during this time
    staleTime: 30 * 1000,
    // Keep cached data for 5 minutes after component unmounts
    gcTime: 5 * 60 * 1000,
    // Refresh in background every 60 seconds
    refetchInterval: 60 * 1000,
    // Don't refetch on window focus if data is fresh
    refetchOnWindowFocus: 'always',
    // Keep previous data while fetching new data (prevents loading flash)
    placeholderData: (previousData) => previousData,
    // Retry with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch a single pNode by public key
 */
export function usePNode(publicKey: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.pnode(publicKey ?? ''),
    queryFn: () => publicKey ? fetchPNodeByPublicKey(publicKey) : null,
    enabled: !!publicKey,
    staleTime: APP_CONFIG.staleThreshold,
    retry: 2,
  });
}

/**
 * Hook to get connection status
 * Less frequent polling since it's just for status indication
 */
export function useConnectionStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.connectionStatus,
    queryFn: checkConnectionStatus,
    staleTime: 15 * 1000, // Fresh for 15 seconds
    gcTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchInterval: 30 * 1000, // Check every 30 seconds
    refetchOnWindowFocus: false, // Don't spam on tab switch
    retry: 1,
  });
}

/**
 * Hook to get network statistics
 * OPTIMIZED: Memoized calculation from pNode data
 */
export function useNetworkStats() {
  const { data: pnodes, isLoading, error } = usePNodes();
  
  // Memoize stats calculation - only recalculate when pnodes change
  const stats = useMemo(() => {
    if (!pnodes) return null;
    return calculateNetworkStats(pnodes);
  }, [pnodes]);
  
  return {
    data: stats,
    isLoading,
    error,
  };
}

/**
 * Filter pNodes based on criteria
 */
function filterPNodes(pnodes: PNode[], filters: PNodeFilters): PNode[] {
  return pnodes.filter((pnode) => {
    // Status filter
    if (filters.status !== 'all' && pnode.status !== filters.status) {
      return false;
    }
    
    // Health tier filter
    if (filters.healthTier !== 'all' && pnode.healthTier !== filters.healthTier) {
      return false;
    }
    
    // Minimum health score filter
    if (filters.minHealthScore !== null && pnode.healthScore < filters.minHealthScore) {
      return false;
    }
    
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesPublicKey = pnode.publicKey.toLowerCase().includes(query);
      const matchesOwner = pnode.ownerPublicKey?.toLowerCase().includes(query) ?? false;
      if (!matchesPublicKey && !matchesOwner) {
        return false;
      }
    }
    
    // Country filter
    if (filters.country && pnode.location?.countryCode !== filters.country) {
      return false;
    }
    
    return true;
  });
}

/**
 * Sort pNodes based on configuration
 */
function sortPNodes(pnodes: PNode[], sortConfig: SortConfig): PNode[] {
  return [...pnodes].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    
    // Handle null values
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
    if (bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
    
    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    }
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Hook to get filtered and sorted pNodes
 * OPTIMIZED: Memoized filtering and sorting
 */
export function useFilteredPNodes(
  filters: PNodeFilters,
  sortConfig: SortConfig
) {
  const { data: pnodes, isLoading, error, refetch, isFetching } = usePNodes();
  
  // Memoize filtering - only recalculate when pnodes or filters change
  const filteredPNodes = useMemo(() => {
    if (!pnodes) return [];
    return filterPNodes(pnodes, filters);
  }, [pnodes, filters]);
  
  // Memoize sorting - only recalculate when filtered list or sort config changes
  const sortedPNodes = useMemo(() => {
    return sortPNodes(filteredPNodes, sortConfig);
  }, [filteredPNodes, sortConfig]);
  
  return {
    data: sortedPNodes,
    totalCount: sortedPNodes.length,
    unfilteredCount: pnodes?.length ?? 0,
    isLoading,
    // Show subtle loading state during background refresh
    isRefreshing: isFetching && !isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to prefetch pNode data
 */
export function usePrefetchPNode() {
  const queryClient = useQueryClient();
  
  return (publicKey: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.pnode(publicKey),
      queryFn: () => fetchPNodeByPublicKey(publicKey),
      staleTime: APP_CONFIG.staleThreshold,
    });
  };
}

/**
 * Hook to invalidate and refetch pNode data
 */
export function useRefreshPNodes() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pnodes });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.networkStats });
  };
}

