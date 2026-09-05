import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest, OrderStatus } from '../types/index.js';
import { getMemoryStore } from '../services/db.service.js';
import { paymentService } from '../services/payment.service.js';
import { cacheService } from '../services/cache.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      addressId,
      shippingAddress,
      deliveryMethod = 'STANDARD',
      paymentMethod = 'RAZORPAY',
      couponCode,
      notes,
    } = req.body;
    const store = getMemoryStore();

    // 1. Fetch user's cart
    const cart = store.carts.find((c) => c.userId === userId);
    if (!cart) {
      return sendError(res, 400, 'Cart is empty', 'CART_EMPTY');
    }

    const cartItems = store.cartItems.filter((ci) => ci.cartId === cart.id);
    if (cartItems.length === 0) {
      return sendError(res, 400, 'Cart is empty', 'CART_EMPTY');
    }

    // 2. Validate stock for every item before placing order
    for (const item of cartItems) {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product) {
        return sendError(res, 404, `Product not found: ${item.productId}`, 'PRODUCT_NOT_FOUND');
      }
      if (product.stock < item.quantity) {
        return sendError(
          res,
          400,
          `Cannot place order: "${product.name}" only has ${product.stock} units remaining in stock.`,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // 3. Resolve Address
    let resolvedAddress: any = null;
    if (addressId) {
      resolvedAddress = store.addresses.find((a) => a.id === addressId);
    }
    if (!resolvedAddress && shippingAddress) {
      resolvedAddress = {
        id: crypto.randomUUID(),
        userId,
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India',
        isDefault: store.addresses.filter((a) => a.userId === userId).length === 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.addresses.push(resolvedAddress);
    }
    if (!resolvedAddress) {
      return sendError(res, 400, 'Shipping address is required', 'ADDRESS_REQUIRED');
    }

    // 4. Calculate pricing
    let subtotal = 0;
    const orderItemsToCreate: any[] = [];

    for (const item of cartItems) {
      const product = store.products.find((p) => p.id === item.productId)!;
      const price = product.discountPrice ?? product.price;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItemsToCreate.push({
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Coupon discount calculation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = store.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive
      );
      if (coupon && subtotal >= coupon.minimumOrder && new Date() <= new Date(coupon.expiryDate)) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscount);
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        coupon.usedCount += 1;
      }
    }

    const shippingAmount = subtotal >= 1000 ? 0 : deliveryMethod === 'EXPRESS' ? 149 : 99;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * 0.05);
    const totalAmount = Math.max(0, taxableAmount + shippingAmount + taxAmount);

    const orderId = crypto.randomUUID();
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryDays = deliveryMethod === 'EXPRESS' ? 2 : 5;
    const deliveryEstimate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);

    const newOrder = {
      id: orderId,
      orderNumber,
      userId,
      addressId: resolvedAddress.id,
      address: resolvedAddress,
      status: 'CONFIRMED' as OrderStatus,
      totalAmount,
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      deliveryMethod,
      deliveryEstimate,
      couponCode: couponCode || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: orderItemsToCreate.map((item) => ({ ...item, orderId })),
    };

    // 5. Atomic Stock Deduction
    for (const item of cartItems) {
      const product = store.products.find((p) => p.id === item.productId)!;
      product.stock = Math.max(0, product.stock - item.quantity);
      product.updatedAt = new Date();
    }

    // 6. Handle Payment
    let razorpayOrderData: any = null;
    if (paymentMethod === 'RAZORPAY') {
      razorpayOrderData = await paymentService.createOrder(totalAmount, orderNumber);
    }

    const paymentRecord = {
      id: crypto.randomUUID(),
      orderId,
      amount: totalAmount,
      method: paymentMethod,
      status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      razorpayOrderId: razorpayOrderData?.id || null,
      razorpayPaymentId: null,
      razorpaySignature: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save order, items, payment
    store.orders.unshift(newOrder);
    store.orderItems.push(...newOrder.items);
    store.payments.push(paymentRecord);

    // 7. Clear user's cart
    store.cartItems = store.cartItems.filter((ci) => ci.cartId !== cart.id);

    // 8. Invalidate product cache (due to stock updates)
    await cacheService.delPattern('products:*');

    // 9. Send Notification to User
    store.notifications.unshift({
      id: crypto.randomUUID(),
      userId,
      title: 'Order Confirmed!',
      message: `Your order #${orderNumber} for ₹${totalAmount.toLocaleString()} has been placed successfully.`,
      type: 'ORDER',
      isRead: false,
      link: `/orders/${orderId}`,
      createdAt: new Date(),
    });

    return sendSuccess(res, 201, 'Order placed successfully', {
      order: {
        ...newOrder,
        payment: paymentRecord,
      },
      razorpayOrder: razorpayOrderData,
    });
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Failed to place order', 'SERVER_ERROR');
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const store = getMemoryStore();
    const status = req.query.status as string;

    let orders = store.orders.filter((o) => o.userId === userId);
    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.status === status);
    }

    const populated = orders.map((o) => {
      const items = store.orderItems.filter((oi) => oi.orderId === o.id).map((oi) => {
        const product = store.products.find((p) => p.id === oi.productId);
        return {
          ...oi,
          product,
        };
      });
      const payment = store.payments.find((p) => p.orderId === o.id);
      const address = store.addresses.find((a) => a.id === o.addressId);
      return {
        ...o,
        items,
        payment,
        address,
      };
    });

    return sendSuccess(res, 200, 'Orders fetched successfully', populated);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch orders', 'SERVER_ERROR');
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();

    const order = store.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    // Access control: customer can only see own order, admin can see all
    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
      return sendError(res, 403, 'Unauthorized to view this order', 'FORBIDDEN');
    }

    const items = store.orderItems.filter((oi) => oi.orderId === order.id).map((oi) => {
      const product = store.products.find((p) => p.id === oi.productId);
      return {
        ...oi,
        product,
      };
    });
    const payment = store.payments.find((p) => p.orderId === order.id);
    const address = store.addresses.find((a) => a.id === order.addressId);
    const user = store.users.find((u) => u.id === order.userId);

    return sendSuccess(res, 200, 'Order details fetched', {
      ...order,
      customer: user ? { name: user.name, email: user.email, phone: user.phone } : null,
      items,
      payment,
      address,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch order details', 'SERVER_ERROR');
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const store = getMemoryStore();

    const order = store.orders.find((o) => o.id === id);
    if (!order) {
      return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();

    // If order is cancelled and wasn't already cancelled, restore inventory stock!
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      const orderItems = store.orderItems.filter((oi) => oi.orderId === order.id);
      for (const item of orderItems) {
        const product = store.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
          product.updatedAt = new Date();
        }
      }
      await cacheService.delPattern('products:*');
    }

    // If delivered, mark payment completed if COD
    if (status === 'DELIVERED') {
      const payment = store.payments.find((p) => p.orderId === order.id);
      if (payment && payment.method === 'COD') {
        payment.status = 'COMPLETED';
        payment.updatedAt = new Date();
      }
    }

    // Send customer notification about order status update
    store.notifications.unshift({
      id: crypto.randomUUID(),
      userId: order.userId,
      title: `Order Status: ${status}`,
      message: `Your order #${order.orderNumber} is now ${status.toLowerCase()}.`,
      type: status === 'DELIVERED' ? 'SUCCESS' : 'INFO',
      isRead: false,
      link: `/orders/${order.id}`,
      createdAt: new Date(),
    });

    return sendSuccess(res, 200, 'Order status updated successfully', order);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update order status', 'SERVER_ERROR');
  }
};
