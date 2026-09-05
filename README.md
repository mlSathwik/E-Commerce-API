# ShopSphere – Modern E-Commerce Platform

ShopSphere is a modern, full-stack e-commerce platform designed to deliver a seamless online shopping experience. It features a responsive React, Vite, and Tailwind CSS frontend, backed by a scalable Node.js, Express, and TypeScript REST API.
---

## Key Features

### Storefront Experience
- **Responsive Navigation**: Sticky top header with autocomplete product/brand suggestions, dark/light theme switch, live notifications popover, wishlist and cart counter badges, plus a mobile bottom navigation bar (`Home | Shop | Wishlist | Cart | Profile`).
- **Interactive Home Page**:
  - Hero banner with quick CTAs.
  - Featured Categories carousel & quick links.
  - Flash Sale section with real-time countdown timer and discounted pricing.
  - Trending Products, Best Sellers, and New Arrivals.
  - Testimonial carousel and VIP newsletter subscription.
- **Advanced Shop Catalog (`/shop`)**:
  - Multi-faceted filter sidebar (Categories, Brands, Price Range slider, Customer Ratings, Stock availability).
  - Sorting: Featured, Price Low-High, Price High-Low, Highest Rated, Newest, Best Selling, Biggest Discount.
  - Responsive layout (4 columns on desktop, 3 on tablet, 2 on mobile).
  - Slide-over filter drawer on mobile.
- **Product Details (`/products/:id`)**:
  - Image gallery with interactive thumbnail switcher and zoom hover effect.
  - Detailed pricing with discount percentage calculations.
  - In-stock availability badges and SKU tracker.
  - Add to Cart, Buy Now, Add to Wishlist, and Side-by-Side Product Comparison.
  - Tabbed sections: Overview, Technical Specifications, Delivery & 30-Day Return Policy, Customer Reviews with star rating breakdown and review submission form.
  - "You may also like" related products carousel.
- **Cart & Slide-Over Drawer (`/cart`)**:
  - Dynamic Free Delivery progress indicator (*"Add ₹... more to get FREE DELIVERY"*).
  - Promo coupon code applicator (e.g. `WELCOME10`, `FLASH50`, `SAVE500`, `FREESHIP`).
  - Order subtotal, coupon savings, estimated GST (5%), shipping calculation.
- **Multi-Step Checkout (`/checkout`)**:
  - Step 1: Shipping address book.
  - Step 2: Delivery methods (Standard Delivery vs Priority Express).
  - Step 3: Payment method (Razorpay online payment with HMAC SHA-256 signature verification vs Cash on Delivery).
  - Step 4: Order review and atomic stock decrement.
- **Celebration & Order Tracking**:
  - `/order-success/:id`: Confetti celebratory animation, Order ID, and estimated arrival.
  - `/orders/:id`: 5-stage visual delivery timeline (*Order Placed -> Confirmed -> Processing -> Shipped -> Delivered*).
  - `/orders`: Customer's complete order history with status filters (*All, Confirmed, Processing, Shipped, Delivered, Cancelled*).
- **Product Comparison (`/compare`)**:
  - Side-by-side spec, pricing, rating, and feature comparison for up to 4 models.
- **Customer Profile (`/profile`)**:
  - Edit personal details, password security, and default shipping addresses.

---

### Admin Dashboard (`/admin`)
- Protected role-based route (`ADMIN` role only).
- **Dashboard Overview**: Top KPI cards (Total Revenue, Orders, Customers, Active Products, Low-Stock Alert), Recharts weekly revenue area chart, sales by category donut chart, top-selling products, and recent orders.
- **Product Catalog Management (`/admin/products`)**: Data table with live search, stock badges, Add/Edit modal with image upload preview, SKU, price, discount, inventory, and category assignment.
- **Order Management (`/admin/orders`)**: Manage fulfillment statuses (*Confirmed, Processing, Shipped, Delivered, Cancelled*) with automatic inventory rollback on cancellation.
- **Inventory Control (`/admin/inventory`)**: Stock level monitoring, low-stock threshold alerts (≤ 5 units), and quick stock adjustment.
- **Category & Brand Management (`/admin/categories`, `/admin/brands`)**: Full CRUD management with product counts.
- **Coupon Manager (`/admin/coupons`)**: Create promo codes with percentage or flat discounts, expiry dates, minimum order limits, and usage caps.
- **Review Moderation (`/admin/reviews`)**: View customer reviews, filter by star ratings, and remove inappropriate content.
- **Business Analytics (`/admin/analytics`)**: Time-series reports (7d, 30d, 90d, 1y) for revenue growth, order volume, and conversion rates using Recharts.
- **Store Settings (`/admin/settings`)**: Currency, shipping minimums, and tax rate configuration.

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with dark and light mode support
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Server State**: TanStack Query v5 & Axios API Client
- **Charts & Visuals**: Recharts & Canvas Confetti
- **Testing**: Vitest, React Testing Library, and jsdom

