Below is **two things together**:

1. A **single master CONTEXT** for Antigravity to generate a **fully runnable platform**
2. A **practical TODO / RUNBOOK** so *anyone* can clone, setup, and run the platform locally or on cloud.

This is written like **real internal engineering docs**.

---

# 🔷 MASTER CONTEXT — RUNNABLE PLATFORM (CORE + TOOLS)

## Project Name

**Modular SaaS Platform — Pay Per Tool**

## Goal

Generate a **fully runnable SaaS platform** with:

* Core platform (auth, billing, plugin manager, Razorpay)
* Finance tools as plugins:

  * Invoice Generator
  * Expense Tracker
  * GST Calculator
  * Payroll
  * Subscription Billing Tool
  * Profit & Loss
  * Cash Flow
  * Purchase Orders

The system must run with **one command locally**, and be **cloud-ready**.

---

## Architecture

* Modular Monolith (initial)
* Plugin-based tools
* Razorpay for payments
* PostgreSQL + Prisma
* Redis for cache
* Next.js frontend
* NestJS backend
* Docker-ready

---

## Repo Structure (FINAL)

```
platform/
│
├── core/                 # Core backend (NestJS)
├── tools/                # All plugins
│   ├── invoice/
│   ├── expense/
│   ├── gst/
│   ├── payroll/
│   ├── subscription-tool/
│   ├── pl-report/
│   ├── cashflow/
│   └── purchase-order/
│
├── client/               # Core frontend (Next.js)
├── prisma/               # Core Prisma schema
│   └── schema.prisma
│
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## Runtime Guarantees

* Adding/removing a tool does NOT require touching core
* Core auto-loads tools from `/tools`
* Razorpay controls access via events
* Sidebar updates dynamically
* Tools are lazy-loaded
* DB auto-migrates

---

# 🔧 TODO / RUNBOOK — HOW TO RUN THE PLATFORM

This is the **real checklist**.

---

## PHASE 1 — Local Development Setup

### 1️⃣ System Requirements

Install:

* Node.js 20+
* Docker
* PostgreSQL (or Docker)
* Redis (or Docker)
* pnpm or npm

---

### 2️⃣ Clone & Install

```bash
git clone <repo>
cd platform
npm install
```

---

### 3️⃣ Environment Setup

Create `.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/core
REDIS_URL=redis://localhost:6379

JWT_SECRET=supersecret
JWT_REFRESH_SECRET=superrefresh

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=rzp_test_xxx
```

---

## PHASE 2 — Start Databases

### Option A (Recommended)

```bash
docker-compose up -d
```

This runs:

* PostgreSQL
* Redis
* pgAdmin

---

## PHASE 3 — Database Init

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Creates:

* users
* tools
* user_tools
* subscriptions
* payments
* events

---

## PHASE 4 — Seed Core Data

Seed default tools:

```ts
Tool.createMany([
  { slug: "invoice", name: "Invoice Generator", price: 199 },
  { slug: "expense", name: "Expense Tracker", price: 149 }
])
```

---

## PHASE 5 — Run Backend

```bash
npm run dev:server
```

Starts:

```
http://localhost:4000
```

---

## PHASE 6 — Run Frontend

```bash
npm run dev:client
```

Starts:

```
http://localhost:3000
```

---

# 🧪 TEST FLOW (END TO END)

### 1. Signup user

### 2. Login

### 3. See tool marketplace

### 4. Buy Invoice tool

### 5. Razorpay webhook triggers

### 6. Event → UserTool activated

### 7. Invoice appears in sidebar

### 8. Use tool

---

# 🧭 PRODUCTION RUN PLAN

## Phase A — VPS (Cheap Start)

* Single VM (DigitalOcean / Hetzner)
* Docker Compose
* Nginx reverse proxy

Cost: $20/month

---

## Phase B — Cloud Native

* AWS / GCP
* Kubernetes
* RDS
* Redis Cloud
* Cloudflare CDN

Cost: $300–$1000/month

---

# 🧠 AUTOMATION CHECKLIST

| Task                | Done |
| ------------------- | ---- |
| Prisma migrations   | ✅    |
| Seed scripts        | ⬜    |
| Razorpay webhook    | ✅    |
| Tool registry       | ✅    |
| Plugin loader       | ✅    |
| Dynamic sidebar     | ✅    |
| Payment events      | ✅    |
| UserTool activation | ✅    |
| Error logging       | ✅    |
| Health checks       | ✅    |

---

# 🧨 ONE COMMAND EXPERIENCE (TARGET)

Ultimate goal:

```bash
npm run setup
npm run dev
```

Which internally:

* starts docker
* migrates DB
* seeds tools
* runs backend
* runs frontend

---

# 🧠 FINAL TRUTH

If this context is followed:

* You can onboard new devs in 1 day
* You can add tools without fear
* You can migrate to microservices later
* You can sell tools independently
* You can scale globally

This is **real SaaS foundation**, not tutorial architecture.

