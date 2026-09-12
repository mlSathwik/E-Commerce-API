import { Request } from 'express';

export type Role = 'CUSTOMER' | 'ADMIN';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'RAZORPAY' | 'EMI' | 'COD';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ProductVariantItem {
  id: string;
  productId: string;
  sku: string;
  color?: string | null;
  storage?: string | null;
  ram?: string | null;
  size?: string | null;
  processor?: string | null;
  screenSize?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  image?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'bestselling' | 'discount';
  featured?: boolean;
  trending?: boolean;
  flashSale?: boolean;
  color?: string;
  storage?: string;
  ram?: string;
  size?: string;
}

export interface DeliveryOptionItem {
  id: string;
  name: string;
  code: string;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
}

export interface EMIPlanItem {
  id: string;
  months: number;
  interestRate: number;
  minAmount: number;
  isActive: boolean;
}
