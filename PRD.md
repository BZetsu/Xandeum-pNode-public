# Xandeum pNode Analytics Platform
## Product Requirements Document (PRD)

---

## 1. Executive Summary

### Project Name: **XANDSCOPE** - Xandeum pNode Analytics & Storage Cluster Overview Platform

### Vision
Build a best-in-class web-based analytics platform for Xandeum pNodes that provides real-time visibility into the Xandeum storage layer network. The platform will serve as the definitive dashboard for pNode operators, developers, and stakeholders to monitor network health, individual node performance, and storage metrics.

### Mission
Retrieve and display comprehensive pNode information using pRPC (pNode RPC) calls, presenting data in an intuitive, visually stunning interface that rivals or exceeds existing Solana validator dashboards like stakewiz.com, topvalidators.app, and validators.app.

---

## 2. Research Findings

### 2.1 Xandeum Architecture Understanding

**What is Xandeum?**
- Xandeum is a scalable storage layer for Solana dApps
- Provides a second tier of Solana accounts that can scale to exabytes
- Operates on a network of storage Provider Nodes (pNodes)

**pNode Operations:**
| Operation | Description |
|-----------|-------------|
| `poke` | Write data from a Solana account into a storage bucket |
| `peek` | Read data from a storage bucket into a Solana account |
| `prove` | Verify data integrity through cryptographic proofs |

**Network Architecture:**
- **pNodes**: Storage provider nodes handling data storage
- **vNodes**: Validator nodes supervising pNodes via Storage Engine (SE)
- **Gossip Protocol**: Network discovery mechanism for pNode visibility
- **RAFT Consensus**: Consensus mechanism for pNode coordination

### 2.2 Technical Resources Available

| Resource | URL | Purpose |
|----------|-----|---------|
| @xandeum/web3.js | xandeum.github.io/xandeum-web3.js | JavaScript SDK for Xandeum |
| Xandeum GitHub | github.com/xandeum | Source code repositories |
| XandMiner | N/A | pNode administration tool |

### 2.3 Competitor Analysis

**Stakewiz.com:**
- ✅ Dark theme, modern aesthetic
- ✅ Advanced search/filter capabilities
- ✅ Toggle filters (Hide unnamed, Only Mine)
- ✅ Real-time data updates

**Validators.app:**
- ✅ Professional data presentation
- ✅ Network-wide metrics dashboard
- ✅ Data center distribution views
- ✅ Stake pool integration
- ✅ Commission tracking

**Key Differentiators for XANDSCOPE:**
- Storage-specific metrics (capacity, utilization, throughput)
- pNode-specific operations tracking (poke/peek/prove rates)
- Zero-knowledge proof verification status
- Geographic storage distribution

---

## 3. Product Objectives

### 3.1 Primary Objectives
1. **Functionality**: Successfully retrieve and display all pNodes from gossip using pRPC calls
2. **Clarity**: Present information in an easily digestible format
3. **UX Excellence**: Create an intuitive, professional-grade interface

### 3.2 Innovation Goals (Competitive Edge)
1. Real-time storage utilization visualization
2. pNode health scoring algorithm
3. Geographic distribution map
4. Historical performance trends
5. Dark/Light theme with distinctive aesthetic

---

## 4. Feature Specifications

### 4.1 Core Features (MVP)

#### 4.1.1 Network Overview Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK HEALTH                           │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ Total pNodes│ Active      │ Storage     │ Avg Response    │
│    127      │   119       │   4.2 PB    │    45ms        │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

**Metrics Displayed:**
- Total pNode count
- Active/Inactive breakdown
- Total storage capacity
- Network storage utilization (%)
- Average response latency
- Total data throughput (24h)
- Proof verification rate

#### 4.1.2 pNode List Table
| Column | Description | Sortable | Filterable |
|--------|-------------|----------|------------|
| Rank | Based on health score | ✅ | ❌ |
| Node ID | Truncated public key with copy | ❌ | ✅ |
| Status | Active/Inactive/Syncing | ✅ | ✅ |
| Uptime | Percentage over 24h/7d/30d | ✅ | ❌ |
| Storage | Total/Used capacity | ✅ | ❌ |
| Operations | Poke/Peek/Prove counts | ✅ | ❌ |
| Latency | Average response time | ✅ | ❌ |
| Location | Geographic region | ❌ | ✅ |
| Health | Composite score 0-100 | ✅ | ❌ |

