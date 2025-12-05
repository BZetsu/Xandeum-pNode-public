# XANDSCOPE Implementation Plan
## Technical Implementation Guide

---

## 1. Project Setup

### 1.1 Initialize Next.js Project

```bash
# Create project with pnpm
pnpm create next-app@14 xandscope --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd xandscope

# Install core dependencies
pnpm add @xandeum/web3.js @solana/web3.js zustand @tanstack/react-query zod

# Install UI dependencies
pnpm add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add @radix-ui/react-select @radix-ui/react-tooltip @radix-ui/react-tabs
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Install visualization dependencies
pnpm add recharts @tremor/react framer-motion

# Install utility dependencies
pnpm add date-fns numeral @tanstack/react-table

# Dev dependencies
pnpm add -D @types/node prettier prettier-plugin-tailwindcss
```

### 1.2 Project Structure

```
xandscope/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   └── layout.tsx            # Dashboard layout
│   │   ├── pnode/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Individual pNode page
│   │   ├── api/
│   │   │   ├── pnodes/
│   │   │   │   └── route.ts          # pNode list endpoint
│   │   │   ├── pnode/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # Individual pNode endpoint
│   │   │   └── stats/
│   │   │       └── route.ts          # Network stats endpoint
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── dashboard/
│   │   │   ├── NetworkStats.tsx
│   │   │   ├── PNodeTable.tsx
│   │   │   ├── SearchFilter.tsx
│   │   │   └── HealthBadge.tsx
│   │   ├── pnode/
│   │   │   ├── PNodeDetail.tsx
│   │   │   ├── StorageChart.tsx
│   │   │   └── PerformanceGraph.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── shared/
│   │       ├── Loading.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── xandeum/
│   │   │   ├── connection.ts         # pRPC connection
│   │   │   ├── pnode.ts              # pNode API calls
│   │   │   └── types.ts              # Type definitions
│   │   ├── utils.ts                  # Utility functions
│   │   └── constants.ts              # Constants & config
│   ├── hooks/
│   │   ├── usePNodes.ts
│   │   ├── usePNode.ts
│   │   ├── useNetworkStats.ts
│   │   └── useSearch.ts
│   ├── store/
│   │   └── index.ts                  # Zustand store
│   └── types/
│       └── index.ts                  # Global types
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 2. Core Implementation

### 2.1 Xandeum Connection (`src/lib/xandeum/connection.ts`)

```typescript
import { Connection } from '@solana/web3.js';

// Xandeum RPC endpoints (to be confirmed)
const XANDEUM_ENDPOINTS = {
  mainnet: 'https://rpc.xandeum.network',
  devnet: 'https://devnet.rpc.xandeum.network',
  testnet: 'https://testnet.rpc.xandeum.network',
};

export type NetworkType = keyof typeof XANDEUM_ENDPOINTS;

class XandeumConnection {
  private connection: Connection;
  private network: NetworkType;

  constructor(network: NetworkType = 'devnet') {
    this.network = network;
    this.connection = new Connection(XANDEUM_ENDPOINTS[network], 'confirmed');
  }

  getConnection(): Connection {
    return this.connection;
  }

  async getClusterPNodes(): Promise<PNodeInfo[]> {
    // This is the critical pRPC call mentioned in the bounty
    // Method name may vary - need to confirm with Xandeum docs/Discord
    try {
      const response = await this.connection.getProgramAccounts(
        // Xandeum pNode program ID (to be obtained)
        new PublicKey('XANDEUM_PNODE_PROGRAM_ID')
      );
      
      return this.parsePNodeAccounts(response);
    } catch (error) {
      console.error('Failed to fetch pNodes:', error);
      throw error;
    }
  }

  async getPNodeInfo(nodeId: string): Promise<PNodeDetail> {
    // Fetch detailed information for a specific pNode
    const info = await this.connection.getAccountInfo(new PublicKey(nodeId));
    return this.parsePNodeDetail(info);
  }

