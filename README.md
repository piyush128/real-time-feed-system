# Real-Time Feed System

A production-grade distributed activity feed and notification system — built to understand how platforms like Instagram and Twitter handle posts, follows, and real-time updates at scale.

Deployed on **Google Kubernetes Engine (GKE)** with a full CI/CD pipeline via GitHub Actions.

**Live API:** `http://34.93.229.248`

---

## Architecture

```
                        ┌─────────────────────────────────────────┐
                        │              GKE Cluster                │
                        │                                         │
  Client ──────────────▶│  api-service (x2 replicas)              │
  (HTTP/WebSocket)      │       │                                 │
                        │       ├──▶ PostgreSQL                   │
                        │       ├──▶ Redis (cache)                │
                        │       └──▶ Kafka (producer)             │
                        │                │                        │
                        │         ┌──────┴──────┐                 │
                        │         ▼             ▼                 │
                        │   feed-service  notification-service    │
                        │   (consumer)    (consumer + WebSocket)  │
                        │         │             │                 │
                        │         ▼             ▼                 │
                        │    PostgreSQL       Redis               │
                        │    (feed table)   (pub/sub)             │
                        └─────────────────────────────────────────┘

  GitHub Push ──▶ GitHub Actions ──▶ Build & Push Images ──▶ kubectl rollout restart
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | Node.js + Express (ES Modules) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Message Queue | Apache Kafka |
| Real-time | Socket.io (WebSockets) |
| Auth | JWT + bcrypt |
| Containers | Docker |
| Orchestration | Kubernetes (GKE) |
| Cloud | Google Cloud Platform |
| CI/CD | GitHub Actions |

---

## Key Design Decisions

**Fanout-on-write** — When a user creates a post, a Kafka event triggers the feed-service to pre-compute and write feed rows for all followers. Feed reads are O(1) lookups.

**Hybrid fanout for celebrities** — Users with `is_celebrity = true` skip fanout on write. Their posts are fetched directly on read and merged with the pre-built feed. Prevents writing millions of rows per post.

**Redis feed cache** — Feed results cached as sorted sets per user. Cache invalidated on new post fanout. Falls back to PostgreSQL on Redis failure.

**Non-fatal Kafka failures** — Post creation has two separate try/catch blocks. DB failure throws (fatal). Kafka failure logs silently (non-fatal) — post is saved even if the event is dropped.

**Private accounts** — Follow requests go through a `pending → accepted/rejected` state machine. Feed and notification events respect the `status = accepted` constraint.

---

## Database Schema

```
users        → user_id (BIGSERIAL PK), username, email, password_hash, bio, profile_pic, is_private, is_celebrity, created_at
posts        → post_id (BIGSERIAL PK), user_id (FK), caption, created_at
followers    → follower_id (FK), following_id (FK), status (pending/accepted/rejected), created_at
likes        → user_id (FK), post_id (FK), created_at
comments     → comment_id (BIGSERIAL PK), user_id (FK), post_id (FK), content, created_at
feed         → user_id (FK), post_id (FK), created_at  [index on (user_id, created_at DESC)]
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/posts` | Yes | Create a post |
| POST | `/api/follow/:userId` | Yes | Follow a user |
| PATCH | `/api/follow/:followerId/accept` | Yes | Accept a follow request |
| PATCH | `/api/follow/:followerId/reject` | Yes | Reject a follow request |
| GET | `/api/feed` | Yes | Get home feed |

---

## Services

| Service | Port | Description |
|---|---|---|
| api-service | 3000 | Handles all HTTP requests |
| notification-service | 3001 | WebSocket server + Kafka consumer |
| feed-service | — | Kafka consumer, writes fanout to feed table |

---

## Run Locally

**Prerequisites:** Docker, Docker Compose

**1. Clone the repo**
```bash
git clone https://github.com/piyush128/real-time-feed-system.git
cd real-time-feed-system
```

**2. Create your `.env` file**
```bash
cp .env.sample .env
```

Edit `.env` with your values (see `.env.sample` for reference).

**3. Start all services**
```bash
docker-compose up --build
```

This starts: PostgreSQL, Redis, Kafka, Zookeeper, api-service, feed-service, notification-service.

Migrations run automatically on first boot via `docker-entrypoint-initdb.d`.

**4. Test the API**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@test.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@test.com", "password": "password123"}'

# Create a post (use token from login)
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"caption": "Hello World"}'

# Get feed
curl http://localhost:3000/api/feed \
  -H "Authorization: Bearer <token>"
```

**5. Import Postman collection**

Import `postman/collection.json` into Postman. Set the `{{token}}` variable after login — all protected requests will use it automatically.

**6. Connect to real-time notifications (WebSocket)**
```
ws://localhost:3001?token=<jwt>
```

---

## Real-Time Notifications Flow

1. Client connects to notification-service via WebSocket with JWT
2. User creates a post → api-service publishes `post_created` to Kafka
3. notification-service consumes event → looks up online followers in Redis
4. Pushes notification to connected follower sockets in real time

---

## CI/CD Pipeline

Every push to `main` triggers GitHub Actions:

1. Builds all 3 Docker images (`linux/amd64`) 
2. Pushes to Google Artifact Registry
3. Runs `kubectl rollout restart` on GKE

---

## Performance Testing

Load tested against the live GKE deployment using [k6](https://k6.io/).

**Endpoint:** `GET /api/feed` (Redis-cached, JWT protected)

| VUs | Duration | Throughput | Avg Latency | p(95) | Error Rate |
|-----|----------|------------|-------------|-------|------------|
| 10  | 30s      | 77.7 req/s | 124ms       | 263ms | 0%         |
| 50  | 30s      | 187.5 req/s | 261ms      | 733ms | 0%         |

API remained stable under 50 concurrent users with zero errors. Latency increase under load is expected queuing behaviour.

To run the load test yourself:
```bash
brew install k6
k6 run load-test/feed.test.js
```

---

## Kubernetes Deployment (GKE)

All services run on a 2-node GKE cluster (`e2-small`, `asia-south1-a`).

```bash
# Apply all manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/zookeeper.yaml
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/feed-service.yaml
kubectl apply -f k8s/notification-service.yaml
kubectl apply -f k8s/api-service.yaml

# Run migrations (first time only)
kubectl cp migrations/001_initial_schema.sql <postgres-pod>:/tmp/001.sql
kubectl cp migrations/002_add_celebrity_flag_to_users.sql <postgres-pod>:/tmp/002.sql
kubectl exec -it <postgres-pod> -- psql -U <DB_USER> -d <DB_NAME> -f /tmp/001.sql
kubectl exec -it <postgres-pod> -- psql -U <DB_USER> -d <DB_NAME> -f /tmp/002.sql
```
