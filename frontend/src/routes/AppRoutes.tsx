import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout.js';
import { AdminLayout } from '../components/layout/AdminLayout.js';
import { useAuth } from '../contexts/AuthContext.js';
import { ShieldAlert } from 'lucide-react';

// Customer Pages
import { Home } from '../pages/Home.js';
import { Shop } from '../pages/Shop.js';
import { ProductDetails } from '../pages/ProductDetails.js';
import { Cart } from '../pages/Cart.js';
import { Checkout } from '../pages/Checkout.js';
import { OrderSuccess } from '../pages/OrderSuccess.js';
import { Orders } from '../pages/Orders.js';
import { OrderTracking } from '../pages/OrderTracking.js';
import { Wishlist } from '../pages/Wishlist.js';
import { Compare } from '../pages/Compare.js';
import { Profile } from '../pages/Profile.js';
import { Deals } from '../pages/Deals.js';
import { Login } from '../pages/Login.js';
import { Register } from '../pages/Register.js';
import { ForgotPassword } from '../pages/ForgotPassword.js';
import { ResetPassword } from '../pages/ResetPassword.js';
import { NotFound } from '../pages/NotFound.js';

// Admin Pages
import { AdminLogin } from '../pages/admin/AdminLogin.js';
import { AdminDashboard } from '../pages/admin/Dashboard.js';
import { AdminProducts } from '../pages/admin/Products.js';
import { AdminCategories } from '../pages/admin/Categories.js';
import { AdminBrands } from '../pages/admin/Brands.js';
import { AdminOrders } from '../pages/admin/Orders.js';
import { AdminInventory } from '../pages/admin/Inventory.js';
import { AdminCustomers } from '../pages/admin/Customers.js';
import { AdminCoupons } from '../pages/admin/Coupons.js';
import { AdminReviews } from '../pages/admin/Reviews.js';
import { AdminAnalytics } from '../pages/admin/Analytics.js';
import { AdminSettings } from '../pages/admin/Settings.js';

const ProtectedCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-3xl font-black text-white">403 - Access Forbidden</h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          Administrator privileges are required to access this backoffice portal.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/" className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">
            Return to Storefront
          </Link>
          <Link to="/admin/login" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500">
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Admin Login Portal */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Customer Storefront Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customer Protected Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedCustomerRoute>
              <Checkout />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <ProtectedCustomerRoute>
              <OrderSuccess />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedCustomerRoute>
              <Orders />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedCustomerRoute>
              <OrderTracking />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedCustomerRoute>
              <Wishlist />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedCustomerRoute>
              <Profile />
            </ProtectedCustomerRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Backoffice Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};