  // Alternative: Direct JSON-RPC call
  async getClusterPNodesRPC(): Promise<PNodeInfo[]> {
    const response = await fetch(XANDEUM_ENDPOINTS[this.network], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getClusterPNodes', // Method name TBC
        params: [],
      }),
    });
    
    const data = await response.json();
    return data.result;
  }

  private parsePNodeAccounts(accounts: AccountInfo[]): PNodeInfo[] {
    // Parse raw account data into PNodeInfo objects
    return accounts.map(account => ({
      // Mapping logic here
    }));
  }

  private parsePNodeDetail(info: AccountInfo): PNodeDetail {
    // Parse detailed pNode information
    return {
      // Mapping logic here
    };
  }
}

export const xandeum = new XandeumConnection(
  (process.env.NEXT_PUBLIC_XANDEUM_NETWORK as NetworkType) || 'devnet'
);
```

### 2.2 Type Definitions (`src/lib/xandeum/types.ts`)

```typescript
export interface PNodeInfo {
  id: string;
  publicKey: string;
  status: PNodeStatus;
  version: string;
  
  // Network
  endpoint: string;
  ip?: string;
  port?: number;
  
  // Performance
  uptime: number;           // 0-100 percentage
  latency: number;          // milliseconds
  lastSeen: string;         // ISO date
  
  // Storage
  storageCapacity: bigint;  // bytes
  storageUsed: bigint;      // bytes
  storageUtilization: number; // 0-100 percentage
  
  // Operations
  operations: {
    poke: OperationStats;
    peek: OperationStats;
    prove: OperationStats;
  };
  
  // Location (optional)
  location?: GeoLocation;
  
  // Computed
  healthScore: number;      // 0-100
}

export interface PNodeDetail extends PNodeInfo {
  // Extended details
  operator?: string;
  description?: string;
  website?: string;
  
  // Historical data
  uptimeHistory: TimeSeriesData[];
  latencyHistory: TimeSeriesData[];
  operationsHistory: TimeSeriesData[];
  
  // Recent activity
  recentProofs: ProofRecord[];
  recentErrors: ErrorRecord[];
}

export type PNodeStatus = 'active' | 'inactive' | 'syncing' | 'unknown';

export interface OperationStats {
  total: number;
  last24h: number;
  last7d: number;
  successRate: number;
}

export interface GeoLocation {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  lat: number;
  lng: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface ProofRecord {
  id: string;
  timestamp: string;
  type: string;
  success: boolean;
  duration: number;
}

export interface ErrorRecord {
  id: string;
  timestamp: string;
  code: string;
  message: string;
}

export interface NetworkStats {
  totalPNodes: number;
  activePNodes: number;
  inactivePNodes: number;
  syncingPNodes: number;
  
  totalStorage: bigint;
  usedStorage: bigint;
  storageUtilization: number;
  
  avgUptime: number;
  avgLatency: number;
  avgHealthScore: number;
  
  totalOperations24h: number;
  proofSuccessRate: number;
  
