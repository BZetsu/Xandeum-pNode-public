/**
 * XANDSCOPE Stats Service - Database Layer
 * 
 * Handles PostgreSQL connection, schema initialization, and CRUD operations.
 * 
 * Schema: See ./schema.sql for full table definitions and comments.
 * 
 * Tables:
 * - pnodes: Individual pNode statistics (storage, versions, status)
 * - stats_history: Time-series snapshots for historical charts
 */

import { Pool } from 'pg';
import type { DBPNode, PNodeReport, NetworkStats, PNodeStats } from '../types/index.js';

// Connection pool (singleton)
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client:', err);
    });
  }
  return pool;
}

/**
 * Initialize database schema
 * 
 * Full schema documentation: see ./schema.sql
 */
export async function initializeDatabase(): Promise<void> {
  const client = await getPool().connect();
  
  try {
    // Create tables and indexes (idempotent - safe to run multiple times)
    await client.query(`
      -- pNodes table: stores stats from opt-in pNode operators
      -- See schema.sql for full documentation
      CREATE TABLE IF NOT EXISTS pnodes (
        id SERIAL PRIMARY KEY,
        public_key VARCHAR(64) UNIQUE NOT NULL,
        first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        total_capacity BIGINT NOT NULL DEFAULT 0,
        total_used BIGINT NOT NULL DEFAULT 0,
        total_dedicated BIGINT NOT NULL DEFAULT 0,
        xandminerd_version VARCHAR(32),
        pod_version VARCHAR(32),
        ip_hash VARCHAR(16),          -- SHA-256 hash (16 chars) for privacy
        hostname_hash VARCHAR(16),    -- SHA-256 hash (16 chars) for privacy
        is_online BOOLEAN NOT NULL DEFAULT true
      );

      CREATE INDEX IF NOT EXISTS idx_pnodes_public_key ON pnodes(public_key);
      CREATE INDEX IF NOT EXISTS idx_pnodes_last_seen ON pnodes(last_seen);
      CREATE INDEX IF NOT EXISTS idx_pnodes_is_online ON pnodes(is_online);

      -- Stats history: time-series snapshots for charts
      CREATE TABLE IF NOT EXISTS stats_history (
        id SERIAL PRIMARY KEY,
        recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        total_pnodes INTEGER NOT NULL,
        online_pnodes INTEGER NOT NULL,
        total_capacity BIGINT NOT NULL,
        total_used BIGINT NOT NULL,
        total_dedicated BIGINT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_stats_history_recorded_at ON stats_history(recorded_at);
    `);

    console.log('[DB] Database schema initialized');
  } finally {
    client.release();
  }
}

// Mark stale pNodes as offline (no report in last 5 minutes)
export async function markStalePNodesOffline(): Promise<number> {
  const result = await getPool().query(`
    UPDATE pnodes 
    SET is_online = false 
    WHERE is_online = true 
    AND last_seen < NOW() - INTERVAL '5 minutes'
    RETURNING id
  `);
  return result.rowCount ?? 0;
}

// Upsert pNode from report
export async function upsertPNode(report: PNodeReport): Promise<void> {
  const { pnode, storage, network } = report;
  
  await getPool().query(`
    INSERT INTO pnodes (
      public_key, 
      last_seen, 
      total_capacity, 
      total_used, 
      total_dedicated,
      xandminerd_version,
      pod_version,
      ip_hash,
      hostname_hash,
      is_online
    ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, true)
    ON CONFLICT (public_key) DO UPDATE SET
      last_seen = NOW(),
      total_capacity = $2,
      total_used = $3,
      total_dedicated = $4,
      xandminerd_version = COALESCE($5, pnodes.xandminerd_version),
      pod_version = COALESCE($6, pnodes.pod_version),
      ip_hash = COALESCE($7, pnodes.ip_hash),
      hostname_hash = COALESCE($8, pnodes.hostname_hash),
      is_online = true
  `, [
    pnode.publicKey,
    storage.totalCapacity,
    storage.totalUsed,
    storage.totalDedicated,
    pnode.versions?.xandminerd ?? null,
    pnode.versions?.pod ?? null,
    network?.ipHash ?? null,
    network?.hostnameHash ?? null,
  ]);
}

// Get aggregated network stats
export async function getNetworkStats(): Promise<NetworkStats> {
  const result = await getPool().query<{
    total_pnodes: string;
    online_pnodes: string;
    total_capacity: string;
    total_used: string;
    total_dedicated: string;
    max_last_seen: Date | null;
  }>(`
    SELECT 
      COUNT(*) as total_pnodes,
      COUNT(*) FILTER (WHERE is_online = true) as online_pnodes,
      COALESCE(SUM(total_capacity), 0) as total_capacity,
      COALESCE(SUM(total_used), 0) as total_used,
      COALESCE(SUM(total_dedicated), 0) as total_dedicated,
      MAX(last_seen) as max_last_seen
    FROM pnodes
  `);

  const row = result.rows[0];
  const totalPNodes = parseInt(row.total_pnodes, 10);
  const onlinePNodes = parseInt(row.online_pnodes, 10);
  const totalCapacity = parseInt(row.total_capacity, 10);

  return {
    totalPNodes,
    onlinePNodes,
    totalStorageCapacity: totalCapacity,
    totalStorageUsed: parseInt(row.total_used, 10),
    totalStorageDedicated: parseInt(row.total_dedicated, 10),
    averageStoragePerNode: onlinePNodes > 0 ? Math.floor(totalCapacity / onlinePNodes) : 0,
    lastUpdated: row.max_last_seen?.toISOString() ?? new Date().toISOString(),
  };
}

// Get individual pNode stats
export async function getPNodeStats(publicKey: string): Promise<PNodeStats | null> {
  const result = await getPool().query<DBPNode>(`
    SELECT * FROM pnodes WHERE public_key = $1
  `, [publicKey]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    publicKey: row.public_key,
    isOnline: row.is_online,
    lastSeen: row.last_seen.toISOString(),
    storage: {
      capacity: Number(row.total_capacity),
      used: Number(row.total_used),
      dedicated: Number(row.total_dedicated),
    },
    versions: {
      xandminerd: row.xandminerd_version,
      pod: row.pod_version,
    },
  };
}

// Get all pNodes (with pagination)
export async function getAllPNodes(limit = 100, offset = 0): Promise<PNodeStats[]> {
  const result = await getPool().query<DBPNode>(`
    SELECT * FROM pnodes 
    ORDER BY is_online DESC, last_seen DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  return result.rows.map(row => ({
    publicKey: row.public_key,
    isOnline: row.is_online,
    lastSeen: row.last_seen.toISOString(),
    storage: {
      capacity: Number(row.total_capacity),
      used: Number(row.total_used),
      dedicated: Number(row.total_dedicated),
    },
    versions: {
      xandminerd: row.xandminerd_version,
      pod: row.pod_version,
    },
  }));
}

// Record stats snapshot for history
export async function recordStatsSnapshot(): Promise<void> {
  await getPool().query(`
    INSERT INTO stats_history (total_pnodes, online_pnodes, total_capacity, total_used, total_dedicated)
    SELECT 
      COUNT(*),
      COUNT(*) FILTER (WHERE is_online = true),
      COALESCE(SUM(total_capacity), 0),
      COALESCE(SUM(total_used), 0),
      COALESCE(SUM(total_dedicated), 0)
    FROM pnodes
  `);
}

// Close pool on shutdown
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}



