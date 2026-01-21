# 1️⃣ SEQUENCE DIAGRAMS (TEXTUAL, SYSTEM-DESIGN STYLE)

## 1.1 User Buys a Tool (Pay-Per-Tool Flow)

```
User
 → Frontend
   → API Gateway
     → Auth Service (JWT verify)
     → Billing Service
        → Payment Provider (Stripe)
        ← Payment Success
     → Billing Service
        → Emit EVENT: TOOL_PURCHASED
     → Tool Registry Service
        → Activate tool for user
     → Emit EVENT: TOOL_ACTIVATED
 ← Response
 → Frontend updates UI
```

**Key Points**

* Tools are **not called**
* Billing is the source of truth
* Activation happens via event

---

## 1.2 Accessing a Tool API

```
User
 → Frontend
   → API Gateway
     → Auth Service
     → Tool Registry (Is tool active?)
     → Route request
         → Tool Service (Invoice)
             → Tool DB
         ← Response
 ← Response
```

**Fail Case**

* Tool expired → Gateway blocks request
* Tool service never checks payment

---

## 1.3 Tool Expiry (Auto Disable)

```
Cron / Scheduler
 → Billing Service
   → Detect expired subscription
   → Emit EVENT: TOOL_EXPIRED
 → Tool Registry
   → Mark tool inactive
 → Emit EVENT: TOOL_DISABLED
 → Notification Service
   → Email user
```

---

## 1.4 Monolith → Micro Extraction (Tool Example)

```
Old Flow:
Monolith → Invoice Module → DB

New Flow:
Gateway
 → Invoice Service
   → Invoice DB
Monolith invoice code removed
```

---

# 2️⃣ EXACT DATABASE SCHEMAS (PRODUCTION-GRADE)

## 2.1 Core Database (PostgreSQL)

### users

```sql
users (
  id UUID PK,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP,
  status TEXT
)
```

---

### tools (tool registry)

```sql
tools (
  id UUID PK,
  slug TEXT UNIQUE,
  name TEXT,
  price INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP
)
```

---

### user_tools (MOST IMPORTANT TABLE)

```sql
user_tools (
  id UUID PK,
  user_id UUID FK(users.id),
  tool_id UUID FK(tools.id),
  status TEXT,          -- active | expired | trial
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)
```

Indexes:

```sql
INDEX(user_id, tool_id)
INDEX(expires_at)
```

---

### subscriptions

```sql
subscriptions (
  id UUID PK,
  user_id UUID,
  tool_id UUID,
  provider TEXT,        -- stripe, paddle
  provider_ref TEXT,
  status TEXT,
  started_at TIMESTAMP,
  ends_at TIMESTAMP
)
```

---

## 2.2 Tool Database (Invoice Example)

> **Database per service** (Micro)
> **Schema isolation** (Mono)

### invoices

```sql
invoices (
  id UUID PK,
  user_id UUID,
  invoice_number TEXT,
  total_amount DECIMAL,
  status TEXT,
  created_at TIMESTAMP
)
```

---

### invoice_items

```sql
invoice_items (
  id UUID PK,
  invoice_id UUID FK(invoices.id),
  description TEXT,
  quantity INTEGER,
  price DECIMAL
)
```

---

## 2.3 Event Store (Optional but Recommended)

```sql
events (
  id UUID PK,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMP
)
```

---

# 3️⃣ EVENT CONTRACTS (STRICT, VERSIONED)

## 3.1 TOOL_PURCHASED

```json
{
  "event": "TOOL_PURCHASED",
  "version": "1.0",
  "data": {
    "userId": "uuid",
    "toolSlug": "invoice",
    "subscriptionId": "uuid",
    "expiresAt": "2026-01-01T00:00:00Z"
  }
}
```

Producers:

* Billing Service

Consumers:

* Tool Registry
* Analytics
* Notification

---

## 3.2 TOOL_ACTIVATED

```json
{
  "event": "TOOL_ACTIVATED",
  "version": "1.0",
  "data": {
    "userId": "uuid",
    "toolSlug": "invoice",
    "activatedAt": "timestamp"
  }
}
```

---

## 3.3 TOOL_EXPIRED

```json
{
  "event": "TOOL_EXPIRED",
  "version": "1.0",
  "data": {
    "userId": "uuid",
    "toolSlug": "invoice",
    "expiredAt": "timestamp"
  }
}
```

---

## 3.4 CONTRACT RULES (NON-NEGOTIABLE)

1. Events are **append-only**
2. Payloads are **versioned**
3. Services must handle unknown fields
4. No breaking changes

---

# 4️⃣ KUBERNETES DEPLOYMENT LAYOUT (REAL WORLD)

## 4.1 Namespaces

```
namespaces:
- core
- tools
- infra
- monitoring
```

---

## 4.2 Core Services (namespace: core)

```
auth-service
billing-service
tool-registry
notification-service
api-gateway
```

Each:

* Deployment
* Service
* HPA
* ConfigMap
* Secret

---

## 4.3 Tool Services (namespace: tools)

```
invoice-service
expense-service
task-service
analytics-service
```

Each tool:

* Independent scaling
* Independent deploy
* Independent DB

---

## 4.4 Example: Invoice Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: invoice-service
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: invoice
          image: invoice-service:1.0.0
          ports:
            - containerPort: 3000
```

---

## 4.5 API Gateway (Ingress)

```
/api/auth      → auth-service
/api/billing   → billing-service
/api/invoice   → invoice-service
```

Ingress:

* TLS
* Rate limiting
* Auth middleware

---

## 4.6 Scaling Strategy

| Component | Scaling   |
| --------- | --------- |
| Gateway   | High      |
| Auth      | Medium    |
| Billing   | Low       |
| Invoice   | Very High |
| Analytics | Burst     |

---

## 4.7 Observability

```
Prometheus → Metrics
Grafana → Dashboards
Jaeger → Tracing
Sentry → Errors
```

---

# 🧠 FINAL SYSTEM TRUTH (READ THIS TWICE)

* Billing never calls tools
* Tools never check payment
* Gateway enforces access
* Events glue everything
* Databases are isolated
* Monolith is temporary
* Architecture is forever

---
