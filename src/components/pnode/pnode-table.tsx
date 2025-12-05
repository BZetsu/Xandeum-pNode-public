/**
 * pNode Table Component
 * Displays a list of pNodes in a table format
 */

'use client';

import { useState } from 'react';
import { useFilteredPNodes, useRefreshPNodes } from '@/hooks/use-pnodes';
import { 
  cn, 
  getStatusBgColor, 
  getHealthColor, 
  formatPercentage,
  formatRelativeTime,
  copyToClipboard 
} from '@/lib/utils';
import { 
  Search, 
  RefreshCw, 
  Copy, 
  Check,
  ChevronUp,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import type { PNode, PNodeFilters, SortConfig } from '@/types/pnode';

const DEFAULT_FILTERS: PNodeFilters = {
  status: 'all',
  healthTier: 'all',
  minHealthScore: null,
  searchQuery: '',
  country: null,
};

const DEFAULT_SORT: SortConfig = {
  field: 'healthScore',
  direction: 'desc',
};

export function PNodeTable() {
  const [filters, setFilters] = useState<PNodeFilters>(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { data: pnodes, totalCount, unfilteredCount, isLoading, isRefreshing, refetch } = useFilteredPNodes(
    filters,
    sortConfig
  );
  const refreshPNodes = useRefreshPNodes();

  const handleSort = (field: keyof PNode) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleStatusFilter = (status: PNodeFilters['status']) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleCopy = async (publicKey: string) => {
    const success = await copyToClipboard(publicKey);
    if (success) {
      setCopiedId(publicKey);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRefresh = () => {
    refreshPNodes();
    refetch();
  };

  const SortIcon = ({ field }: { field: keyof PNode }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with Search and Filters */}
      <div className="space-y-3">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-lg font-semibold text-white sm:text-xl">pNodes</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400 sm:px-3 sm:py-1 sm:text-sm">
              {totalCount} of {unfilteredCount}
            </span>
            {isRefreshing && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                syncing
              </span>
            )}
          </div>
          </div>
          
          {/* Refresh Button - always visible */}
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/10 disabled:opacity-50 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', (isLoading || isRefreshing) && 'animate-spin')} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
        
        {/* Search Row */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by public key..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        
        {/* Status Filter - Horizontal scroll on mobile */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex w-max items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-1 sm:w-auto">
            {(['all', 'online', 'offline', 'degraded'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-all sm:px-3 sm:text-sm',
                  filters.status === status
                    ? 'bg-amber-500 text-black'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                )}
              >
                {status !== 'all' && (
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      status === 'online' && 'bg-green-500',
                      status === 'offline' && 'bg-red-500',
                      status === 'degraded' && 'bg-yellow-500',
                      filters.status === status && 'ring-1 ring-black/20'
                    )}
                  />
                )}
                <span className="capitalize">{status === 'all' ? 'All' : status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile scroll hint */}
      <p className="text-xs text-gray-500 sm:hidden">
        ← Scroll horizontally to see more →
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="whitespace-nowrap px-3 py-2.5 text-left sm:px-4 sm:py-3">
                  <button
                    onClick={() => handleSort('publicKey')}
                    className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 hover:text-white sm:text-xs"
                  >
                    Public Key
                    <SortIcon field="publicKey" />
                  </button>
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-left sm:px-4 sm:py-3">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 hover:text-white sm:text-xs"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-left sm:px-4 sm:py-3">
                  <button
                    onClick={() => handleSort('healthScore')}
                    className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 hover:text-white sm:text-xs"
                  >
                    Health
                    <SortIcon field="healthScore" />
                  </button>
                </th>
                <th className="hidden whitespace-nowrap px-3 py-2.5 text-left sm:table-cell sm:px-4 sm:py-3">
                  <button
                    onClick={() => handleSort('uptimePercentage')}
                    className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 hover:text-white sm:text-xs"
                  >
                    Uptime
                    <SortIcon field="uptimePercentage" />
                  </button>
                </th>
                <th className="hidden whitespace-nowrap px-3 py-2.5 text-left md:table-cell sm:px-4 sm:py-3">
                  <button
                    onClick={() => handleSort('lastSeen')}
                    className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 hover:text-white sm:text-xs"
                  >
                    Last Seen
                    <SortIcon field="lastSeen" />
                  </button>
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right sm:px-4 sm:py-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:text-xs">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 rounded bg-white/10" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 rounded bg-white/10" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 rounded bg-white/10" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 rounded bg-white/10" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 rounded bg-white/10" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-8 rounded bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : pnodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    {filters.searchQuery || filters.status !== 'all'
                      ? 'No pNodes match your filters'
                      : 'No pNodes found on the network'}
                  </td>
                </tr>
              ) : (
                pnodes.map((pnode) => (
                  <PNodeRow
                    key={pnode.id}
                    pnode={pnode}
                    isCopied={copiedId === pnode.publicKey}
                    onCopy={handleCopy}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface PNodeRowProps {
  pnode: PNode;
  isCopied: boolean;
  onCopy: (publicKey: string) => void;
}

function PNodeRow({ pnode, isCopied, onCopy }: PNodeRowProps) {
  return (
    <tr className="transition-colors hover:bg-white/[0.02]">
      <td className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-xs text-white sm:text-sm">
            {pnode.publicKeyShort}
          </span>
          <button
            onClick={() => onCopy(pnode.publicKey)}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            title="Copy full public key"
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={cn('h-2 w-2 rounded-full', getStatusBgColor(pnode.status))} />
          <span className="text-xs capitalize text-gray-300 sm:text-sm">{pnode.status}</span>
        </div>
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10 sm:w-24">
            <div
              className={cn(
                'h-full rounded-full',
                pnode.healthScore >= 70 ? 'bg-green-500' : 
                pnode.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${pnode.healthScore}%` }}
            />
          </div>
          <span className={cn('text-xs font-medium sm:text-sm', getHealthColor(pnode.healthScore))}>
            {pnode.healthScore}%
          </span>
        </div>
      </td>
      <td className="hidden px-3 py-3 sm:table-cell sm:px-4 sm:py-4">
        <span className="text-xs text-gray-300 sm:text-sm">
          {formatPercentage(pnode.uptimePercentage)}
        </span>
      </td>
      <td className="hidden px-3 py-3 md:table-cell sm:px-4 sm:py-4">
        <span className="text-xs text-gray-500 sm:text-sm">
          {formatRelativeTime(pnode.lastSeen)}
        </span>
      </td>
      <td className="px-3 py-3 text-right sm:px-4 sm:py-4">
        <button
          className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white sm:p-1.5"
          title="View details"
        >
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </td>
    </tr>
  );
}

