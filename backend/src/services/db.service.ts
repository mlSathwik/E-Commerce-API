import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import {
  seedCategories,
  seedBrands,
  seedDeliveryOptions,
  seedEmiPlans,
  seedProducts,
  seedProductVariants,
  seedProductImages,
} from './catalog.data.js';

export interface MemoryStore {
  users: any[];
  refreshTokens: any[];
  addresses: any[];
  categories: any[];
  brands: any[];
  products: any[];
  productVariants: any[];
  productImages: any[];
  carts: any[];
  cartItems: any[];
  wishlists: any[];
  wishlistItems: any[];
  orders: any[];
  orderItems: any[];
  payments: any[];
  reviews: any[];
  coupons: any[];
  notifications: any[];
  deliveryOptions: any[];
  emiPlans: any[];
}

export const initialSeedData: MemoryStore = {
  users: [],
  refreshTokens: [],
  addresses: [],
  categories: [],
  brands: [],
  products: [],
  productVariants: [],
  productImages: [],
  carts: [],
  cartItems: [],
  wishlists: [],
  wishlistItems: [],
  orders: [],
  orderItems: [],
  payments: [],
  reviews: [],
  coupons: [],
  notifications: [],
  deliveryOptions: [],
  emiPlans: [],
};

let isPostgresAvailable = false;
let memoryStore: MemoryStore = { ...initialSeedData };

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPostgresAvailable = true;
    logger.info('Connected to PostgreSQL database via Prisma');
    return true;
  } catch (err: any) {
    isPostgresAvailable = false;
    logger.warn('PostgreSQL connection unavailable. Operating in resilient Memory Store mode with full seed data.');
    return false;
  }
}

export const getDbStatus = () => ({
  isPostgresAvailable,
  mode: isPostgresAvailable ? 'PostgreSQL (Prisma)' : 'Resilient In-Memory Database',
});

export const getMemoryStore = () => memoryStore;
export const setMemoryStore = (store: MemoryStore) => {
  memoryStore = store;
};

