/**
 * Xandeum Network Configuration
 * Contains all network-specific constants and addresses
 */

/**
 * Xandeum RPC Endpoints
 * 
 * NOTE: Xandeum does not provide an official public RPC.
 * For production, run your own pNode and set NEXT_PUBLIC_XANDEUM_RPC.
 * See: https://docs.xandeum.network
 */
export const XANDEUM_RPC_ENDPOINTS = {
  /** DevNet RPC endpoint (configurable via env) */
  devnet: process.env.NEXT_PUBLIC_XANDEUM_RPC || 'https://api.devnet.xandeum.com:8899',
  /** MainNet RPC endpoint (configurable via env) */
  mainnet: process.env.NEXT_PUBLIC_XANDEUM_RPC_MAINNET || 'https://api.mainnet.xandeum.com:8899',
} as const;

/**
 * Current active network
 */
export const CURRENT_NETWORK: keyof typeof XANDEUM_RPC_ENDPOINTS = 'devnet';

/**
 * Get the current RPC endpoint
 */
export function getRpcEndpoint(): string {
  return XANDEUM_RPC_ENDPOINTS[CURRENT_NETWORK];
}

/**
 * Xandeum Program IDs
 */
export const XANDEUM_PROGRAMS = {
  /** pNode Registry Program ID (DevNet) */
  pnodeRegistry: '6Bzz3KPvzQruqBg2vtsvkuitd6Qb4iCcr5DViifCwLsL',
} as const;

/**
 * Important Account Addresses
 */
export const XANDEUM_ACCOUNTS = {
  /** 
   * pNode Index Account - Contains list of ALL registered pNode public keys
   * Data structure: Array of 32-byte public keys
   */
  pnodeIndex: 'GHTUesiECzPRHTShmBGt9LiaA89T8VAzw8ZWNE6EvZRs',
} as const;

/**
 * PDA Seeds for deriving program addresses
 */
export const PDA_SEEDS = {
  /** Seed for individual pNode registry PDA: ["registry", pnodePublicKey] */
  registry: 'registry',
  /** Seed for global network state PDA: ["global"] */
  global: 'global',
  /** Seed for manager/owner PDA: ["manager", ownerPublicKey] */
  manager: 'manager',
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  /** Name of the application */
  appName: 'XANDSCOPE',
  /** Application description */
  appDescription: 'Real-time analytics dashboard for Xandeum pNodes',
  /** Data refresh interval in milliseconds */
  refreshInterval: 30000, // 30 seconds
  /** Stale data threshold in milliseconds */
  staleThreshold: 60000, // 1 minute
  /** Maximum pNodes to fetch in a single request */
  maxPNodesPerRequest: 100,
  /** Health score thresholds */
  healthThresholds: {
    excellent: 90,
    good: 70,
    fair: 50,
    poor: 30,
    // Below 30 is critical
  },
} as const;

/**
 * Solana System Program ID (for reference)
 */
export const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';

/**
 * Solana Rent Sysvar (for reference)
 */
export const SYSVAR_RENT_PUBKEY = 'SysvarRent111111111111111111111111111111111';



