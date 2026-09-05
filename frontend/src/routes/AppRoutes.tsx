import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout.js';
import { AdminLayout } from '../components/layout/AdminLayout.js';

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
import { NotFound } from '../pages/NotFound.js';

// Admin Pages
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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderTracking />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<AdminLayout />}>
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