  // Trends
  pnodesTrend: number;      // % change
  storageTrend: number;
  performanceTrend: number;
}

export interface SearchFilters {
  query: string;
  status: PNodeStatus | 'all';
  minHealthScore: number;
  maxLatency: number;
  location?: string;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
}

export type SortField = 
  | 'healthScore' 
  | 'uptime' 
  | 'latency' 
  | 'storage' 
  | 'operations';
```

### 2.3 API Routes

#### `src/app/api/pnodes/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { xandeum } from '@/lib/xandeum/connection';

export async function GET(request: NextRequest) {
  try {
    const pnodes = await xandeum.getClusterPNodes();
    
    // Calculate health scores
    const enrichedPNodes = pnodes.map(pnode => ({
      ...pnode,
      healthScore: calculateHealthScore(pnode),
    }));
    
    return NextResponse.json({
      success: true,
      data: enrichedPNodes,
      count: enrichedPNodes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pNodes' },
      { status: 500 }
    );
  }
}

function calculateHealthScore(pnode: PNodeInfo): number {
  const weights = {
    uptime: 0.30,
    latency: 0.25,
    proofSuccess: 0.30,
    storage: 0.15,
  };
  
  // Normalize metrics to 0-100 scale
  const uptimeScore = pnode.uptime;
  const latencyScore = Math.max(0, 100 - (pnode.latency / 10)); // Lower is better
  const proofScore = pnode.operations.prove.successRate;
  const storageScore = pnode.storageUtilization < 90 ? 100 : 100 - (pnode.storageUtilization - 90) * 10;
  
  return Math.round(
    uptimeScore * weights.uptime +
    latencyScore * weights.latency +
    proofScore * weights.proofSuccess +
    storageScore * weights.storage
  );
}
```

#### `src/app/api/stats/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { xandeum } from '@/lib/xandeum/connection';

export async function GET() {
  try {
    const pnodes = await xandeum.getClusterPNodes();
    
    const stats: NetworkStats = {
      totalPNodes: pnodes.length,
      activePNodes: pnodes.filter(p => p.status === 'active').length,
      inactivePNodes: pnodes.filter(p => p.status === 'inactive').length,
      syncingPNodes: pnodes.filter(p => p.status === 'syncing').length,
      
      totalStorage: pnodes.reduce((sum, p) => sum + p.storageCapacity, 0n),
      usedStorage: pnodes.reduce((sum, p) => sum + p.storageUsed, 0n),
      storageUtilization: calculateStorageUtilization(pnodes),
      
      avgUptime: average(pnodes.map(p => p.uptime)),
      avgLatency: average(pnodes.map(p => p.latency)),
      avgHealthScore: average(pnodes.map(p => p.healthScore)),
      
      totalOperations24h: pnodes.reduce(
        (sum, p) => sum + p.operations.poke.last24h + p.operations.peek.last24h + p.operations.prove.last24h,
        0
      ),
      proofSuccessRate: average(pnodes.map(p => p.operations.prove.successRate)),
      
      // Trends would require historical data
      pnodesTrend: 0,
      storageTrend: 0,
      performanceTrend: 0,
    };
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateStorageUtilization(pnodes: PNodeInfo[]): number {
  const total = pnodes.reduce((sum, p) => sum + Number(p.storageCapacity), 0);
  const used = pnodes.reduce((sum, p) => sum + Number(p.storageUsed), 0);
  return total > 0 ? (used / total) * 100 : 0;
}
```

### 2.4 React Query Hooks

#### `src/hooks/usePNodes.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { PNodeInfo, SearchFilters } from '@/lib/xandeum/types';

async function fetchPNodes(): Promise<PNodeInfo[]> {
  const response = await fetch('/api/pnodes');
  if (!response.ok) throw new Error('Failed to fetch pNodes');
  const data = await response.json();
  return data.data;
}

export function usePNodes(filters?: SearchFilters) {
  return useQuery({
    queryKey: ['pnodes', filters],
    queryFn: fetchPNodes,
    select: (data) => filterAndSortPNodes(data, filters),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,       // Consider data stale after 10 seconds
  });
}

function filterAndSortPNodes(
  pnodes: PNodeInfo[],
  filters?: SearchFilters
): PNodeInfo[] {
  if (!filters) return pnodes;
  
  let result = [...pnodes];
  
  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase();
    result = result.filter(p => 
      p.id.toLowerCase().includes(query) ||
      p.publicKey.toLowerCase().includes(query)
    );
  }
  
  // Status filter
  if (filters.status !== 'all') {
    result = result.filter(p => p.status === filters.status);
  }
  
  // Health score filter
  if (filters.minHealthScore > 0) {
    result = result.filter(p => p.healthScore >= filters.minHealthScore);
  }
  
  // Latency filter
  if (filters.maxLatency < Infinity) {
    result = result.filter(p => p.latency <= filters.maxLatency);
  }
  
  // Location filter
  if (filters.location) {
    result = result.filter(p => 
      p.location?.country === filters.location ||
      p.location?.region === filters.location
    );
  }
  
  // Sorting
  result.sort((a, b) => {
    const aVal = getSortValue(a, filters.sortBy);
    const bVal = getSortValue(b, filters.sortBy);
    const modifier = filters.sortOrder === 'asc' ? 1 : -1;
    return (aVal - bVal) * modifier;
  });
  
  return result;
}

function getSortValue(pnode: PNodeInfo, field: string): number {
  switch (field) {
    case 'healthScore': return pnode.healthScore;
    case 'uptime': return pnode.uptime;
    case 'latency': return pnode.latency;
    case 'storage': return Number(pnode.storageUsed);
    case 'operations': return pnode.operations.poke.last24h + pnode.operations.peek.last24h;
    default: return 0;
  }
}
```

---

## 3. Component Implementation

### 3.1 Dashboard Page (`src/app/(dashboard)/page.tsx`)

```typescript
'use client';

import { NetworkStats } from '@/components/dashboard/NetworkStats';
import { PNodeTable } from '@/components/dashboard/PNodeTable';
import { SearchFilter } from '@/components/dashboard/SearchFilter';
import { usePNodes } from '@/hooks/usePNodes';
import { useNetworkStats } from '@/hooks/useNetworkStats';
import { useState } from 'react';
import { SearchFilters } from '@/lib/xandeum/types';

export default function DashboardPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    minHealthScore: 0,
    maxLatency: Infinity,
    sortBy: 'healthScore',
    sortOrder: 'desc',
  });
  
