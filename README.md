# NEXUS LUXE — Full-Stack Production-Ready E-Commerce Platform

A complete, modern, scalable, and fully functional commercial e-commerce application engineered with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

Designed with a sophisticated, minimalist **4-color palette**:
- **Primary Blue**: `#2563EB` (Dark: `#1D4ED8`, Light: `#EFF6FF`)
- **Secondary White**: `#FFFFFF`
- **Main Dark / Black**: `#111827`
- **Supporting Neutral Gray**: `#F3F4F6` (Border: `#E5E7EB`, Background: `#F9FAFB`)

---

## 🌟 Key Features & Capabilities

### 1. Customer Shopping Storefront
- **Dynamic Homepage**: Hero banner carousel with call-to-actions, trust seals, live countdown flash sales, featured collections, trending flagships, brand partners, customer rating breakdown, and newsletter subscription.
- **Dynamic Catalog (`/products`)**:
  - Filter by category, brand, price slider, in-stock availability, and flags (Featured, Trending, Flash Deals).
  - Dynamic database-driven sorting (Featured, Price Low to High, Price High to Low, Newest, Top Rated).
  - Pagination and clean search query URLs.
- **Product Details (`/products/[slug]`)**:
  - Multi-image gallery with zoom thumbnail switcher.
  - Interactive variant selector (Size, Color, Edition, Storage) with live SKU and price recalculation.
  - Real-time stock status indicator.
  - Interactive PIN code serviceability and delivery timeline checker.
  - Detailed technical specifications table & manufacturer warranty.
  - Verified buyer review breakdown with interactive "Write Review" modal.
  - Frequently bought together recommendations.
- **Real-Time Autocomplete Search (`/search`)**:
  - Instant live dropdown suggestions matching product titles, SKUs, and categories.
- **Persistent Cart (`/cart`)**:
  - Quantity increase/decrease/remove with inventory limit guards.
  - Dynamic promotional coupon validation engine (`WELCOME10`, `FLAT500`, `SUPERDEAL`).
  - Automated calculation of subtotal, discount, shipping fee (Free over ₹999), and GST taxes.
- **Multi-Step Checkout (`/checkout`)**:
  - Step 1: Customer details & shipping destination address with 6-digit PIN code validation.
  - Step 2: Shipping speed selection (Standard vs Priority Express).
  - Step 3: Payment method (Razorpay online payment vs Cash on Delivery).
  - Order review with server-side price recalculation (never trusts frontend prices).
  - Idempotent order placement with atomic stock reservation.
  - Confirmation page (`/checkout/success`) with order number and tracking links.
- **Customer Dashboard (`/account`)**:
  - Profile overview with metrics (total orders, saved items, member status).
  - Order history with live status tags and tracking timelines.
  - Detailed order view (`/account/orders/[id]`) with printable tax invoice and customer cancellation workflow.
  - Saved delivery addresses management (`/account/addresses`).
  - Saved wishlist (`/account/wishlist`) with 1-click move to cart.
  - Concierge support tickets (`/support`) with live customer-staff messaging threads.
  - Security and password updates (`/account/security`).
- **Legal & Informational Pages**:
  - About Us (`/about`), Contact Us (`/contact`), FAQ (`/faq`), Privacy Policy (`/privacy-policy`), Terms & Conditions (`/terms`), Return Policy (`/return-policy`), Shipping Policy (`/shipping-policy`), Track Order lookup (`/track-order`).

---

### 2. Comprehensive Administration System (`/admin`)
- **Admin Dashboard Overview (`/admin/dashboard`)**:
  - Gross Merchandise Value (GMV) / Revenue from verified paid orders.
  - Total orders, pending orders, and delivered orders counters.
  - Total registered customers count.
  - Low-stock SKU alerts counter with quick navigation.
  - Visual responsive weekly sales trend chart.
  - Recent orders table with live fulfillment action buttons.
  - Top-selling products leaderboard.
- **Product Management (`/admin/products`)**:
  - Full catalog data table with thumbnail, SKU, price, stock, and status.
  - Create new product (`/admin/products/create`) with variants, attributes, images, and homepage badges.
  - Delete product with confirmation dialog and database cascade.
