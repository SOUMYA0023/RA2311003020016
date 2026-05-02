# Notification System Design

## Stage 1

---

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │          Frontend (Next.js + React + MUI)                      │    │
│   │   /notifications          /notifications/priority             │    │
│   │   AllNotificationsPage    PriorityNotificationsPage           │    │
│   │   FilterBar | Pagination  N-Selector | Sorted List            │    │
│   └──────────────────────────┬────────────────────────────────────┘    │
└─────────────────────────────-│────────────────────────────────────────-┘
                               │  HTTP REST (localhost:3000 → :5000)
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVICE (Express)                         │
│                                                                          │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐   │
│   │  Middleware  │   │    Routes    │   │   Logging Middleware      │   │
│   │  requestLog  │──▶│ /notif.      │   │   Log(stack,level,pkg,   │   │
│   │  errorHandler│   │ /notif/prio  │   │       message)           │   │
│   └──────────────┘   └──────┬───────┘   └──────────────────────────┘   │
│                              │                                           │
│                    ┌─────────▼──────────┐                               │
│                    │    Controllers     │                               │
│                    │  getAllNotif()     │                               │
│                    │  getPriorityNotif()│                               │
│                    └─────────┬──────────┘                               │
│                              │                                           │
│                    ┌─────────▼──────────┐                               │
│                    │     Services       │                               │
│                    │  getNotifications()│                               │
│                    │  getPriority()     │                               │
│                    │  [sort algorithm]  │                               │
│                    └─────────┬──────────┘                               │
│                              │                                           │
│                    ┌─────────▼──────────┐                               │
│                    │    Repository      │                               │
│                    │  fetchNotif()      │                               │
│                    │  fetchAllNotif()   │                               │
│                    └─────────┬──────────┘                               │
└─────────────────────────────-│────────────────────────────────────────--┘
                               │  HTTPS (Bearer token auth)
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              External Evaluation API (20.207.122.201)                    │
│                                                                          │
│   GET  /evaluation-service/notifications   (protected)                  │
│   POST /evaluation-service/logs            (protected)                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Data Flow

#### GET /notifications (All Notifications)

```
1. CLIENT sends:
   GET http://localhost:5000/notifications?limit=10&page=1&notification_type=Placement

2. BACKEND — Middleware:
   requestLogger logs: "Incoming request: GET /notifications"

3. BACKEND — Controller (notificationController.ts):
   - Parses and validates query params (limit, page, notification_type)
   - Calls getNotifications(params)

4. BACKEND — Service (notificationService.ts):
   - Thin pass-through — no sorting applied
   - Calls fetchNotifications(params)

5. BACKEND — Repository (notificationRepository.ts):
   - Builds Axios request with Bearer token header
   - Calls: GET http://20.207.122.201/evaluation-service/notifications
   - Forwards all query params

6. EXTERNAL API:
   - Authenticates Bearer token
   - Returns { notifications: [...] }

7. BACKEND — Repository:
   - Receives and returns raw notification array

8. BACKEND — Controller:
   - Wraps in { notifications: [...] }
   - Returns HTTP 200 JSON

9. CLIENT renders notification cards
```

#### GET /notifications/priority?n=10 (Priority Sorted)

```
1. CLIENT sends:
   GET http://localhost:5000/notifications/priority?n=10

2. BACKEND — Controller:
   - Parses n (default 10)
   - Calls getPriorityNotifications(n)

3. BACKEND — Service:
   - Calls fetchAllNotifications() (limit=100 to capture all)
   - Applies two-pass priority sort (see algorithm below)
   - Slices top N results

4. BACKEND — Repository:
   - Fetches all notifications from external API

5. BACKEND — Controller:
   - Returns { notifications: topN, meta: { topN, returned } }

6. CLIENT renders sorted list: Placement → Result → Event
```

---

### Sorting Algorithm Explanation

#### Why Two-Key Sort?

A single-key sort on type alone would leave ties within the same notification type (e.g., two Placement notifications) in an undefined order — potentially showing older, less relevant ones first. Adding a timestamp tiebreaker ensures deterministic, user-relevant ordering: **most recent notifications float to the top within each priority tier**.

#### Algorithm: Two-Pass Comparator

