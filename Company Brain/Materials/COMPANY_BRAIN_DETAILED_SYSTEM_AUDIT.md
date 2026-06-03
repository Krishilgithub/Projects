# COMPANY_BRAIN_DETAILED_SYSTEM_AUDIT.md

> **Auditor Mode:** Staff+ Distributed Systems Engineer × Principal AI Infrastructure Architect × Senior Enterprise SaaS Engineer × Ruthless Production-Readiness Auditor  
> **Audit Date:** May 27, 2026  
> **Audit Scope:** Full codebase review — every file in `app/`, `lib/`, `modules/`, `workers/`, `prisma/`  
> **Verdict Type:** Engineering-grade, no sugar-coating.

---

# Executive Audit Summary

**Corely (Company Brain)** is a technically ambitious enterprise AI memory platform. The product vision is correct, the market timing is excellent, and the core ingestion pipeline (Google Drive + Notion → pgvector → GPT-4o-mini streaming) is **genuinely working and well-engineered** for an MVP.

However, there is a severe, structural gap between the product *vision* ("Institutional Memory Engine for Modern Organizations") and what the codebase actually delivers today. The product positions itself as infrastructure-grade enterprise software but is currently a well-styled demo with two real connectors, no authentication, no multi-tenancy, no permission enforcement, and dashboards fed by hardcoded dummy data seeded on first load.

**Starkest Single Problem:** Every API endpoint authenticates by calling `prisma.user.findFirst()` — no session, no token, no user ID. On a multi-tenant SaaS, this means **every user of every company sees and can modify the same first row in your database**. This is not a bug; it's a fundamental architectural hole that must be closed before any real customer touches this system.

The underlying technical choices are solid: pgvector for hybrid vector storage, BullMQ for job queuing, encrypted token storage, streaming SSE responses, content-hash deduplication, AES-encrypted OAuth tokens. These show real engineering judgment. The gap is not *technical capability* — it's *completeness and correctness* of the implementation.

---

# Section-by-Section Findings

---

## Section 1: Product-Level Audit

### Current Status
**Partial** — Vision is compelling, core positioning is correct, but product completeness is approximately 30% of what the tagline implies.

### Problems Found

1. **Tagline-to-reality gap is enormous.** The tagline is "Institutional Memory Engine." The delivered product is "AI Q&A over Google Drive and Notion docs." There is no temporal intelligence, no decision reconstruction, no knowledge decay detection, no permission-aware retrieval, and no citation graph. The marketing promise is 3-5x beyond the implementation.

2. **6 connectors promised, 2 delivered.** The MVP plan names Slack, Gmail, Notion, GitHub, Google Drive, Linear. Only Notion and Google Drive have working connectors. Slack, Gmail, GitHub, and Linear are completely absent from the codebase — not even stub files exist.

3. **Dashboard is cosmetically sophisticated, functionally empty.** The dashboard shows "Knowledge Coverage: 78%", "Active Teams: 24", "Insights Trend" charts — all seeded dummy data that is hardcoded in the API or generated on first load. This passes the visual demo bar but fails the technical scrutiny bar.

4. **No clear user persona flow.** There is no login, no onboarding, no workspace setup, no invitation system. A new user navigating to this product has no idea who they are, what workspace they're in, or how to get started.

5. **Competitive differentiation is weak in implementation.** The positioning claims differentiation through temporal intelligence and permission-aware retrieval. Neither exists. Competitors like Glean, Guru, and Notion AI have years of head start on these exact features.

### Technical Risks
- Investors/judges who dig into the source code will immediately find `prisma.user.findFirst()` in every API and conclude the product is a prototype.
- The Insights, Teams, Workflows pages are 100% static mock UIs with no backend. This creates a false impression of feature completeness.

### Missing Features
- Real user authentication (NextAuth, Clerk, or Supabase Auth)
- Multi-tenant workspace isolation
- Onboarding flow
- Connectors: Slack, GitHub, Gmail, Linear
- Actual insight generation from ingested data

### Required Fixes
- Replace all `prisma.user.findFirst()` calls with session-based auth
- Add clear "Prototype / Beta" labeling to UI sections that are mock-only
- Add a proper onboarding page

### Recommended Implementation
Prioritize completing 2-3 real connectors with real data flowing into one premium dashboard widget over building mock UIs for 8 different pages.

### Priority Level
**Critical**

---

## Section 2: Frontend Audit

### Current Status
**Partial** — The UI design quality is excellent (premium aesthetics, consistent design system, good use of lucide-react icons and recharts). However, most pages beyond Sources and Ask Corely are static mockups.

### Problems Found

1. **No authentication state.** There is no login page, no session management, no redirect to login for unauthenticated users. Anyone with the URL gets direct dashboard access.

2. **Hardcoded workspace IDs in frontend code.** Multiple components contain `const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"` — this is a critical multi-tenancy failure. If two users connect, they will share the same data.

3. **The following pages are 100% static mock UIs with zero API integration:**
   - `/dashboard/insights` — All data is a hardcoded TypeScript array in `page.tsx`. No API exists for insights.
   - `/dashboard/teams` — Entirely hardcoded `teamsData` array. No API. No database model for teams.
   - `/dashboard/workflows` — Assumed to be static (no API route found for workflows).
   - `/dashboard/actions` — No route found.

4. **Loading states are incomplete.** The Ask Corely page handles loading well. The Settings page may have incomplete loading states for async saves. Memory page has no skeleton loader.

5. **Error states are missing across most pages.** If the `/api/memory` endpoint fails, the Memory page renders an empty list with no error message. Same for dashboard stats.

6. **Form validation is minimal.** The "Add Memory" modal does a basic `if (!newTitle.trim() || !newContent.trim()) return` — no user-visible validation errors, no character limits enforced in UI.

