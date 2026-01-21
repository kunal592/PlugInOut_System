# 🛠️ Tool Modification Guide

## Quick Reference: Which Files to Change

When updating a tool, the files you need to modify depend on **what you're changing**:

---

## 📁 Tool Structure Overview

```
tools/<tool-slug>/
├── manifest.json           # Tool metadata & config
├── backend/
│   ├── model.prisma        # Database schema
│   ├── repository.ts       # Data access layer
│   ├── service.ts          # Business logic
│   ├── controller.ts       # API handlers
│   └── routes.ts           # Route definitions
├── frontend/
│   ├── pages/
│   │   └── index.tsx       # Plugin component
│   └── routes.ts           # Frontend routes
└── index.ts                # Entry point

apps/web/src/app/tools/
└── <tool-slug>/
    └── page.tsx            # Next.js frontend page
```

---

## 🔄 Change Scenarios

### 1️⃣ **Update Tool Metadata (Price, Name, Description)**

| Change | File to Edit | Effect on Others |
|--------|-------------|------------------|
| Price | `tools/<slug>/manifest.json` | ❌ No effect |
| Name | `tools/<slug>/manifest.json` | ❌ No effect |
| Description | `tools/<slug>/manifest.json` | ❌ No effect |
| Icon | `tools/<slug>/manifest.json` | ❌ No effect |
| Category | `tools/<slug>/manifest.json` | ❌ No effect |

**Example:**
```json
// tools/invoice/manifest.json
{
  "slug": "invoice",
  "name": "Invoice Generator Pro",  // ← Change here
  "price": 24900,                   // ← Change price here (in paise)
  "description": "Updated desc..."
}
```

⚠️ **Note:** Also update `apps/web/src/app/marketplace/page.tsx` if you have static tool data there.

---

### 2️⃣ **Update UI/Frontend Only**

| Change | File to Edit | Effect on Others |
|--------|-------------|------------------|
| Visual design | `apps/web/src/app/tools/<slug>/page.tsx` | ❌ No effect |
| Add new UI feature | `apps/web/src/app/tools/<slug>/page.tsx` | ❌ No effect |
| Fix UI bug | `apps/web/src/app/tools/<slug>/page.tsx` | ❌ No effect |

**Example:** Change invoice page layout
```tsx
// apps/web/src/app/tools/invoice/page.tsx
// Modify the React component - only affects this tool's UI
```

---

### 3️⃣ **Update Business Logic (Add Feature, Fix Bug)**

| Change | Files to Edit | Effect on Others |
|--------|--------------|------------------|
| Add new API endpoint | `backend/routes.ts`, `controller.ts`, `service.ts` | ❌ No effect |
| Change calculation | `backend/service.ts` | ❌ No effect |
| Add validation | `backend/service.ts` | ❌ No effect |

**Example:** Add discount calculation to invoices
```typescript
// tools/invoice/backend/service.ts
async applyDiscount(invoiceId: string, discountPercent: number) {
    // Add new logic here
}
```

---

### 4️⃣ **Update Database Schema (Add/Remove Fields)**

| Change | Files to Edit | Required Actions | Effect |
|--------|--------------|-----------------|--------|
| Add column | `backend/model.prisma` | Run `prisma migrate` | ⚠️ DB migration needed |
| Remove column | `backend/model.prisma` | Run `prisma migrate` | ⚠️ DB migration needed |
| Add new table | `backend/model.prisma` | Run `prisma migrate` | ⚠️ DB migration needed |

**Example:** Add discount field to Invoice
```prisma
// tools/invoice/backend/model.prisma
model Invoice {
  id          String   @id @default(uuid())
  userId      String
  clientName  String
  discount    Int      @default(0)  // ← NEW FIELD
  // ...
}
```

**Then update:**
1. `repository.ts` - Add field to queries
2. `service.ts` - Add business logic
3. `controller.ts` - Handle in API
4. `apps/web/src/app/tools/<slug>/page.tsx` - Add to UI

**Run migration:**
```bash
cd tools/invoice/backend
npx prisma migrate dev --name add_discount_field
```

---

### 5️⃣ **Add New API Endpoint**

| Step | File | Change |
|------|------|--------|
| 1 | `backend/routes.ts` | Add route definition |
| 2 | `backend/controller.ts` | Add handler method |
| 3 | `backend/service.ts` | Add business logic |
| 4 | `backend/repository.ts` | Add DB query (if needed) |

**Example:** Add "duplicate invoice" endpoint
```typescript
// routes.ts
router.post('/:id/duplicate', (req) => controller.duplicateInvoice(req));

// controller.ts
async duplicateInvoice(req: any) {
    const invoice = await this.service.duplicate(req.params.id, userId);
    return { success: true, data: invoice };
}

// service.ts
async duplicate(id: string, userId: string) {
    const original = await this.repository.findById(id, userId);
    return this.repository.create({ ...original, id: undefined });
}
```

