# XANDSCOPE Stats Service

Stats aggregation service for XANDSCOPE - collects and aggregates pNode statistics from the Xandeum network.

## Overview

This service receives stats reports from pNodes (via modified xandminerd) and aggregates them for the XANDSCOPE dashboard.

```
pNode 1 ──┐
pNode 2 ──┼──► Stats Service ──► XANDSCOPE Dashboard
pNode N ──┘     (this)
```

## Features

- **Receive pNode reports** - POST /api/report
- **Aggregate network stats** - Total storage, online nodes, etc.
- **Individual pNode stats** - Per-node storage details
- **Rate limiting** - Prevent abuse
- **Signature verification** - (Optional) Verify reports come from real pNodes

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Environment Variables

Create a `.env` file with:

```bash
# Database connection string (required)
DATABASE_URL=postgresql://user:password@localhost:5432/xandscope_stats

# Server port (default: 3001)
PORT=3001

# Environment
NODE_ENV=development

# CORS origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,https://xandscope.io
```

## Setup

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Create PostgreSQL database:**
   ```bash
   createdb xandscope_stats
   ```

3. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Run development server:**
   ```bash
   yarn dev
   ```

## API Endpoints

### POST /api/report

Receives stats reports from pNodes.

**Request:**
```json
{
  "timestamp": "2025-12-04T12:00:00Z",
  "pnode": {
    "publicKey": "Base58PublicKey...",
    "isOnline": true,
    "versions": {
      "xandminerd": "v0.5.0",
      "pod": "v1.2.3"
    }
  },
  "storage": {
    "totalCapacity": 500000000000,
    "totalUsed": 100000000000,
    "totalDedicated": 250000000000
  },
  "network": {
    "hostname": "pnode-server-01",
    "ipHash": "abc123..."
  }
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Report received",
  "pnode": "Base58Pu..."
}
```

### GET /api/network/stats

Returns aggregated network statistics.

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalPNodes": 127,
    "onlinePNodes": 119,
    "totalStorageCapacity": 63500000000000,
    "totalStorageUsed": 12700000000000,
    "totalStorageDedicated": 31750000000000,
    "averageStoragePerNode": 500000000000,
    "lastUpdated": "2025-12-04T12:00:00Z"
  }
}
```

### GET /api/pnodes

Returns list of all reporting pNodes.

**Query params:**
- `limit` (default: 100, max: 500)
- `offset` (default: 0)

### GET /api/pnode/:publicKey

Returns stats for a specific pNode.

### GET /api/health

Health check endpoint.

## Deployment

### Render

1. Create new Web Service
2. Connect your repo
3. Set environment variables
4. Deploy

### Railway

1. Create new project
2. Add PostgreSQL database
3. Deploy from repo
4. Set environment variables

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Stats Service                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │   Express   │    │  PostgreSQL │    │  Background │        │
│   │   Server    │───▶│  Database   │◀───│   Tasks     │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                                      │                │
│         │                                      │                │
│   Rate Limiting                     - Mark stale offline       │
│   Signature Verify                  - Record snapshots          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## License

Apache-2.0

## Contributing

Part of the XANDSCOPE project. See main repo for contribution guidelines.