7. **The Sidebar navigation links to non-existent or static pages.** Security page, Teams page, and Workflows page show in nav but have no real backend.

8. **Accessibility is absent.** No ARIA labels on icon-only buttons, no keyboard navigation tested, no focus management in modals, no screen reader considerations.

9. **No responsive design for mobile.** The dashboard layout is a fixed CSS grid optimized for large screens. On a 1024px screen, the table columns will overflow. On mobile, the experience breaks completely.

10. **The top bar search ("Ask anything about your company") is non-functional.** It appears functional visually but does nothing on the real pages outside of Ask Corely.

### Technical Risks
- Demo fails if judge clicks on Teams, Insights, or Workflows and inspects the data, as it immediately reveals static JavaScript arrays.
- A hardcoded workspace ID means two demo users would see each other's connected sources.

### Missing Functionality
- Login/auth flow
- Global search functionality in top bar
- Loading skeletons for all data pages
- Error boundary components
- Empty state designs for zero-data scenarios
- Form validation with user-visible error messages
- API integration for Insights, Teams, Workflows, Actions

### Priority Level
**Critical (Auth) / High (UX completeness)**

---

## Section 3: Backend Audit

### Current Status
**Partial** — Core endpoints (ask, sources, documents, chats, memory, settings) are implemented with reasonable structure. Missing critical security primitives.

### Problems Found

1. **Zero authentication on all API routes.** Every single API handler uses `prisma.user.findFirst()` as its auth mechanism. This returns the first user in the entire database — meaning any request to any API endpoint operates as the first registered user. This is not just a security issue; it's architecturally incompatible with multi-tenancy.

2. **Input validation is absent.** The `/api/memory` POST handler accepts arbitrary JSON with no Zod or similar schema validation. A malformed payload could throw an unhandled Prisma error or silently store garbage data.

3. **No rate limiting.** The `/api/ask` endpoint calls OpenAI on every request with no debouncing, rate limiting, or cost controls. A single automated script could exhaust API credits in minutes.

4. **The sync route is fire-and-forget with no verification.** `POST /api/sources/[sourceId]/sync` returns immediately and fires the sync in the background with `.catch()` logging only. If the sync fails, the source status might remain "syncing" forever (the connector handles this, but the HTTP response gives the caller no way to verify or subscribe to completion).

5. **No request body size limits.** The documents POST endpoint accepts `rawContent` with no size cap. A 50MB document upload would attempt to chunk, embed, and store without any guard.

6. **Error messages leak internal details.** Several handlers return raw Prisma error messages (`error.message`) directly to the client. In production, this can expose table names, column names, and query structure.

7. **No API versioning.** Routes are at `/api/*` with no version prefix. Breaking changes in the future will require careful coordination.

8. **Workspace upsert anti-pattern.** Multiple callback routes contain `prisma.workspace.upsert(...)` with hardcoded defaults. This means any request with an arbitrary UUID in `state` can create a new workspace on your database. This is a significant data integrity risk.

### Missing Routes
- `GET /api/users/me` — current user endpoint
- `POST /api/auth/*` — authentication endpoints
- `GET /api/insights` — real insights endpoint
- `GET /api/teams` — teams management endpoint
- `GET /api/workflows` — workflows endpoint
- `POST /api/search` — global search endpoint
- `GET /api/analytics` — analytics data endpoint
- Webhook endpoints for any real-time source updates

### Required Fixes
- Implement session-based auth middleware that validates every request
- Add Zod schema validation on all POST/PATCH handlers
- Add rate limiting (e.g., Upstash Rate Limit)
- Never return raw error messages to clients
- Add response envelope with version info

### Priority Level
**Critical**

---

## Section 4: Connector Layer Audit

### Current Status
**Partial** — 2 of 6 planned connectors exist. Both are of reasonable quality.

### Google Drive Connector (`google-drive.ts`)

**Status: Implemented (70% complete)**

**What works:**
- OAuth2 flow with token refresh persistence
- Paginated file listing
- Multi-folder recursive traversal
- Content export for Google Docs/Sheets/PDFs
- Content hash deduplication
- Encrypted token storage

**What's missing:**
- **No incremental sync.** Every sync re-fetches all files. For a 10,000-file Drive, this is extremely slow and expensive. Should use `modifiedTime > lastSyncedAt` filter.
- **No webhook support.** Google Drive Push Notifications API is not used. Sync is entirely polling-based.
- **PDF parsing is broken.** The code attempts `PDFParseClass.setWorker(...)` with pdfjs-dist — this API call is incorrect for the `pdf-parse` library which is not pdfjs-based. Then tries `new PDFParseClass({data:...}).getText()` which is not the correct pdf-parse API (`pdf(buffer)` is the correct call). This entire PDF branch likely errors silently.
- **No handling for Google Slides, Forms, or Sites** — common in enterprise Drive setups.
- **File size limits not enforced.** Large files (100MB+ PDFs) will cause memory issues.
- **Token rotation not stored.** The `oauth2Client.on("tokens")` handler saves `access_token` but not `refresh_token` if Google rotates it.

### Notion Connector (`notion.ts`)

**Status: Implemented (75% complete)**

**What works:**
- OAuth token exchange and storage
- Full page search with pagination
- Database row enumeration
- Recursive block content extraction (up to depth 5)
- Comprehensive block type coverage
- Rate limit retry with exponential backoff
- Content hash deduplication

**What's missing:**
- **No incremental sync.** Same problem as Drive — fetches all pages on every sync. Should use `last_edited_time > lastSyncedAt` filter in the Notion search API.
- **No webhook support.** Notion has a webhook system; it's not being used.
- **No permissions tracking.** Page-level permissions from Notion (who can see what) are not stored or respected during retrieval.
- **Database properties not indexed.** Only block content is extracted. Rich properties in Notion databases (Select, Multi-select, Date, Relation) are ignored and not embedded.
- **`any` type casting.** Multiple places use `as any[]` and `as any` which suppresses TypeScript safety.

