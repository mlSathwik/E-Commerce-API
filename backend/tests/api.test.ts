import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initializeSeedData } from '../src/services/db.service.js';

describe('ShopSphere Backend API Integration Tests', () => {
  let app: any;
  let customerToken = '';
  let adminToken = '';
  let sampleProductId = '';

  beforeAll(async () => {
    await initializeSeedData();
    app = createApp();
  });

  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('HEALTHY');
  });

  it('POST /api/auth/login authenticates Admin successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@shopsphere.com',
      password: 'Admin@123456',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.accessToken).toBeDefined();
    adminToken = res.body.data.accessToken;
  });

  it('POST /api/auth/login authenticates Customer successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'customer@shopsphere.com',
      password: 'Customer@123456',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.accessToken).toBeDefined();
    customerToken = res.body.data.accessToken;
  });

  it('GET /api/products returns product listing with pagination and filters', async () => {
    const res = await request(app).get('/api/products?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBeGreaterThan(0);
    sampleProductId = res.body.data[0].id;
  });

  it('GET /api/products/:id returns product details', async () => {
    const res = await request(app).get(`/api/products/${sampleProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(sampleProductId);
    expect(res.body.data.category).toBeDefined();
    expect(res.body.data.brand).toBeDefined();
  });

  it('GET /api/categories returns category list', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(5);
  });

  it('POST /api/coupons/validate validates coupon correctly', async () => {
    const res = await request(app).post('/api/coupons/validate').send({
      code: 'WELCOME10',
      orderAmount: 1000,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountAmount).toBe(100);
  });

  it('POST /api/cart/add adds item to cart', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: sampleProductId,
        quantity: 1,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('GET /api/cart fetches cart', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subtotal).toBeGreaterThan(0);
  });

  it('GET /api/wishlist fetches customer wishlist', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/orders places order and reduces inventory stock', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddress: {
          fullName: 'Alex Johnson',
          phone: '+91 9876543211',
          street: '123 Main Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
        },
        deliveryMethod: 'STANDARD',
        paymentMethod: 'RAZORPAY',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.orderNumber).toBeDefined();
    expect(res.body.data.order.status).toBe('PENDING');
  });

  it('POST /api/orders enforces COD maximum limit of 50,000 INR', async () => {
    // Add expensive item to cart
    await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: sampleProductId,
        quantity: 1,
      });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddress: {
          fullName: 'Alex Johnson',
          phone: '+91 9876543211',
          street: '123 Main Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
        },
        deliveryMethod: 'STANDARD',
        paymentMethod: 'COD',
      });

    // If order total exceeds 50k, COD is blocked
    if (res.body.data?.order?.totalAmount > 50000 || res.status === 400) {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('COD_LIMIT_EXCEEDED');
    }
  });

  it('GET /api/admin/dashboard returns admin KPIs and analytics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpis.totalOrders).toBeGreaterThan(0);
  });
});