---

## 🔒 Isolation Rules (What CANNOT Affect Others)

| This Tool... | Can Affect | Cannot Affect |
|-------------|-----------|---------------|
| Invoice | `tool_invoice_*` tables | Core tables, other tools |
| Expense Tracker | `tool_expense_*` tables | Core tables, other tools |
| Task Manager | `tool_task_*` tables | Core tables, other tools |

### ✅ Safe Changes (Isolated)
- Any file inside `tools/<slug>/` folder
- Any file inside `apps/web/src/app/tools/<slug>/` folder

### ⚠️ Careful Changes (May Affect Others)
- `apps/web/src/app/marketplace/page.tsx` (shows all tools)
- `apps/web/src/app/tools/page.tsx` (tools listing)
- `apps/web/src/app/settings/page.tsx` (shows purchased tools)

---

## 🔄 Update Checklist

### For UI Changes Only:
```
☐ Edit apps/web/src/app/tools/<slug>/page.tsx
☐ Test in browser
☐ Done!
```

### For Business Logic Changes:
```
☐ Edit tools/<slug>/backend/service.ts
☐ Update controller.ts if new endpoints
☐ Update routes.ts if new routes
☐ Update frontend page.tsx to use new features
☐ Test API endpoints
☐ Test in browser
☐ Done!
```

### For Database Schema Changes:
```
☐ Edit tools/<slug>/backend/model.prisma
☐ Run: npx prisma migrate dev --name <change_name>
☐ Run: npx prisma generate
☐ Update repository.ts with new fields
☐ Update service.ts with new logic
☐ Update controller.ts if needed
☐ Update frontend page.tsx
☐ Test everything
☐ Done!
```

---

## 📊 Impact Matrix

| Change Type | Tool Files | Core Files | DB Migration | Other Tools |
|------------|-----------|-----------|--------------|-------------|
| UI only | ✅ Yes | ❌ No | ❌ No | ❌ No effect |
| Business logic | ✅ Yes | ❌ No | ❌ No | ❌ No effect |
| New API endpoint | ✅ Yes | ❌ No | ❌ No | ❌ No effect |
| DB schema change | ✅ Yes | ❌ No | ✅ Yes | ❌ No effect |
| Tool metadata | ✅ Yes | Maybe* | ❌ No | ❌ No effect |

*May need to update marketplace page if using static data

---

## 🚀 Quick Commands

```bash
# Regenerate Prisma client for a tool
cd tools/invoice/backend
npx prisma generate

# Run migration for a tool
cd tools/invoice/backend
npx prisma migrate dev --name <migration_name>

# Push schema without migration (development only)
cd tools/invoice/backend
npx prisma db push

# View tool's database
cd tools/invoice/backend
npx prisma studio
```

---

## 💡 Best Practices

1. **Always use table prefixes** - `tool_<slug>_*`
2. **Never import from core** - Tools are isolated
3. **Never access other tool tables** - Each tool owns its data
4. **Test in isolation** - One tool change shouldn't break others
5. **Version your migrations** - Name them descriptively

---

## Example: Complete Feature Addition

**Goal:** Add "Payment Link" feature to Invoice tool

### Step 1: Update Schema
```prisma
// tools/invoice/backend/model.prisma
model Invoice {
  // ...existing fields
  paymentLink    String?   // NEW
  paymentStatus  String    @default("PENDING")  // NEW
}
```

### Step 2: Run Migration
```bash
cd tools/invoice/backend
npx prisma migrate dev --name add_payment_link
```

### Step 3: Update Repository
```typescript
// tools/invoice/backend/repository.ts
async updatePaymentLink(id: string, userId: string, link: string) {
    return this.db.invoice.update({
        where: { id, userId },
        data: { paymentLink: link }
    });
}
```

### Step 4: Update Service
```typescript
// tools/invoice/backend/service.ts
async generatePaymentLink(invoiceId: string, userId: string) {
    const link = `https://pay.example.com/${invoiceId}`;
    return this.repository.updatePaymentLink(invoiceId, userId, link);
}
```

### Step 5: Update Controller & Routes
```typescript
// controller.ts
async generatePaymentLink(req: any) { ... }

// routes.ts
router.post('/:id/payment-link', (req) => controller.generatePaymentLink(req));
```

### Step 6: Update Frontend
```tsx
// apps/web/src/app/tools/invoice/page.tsx
<button onClick={() => generatePaymentLink(invoice.id)}>
    Generate Payment Link
</button>
```

---

**Result:** This change ONLY affects the Invoice tool. No other tools or core platform affected! ✅