### Slack Connector
**Status: MISSING — Not implemented at all**

No files, no OAuth flow, no schema. Slack is prominently mentioned in the product positioning.

### GitHub Connector
**Status: MISSING — Not implemented at all**

### Gmail Connector  
**Status: MISSING — Not implemented at all**

### Linear Connector
**Status: MISSING — Not implemented at all**

### Priority Level
**Critical (missing connectors) / High (connector completeness)**

---

## Section 5: Ingestion Pipeline Audit

### Current Status
**Partial** — The core pipeline (fetch → chunk → embed → store) works. Significant gaps in robustness and intelligence.

### Problems Found

1. **Chunking strategy is primitive.** The chunker (`chunker.ts`) splits on word count (400 words, 50-word overlap). This is the simplest possible approach. Problems:
   - It ignores document structure (headings, sections, tables).
   - A Notion page with 50 headings gets chunked mid-heading, destroying semantic coherence.
   - No sentence-boundary awareness — chunks can break mid-sentence.
   - No special handling for code blocks, tables, or lists.
   - The "token count" field is labeled as words, not actual tokens — will be wrong.

2. **Embedding is sequential, not batched.** The connector loops: `for (const chunk of chunks) { const embedding = await generateEmbedding(chunk.content); }`. For a 100-chunk document, this makes 100 sequential OpenAI API calls. The OpenAI embeddings API supports batching up to 2048 inputs per call. Current implementation is 100x slower than necessary and 100x more prone to rate limiting.

3. **No embedding failure recovery.** If `generateEmbedding` throws for chunk #47 of 100, the error is logged, but the loop continues. The document ends up with 46 embedded chunks and 54 missing. There is no way to detect or re-embed the failed chunks.

4. **No ingestion queue per-chunk.** For large documents (1000+ chunks), the sync function runs for the entire duration in a single BullMQ job. If the worker crashes mid-document, all chunks must be re-processed from scratch.

5. **Raw content stored in Postgres.** The `Document` model stores `rawContent String?` — the full text of every indexed document. For a 500-page PDF, this is megabytes per row. This will cause severe Postgres bloat and expensive full-row fetches when only metadata is needed.

6. **No content validation before embedding.** Text like "Page 1 of 1", "Untitled", or single-character strings pass the `< 20 char` filter and get embedded, wasting API calls and polluting the vector store.

7. **Dual storage split (Prisma + Supabase) creates sync risk.** Documents and their metadata live in Prisma/Postgres. Chunks and vectors live in Supabase pgvector. If a Supabase insert fails after a Prisma document upsert, the system has a document with no chunks — invisible to queries but taking up storage.

8. **No ingestion progress tracking.** The UI shows "syncing" until the job completes. For a large source, this could be 30+ minutes with no progress update.

### Required Fixes
- Implement semantic chunking that respects document structure
- Batch OpenAI embedding calls (up to 2048 per request)
- Add per-chunk retry logic with dead-letter queue
- Remove `rawContent` from the Document model or move to separate blob storage
- Add chunking validation with minimum quality thresholds
- Use a single Supabase transaction for chunk batch inserts

### Priority Level
**High**

---

## Section 6: Retrieval Engine Audit

### Current Status  
**Partial** — Basic semantic search via pgvector works. Lacks production-grade retrieval intelligence.

### Problems Found

1. **Single retrieval strategy.** The `/api/ask` route only does semantic (vector) similarity search via `match_chunks` RPC. There is no:
   - Keyword/BM25 search for exact term matching
   - Hybrid search combining semantic + keyword
   - Metadata filtering (by source, date range, document type)
   - Re-ranking of retrieved results

2. **Fixed threshold of 0.65 is not validated.** The `match_threshold: 0.65` is hardcoded. Whether this is calibrated for `text-embedding-3-small` is unknown. Too high = misses relevant results. Too low = retrieves noise. Should be tunable per workspace.

3. **Only 6 chunks retrieved.** `match_count: 6` is hardcoded. For complex queries needing cross-document synthesis, 6 chunks providing ~2400 words of context is insufficient. Should be dynamically sized based on question complexity.

4. **No query expansion or HyDE.** For questions like "why did we choose vendor X?", the query is embedded as-is. Hypothetical Document Embeddings (HyDE) or query expansion would dramatically improve recall.

5. **No citation quality scoring.** Sources are returned in similarity order, but relevance is not communicated to the user with any confidence score or context about why that source was chosen.

6. **Context is passed raw to LLM.** The 6 chunks are joined with `---` separators and passed directly to GPT-4o-mini as one big string. There is no deduplication of overlapping chunks (from overlapping chunk windows), no compression of redundant context, and no summarization of large contexts.

7. **The `match_chunks` RPC is a black box.** The Supabase RPC function for vector search is not in the repository. If this function has a bug, there is no way to debug it from this codebase. The function definition, index type (IVFFlat vs HNSW), and probes configuration are unknown.

8. **No fallback when no chunks match.** If the vector search returns 0 results (either because no data is ingested or the similarity threshold is too high), the LLM receives an empty context and will generate a generic response ("I don't have information about that"). The API should detect this case and return an explicit `no_context` flag to the frontend.

9. **Temporal scoring is completely absent.** An old Slack message from 2019 and a recent decision from last week receive identical relevance weight. For an "Institutional Memory" platform, temporal recency should be a first-class retrieval signal.

### Priority Level
**High (retrieval quality) / Critical (temporal scoring for differentiation)**

---

## Section 7: Temporal Intelligence Audit

### Current Status
**Missing** — Described in the product vision, completely absent from the implementation.

### Problems Found

