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
      emiPlanId,
      emiMonths: inputEmiMonths,
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

    // 2. Validate stock for every item before placing order (including variants)
    for (const item of cartItems) {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product) {
        return sendError(res, 404, `Product not found: ${item.productId}`, 'PRODUCT_NOT_FOUND');
      }

      let availableStock = product.stock;
      let selectionLabel = product.name;

      if (item.variantId) {
        const variant = store.productVariants.find((v) => v.id === item.variantId);
        if (!variant) {
          return sendError(res, 404, `Selected variant for "${product.name}" not found`, 'VARIANT_NOT_FOUND');
        }
        availableStock = variant.stock;
        selectionLabel = `${product.name} (${[variant.color, variant.storage, variant.ram, variant.size].filter(Boolean).join('/')})`;
      }

      if (availableStock < item.quantity) {
        return sendError(
          res,
          400,
          `Cannot place order: "${selectionLabel}" only has ${availableStock} units remaining in stock.`,
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

    // 4. Calculate pricing & prepare order items
    let subtotal = 0;
    const orderItemsToCreate: any[] = [];

    for (const item of cartItems) {
      const product = store.products.find((p) => p.id === item.productId)!;
      const variant = item.variantId
        ? store.productVariants.find((v) => v.id === item.variantId)
        : null;

      const price = variant
        ? (variant.discountPrice ?? variant.price)
        : (product.discountPrice ?? product.price);

      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      const itemImage = variant?.image || product.images?.[0] || product.thumbnail || '';
      const variantDetails = variant
        ? [variant.color, variant.storage, variant.ram, variant.size].filter(Boolean).join(' / ')
        : null;

      orderItemsToCreate.push({
        id: crypto.randomUUID(),
        productId: product.id,
        variantId: item.variantId || null,
        name: product.name,
        variantDetails,
        sku: variant?.sku || product.sku,
        image: itemImage,
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

    // Delivery cost & estimate calculation
    const isExpress = deliveryMethod === 'EXPRESS';
    const shippingAmount = isExpress ? 99 : 0;
    const deliveryDays = isExpress ? 2 : 4;
    const deliveryEstimate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * 0.05); // 5% GST
    const totalAmount = Math.max(0, taxableAmount + shippingAmount + taxAmount);

    // 5. COD Maximum Limit Check (₹50,000 maximum for COD)
    if (paymentMethod === 'COD' && totalAmount > 50000) {
      return sendError(
        res,
        400,
        `Cash on Delivery (COD) is available only for orders up to ₹50,000. Your order total is ₹${totalAmount.toLocaleString('en-IN')}. Please choose Razorpay or EMI.`,
        'COD_LIMIT_EXCEEDED'
      );
    }

    // 6. EMI calculations if applicable
    let emiMonths: number | null = null;
    let emiMonthlyAmount: number | null = null;
    if (paymentMethod === 'EMI') {
      const plan =
        store.emiPlans.find((p) => p.id === emiPlanId || p.months === Number(inputEmiMonths)) ||
        store.emiPlans[0];
      if (plan) {
        if (totalAmount < plan.minAmount) {
          return sendError(
            res,
            400,
            `EMI is only available on orders of ₹${plan.minAmount.toLocaleString('en-IN')} and above.`,
            'EMI_MIN_AMOUNT_NOT_MET'
          );
        }
        emiMonths = plan.months;
        const totalWithInterest = totalAmount * (1 + plan.interestRate / 100);
        emiMonthlyAmount = Math.round(totalWithInterest / plan.months);
      }
    }

    const orderId = crypto.randomUUID();
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `TRK${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const initialStatus: OrderStatus = paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING';

    const newOrder = {
      id: orderId,
      orderNumber,
      userId,
      addressId: resolvedAddress.id,
      address: resolvedAddress,
      shippingAddress: resolvedAddress,
      status: initialStatus,
      paymentStatus: 'PENDING',
      paymentMethod,
      totalAmount,
      subtotal,
      taxAmount,
      shippingAmount,
      deliveryCost: shippingAmount,
      discountAmount,
      deliveryMethod,
      deliveryEstimate,
      estimatedDeliveryDate: deliveryEstimate,
      trackingNumber,
      emiMonths,
      emiMonthlyAmount,
      couponCode: couponCode || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: orderItemsToCreate.map((item) => ({ ...item, orderId })),
    };

    // 7. Atomic Stock Deduction (both product and variant)
    for (const item of cartItems) {
      const product = store.products.find((p) => p.id === item.productId)!;
      product.stock = Math.max(0, product.stock - item.quantity);
      product.updatedAt = new Date();

      if (item.variantId) {
        const variant = store.productVariants.find((v) => v.id === item.variantId);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
          variant.updatedAt = new Date();
        }
      }
    }

    // 8. Handle Payment
    let razorpayOrderData: any = null;
    if (paymentMethod === 'RAZORPAY') {
      razorpayOrderData = await paymentService.createOrder(totalAmount, orderNumber);
    }

    const paymentRecord = {
      id: crypto.randomUUID(),
      orderId,
      amount: totalAmount,
      method: paymentMethod,
      status: 'PENDING',
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

    // 9. Clear user's cart
    store.cartItems = store.cartItems.filter((ci) => ci.cartId !== cart.id);

    // 10. Invalidate product cache
    await cacheService.delPattern('products:*');

    // 11. Send Notification to User
    store.notifications.unshift({
      id: crypto.randomUUID(),
      userId,
      title: paymentMethod === 'COD' ? 'Order Confirmed!' : 'Order Placed!',
      message: `Your order #${orderNumber} for ₹${totalAmount.toLocaleString('en-IN')} has been placed successfully.`,
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

    // Admin can view all orders; Customer views only their own
    let orders =
      req.user!.role === 'ADMIN'
        ? store.orders
        : store.orders.filter((o) => o.userId === userId);

    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.status === status);
    }

    const populated = orders.map((o) => {
      const items = store.orderItems.filter((oi) => oi.orderId === o.id).map((oi) => {
        const product = store.products.find((p) => p.id === oi.productId);
        const variant = oi.variantId ? store.productVariants.find((v) => v.id === oi.variantId) : null;
        return {
          ...oi,
          product,
          variant,
        };
      });
      const payment = store.payments.find((p) => p.orderId === o.id);
      const address = store.addresses.find((a) => a.id === o.addressId);
      const customer = store.users.find((u) => u.id === o.userId);
      return {
        ...o,
        customer: customer ? { name: customer.name, email: customer.email, phone: customer.phone } : null,
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
      const variant = oi.variantId ? store.productVariants.find((v) => v.id === oi.variantId) : null;
      return {
        ...oi,
        product,
        variant,
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
    const { status, trackingNumber } = req.body;
    const store = getMemoryStore();

    const validStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return sendError(res, 400, `Invalid order status: ${status}`, 'INVALID_STATUS');
    }

    const order = store.orders.find((o) => o.id === id);
    if (!order) {
      return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    const previousStatus = order.status;
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    order.updatedAt = new Date();

    // If order is cancelled and wasn't already cancelled, restore inventory stock (both product and variant)!
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      const orderItems = store.orderItems.filter((oi) => oi.orderId === order.id);
      for (const item of orderItems) {
        const product = store.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
          product.updatedAt = new Date();
        }
        if (item.variantId) {
          const variant = store.productVariants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stock += item.quantity;
            variant.updatedAt = new Date();
          }
        }
      }
      await cacheService.delPattern('products:*');
    }

    // If delivered, mark payment completed & paid
    if (status === 'DELIVERED') {
      const payment = store.payments.find((p) => p.orderId === order.id);
      if (payment) {
        payment.status = 'COMPLETED';
        payment.updatedAt = new Date();
      }
      order.paymentStatus = 'PAID';
    }

    // Send customer notification about order status update
    store.notifications.unshift({
      id: crypto.randomUUID(),
      userId: order.userId,
      title: `Order Status: ${status}`,
      message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
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
