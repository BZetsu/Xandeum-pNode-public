-- XANDSCOPE Stats Service Database Schema
-- PostgreSQL 14+
--
-- This schema stores pNode statistics reported by operators
-- who have opted-in to the XANDSCOPE stats reporting feature.

-- =============================================================================
-- TABLES
-- =============================================================================

-- pNodes table: stores each unique pNode that has reported stats
CREATE TABLE IF NOT EXISTS pnodes (
    id SERIAL PRIMARY KEY,
    
    -- Identity (from on-chain registration)
    public_key VARCHAR(64) UNIQUE NOT NULL,
    
    -- Timestamps
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Storage metrics (in bytes)
    total_capacity BIGINT NOT NULL DEFAULT 0,
    total_used BIGINT NOT NULL DEFAULT 0,
    total_dedicated BIGINT NOT NULL DEFAULT 0,
    
    -- Software versions
    xandminerd_version VARCHAR(32),
    pod_version VARCHAR(32),
    
    -- Privacy-preserving identifiers (SHA-256 hashes, 16 chars)
    ip_hash VARCHAR(16),
    hostname_hash VARCHAR(16),
    
    -- Status
    is_online BOOLEAN NOT NULL DEFAULT true
);

-- Stats history table: time-series data for historical charts
CREATE TABLE IF NOT EXISTS stats_history (
    id SERIAL PRIMARY KEY,
    
    -- When this snapshot was taken
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Aggregated metrics at this point in time
    total_pnodes INTEGER NOT NULL,
    online_pnodes INTEGER NOT NULL,
    total_capacity BIGINT NOT NULL,
    total_used BIGINT NOT NULL,
    total_dedicated BIGINT NOT NULL
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Fast lookups by public key
CREATE INDEX IF NOT EXISTS idx_pnodes_public_key ON pnodes(public_key);

-- For finding stale pNodes (cleanup job)
CREATE INDEX IF NOT EXISTS idx_pnodes_last_seen ON pnodes(last_seen);

-- For filtering online/offline
CREATE INDEX IF NOT EXISTS idx_pnodes_is_online ON pnodes(is_online);

-- For historical queries
CREATE INDEX IF NOT EXISTS idx_stats_history_recorded_at ON stats_history(recorded_at);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE pnodes IS 'Stores pNode statistics from opt-in operators';
COMMENT ON COLUMN pnodes.public_key IS 'pNode public key (Base58 encoded, from on-chain registration)';
COMMENT ON COLUMN pnodes.ip_hash IS 'SHA-256 hash of IP address (first 16 chars) - for future geo features';
COMMENT ON COLUMN pnodes.hostname_hash IS 'SHA-256 hash of hostname (first 16 chars) - for privacy';
COMMENT ON COLUMN pnodes.total_dedicated IS 'Storage dedicated to Xandeum network (bytes)';

COMMENT ON TABLE stats_history IS 'Time-series snapshots for historical charts';
COMMENT ON COLUMN stats_history.recorded_at IS 'Snapshot timestamp (every 5 minutes)';

-- =============================================================================
-- MAINTENANCE QUERIES (for reference)
-- =============================================================================

-- Mark stale pNodes as offline (run every minute)
-- UPDATE pnodes SET is_online = false 
-- WHERE is_online = true AND last_seen < NOW() - INTERVAL '5 minutes';

-- Get current network stats
-- SELECT 
--     COUNT(*) as total_pnodes,
--     COUNT(*) FILTER (WHERE is_online = true) as online_pnodes,
--     COALESCE(SUM(total_capacity), 0) as total_capacity,
--     COALESCE(SUM(total_used), 0) as total_used,
--     COALESCE(SUM(total_dedicated), 0) as total_dedicated
-- FROM pnodes;

-- Cleanup old history (keep last 30 days)
-- DELETE FROM stats_history WHERE recorded_at < NOW() - INTERVAL '30 days';
