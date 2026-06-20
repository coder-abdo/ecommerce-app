# 🌟 Premium Multi-Tenant E-Commerce System

A premium, modern e-commerce application powered by a robust Go backend and a highly optimized, fully responsive Vite-React frontend. The application features a strict separation of business logic and presentation layouts, dynamic dashboards, customer storefront with shopping cart & order tracking, admin controls for catalog and orders management, and secure Google OAuth integration.

---

## 🏗 Architecture & Design System

The system is built on a clean, scalable architectural pattern featuring:
1. **Clean Separation of Concerns (UI/Logic)**: Every page in the frontend is split into a pure presentation layer (`src/components/`) and a dedicated business logic hook (`src/hooks/`). This design prevents presentation components from cluttering with React Query synchronization, Redux state selectors, Zod schemas, form handlers, or logic code.
2. **Server State Sync**: Managed entirely through `@tanstack/react-query`, ensuring cache invalidation, loading feedback, and smooth client-to-server synchronizations.
3. **Local State**: Managed with **Redux Toolkit** for local client operations (e.g., cart drawer storage).
4. **Performance-Optimized Forms**: Forms use `@tanstack/react-form` combined with `@tanstack/zod-form-adapter` and **Zod** validation, preventing input lag and unnecessary parent re-renders.
5. **Backend Database Mapping**: Built using **GORM** on a **SQLite** database, supporting automatic table schemas auto-migration and relational seeding.
6. **Authentication & Authorization**: Built around secure JWT tokens managed inside `HttpOnly` cookie wrappers, preventing XSS-based token extraction. Single-Admin authorization enforces access restrictions.

---

## 📁 Directory Structure

```text
ecommerce-app/
├── package.json             # Root-level orchestrator scripts
├── .gitignore               # Strict exclude patterns for secret/local files
├── README.md                # Comprehensive system documentation
├── backend/                 # Go (Golang) Backend Application
│   ├── cmd/server/          # Backend entrypoint
│   │   └── main.go          # Route definitions, CORS, and startup logic
│   ├── config/              # Configuration files
│   │   └── config.go        # Environment variable bindings (.env)
│   ├── handlers/            # HTTP Controller/Action handlers
│   │   ├── auth.go          # Auth handlers (Google OAuth & JWT Credentials)
│   │   ├── product.go       # Products & categories CRUD, plus local asset uploader
│   │   └── order.go         # Orders processing (Checkout, history tracking)
│   ├── middleware/          # Gin middleware
│   │   ├── auth.go          # JWT validator and cookie extractor
│   │   └── role.go          # Role-based access control (Admin restrictions)
│   ├── models/              # GORM Database schemas
│   │   ├── user.go          # User model (Customer vs Admin)
│   │   ├── product.go       # Product & product image models
│   │   ├── category.go      # Product categorization model
│   │   └── order.go         # Order and order item models (historical pricing)
│   ├── utils/               # Helper packages
│   │   ├── db.go            # GORM initialization and auto-migration/seeds
│   │   └── jwt.go           # Signed JWT generator and validator
│   ├── .env                 # Secret credentials and configuration variables
│   └── ecommerce.db         # Local development SQLite database (auto-generated)
│
└── frontend/                # Vite + React + TypeScript Frontend
    ├── package.json         # Client dependencies
    ├── vite.config.ts       # Vite bundler options and proxy configuration
    ├── index.html           # Single Page Application container
    ├── src/
    │   ├── main.tsx         # DOM entrypoint
    │   ├── App.tsx          # Navigation router and wrapper layouts
    │   ├── index.css        # Tailwind configurations and glassmorphism styles
    │   ├── api/             # React Query fetchers and mutations
    │   │   ├── productQueries.ts  # Catalog syncing
    │   │   └── orderQueries.ts    # Orders syncing
    │   ├── components/      # Pure Presentational Components (UI only)
    │   │   ├── Dashboard.tsx        # Telemetry grids and sales charts
    │   │   ├── AdminProductPanel.tsx# Product management, modals, and file uploads
    │   │   ├── AdminOrderPanel.tsx  # Order processing & status updater
    │   │   ├── CustomerShop.tsx     # Shopping storefront catalog
    │   │   ├── CartDrawer.tsx       # Checkout cart drawer
    │   │   ├── CustomerOrders.tsx   # Customer purchase history & visual timeline
    │   │   ├── CustomerProfile.tsx  # Password & settings panels
    │   │   ├── Login.tsx            # Login panel
    │   │   └── Register.tsx         # Registration panel
    │   ├── hooks/           # Business Logic, State, and Form Hooks (Logic only)
    │   │   ├── useDashboard.ts
    │   │   ├── useAdminProducts.ts
    │   │   ├── useAdminOrders.ts
    │   │   ├── useCustomerShop.ts
    │   │   ├── useCartDrawer.ts
    │   │   ├── useCustomerOrders.ts
    │   │   ├── useCustomerProfile.ts
    │   │   ├── useLogin.ts
    │   │   └── useRegister.ts
    │   ├── store/           # Redux global store configurations
    │   │   ├── index.ts     # Store assembly
    │   │   └── cartSlice.ts # Client cart operations
    │   ├── lib/             # Class mergers
    │   │   └── utils.ts     # clsx + tailwind-merge utility helper (cn)
    │   └── utils/           # Static schemas and validations
    │       └── schemas.ts   # Form validation schemas via Zod
```