#### 4.1.3 Search & Filter
- **Text Search**: Node ID, operator name
- **Status Filter**: Active, Inactive, Syncing, All
- **Location Filter**: Region dropdown
- **Performance Filter**: Min health score slider
- **Storage Filter**: Capacity range

#### 4.1.4 Individual pNode Detail Page
```
/pnode/:nodeId
```
**Information Displayed:**
- Full Node ID with copy functionality
- Status badge with uptime history
- Storage metrics (pie chart)
- Performance graphs (line charts)
- Operation counts over time
- Recent proof verifications
- Error log (if any)

### 4.2 Enhanced Features (Post-MVP)

#### 4.2.1 Geographic Distribution Map
- Interactive world map
- pNode markers with status colors
- Cluster density visualization
- Click to filter by region

#### 4.2.2 Historical Analytics
- 24h / 7d / 30d / 90d views
- Network growth trends
- Storage utilization over time
- Performance degradation alerts

#### 4.2.3 Health Score Algorithm
```
Health Score = (
  Uptime_Weight × Uptime_Score +
  Latency_Weight × Latency_Score +
  Proof_Weight × Proof_Success_Rate +
  Storage_Weight × Storage_Utilization_Score
) / Total_Weight

Weights:
- Uptime: 30%
- Latency: 25%
- Proof Success: 30%
- Storage Health: 15%
```

#### 4.2.4 Alerts & Notifications
- Network anomaly detection
- pNode status change alerts
- Storage threshold warnings

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | Next.js 14 (App Router) | SSR, excellent DX, built-in API routes |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design |
| State | Zustand | Lightweight, TypeScript-native |
| Charts | Recharts / Tremor | React-native, beautiful defaults |
| Maps | Mapbox GL JS | Industry-standard mapping |
| Animation | Framer Motion | Smooth transitions |
| Backend | Next.js API Routes | Integrated, serverless-ready |
| Data Fetching | TanStack Query | Caching, refetching, optimistic updates |
| Validation | Zod | Runtime type safety |
| Deployment | Vercel | Optimal for Next.js |

### 5.2 System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         XANDSCOPE                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Next.js    │    │  API Routes  │    │   Xandeum    │    │
│  │   Frontend   │◄──►│  (Backend)   │◄──►│   pRPC       │    │
│  │              │    │              │    │   Network    │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│         │                   │                   │             │
│         ▼                   ▼                   │             │
│  ┌──────────────┐    ┌──────────────┐          │             │
│  │   Zustand    │    │   Redis      │◄─────────┘             │
│  │   Store      │    │   Cache      │  (Optional)            │
│  └──────────────┘    └──────────────┘                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 pRPC Integration Strategy

**Approach 1: Direct pRPC Calls (Primary)**
```typescript
// Using @xandeum/web3.js or direct JSON-RPC
const connection = new Connection('https://rpc.xandeum.network');

// Hypothetical pRPC methods (to be confirmed with Xandeum team)
const pNodes = await connection.getClusterPNodes();
const pNodeInfo = await connection.getPNodeInfo(nodeId);
```

**Approach 2: Gossip Protocol Subscription**
```typescript
// Subscribe to gossip for real-time pNode discovery
connection.onPNodeGossip((pNode) => {
  // Handle new/updated pNode
});
```

**Key pRPC Methods (Expected):**
| Method | Purpose |
|--------|---------|
| `getClusterPNodes` | Get all pNodes in gossip |
| `getPNodeInfo` | Get detailed pNode information |
| `getPNodeMetrics` | Get performance metrics |
| `getPNodeStorage` | Get storage statistics |
| `getRecentProofs` | Get recent ZK proof verifications |

### 5.4 Data Models

```typescript
interface PNode {
  id: string;                    // Public key
  version: string;               // Software version
  status: 'active' | 'inactive' | 'syncing';
  
  // Network
  ip: string;
  port: number;
  rpcEndpoint: string;
  
  // Performance
  uptime: number;                // Percentage
  latency: number;               // ms
  lastSeen: Date;
  
  // Storage
  storageCapacity: number;       // bytes
  storageUsed: number;           // bytes
  
  // Operations
  pokeCount: number;
  peekCount: number;
  proveCount: number;
  proveSuccessRate: number;      // Percentage
  
  // Location (if available)
  location?: {
    country: string;
    city: string;
    lat: number;
    lng: number;
  };
  
  // Health
  healthScore: number;           // 0-100
}

interface NetworkStats {
  totalPNodes: number;
  activePNodes: number;
  totalStorage: number;
  usedStorage: number;
  avgLatency: number;
  avgUptime: number;
  totalOperations24h: number;
}
```

