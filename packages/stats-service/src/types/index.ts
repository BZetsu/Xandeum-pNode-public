import { z } from 'zod';

// Schema for drive information from pNode
export const DriveSchema = z.object({
  name: z.string(),
  capacity: z.number().nonnegative(),
  used: z.number().nonnegative(),
  dedicated: z.number().nonnegative().optional(),
  type: z.string().optional(),
});

// Schema for pNode info in report
export const PNodeInfoSchema = z.object({
  publicKey: z.string().min(32).max(64),
  isOnline: z.boolean(),
  versions: z.object({
    xandminerd: z.string().optional(),
    pod: z.string().optional(),
  }).optional(),
});

// Schema for storage data in report
export const StorageDataSchema = z.object({
  totalCapacity: z.number().nonnegative(),
  totalUsed: z.number().nonnegative(),
  totalDedicated: z.number().nonnegative(),
  drives: z.array(DriveSchema).optional(),
});

// Schema for network info in report (privacy-first: only hashes, never raw values)
export const NetworkInfoSchema = z.object({
  hostnameHash: z.string().max(16).optional(),
  ipHash: z.string().max(16).optional(),
});

// Full report schema from pNode
export const PNodeReportSchema = z.object({
  timestamp: z.string().datetime(),
  pnode: PNodeInfoSchema,
  storage: StorageDataSchema,
  network: NetworkInfoSchema.optional(),
  signature: z.string().optional(), // Ed25519 signature for verification
});

// Type exports
export type Drive = z.infer<typeof DriveSchema>;
export type PNodeInfo = z.infer<typeof PNodeInfoSchema>;
export type StorageData = z.infer<typeof StorageDataSchema>;
export type NetworkInfo = z.infer<typeof NetworkInfoSchema>;
export type PNodeReport = z.infer<typeof PNodeReportSchema>;

// Database types
export interface DBPNode {
  id: number;
  public_key: string;
  first_seen: Date;
  last_seen: Date;
  total_capacity: bigint;
  total_used: bigint;
  total_dedicated: bigint;
  xandminerd_version: string | null;
  pod_version: string | null;
  ip_hash: string | null;       // SHA-256 hash (first 16 chars) of IP
  hostname_hash: string | null; // SHA-256 hash (first 16 chars) of hostname
  is_online: boolean;
}

// Aggregated network stats response
export interface NetworkStats {
  totalPNodes: number;
  onlinePNodes: number;
  totalStorageCapacity: number;
  totalStorageUsed: number;
  totalStorageDedicated: number;
  averageStoragePerNode: number;
  lastUpdated: string;
}

// Individual pNode stats response
export interface PNodeStats {
  publicKey: string;
  isOnline: boolean;
  lastSeen: string;
  storage: {
    capacity: number;
    used: number;
    dedicated: number;
  };
  versions: {
    xandminerd: string | null;
    pod: string | null;
  };
}