1. **No freshness score exists anywhere in the codebase.** The `metadata` JSON stored per chunk has `last_edited_time` from Notion and `modified_time` from Drive. These timestamps are stored but never used in retrieval.

2. **No staleness detection.** There is no scheduled job that scans documents for ones that haven't been updated in X days and flags them as potentially stale.

3. **No knowledge decay model.** The product claims "Knowledge Decay Detection" but there is zero implementation of any decay curve, temporal weighting, or staleness scoring algorithm.

4. **No historical timeline.** The Memory page shows a "timeline" but it is populated by the `org_memories` table which is manually-added content, not derived from the temporal progression of ingested documents.

5. **`last_edited_time` is stored but ignored.** The chunk metadata includes this field but the retrieval RPC does not use it. The LLM response has no awareness of whether its sources are from yesterday or three years ago.

### Required Implementation
```typescript
// Score = similarity_score * recency_decay
// recency_decay = exp(-lambda * days_since_edit)
// lambda controls decay speed (0.01 = slow decay, 0.1 = fast decay)
function temporalScore(similarity: number, lastEditedTime: Date, lambda = 0.02): number {
  const daysSinceEdit = (Date.now() - lastEditedTime.getTime()) / (1000 * 60 * 60 * 24);
  return similarity * Math.exp(-lambda * daysSinceEdit);
}
```

### Priority Level
**Critical** — This is a core product differentiator that is 0% implemented.

---

## Section 8: Permission-Aware Retrieval Audit

### Current Status
**Missing** — Described in the product vision, completely absent from the implementation.

### Problems Found

1. **No permission metadata is stored per document or chunk.** When a document is ingested from Google Drive, the sharing permissions (who can view it) are not fetched, stored, or respected. A Google Drive document that is restricted to the Finance team would be visible to everyone in any query.

2. **No ACL enforcement at retrieval time.** The `match_chunks` RPC filters only by `workspace_filter` (workspace ID). There is no user-level, role-level, or document-level permission filter applied during vector search.

3. **A single workspace_filter is the only isolation.** All users in the same workspace see all documents from all sources — even if those sources were connected by a different user with restricted permissions.

4. **This is a GDPR/compliance blocker.** If Corely is marketed as an enterprise product, enterprises will immediately ask: "Can the sales team see the board's strategy documents?" The answer today is yes. This will kill enterprise deals.

5. **Source-level access control is absent.** A user who disconnects a source can still retrieve content from that source because the chunks remain in the vector store after source deletion is handled inconsistently (the cascade delete removes DB records but Supabase pgvector entries need an explicit cleanup call that may fail silently).

### Priority Level
**Critical** — Enterprise blocker. No enterprise CIO will approve a system where any employee can query any document regardless of permissions.

---

## Section 9: Decision Reconstruction Audit

### Current Status
**Missing** — Described in the product vision, completely absent from the implementation.

### Problems Found

1. **No decision graph model.** There is no database schema for decisions, decision links, decision context, or decision outcomes. The `OrgMemory` model is a manual journal, not an auto-detected decision graph.

2. **No relationship extraction.** The ingestion pipeline extracts text and embeds it. It does not extract entities (people, projects, dates, decisions), relationships between entities, or causal chains.

3. **No graph database or graph queries.** Decision reconstruction would require a graph data structure. Neither Neo4j, nor any Postgres graph extension, nor any in-memory graph is present.

4. **"Citation-backed organizational reasoning" is not implemented.** The Ask Corely response includes sources as a flat list of document titles and URLs. There is no graph traversal, no reasoning chain visualization, no "this decision was made because of these 3 documents" reconstruction.

### Priority Level
**Low for MVP (too complex to build correctly), but must be removed from the product description if not implemented.**

---

## Section 10: Database Architecture Audit

### Current Status
**Partial** — Schema design is reasonable for an MVP. Several structural concerns for scale.

### Problems Found

1. **Vector storage is split across Prisma (Postgres) and Supabase.** The `DocumentChunk` model in Prisma has `embedding Unsupported("vector")?` — this is technically correct for pgvector support. However, chunks are actually inserted via `supabaseAdmin.from("document_chunks").insert(...)` bypassing Prisma entirely. This split means Prisma foreign key constraints are not enforced on chunk inserts.

2. **No vector index configuration visible.** The schema has `@@index([embedding], map: "idx_chunks_embedding")` but the index type (IVFFlat vs HNSW) and parameters are not specified. For production pgvector, `USING hnsw (embedding vector_cosine_ops)` with tuned `m` and `ef_construction` parameters is critical for query performance at scale.

3. **`rawContent` stored in `Document` model.** For a company indexing 100,000 documents, storing full text in Postgres will create multi-GB rows that slow every query that touches the Documents table, even when only metadata is needed.

4. **No soft delete.** Documents and chunks are hard-deleted. There is no `deletedAt` field. If a sync erroneously deletes documents, there is no recovery path.

5. **No created-by/updated-by audit fields.** None of the models track which user created or last modified a record. This is required for enterprise audit logging.

6. **`settings Json` and `preferences Json` are untyped blobs.** There is no TypeScript type or validation for these JSON fields, meaning any arbitrary JSON can be stored without validation. This makes it impossible to write reliable application code against these fields.

7. **No partitioning strategy.** At 10M+ chunks, a single `document_chunks` table becomes a query bottleneck. There is no partitioning by workspace or time range.

8. **Enum fields stored as `String`.** `Source.status`, `Source.type`, `User.role`, `Workspace.plan` are all strings. This allows invalid values to be stored. Should use Prisma enums or check constraints.

### Priority Level
**High (structural) / Medium (optimization)**

---

## Section 11: Observability Audit

### Current Status
**Missing** — The application has console.log-based logging only. No structured logging, no tracing, no metrics, no alerting.

### Problems Found