export async function initializeSeedData() {
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  const customerPassword = await bcrypt.hash('Customer@123456', 10);

  const adminUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@shopsphere.com',
    name: 'ShopSphere Admin',
    password: hashedPassword,
    phone: '+91 9876543210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'ADMIN',
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const customerUser = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'customer@shopsphere.com',
    name: 'Alex Johnson',
    password: customerPassword,
    phone: '+91 9876543211',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'CUSTOMER',
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultAddress = {
    id: '33333333-3333-3333-3333-333333333333',
    userId: customerUser.id,
    fullName: 'Alex Johnson',
    phone: '+91 9876543211',
    street: '42 Tech Park Avenue, Cyber City',
    addressLine2: 'Tower B, Suite 402',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100',
    country: 'India',
    addressType: 'HOME',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const coupons = [
    {
      id: 'cp100000-0000-0000-0000-000000000001',
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrder: 500,
      maxDiscount: 1500,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      usedCount: 23,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cp100000-0000-0000-0000-000000000002',
      code: 'FLASH50',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      minimumOrder: 2000,
      maxDiscount: 2000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      usedCount: 42,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cp100000-0000-0000-0000-000000000003',
      code: 'SAVE500',
      discountType: 'FIXED',
      discountValue: 500,
      minimumOrder: 2500,
      maxDiscount: null,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 200,
      usedCount: 15,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cp100000-0000-0000-0000-000000000004',
      code: 'SHOP20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minimumOrder: 1000,
      maxDiscount: 3000,
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      usageLimit: 300,
      usedCount: 19,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cp100000-0000-0000-0000-000000000005',
      code: 'FIRSTORDER',
      discountType: 'FIXED',
      discountValue: 250,
      minimumOrder: 999,
      maxDiscount: null,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      usedCount: 52,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const firstProduct = seedProducts[0];
  const firstVariant = seedProductVariants.find((v) => v.productId === firstProduct.id);

  const reviews = [
    {
      id: 'r1000000-0000-0000-0000-000000000001',
      productId: firstProduct.id,
      userId: customerUser.id,
      user: { name: customerUser.name, avatar: customerUser.avatar },
      rating: 5,
      title: 'Remarkable phone, absolutely worth every penny!',
      comment: 'Camera quality, battery endurance, and seamless display make this an exceptional everyday companion.',
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];

  const notifications = [
    {
      id: 'n1000000-0000-0000-0000-000000000001',
      userId: customerUser.id,
      title: 'Welcome to ShopSphere!',
      message: 'Explore our catalog of 110+ premium products and use coupon WELCOME10 for 10% off.',
      type: 'INFO',
      isRead: false,
      link: '/shop',
      createdAt: new Date(),
    },
    {
      id: 'n1000000-0000-0000-0000-000000000002',
      userId: customerUser.id,
      title: 'Flash Sale Live Now!',
      message: 'Get up to 50% discount on smartphones, laptops, and audio gear for the next 24 hours.',
      type: 'SALE',
      isRead: false,
      link: '/deals',
      createdAt: new Date(),
    },
  ];

  const cartId = 'cart-customer-1';
  const wishlistId = 'wishlist-customer-1';

  // Seed sample customer order so order tracking and verified reviews can be tested immediately
  const sampleOrder = {
    id: 'ord-100001',
    orderNumber: 'ORD-98241',
    userId: customerUser.id,
    addressId: defaultAddress.id,
    address: defaultAddress,
    status: 'DELIVERED',
    totalAmount: firstProduct.discountPrice ?? firstProduct.price,
    subtotal: firstProduct.discountPrice ?? firstProduct.price,
    taxAmount: 0,
    shippingAmount: 0,
    discountAmount: 0,
    deliveryMethod: 'STANDARD',
    deliveryEstimate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    couponCode: null,
    notes: 'Please ring the doorbell',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    items: [
      {
        id: 'orditem-1',
        orderId: 'ord-100001',
        productId: firstProduct.id,
        variantId: firstVariant?.id ?? null,
        name: firstProduct.name,
        price: firstProduct.discountPrice ?? firstProduct.price,
        quantity: 1,
        subtotal: firstProduct.discountPrice ?? firstProduct.price,
        variantInfo: firstVariant ? { color: firstVariant.color, storage: firstVariant.storage, sku: firstVariant.sku } : null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
    payment: {
      id: 'pay-100001',
      orderId: 'ord-100001',
      amount: firstProduct.discountPrice ?? firstProduct.price,
      method: 'RAZORPAY',
      status: 'PAID',
      razorpayOrderId: 'order_mock_98241',
      razorpayPaymentId: 'pay_mock_98241',
      razorpaySignature: 'sig_mock_98241',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  };

  // Populate memory store
  memoryStore.users = [adminUser, customerUser];
  memoryStore.refreshTokens = [];
  memoryStore.addresses = [defaultAddress];
  memoryStore.categories = [...seedCategories];
  memoryStore.brands = [...seedBrands];
  memoryStore.products = JSON.parse(JSON.stringify(seedProducts));
  memoryStore.productVariants = JSON.parse(JSON.stringify(seedProductVariants));
  memoryStore.productImages = [...seedProductImages];
  memoryStore.deliveryOptions = [...seedDeliveryOptions];
  memoryStore.emiPlans = [...seedEmiPlans];
  memoryStore.coupons = coupons;
  memoryStore.reviews = reviews;
  memoryStore.notifications = notifications;
  memoryStore.carts = [{ id: cartId, userId: customerUser.id, createdAt: new Date(), updatedAt: new Date() }];
  memoryStore.cartItems = [
    {
      id: 'cartitem-1',
      cartId,
      productId: firstProduct.id,
      variantId: firstVariant?.id ?? null,
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  memoryStore.wishlists = [{ id: wishlistId, userId: customerUser.id, createdAt: new Date(), updatedAt: new Date() }];
  memoryStore.wishlistItems = [
    {
      id: 'wishitem-1',
      wishlistId,
      productId: seedProducts[1]?.id ?? firstProduct.id,
      variantId: null,
      createdAt: new Date(),
    },
  ];
  memoryStore.orders = [sampleOrder];
  memoryStore.orderItems = sampleOrder.items;
  memoryStore.payments = [sampleOrder.payment];

  logger.info(
    `Initialized seed dataset with ${seedCategories.length} categories, ${seedBrands.length} brands, ${seedProducts.length} products, ${seedProductVariants.length} variants, and active coupons.`
  );
}