---

## 🛠 Features Breakdown

### 📊 Admin Telemetry & Analytics Dashboard
- Comprehensive metrics panels including **Total Sales**, **Total Orders**, **Total Customers**, and **Average Order Value**.
- Custom CSS visual sales trends visualization comparing historical checkout records.
- Actionable summaries detailing latest orders and system telemetry.

### 📦 Unified Catalog Admin (Product Panel)
- Full CRUD operations for all product entries.
- Multipart local file uploader permitting direct PNG/JPG asset uploads.
- Category Manager to define taxonomy tags and assign them dynamically during creation.

### 📋 Administrative Orders Controller
- Global listing of all placed orders in the system.
- Detailed itemization displaying historical unit pricing (locking items at checkout cost even if catalog prices change).
- Visual status updating mechanism to transition orders between: `Pending` ➡️ `Shipped` ➡️ `Delivered` (or `Cancelled`).
- Integrated tracking number controllers allowing administrators to assign shipment tracking codes.

### 🛒 Client-Side Shopping Experience & Checkout Wizard
- Interactive catalog browser with search and filter controls.
- Redux-backed Cart Drawer featuring a **premium 4-step Checkout Wizard**:
  - **1. Review**: Itemized quantity updates and subtotal summation.
  - **2. Shipping**: Recipient contact entries and dynamic shipping rate selection (Standard Delivery, Express Courier, Next-Day Priority).
  - **3. Payment**: Simulated payment channels including credit card (with real-time glassmorphic virtual card preview), PayPal, Web3 tokens, and Cash on Delivery.
  - **4. Confirmation**: Invoice summary receipt and mock Transaction ID logs.
- Complete purchase tracking via the **My Orders** screen, showing delivery timelines, structured address details, tracking codes, payment methods/statuses, and invoice breakdowns.

---

## 🔑 Secure Authentication & RBAC

1. **HttpOnly Cookies**: All JWT tokens generated at registration or login are securely sent to the user's browser inside `HttpOnly`, `Secure` (in production), and `SameSite` cookies. The frontend scripts have zero access to the credentials, shielding the app from Cross-Site Scripting (XSS) threats.
2. **Single Administrator Enforcer**: For security, registration cannot grant administrator privileges directly. Instead, administrator privileges are strictly locked to the configured `ADMIN_EMAIL` specified in the `.env` settings. The registration route checks user emails against this value and sets `role = "admin"` if and only if it matches.
3. **Google Sign-In Callback Flow**: Integrates Google OAuth client configuration. Successful login redirect routes through backend code, authenticates accounts, and drops the HTTP cookie redirecting the client safely back to the client application landing page.

---

## ⚙ Environment Configurations

Ensure a `.env` file exists in the `backend/` directory with the following variables configured:

```env
# Backend server port
PORT=8080

# Path to the SQLite local database file
DB_PATH=ecommerce.db

# Private secret string used to sign JWT authorization tokens
JWT_SECRET=4a72d3e910f8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6

# Single Authorized Administrator Email
ADMIN_EMAIL=admin@ecommerce.com

# Google Client OAuth settings
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_REDIRECT_URL=http://localhost:3000/oauth-callback
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Go** (Golang v1.20+)
- **Node.js** (v18+) & **npm**

### 📦 Step 1: Install Dependencies
From the root directory, install the frontend packages:
```bash
npm run install:all
```

### 🏃‍♂️ Step 2: Run Development Servers
From the root folder, launch the concurrent runner:
```bash
npm run dev
```
This command concurrently launches:
- **Go Backend Server**: Port `8080` (with live db auto-migrations and file serving)
- **Vite Frontend Client**: Port `3000` (incorporating automatic proxies for `/api` and `/uploads` requests)

Simply open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🛡 Ignored Files Policy

The root-level `.gitignore` explicitly prevents sensitive credentials or binaries from being committed:
- **Environment variables**: `.env`, `.env.*`, `*.env` files.
- **Local Databases**: SQLite database assets (`ecommerce.db`, `*.db-journal`, `*.db-shm`, `*.db-wal`).
- **Compiled binaries**: Local compiled executables (`backend/main`, `backend/server`, `*.exe`, `*.dll`, `*.so`, `*.dylib`).
- **Dependencies**: `node_modules/` folders for both root and frontend applications.
- **Local Uploads**: Image assets directories (`backend/uploads/`, `uploads/`).