1. **Only `console.log/error/warn` is used.** There is no structured logging library (Winston, Pino). Log output is unformatted strings with emoji. In production, this makes log aggregation (Datadog, Splunk, CloudWatch) unusable because logs cannot be parsed or queried.

2. **No request tracing.** There are no trace IDs, span IDs, or distributed tracing (OpenTelemetry). When a user reports "Ask Corely is slow," there is no way to trace which database query, which OpenAI call, or which chunk retrieval caused the latency.

3. **No performance metrics.** There are no response time metrics, embedding generation latency metrics, or sync job duration metrics. You cannot answer "what is our p95 Ask Corely response time?"

4. **No job monitoring.** BullMQ has a dashboard (Bull Board), but it's not configured or exposed. You cannot see queued jobs, failed jobs, or retry attempts from any UI.

5. **No error alerting.** If the Google Drive sync fails for every user simultaneously (e.g., Google API outage), no alert is sent. The only signal is a status field in the database that someone has to manually check.

6. **No health check endpoint.** There is no `/api/health` or `/api/ready` endpoint to verify the application can connect to Postgres, Supabase, Redis, and OpenAI. This makes Kubernetes liveness probes or load balancer health checks impossible.

7. **No cost tracking.** Every `/api/ask` call makes at least 2 OpenAI API calls (embedding + chat completion). There is no tracking of per-workspace or per-user OpenAI costs. A single power user could generate $1,000/day in API costs undetected.

### Required Implementation
- Integrate Pino or Winston for structured JSON logging
- Add OpenTelemetry SDK with traces sent to Datadog, Honeycomb, or similar
- Create `/api/health` endpoint checking DB, vector store, and cache connectivity
- Expose Bull Board (behind auth) for job monitoring
- Add cost tracking table: `api_usage` model with tokens, cost, model, endpoint

### Priority Level
**High** — Without observability, production debugging is blind.

---

## Section 12: Security Audit

### Current Status
**Failing** — Multiple critical security issues that would block enterprise deployment.

### Problems Found