  const { data: pnodes, isLoading: pnodesLoading, error: pnodesError } = usePNodes(filters);
  const { data: stats, isLoading: statsLoading } = useNetworkStats();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#12121a]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            XANDSCOPE
          </h1>
          <p className="text-slate-400 mt-2">
            Xandeum pNode Analytics & Network Overview
          </p>
        </div>
        
        {/* Network Stats */}
        <NetworkStats stats={stats} isLoading={statsLoading} />
        
        {/* Search & Filters */}
        <SearchFilter filters={filters} onFiltersChange={setFilters} />
        
        {/* pNode Table */}
        <PNodeTable 
          pnodes={pnodes || []} 
          isLoading={pnodesLoading}
          error={pnodesError}
        />
      </div>
    </div>
  );
}
```

### 3.2 Network Stats Component (`src/components/dashboard/NetworkStats.tsx`)

```typescript
'use client';

import { NetworkStats as NetworkStatsType } from '@/lib/xandeum/types';
import { formatBytes, formatNumber, formatPercentage } from '@/lib/utils';
import { Activity, Database, Gauge, Server, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  stats?: NetworkStatsType;
  isLoading: boolean;
}

export function NetworkStats({ stats, isLoading }: Props) {
  const cards = [
    {
      title: 'Total pNodes',
      value: stats?.totalPNodes ?? 0,
      format: formatNumber,
      icon: Server,
      color: 'from-cyan-500 to-blue-500',
      subtitle: `${stats?.activePNodes ?? 0} active`,
    },
    {
      title: 'Total Storage',
      value: stats?.totalStorage ?? 0n,
      format: (v: bigint) => formatBytes(Number(v)),
      icon: Database,
      color: 'from-purple-500 to-pink-500',
      subtitle: `${formatPercentage(stats?.storageUtilization ?? 0)} utilized`,
    },
    {
      title: 'Avg Uptime',
      value: stats?.avgUptime ?? 0,
      format: formatPercentage,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Avg Latency',
      value: stats?.avgLatency ?? 0,
      format: (v: number) => `${v.toFixed(0)}ms`,
      icon: Gauge,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      title: 'Operations (24h)',
      value: stats?.totalOperations24h ?? 0,
      format: formatNumber,
      icon: Zap,
      color: 'from-cyan-500 to-purple-500',
    },
    {
      title: 'Proof Success',
      value: stats?.proofSuccessRate ?? 0,
      format: formatPercentage,
      icon: CheckCircle,
      color: 'from-green-400 to-cyan-500',
    },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity" />
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
            </div>
            {isLoading ? (
              <div className="h-8 bg-slate-800 animate-pulse rounded" />
            ) : (
              <>
                <div className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  {card.format(card.value)}
                </div>
                {card.subtitle && (
                  <div className="text-xs text-slate-500 mt-1">
                    {card.subtitle}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

### 3.3 pNode Table Component (`src/components/dashboard/PNodeTable.tsx`)

```typescript
'use client';

import { PNodeInfo } from '@/lib/xandeum/types';
import { HealthBadge } from './HealthBadge';
import { formatBytes, truncateAddress } from '@/lib/utils';
import { Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  pnodes: PNodeInfo[];
  isLoading: boolean;
  error: Error | null;
}

export function PNodeTable({ pnodes, isLoading, error }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-8 text-center">
        <p className="text-red-400">Failed to load pNodes</p>
        <p className="text-red-300/70 text-sm mt-2">{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Node ID
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Uptime
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Storage
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Latency
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Ops (24h)
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Health
              </th>
              <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 bg-slate-800 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : pnodes.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  No pNodes found matching your filters
                </td>
              </tr>
            ) : (
              pnodes.map((pnode, index) => (
                <tr 
                  key={pnode.id} 
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <span className="text-slate-300 font-mono">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="text-cyan-400 font-mono text-sm">
                        {truncateAddress(pnode.id)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(pnode.id)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                      >
                        <Copy className={`w-3 h-3 ${copiedId === pnode.id ? 'text-green-400' : 'text-slate-400'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={pnode.status} />
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300">
                      {pnode.uptime.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <span className="text-slate-300">
                        {formatBytes(Number(pnode.storageUsed))}
                      </span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-slate-400">
                        {formatBytes(Number(pnode.storageCapacity))}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`${pnode.latency < 100 ? 'text-green-400' : pnode.latency < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {pnode.latency}ms
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 font-mono">
                      {(pnode.operations.poke.last24h + pnode.operations.peek.last24h + pnode.operations.prove.last24h).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <HealthBadge score={pnode.healthScore} />
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/pnode/${pnode.id}`}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                    >
                      Details
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
    syncing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    unknown: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.unknown}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

---

## 4. Styling

### 4.1 Global Styles (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Background */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a2e;
  
  /* Accent */
  --accent-primary: #00d4ff;
  --accent-secondary: #7c3aed;
  
  /* Status */
  --status-active: #22c55e;
  --status-inactive: #ef4444;
  --status-syncing: #f59e0b;
}

@layer base {
  body {
    @apply bg-[#0a0a0f] text-white antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent;
  }
  
  .glow-cyan {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
  
  .glow-purple {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a2e;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### 4.2 Tailwind Config (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a2e',
        },
        accent: {
          cyan: '#00d4ff',
          purple: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px rgba(0, 212, 255, 0.2)' },
          to: { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 5. Testing Plan

### 5.1 Manual Testing Checklist

- [ ] pNode list loads correctly
- [ ] Network stats display accurate data
- [ ] Search filters work correctly
- [ ] Sorting works in both directions
- [ ] Individual pNode page loads
- [ ] Copy to clipboard works
- [ ] Responsive design on mobile
- [ ] Dark theme renders correctly
- [ ] Error states display properly
- [ ] Loading states are smooth

### 5.2 API Testing

```bash
# Test pNodes endpoint
curl http://localhost:3000/api/pnodes | jq

# Test stats endpoint
curl http://localhost:3000/api/stats | jq

# Test individual pNode
curl http://localhost:3000/api/pnode/NODE_ID | jq
```

---

## 6. Deployment

### 6.1 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### 6.2 Environment Variables

```env
# .env.local
NEXT_PUBLIC_XANDEUM_NETWORK=devnet
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_XANDEUM_NETWORK=mainnet
NEXT_PUBLIC_APP_URL=https://xandscope.vercel.app
```

---

## 7. Next Steps (After MVP)

1. **Real pRPC Integration**: Confirm exact API methods with Xandeum team
2. **Geographic Map**: Add Mapbox integration
3. **Historical Data**: Implement time-series storage
4. **WebSocket Updates**: Real-time data streaming
5. **User Accounts**: Save favorite pNodes
6. **Alerts**: Email/Discord notifications

---

*Implementation Plan v1.0 - December 4, 2025*