### Backend
- **Runtime & Framework**: Node.js, Express.js, TypeScript
- **Database ORM**: PostgreSQL with Prisma ORM (with in-memory fallback layer for turnkey local development)
- **Caching**: Redis via `ioredis` (with graceful offline fallback)
- **Authentication**: JWT Access Token (1d) + Refresh Token (7d) + bcryptjs
- **Payment Processing**: Razorpay API with server-side HMAC SHA-256 signature verification
- **File Uploads**: Multer with MIME validation and 5MB size limits
- **Security & Utilities**: Helmet, CORS, express-rate-limit, Morgan, Zod schema validation
- **Documentation**: Swagger / OpenAPI 3.0 UI mounted at `/api/docs`
- **Testing**: Vitest with Supertest

---

## Project Structure

```
E-Commerce API/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment, Redis client, Prisma client, Swagger spec
│   │   ├── controllers/        # Auth, Products, Cart, Orders, Payments, Admin, etc.
│   │   ├── middleware/         # Auth JWT, Role guard, Error handler, Multer, Rate limit
│   │   ├── prisma/             # schema.prisma, seed.ts
│   │   ├── routes/             # Modular Express routes
│   │   ├── services/           # DB resilience, Redis cache service, Razorpay service
│   │   ├── types/              # Backend TypeScript interfaces
│   │   ├── utils/              # Token helpers, response formatters, logger
│   │   ├── validators/         # Zod schemas for request validation
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server bootstrap
│   ├── tests/                  # Integration tests (Vitest + Supertest)
│   ├── uploads/                # Static image upload directory
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Modular Axios API clients
│   │   ├── components/         # Reusable UI, Layout, Product cards, Cart drawer
│   │   ├── contexts/           # Auth, Cart, Wishlist, Theme, Notifications
│   │   ├── pages/              # Home, Shop, ProductDetails, Cart, Checkout, Admin, etc.
│   │   ├── routes/             # AppRoutes
│   │   ├── types/              # Frontend TypeScript interfaces
│   │   ├── utils/              # Formatters, currency, cn helper
│   │   ├── App.tsx             # Root component with providers
│   │   ├── main.tsx            # React DOM entry
│   │   └── index.css           # Tailwind directives and custom scrollbars
│   ├── tests/                  # Component unit tests (Vitest + RTL)
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Backend Setup
```bash
cd backend
npm install
```

Generate Prisma Client:
```bash
npm run prisma:generate
```

Configure Environment:
Check `backend/.env` (pre-configured with development defaults):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shopsphere?schema=public
JWT_ACCESS_SECRET=shopsphere_super_secret_access_jwt_key_2025_secure
JWT_REFRESH_SECRET=shopsphere_super_secret_refresh_jwt_key_2025_secure
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=rzp_test_shopsphere_mock_id
RAZORPAY_KEY_SECRET=shopsphere_mock_secret_key_12345
```

> **Note on Database & Redis Resilience**:
> If PostgreSQL or Redis are not currently active on your local machine, the backend automatically logs a fallback notice and operates with an internal high-performance store pre-seeded with all 10+ categories, 10+ brands, 16+ realistic products, demo users, and active coupons. You do not need to install or start external database services to test or evaluate the application!

Start Backend Development Server:
```bash
npm run dev
```
- API Base: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`
- Swagger Documentation: `http://localhost:5000/api/docs`

---

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Demo Accounts (1-Click Login on UI)

The login page (`/login`) includes **1-Click Quick Demo Login** buttons for instant evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@shopsphere.com` | `Admin@123456` | Full access to `/admin` dashboard, inventory, products, orders, coupons |
| **Customer** | `customer@shopsphere.com` | `Customer@123456` | Storefront browsing, cart, checkout, wishlist, review submission, order tracking |

---

## Testing

### Backend Tests
Integration tests verify health checks, authentication, product filtering, coupons, cart actions, orders, stock reduction, and admin dashboard stats:
```bash
cd backend
npm test
```

### Frontend Tests
Component tests verify rendering, routing, pricing formatting, and cart interactions:
```bash
cd frontend
npm test
```

---

## Production Build

### Compile Backend:
```bash
cd backend
npm run build
```

### Compile Frontend:
```bash
cd frontend
npm run build
```
The compiled frontend bundle will be placed in `frontend/dist`.

---

## License
MIT License. Developed for ShopSphere Modern E-Commerce Platform.
