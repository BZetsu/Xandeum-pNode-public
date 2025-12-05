/**
 * Xandeum pNode Type Definitions
 * All types are strictly defined - NO 'any' types allowed
 */

/**
 * Status of a pNode on the network
 */
export type PNodeStatus = 'online' | 'offline' | 'degraded' | 'unknown';

/**
 * Health tier classification for pNodes
 */
export type HealthTier = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

/**
 * Raw pNode data from the Xandeum network
 */
export interface PNodeRaw {
  /** Public key of the pNode (Base58 encoded) */
  publicKey: string;
  /** Registry PDA for this pNode */
  registryPda: string;
  /** Owner/Manager public key */
  ownerPublicKey: string | null;
  /** Slot when the pNode was registered */
  registrationSlot: number | null;
  /** Raw account data length in bytes */
  dataLength: number;
}

/**
 * Processed pNode data with computed fields
 */
export interface PNode {
  /** Unique identifier - the pNode's public key (Base58) */
  id: string;
  /** Public key of the pNode (Base58 encoded) */
  publicKey: string;
  /** Short version of public key for display */
  publicKeyShort: string;
  /** Registry PDA address */
  registryPda: string;
  /** Owner/Manager public key */
  ownerPublicKey: string | null;
  /** Current status */
  status: PNodeStatus;
  /** Uptime percentage (0-100) */
  uptimePercentage: number;
  /** Health score (0-100) */
  healthScore: number;
  /** Health tier classification */
  healthTier: HealthTier;
  /** Storage capacity in bytes */
  storageCapacityBytes: number | null;
  /** Storage used in bytes */
  storageUsedBytes: number | null;
  /** Storage utilization percentage (0-100) */
  storageUtilization: number | null;
  /** When the pNode was first seen */
  firstSeen: Date;
  /** When the pNode was last seen active */
  lastSeen: Date;
  /** Network latency in milliseconds */
  latencyMs: number | null;
  /** Geographic location (if available) */
  location: PNodeLocation | null;
  /** Version of xandminer software */
  version: string | null;
  /** Registration slot on chain */
  registrationSlot: number | null;
}

/**
 * Geographic location information
 */
export interface PNodeLocation {
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Country name */
  country: string;
  /** City name */
  city: string | null;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Region/State */
  region: string | null;
}

/**
 * Network-wide statistics
 */
export interface NetworkStats {
  /** Total number of registered pNodes */
  totalPNodes: number;
  /** Number of pNodes currently online */
  onlinePNodes: number;
  /** Number of pNodes currently offline */
  offlinePNodes: number;
  /** Network-wide uptime percentage */
  networkUptime: number;
  /** Total storage capacity across all pNodes (bytes) */
  totalStorageCapacity: number;
  /** Total storage used across all pNodes (bytes) */
  totalStorageUsed: number;
  /** Network storage utilization percentage */
  storageUtilization: number;
  /** Average health score across all pNodes */
  averageHealthScore: number;
  /** Timestamp of stats calculation */
  calculatedAt: Date;
  /** Number of unique countries with pNodes */
  uniqueCountries: number;
}

/**
 * Historical data point for charts
 */
export interface HistoricalDataPoint {
  /** Timestamp of the data point */
  timestamp: Date;
  /** Value at this point */
  value: number;
  /** Label for display */
  label: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  /** Field to sort by */
  field: keyof PNode;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration for pNode queries
 */
export interface PNodeFilters {
  /** Filter by status */
  status: PNodeStatus | 'all';
  /** Filter by health tier */
  healthTier: HealthTier | 'all';
  /** Minimum health score */
  minHealthScore: number | null;
  /** Search query (matches public key or owner) */
  searchQuery: string;
  /** Filter by country */
  country: string | null;
}

/**
 * Paginated response for pNode list
 */
export interface PaginatedPNodes {
  /** Array of pNodes for current page */
  pnodes: PNode[];
  /** Total count of pNodes matching filters */
  totalCount: number;
  /** Current page number */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNextPage: boolean;
  /** Whether there's a previous page */
  hasPreviousPage: boolean;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (if successful) */
  data: T | null;
  /** Error message (if failed) */
  error: string | null;
  /** Timestamp of response */
  timestamp: Date;
}

/**
 * Connection status to the Xandeum network
 */
export interface ConnectionStatus {
  /** Whether connected to RPC */
  isConnected: boolean;
  /** RPC endpoint URL */
  endpoint: string;
  /** Current slot number */
  currentSlot: number | null;
  /** Network latency to RPC */
  latencyMs: number | null;
  /** Last successful connection time */
  lastConnected: Date | null;
  /** Error message if disconnected */
  error: string | null;
}