```typescript
// Type weights (hardcoded constants)
const PRIORITY_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

const sorted = [...all].sort((a, b) => {
  const weightA = PRIORITY_WEIGHTS[a.Type];
  const weightB = PRIORITY_WEIGHTS[b.Type];

  // Pass 1: Primary sort by weight DESC
  if (weightB !== weightA) return weightB - weightA;

  // Pass 2: Tiebreaker — Timestamp DESC (most recent first)
  return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
});

return sorted.slice(0, N);
```

#### Complexity Analysis

| Metric | Value | Explanation |
|--------|-------|-------------|
| **Time** | O(n log n) | `Array.prototype.sort` uses TimSort — O(n log n) worst case |
| **Space** | O(n) | Spread operator `[...all]` creates a copy of size n; sort is in-place on the copy |
| **Comparator** | O(1) | Each comparison does 2 weight lookups + 1 Date parse — constant time |

No external sorting libraries are used — only native JavaScript `Array.prototype.sort`.

---

### Maintaining Top-N Efficiently with New Notifications

#### The Challenge
When new notifications continuously arrive, re-sorting the entire array for every request is costly at scale. Three strategies address this:

#### Strategy 1: Min-Heap of Size N (Recommended for Real-time)
- Maintain a min-heap of size N keyed on (priority_weight, timestamp).
- When a new notification arrives, compare it against the heap's minimum.
- If the new notification ranks higher, pop the minimum and push the new one.
- **Cost per insertion**: O(log N) — significantly better than O(n log n) full resort.
- **Result retrieval**: O(N log N) to extract the heap in sorted order.

```
Heap structure (min at root — weakest priority in the top-N set):
       Event(oldest)
      /              \
   Result(t2)      Placement(t1)
```

#### Strategy 2: Lazy Fetch + Sort (Current Implementation)
- Fetch all notifications on every request, sort, and slice.
- Simple, correct, and sufficient for moderate data volumes (<10,000 notifications).
- **Acceptable for Stage 1** where external API is the single source of truth.

#### Strategy 3: Polling + Cached Sorted List
- Background cron job polls the external API at a configured interval (e.g., every 30 seconds).
- Sorted list is cached in memory (Redis for production).
- API endpoint serves from cache, refreshed on each poll.
- **TTL-based invalidation** ensures eventual consistency.

```
[Cron Job] → fetchAll() → sort() → update cache
[GET /priority] → serve from cache (O(1) read)
```

For production, **Strategy 1 (min-heap) + Strategy 3 (polling cache)** together provide optimal performance.

---

### Scaling Strategy

#### Real-time Notifications
- Replace polling with **WebSockets (Socket.IO)** or **Server-Sent Events (SSE)**.
- The backend pushes new notifications to connected clients immediately.
- Frontend subscribes to a notification stream and updates the priority heap in-place.

```
External API / Queue → Backend WebSocket server → Client connections
```

#### Large Data Streams
- **Pagination**: Already implemented via `limit` and `page` params forwarded to external API.
- **Cursor-based pagination**: Replace page numbers with cursor tokens for consistent results under concurrent inserts.
- **Streaming**: Use Node.js `Transform` streams to pipe large API responses directly to clients without buffering the full dataset in memory.

#### Concurrent Users
- **Horizontal Scaling**: Deploy multiple backend instances behind a load balancer (e.g., AWS ALB, Nginx).
- **Caching Layer**: Redis for storing the sorted top-N list, shared across all instances (avoids redundant sort on each instance).
- **Rate Limiting**: Per-IP rate limits on `/notifications/priority` to prevent sort-abuse.
- **CDN + Cache-Control**: Static assets and infrequently-changing notification lists served from edge CDN.

```
              ┌─────────┐
Clients ──── │   LB    │ ─────────────────────────────────
              └─────────┘          │           │
                │                  ▼           ▼
              ┌─▼──────┐  ┌──────────┐  ┌──────────┐
              │Backend │  │Backend   │  │Backend   │
              │Instance│  │Instance  │  │Instance  │
              └───┬────┘  └────┬─────┘  └────┬─────┘
                  └────────────┼──────────────┘
                               ▼
                         ┌──────────┐
                         │  Redis   │  (shared sorted cache)
                         └──────────┘
```