---

## 6. UI/UX Design Specifications

### 6.1 Design Philosophy
- **Dark Mode First**: Rich, deep background (#0a0a0f to #1a1a2e)
- **Accent Colors**: Cyan (#00d4ff) and Purple (#7c3aed) gradient theme
- **Typography**: Space Grotesk for headings, Inter for body (modern, tech-forward)
- **Spacing**: Generous whitespace, card-based layout
- **Animations**: Subtle, purposeful micro-interactions

### 6.2 Color Palette

```css
:root {
  /* Background */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a2e;
  
  /* Accent */
  --accent-primary: #00d4ff;
  --accent-secondary: #7c3aed;
  --accent-gradient: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  
  /* Status */
  --status-active: #22c55e;
  --status-inactive: #ef4444;
  --status-syncing: #f59e0b;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Border */
  --border-default: #1e293b;
  --border-hover: #334155;
}
```

### 6.3 Component Library

**Key Components:**
1. `<StatCard />` - Network statistics display
2. `<PNodeTable />` - Sortable, filterable data table
3. `<HealthBadge />` - Visual health indicator
4. `<StorageGauge />` - Circular progress indicator
5. `<PerformanceChart />` - Line/area charts
6. `<WorldMap />` - Geographic distribution
7. `<SearchBar />` - Advanced search with filters
8. `<ThemeToggle />` - Dark/Light mode switch

### 6.4 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked cards |
| Tablet | 640-1024px | 2-column grid |
| Desktop | > 1024px | Full dashboard, 3-4 columns |

---

## 7. Implementation Plan

### Phase 1: Foundation (Days 1-3)
- [x] Research & PRD completion
- [ ] Project scaffolding (Next.js 14)
- [ ] Design system setup (Tailwind, shadcn/ui)
- [ ] pRPC connection establishment
- [ ] Basic data fetching implementation

### Phase 2: Core MVP (Days 4-7)
- [ ] Network overview dashboard
- [ ] pNode list table with sorting
- [ ] Search functionality
- [ ] Basic filtering
- [ ] Individual pNode detail page

### Phase 3: Polish (Days 8-10)
- [ ] Advanced filtering
- [ ] Charts and visualizations
- [ ] Health score implementation
- [ ] Responsive design refinement
- [ ] Performance optimization

### Phase 4: Innovation (Days 11-12)
- [ ] Geographic map (if time permits)
- [ ] Historical data views
- [ ] Auto-refresh functionality
- [ ] Error handling & loading states

### Phase 5: Launch (Days 13-14)
- [ ] Deployment to Vercel
- [ ] Documentation
- [ ] Testing across browsers
- [ ] Submission preparation

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Time to First Meaningful Paint | < 1.5s |
| Lighthouse Performance Score | > 90 |
| pNode Data Refresh Rate | ≤ 30s |
| Search Response Time | < 100ms |
| Mobile Usability Score | 100 |

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| pRPC API unavailability | Medium | High | Contact Xandeum Discord, use mock data for UI |
| Unclear API methods | High | Medium | Join Discord, examine source code |
| Performance with large dataset | Low | Medium | Pagination, virtual scrolling |
| Time constraints | Medium | High | Prioritize MVP features |

---

## 10. Dependencies

### External Dependencies
- Xandeum pRPC endpoint availability
- @xandeum/web3.js library compatibility
- Access to pNode gossip protocol

### Development Dependencies
- Node.js 18+
- pnpm (package manager)
- Git

---

## 11. Submission Checklist

- [ ] Live, functional website URL
- [ ] GitHub repository with source code
- [ ] README with deployment instructions
- [ ] API documentation (if custom backend)
- [ ] Demo video (optional, for innovation points)

---

## 12. Contact & Support

**Xandeum Discord**: https://discord.gg/uqRSmmM5m
**Documentation**: xandeum.network → Docs

---

*Document Version: 1.0*
*Last Updated: December 4, 2025*
*Author: XANDSCOPE Development Team*



