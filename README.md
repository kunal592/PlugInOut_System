# PlugInOut System

A modular SaaS platform with a core pay-per-tool architecture.

## Core Platform
- **Backend**: NestJS + Fastify + Prisma (PostgreSQL)
- **Frontend**: Next.js 14 App Router
- **Infra**: Docker, Redis

## Tools (Plugins)
The `tools/` directory contains 8 independent business tools. Each tool is a self-contained plugin.

| Tool | Slug | Schema Prefix | Price (INR) | Type |
|------|------|---------------|-------------|------|
| Invoice Generator | `invoice` | `tool_invoice_*` | ₹199 | One-Time |
| Expense Tracker | `expense-tracker` | `tool_expense_*` | ₹99 | Subscription |
| GST Calculator | `gst-calculator` | `tool_gst_*` | Free | Free |
| Payroll Management | `payroll` | `tool_payroll_*` | ₹499 | Subscription |
| Subscription Manager | `subscription-manager` | `tool_submgr_*` | ₹299 | One-Time |
| Profit & Loss | `profit-loss` | `tool_pl_*` | ₹149 | One-Time |
| Cash Flow Tracker | `cash-flow` | `tool_cashflow_*` | ₹99 | One-Time |
| Purchase Order | `purchase-order` | `tool_po_*` | ₹199 | One-Time |

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   npm run db:migrate
   npm run db:seed
   ```

   **Important**: Each tool has its own Prisma client. You must generate them:
   ```bash
   # Example for Invoice Tool
   cd tools/invoice/backend && npx prisma generate
   # (Repeat for all tools or write a script)
   ```

3. **Run Platform**
   ```bash
   npm run dev
   ```

## Architecture Rules
1. **Core Only**: Auth, Billing (Razorpay), User Management.
2. **Tools Only**: Domain logic, Tool-specific tables.
3. **No Crossing**: Tools never touch core tables. Core never imports tool code directly.