1. **No authentication.** (Repeated because it's the most critical issue.) Every API route is accessible to any HTTP client without any credential. This is a complete security failure.

2. **CryptoJS AES with a string key is weak.** `CryptoJS.AES.encrypt(text, getKey())` uses password-based key derivation, not AES-256-CBC with a proper key. For enterprise-grade token storage, the standard is to use Node's `crypto.createCipheriv('aes-256-gcm', key, iv)` with a 256-bit key derived from an HSM or KMS-managed secret, not a user-defined string.

3. **No CSRF protection.** POST/PATCH/DELETE endpoints have no CSRF token validation. Since the app uses redirects and form-like interactions, this is an SSRF and CSRF attack surface.

4. **OAuth state parameter has no CSRF nonce.** The Google OAuth `state` parameter is `JSON.stringify({ workspaceId, userId })`. This has no random nonce component. An attacker can forge the state parameter and inject their workspace/userId into the OAuth flow.

5. **Secrets potentially logged.** Several error catch blocks log `err` directly. If an error contains token values or the encrypted key in its message, it would be logged.

6. **No HTTPS enforcement.** The application doesn't enforce HTTPS redirects or HSTS headers. On Vercel this is handled at the platform level, but there's no application-level guarantee.

7. **Service role key used on the server.** `supabaseAdmin` uses the service role key, which bypasses all Row Level Security policies. This is correct for server-side operations, but means there is no defense-in-depth through Supabase RLS.

8. **No Content Security Policy headers.** CSP, X-Content-Type-Options, X-Frame-Options are not configured. 

9. **No audit log.** There is no record of who queried what, who connected which source, or who deleted which document. Enterprise customers require complete audit trails.

10. **Token storage uses symmetric encryption, not a secrets manager.** Production-grade systems store OAuth tokens encrypted with KMS-managed keys (AWS KMS, GCP KMS, Azure Key Vault), not a single environment variable.

### Priority Level
**Critical** — Most of these would immediately fail an enterprise security review.

---

## Section 13: Performance Audit

### Current Status
**Unknown** — No benchmarks exist. The architecture has several known bottlenecks that will cause problems at scale.

### Problems Found

1. **Sequential embedding generation is the primary bottleneck.** For a 500-chunk document, 500 sequential API calls to OpenAI with ~200ms latency each = 100 seconds minimum per document. This blocks the BullMQ worker for the entire duration. Concurrency of 2 workers means at most 2 documents can be embedded simultaneously.

2. **Every API route creates a new Prisma connection pool.** The singleton pattern in `lib/db.ts` is correct for dev (hot reload). But in production serverless (Vercel), each invocation may create a new connection. With 100 concurrent API calls, this can exhaust Postgres's connection limit rapidly. Should use PgBouncer or Prisma Accelerate.

3. **`/api/ask` has unbounded latency.** The response time is: embedding generation (~200ms) + pgvector search (unknown) + GPT-4o-mini streaming (1-10 seconds). With the streaming implementation, this is acceptable — but the embedding and search steps before streaming begins add 500-1500ms of blank loading time with no user feedback.

4. **Vector search performance is unvalidated.** The `match_chunks` Supabase RPC performance at 1M+ chunks with an IVFFlat index (if that's what's configured) will degrade significantly. HNSW is preferred for query performance. The index configuration is not visible in the repository.

5. **No caching layer.** Frequent questions will hit OpenAI and pgvector every time. A simple semantic cache (e.g., store embeddings of recent queries and return cached answers for similar queries) could reduce costs by 30-70%.

6. **Sync jobs block on I/O without streaming.** The connector fetches all files, then processes each sequentially. For large workspaces, this creates a single long-running job. Using streaming iterators and processing in parallel would dramatically reduce sync time.

### Priority Level
**High** — Will manifest as real failures at 10+ connected sources or 10+ concurrent users.

---

## Section 14: Deployment Audit

### Current Status
**Partial** — The app deploys to Vercel successfully. Production infrastructure is incomplete.

### Problems Found

1. **The BullMQ worker cannot run on Vercel.** Vercel is a serverless platform with no persistent processes. The `workers/index.ts` file is a long-running Node.js process that must run on a dedicated server (EC2, Railway, Render, Fly.io). Currently, when Redis is unavailable, the worker silently enters "standby mode" and does nothing — this is the production behavior on Vercel.

2. **The fallback sync (direct dynamic import in API route) runs inside a serverless function.** When Redis is not available, sync is triggered by directly importing and calling the connector from the Next.js API route. Vercel serverless functions have a 60-second execution limit (or 15 seconds on hobby tier). A large Google Drive sync taking 10 minutes will be killed at 60 seconds without completing.

3. **No environment variable validation on startup.** If `OPENAI_API_KEY` or `ENCRYPTION_KEY` is missing, the application starts with the dummy values defined in the code (e.g., `"dummy-key-for-build"`). In production, this would cause decrypt failures when a user's token is loaded — a silent, confusing error.

4. **No CI/CD pipeline.** There are no GitHub Actions or similar workflows for automated testing, linting, or deployment gates.

5. **No staging environment.** Changes go directly to production (or require manual Vercel preview URLs). A staging environment with separate database and vector store is necessary for safe deployments.

6. **No rollback strategy.** If a bad deployment is pushed, the only rollback is a manual Vercel redeploy to a previous commit. There are no feature flags, canary deployments, or automated rollback triggers.

7. **Database migrations are managed via `prisma db push`.** This is appropriate for development but dangerous in production. `prisma migrate deploy` with version-controlled migration files should be used for production. `db push` can destroy data in some schema change scenarios.

### Priority Level
**Critical (worker deployment) / High (everything else)**

---

## Section 15: Demo Readiness Audit

### Current Status
**Conditionally ready** — Can win a hackathon if the demo is carefully scripted. Will fail under free-form exploration.

### What Works in a Demo
- Connecting a Google Drive source is smooth and visually satisfying
- The real-time sync animation is compelling
- The Ask Corely interface with streaming responses and cited sources is impressive
- The Memory timeline page looks rich and polished
- The Insights, Teams, and Workflows pages look sophisticated at first glance

### What Will Break a Demo
1. **Any judge who clicks "Teams" and opens DevTools** will see the data is a hardcoded TypeScript array.
2. **"Ask something complex"** — if no documents are indexed or if the question is outside the embedded content, the LLM will say "I don't have that information" with no context about why.
3. **Multiple demo users** — if two judges connect sources simultaneously, they'll share the same workspace (hardcoded workspace ID issue).
4. **"Show me the insights" on a fresh deployment** — the Insights page shows hardcoded data, but the Dashboard Insights panel will show seeded dummy data from the database, creating inconsistency.
5. **Slow syncing** — connecting a Google Drive with 1000+ files will show "syncing" for potentially 30+ minutes. A demo Drive with 5-10 documents is required.
6. **Asking about a document that was just connected** — if Redis is down and the worker is in standby mode, the background sync may not run and the document will not be indexed despite showing "synced" in the UI.

### Missing Wow Factor
- No "temporal intelligence" demo moment
- No "permission-aware retrieval" demo moment  
- No visual representation of knowledge graph
- No proactive insight notification
- No real-time collaborative Q&A
- No "here's why this decision was made 2 years ago" reconstruction

### Recommended Demo Script
1. Pre-connect a curated Google Drive folder with 5-10 meaningful documents (Q1 report, product roadmap, customer interview notes)
2. Pre-connect a Notion workspace
3. Show the Sources page with both connected
4. Ask a question that spans both sources: "What is our Q2 product strategy based on customer feedback?"
5. Show the cited sources in the response
6. Show the Memory page with saved insights

### Priority Level
**High**

---

## Section 16: Million-Dollar SaaS Audit

### Current Status
**Very early prototype** — Has the bones of a $1M product but needs 3-4 months of critical work.

### What's Missing for Real Enterprise SaaS

**Trust Blockers:**
- No authentication, no audit logs, no permission enforcement
- No SOC2 compliance posture
- No data retention policies or data deletion mechanisms
- No GDPR compliance (no way for a user to request data export or deletion)

**Monetization Blockers:**
- No billing system (Stripe, Chargebee)
- No usage metering (API calls, documents indexed, queries answered)
- No plan enforcement (free tier limits, enterprise quotas)
- No team/seat management

**Scalability Blockers:**
- Worker process can't run on serverless infrastructure
- No incremental sync (full re-scan every time)
- No batch embedding (sequential OpenAI calls)
- No connection pooling for Postgres

**Product Gaps:**
- 4 of 6 connectors missing
- No Slack connector (most enterprise organizations' primary communication channel)
- No permission-aware retrieval
- No temporal intelligence beyond storing timestamps

**Enterprise Sales Blockers:**
- No SSO (SAML, OIDC)
- No role-based access control
- No custom data residency
- No SLA or uptime guarantee infrastructure
- No enterprise contract compliance (BAA, DPA)

### Priority Level
**Critical (must fix before first paying customer)**

---

# Missing Features Master Checklist

## Authentication & Security
- [ ] **User Authentication System**
  - Status: Missing
  - Why Missing: Not implemented
  - Why Required: Without auth, any HTTP client can access any user's data
  - Recommendation: Implement Clerk or NextAuth.js with JWT session management

- [ ] **Session-Based API Authorization**
  - Status: Missing  
  - Why Missing: `prisma.user.findFirst()` is used as auth
  - Why Required: Multi-tenancy fundamental
  - Recommendation: Auth middleware that validates JWT and injects user/workspace context

- [ ] **CSRF Protection**
  - Status: Missing
  - Why Required: Prevents cross-site request forgery attacks

- [ ] **OAuth State CSRF Nonce**
  - Status: Missing (state has no random nonce)
  - Why Required: Prevents OAuth flow hijacking

- [ ] **Rate Limiting**
  - Status: Missing
  - Why Required: Prevents API cost exhaustion

- [ ] **Audit Log**
  - Status: Missing
  - Why Required: Enterprise compliance requirement

## Connectors
- [ ] **Slack Connector**
  - Status: Missing
  - Why Required: Primary enterprise communication channel
  - Recommendation: Use Slack Events API + OAuth to index channel messages and threads

- [ ] **GitHub Connector**
  - Status: Missing
  - Why Required: Engineering context (PRs, issues, wiki) is critical org knowledge

- [ ] **Gmail Connector**
  - Status: Missing
  - Why Required: Email-based decisions are a core enterprise knowledge source

- [ ] **Linear Connector**
  - Status: Missing
  - Why Required: Product roadmap and issue tracking context

- [ ] **Confluence Connector**
  - Status: Missing (mentioned in MVP plan)
  - Why Required: Most enterprises use Confluence as their primary wiki

- [ ] **Incremental Sync (Google Drive)**
  - Status: Missing
  - Why Required: Full re-scan of large drives is impractical
  - Recommendation: Use `modifiedTime > lastSyncedAt` query filter

- [ ] **Incremental Sync (Notion)**
  - Status: Missing
  - Why Required: Same as Drive
  - Recommendation: Use `last_edited_time` filter in Notion search

- [ ] **Webhook-Based Sync (Google Drive)**
  - Status: Missing
  - Why Required: Real-time knowledge updates instead of polling

## Ingestion Pipeline
- [ ] **Batched Embedding Generation**
  - Status: Missing
  - Why Required: 100x performance improvement
  - Recommendation: Collect all chunks, call `openai.embeddings.create({input: chunks})` once

- [ ] **Semantic/Structure-Aware Chunking**
  - Status: Primitive (word-count only)
  - Why Required: Chunk quality directly determines retrieval quality
  - Recommendation: Implement markdown heading-based chunking with sentence boundary detection

- [ ] **PDF Parsing Fix**
  - Status: Broken (incorrect pdf-parse API usage)
  - Why Required: PDFs are a critical enterprise document format

- [ ] **Per-Chunk Retry with Dead-Letter Queue**
  - Status: Missing
  - Why Required: Embedding failures leave documents partially indexed

- [ ] **Ingestion Progress Streaming**
  - Status: Missing
  - Why Required: Users can't see how far along a sync is

## Retrieval Intelligence
- [ ] **Hybrid Search (Semantic + BM25)**
  - Status: Missing
  - Why Required: Semantic search alone misses exact keyword matches
  
- [ ] **Temporal Scoring in Retrieval**
  - Status: Missing
  - Why Required: Core product differentiator
  - Recommendation: Apply exponential decay to similarity scores based on `last_edited_time`

- [ ] **Re-Ranking Layer**
  - Status: Missing
  - Why Required: Initial vector retrieval is imprecise; cross-encoder re-ranking improves precision

- [ ] **Permission-Aware Retrieval**
  - Status: Missing
  - Why Required: Enterprise blocker — users must only see documents they have access to

- [ ] **Query Classification**
  - Status: Missing
  - Why Required: "Who is the head of engineering?" requires different retrieval than "What was decided about the API strategy?"

- [ ] **No-Context Handling**
  - Status: Missing
  - Why Required: Empty retrieval results should show a clear "no data indexed" message, not a generic LLM non-answer

## Infrastructure
- [ ] **Dedicated Worker Deployment**
  - Status: Missing
  - Why Required: BullMQ worker cannot run on Vercel serverless
  - Recommendation: Deploy worker on Railway, Render, or Fly.io

- [ ] **Database Connection Pooling (PgBouncer)**
  - Status: Missing
  - Why Required: Serverless Postgres connection exhaustion at scale

- [ ] **Health Check Endpoint**
  - Status: Missing
  - Why Required: Load balancer and monitoring integration

- [ ] **Structured Logging**
  - Status: Missing (console.log only)
  - Why Required: Log aggregation and debugging in production

- [ ] **Distributed Tracing (OpenTelemetry)**
  - Status: Missing
  - Why Required: Latency attribution across DB, vector store, and LLM calls

## Product Features
- [ ] **Onboarding Flow**
  - Status: Missing
  - Why Required: New users have no guidance on getting started

- [ ] **Insights Generation from Real Data**
  - Status: Missing (seeded dummy data)
  - Why Required: The core value proposition of AI-generated insights

- [ ] **Real-Time Sync Status Notifications**
  - Status: Missing
  - Why Required: Users need to know when sync completes

- [ ] **Document Search / Browse Interface**
  - Status: Missing
  - Why Required: Users need to understand what Corely knows before asking questions

- [ ] **Billing & Usage Tracking**
  - Status: Missing
  - Why Required: Required for any monetization

- [ ] **Team Management**
  - Status: Missing
  - Why Required: Enterprise requires inviting team members with roles

---

# Production Readiness Scores

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Product Maturity** | 4/10 | Vision is excellent, core Q&A feature works, but 70% of the product surface is mock UI |
| **Architecture** | 5/10 | Correct technology choices (pgvector, BullMQ, streaming), but no auth, dual storage split, worker can't deploy on serverless |
| **Backend** | 4/10 | APIs exist and handle basic cases, but no auth middleware, no validation, no rate limiting |
| **Frontend** | 6/10 | Excellent design quality, consistent system, but hardcoded data on most pages, no auth state management |
| **Retrieval Intelligence** | 3/10 | Basic semantic search works, but no temporal scoring, no hybrid search, no re-ranking — all core differentiators missing |
| **Security** | 1/10 | No authentication is a complete failure. OAuth state is unsecured. Encryption is weak. |
| **Scalability** | 3/10 | Sequential embedding, no connection pooling, worker can't run on serverless, no caching |
| **Enterprise Readiness** | 1/10 | No auth, no permissions, no audit logs, no SOC2 posture, no billing, no SSO |
| **Demo Readiness** | 6/10 | Looks excellent in a scripted demo, breaks under exploration. Needs a carefully curated demo environment |

**Overall Score: 3.7/10**

---

# Final Brutal Verdict

## Would this realistically feel like a hackathon prototype OR an early-stage venture-backed SaaS?

**Honest answer: A polished hackathon prototype, not a venture-backed SaaS.**

Here is exactly why:

**It looks like a SaaS.** The UI design is genuinely impressive — clean typography, consistent color system, premium feel across all pages. The Insights, Teams, and Memory pages are visually sophisticated. A non-technical judge viewing a scripted demo could absolutely believe this is a production product.

**It does not behave like a SaaS.** The moment any technical evaluator opens their browser's developer tools or reads even 100 lines of the backend code, they will find:
- `prisma.user.findFirst()` — auth by database lottery
- `const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"` — hardcoded multi-tenancy
- Seeded dummy data in production APIs
- 4 of 6 promised connectors are completely absent from the codebase
- A BullMQ worker that "silently enters standby mode" when Redis is unavailable

**The vision is genuinely differentiated.** "Temporal Intelligence" + "Permission-Aware Retrieval" + "Decision Reconstruction" is a compelling and defensible product positioning. The tragedy is that none of these three core differentiators exist in the implementation. The product is positioned as infrastructure and behaves as a demo.

**What prevents this from being called early-stage venture-backed:**
1. **No authentication** is not an MVP compromise — it's a fundamental product blocker that makes the system technically useless for any real customer
2. **The core differentiators are in the tagline but not in the code** — an investor who sees "Permission-Aware Retrieval" in the deck and then reads the retrieval code will immediately distrust all other claims
3. **Mock data seeded in production APIs** signals that the product was built for demo impressiveness rather than production correctness

**What makes this compelling as a hackathon project:**
- The ingestion pipeline (Notion + Drive) genuinely works and is well-engineered
- The streaming Ask Corely interface is impressive and functional
- The visual design is professional-grade
- The technology choices (pgvector, BullMQ, GPT-4o-mini) are correct for the domain
- The content hash deduplication and encrypted token storage show real engineering rigor

**To become a real venture-backed SaaS in 90 days**, the team needs to:
1. Implement authentication (2 weeks)
2. Fix multi-tenancy isolation (1 week)  
3. Add incremental sync + batch embedding (1 week)
4. Add one more high-value connector (Slack, 2 weeks)
5. Build at least one real AI-generated insight (2 weeks)
6. Deploy the worker on a persistent runtime (1 week)
7. Add rate limiting and basic security headers (1 week)

That is a credible path. The foundation is not bad — it just needs to match its own promises.

---

# Final Action Plan

## Immediate Critical Fixes (Do Before Any Demo)
1. **Replace all `prisma.user.findFirst()` calls with proper auth middleware** — This is the single most important fix. Even a simple hardcoded API key is better than no auth.
2. **Remove hardcoded `WORKSPACE_ID` from frontend components** — Replace with a context provider that reads from session/localStorage.
3. **Fix the PDF parsing code** — The current implementation uses incorrect pdf-parse API. Change to `const pdf = require('pdf-parse'); const result = await pdf(buffer); rawContent = result.text;`
4. **Ensure BullMQ worker is deployed separately** — Create a Railway or Render service running `workers/index.ts` with proper Redis connection.
5. **Create a curated demo environment** — A Google Drive folder with 10 pre-loaded documents covering "company strategy", "Q2 OKRs", "customer feedback" themes.

## High-Leverage Improvements (2-4 Weeks)
1. **Batch embedding calls** — Collect all chunks for a document and call OpenAI once per document instead of once per chunk. This is a 1-hour change that makes ingestion 50-100x faster.
2. **Add incremental sync** — Add `modifiedTime > lastSyncedAt` filter to both connectors. Reduces sync time from minutes to seconds for subsequent syncs.
3. **Add Slack connector** — Slack is the highest-value missing connector. Use the Conversations History API with OAuth to index channel messages.
4. **Add hybrid search** — Implement BM25 keyword search alongside pgvector semantic search. Combine scores with RRF (Reciprocal Rank Fusion).
5. **Add temporal scoring** — Implement the exponential decay scoring on retrieved chunks using the stored `last_edited_time` metadata.

## Must-Build Before Any Customer Submission
1. **Full authentication system** (NextAuth.js or Clerk) with workspace-scoped sessions
2. **Permission-aware retrieval** — store Google Drive file permissions per document, filter at retrieval time
3. **Real AI-generated insights** — daily cron job that runs prompt engineering over recent ingested content to generate 3-5 real insights
4. **Billing and usage metering** — Stripe integration with per-query and per-document usage tracking
5. **Health check endpoint** at `/api/health`
6. **Structured logging** with Pino + log drain to Datadog or Logtail

## Nice-to-Have Polish
1. Loading skeletons on all data pages
2. Toast notifications for sync completion
3. Export functionality (download conversation history as PDF)
4. Keyboard shortcuts in Ask Corely (Cmd+K to open)
5. Dark mode toggle
6. Demo mode with sample data for prospects who haven't connected sources yet
7. Feedback mechanisms on AI responses (thumbs up/down to improve retrieval)
8. Streamed sync progress (WebSocket or SSE) instead of polling status

---

*End of Audit. This document represents a complete, engineering-grade assessment of the Corely system as of May 27, 2026.*