- **Order Management (`/admin/orders`)**:
  - Filter orders by status (`ALL`, `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
  - Order detail control panel (`/admin/orders/[id]`) to update status transitions, assign courier names and AWB tracking numbers, and add internal admin notes.
- **Inventory & Warehouse Tracking (`/admin/inventory`)**:
  - Multi-warehouse allocation (Mumbai, Bengaluru, Delhi NCR hubs).
  - SKU stock thresholds and low-stock warnings.
- **Coupons & Campaigns (`/admin/coupons`)**:
  - Manage percentage and fixed discount coupons with minimum spend thresholds, max discount caps, and usage limits.
- **Customer Directory (`/admin/customers`)**:
  - Customer directory with registered dates, order volume, and lifetime spend.
- **Support Desk (`/admin/support`)**:
  - Customer ticket management with categories, priority tags, and status updates.
- **Store Configuration (`/admin/settings`)**:
  - Legal corporate details, registered GSTIN, concierge contacts, and payment gateway configuration guides.

---

## 🛠️ Technology Stack Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React |
| **Backend & APIs** | Next.js Route Handlers (`app/api/*`), Node.js, RESTful Architecture, Zod Validation |
| **Database & ORM** | PostgreSQL / SQLite via Prisma ORM (relational schema, indexes, atomic transactions) |
| **Authentication** | JWT via `jose`, bcrypt password hashing, HTTP-only secure cookie sessions, RBAC |
| **Payments** | Razorpay integration (UPI, Cards, Net Banking) + COD + HMAC SHA-256 signature verification |
| **Logistics** | Shiprocket & Delhivery architecture, PIN code serviceability, real-time tracking timeline |
| **Theme** | 4-Color Palette: Blue (`#2563EB`), White (`#FFFFFF`), Black (`#111827`), Gray (`#F3F4F6`) |

---

## 🚀 Local Quickstart Guide

### Step 1: Open the Project Directory
Set your active workspace or navigate to the project directory:
```bash
cd "C:\Users\raj patel\.gemini\antigravity\scratch\ecommerce-store"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Initialize Database & Seed Realistic Data
Run the all-in-one setup command to generate the Prisma client, push the relational schema, and seed realistic demo products, categories, warehouses, admins, and coupons:
```bash
npm run db:setup
```

*(Alternatively, run individually: `npx prisma generate`, `npx prisma db push`, `npx tsx prisma/seed.ts`)*

### Step 4: Start the Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## 🔑 Pre-Configured Demo Accounts

For immediate testing, the database seed script provides pre-configured credentials:

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Super Admin** | `superadmin@nexuscommerce.com` | `Admin@123456` | `/admin/dashboard` & Full Control |
| **Operations Admin** | `admin@nexuscommerce.com` | `Admin@123456` | `/admin/orders` & Inventory |
| **Customer Demo** | `customer@example.com` | `Customer@123` | Storefront, Cart, Checkout, `/account` |

*(Note: The login page at `/login` and `/admin/login` includes 1-click demo buttons to automatically autofill these credentials for seamless testing!)*

---

## 🎟️ Active Demo Coupons

| Coupon Code | Discount | Minimum Spend | Max Cap |
|---|---|---|---|
| `WELCOME10` | 10% OFF | ₹1,999 | ₹1,000 |
| `FLAT500` | Flat ₹500 OFF | ₹2,999 | ₹500 |
| `SUPERDEAL` | 15% OFF | ₹20,000 | ₹5,000 |

---

## 🧪 Running the 20-Step Automated Test Suite

A standalone test suite is included in `tests/e2e-journey.ts` covering the complete customer journey:
```bash
npx tsx tests/e2e-journey.ts
```

### Test Journey Steps Covered:
1. Register user account in database
2. Verify account status
3. Authenticate user & issue signed session token
4. Browse product catalog
5. Search catalog with live query
6. Apply price range & facet filters
7. Open product details
8. Select variant (size, color, storage)
9. Persist item to customer wishlist
10. Add item to persistent shopping cart
11. Apply coupon code & calculate discount
12. Register delivery address with PIN code
13. Complete checkout & atomic order creation
14. Verify payment gateway HMAC SHA-256 signature
15. Confirm order marked PAID in database
16. Admin updates order status to SHIPPED with courier AWB
17. Verify atomic inventory stock reduction
18. Verify logistics PIN code serviceability
19. Generate order tracking timeline milestones
20. Test cancellation & atomic stock restoration

---

## 📦 Production Deployment & External Integrations

### Database (PostgreSQL)
To switch from SQLite to production PostgreSQL:
1. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@hostname:5432/ecommerce?schema=public"
   ```
3. Run migrations: `npx prisma migrate deploy`

### Razorpay Payments
1. Obtain API Key and Secret from the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Set in `.env`:
   ```env
   RAZORPAY_KEY_ID="rzp_live_yourKeyId"
   RAZORPAY_KEY_SECRET="yourKeySecret"
   RAZORPAY_WEBHOOK_SECRET="yourWebhookSecret"
   ```
3. The platform automatically detects live credentials and transitions from sandbox verification mode to live payment processing.
