export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'RAZORPAY' | 'COD';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  createdAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  sku: string;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isFlashSale?: boolean;
  specifications?: Record<string, string>;
  images?: string[];
  categoryId: string;
  category?: Category;
  brandId: string;
  brand?: Brand;
  reviews?: Review[];
  relatedProducts?: Product[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  effectivePrice: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  tax: number;
  total: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
  count: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  deliveryMethod: string;
  deliveryEstimate?: string;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
  address?: Address;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  user?: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrder: number;
  maxDiscount?: number | null;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: string;
  featured?: boolean;
  trending?: boolean;
  flashSale?: boolean;
}
