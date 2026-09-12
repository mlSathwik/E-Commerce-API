import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { getMemoryStore } from '../services/db.service.js';
import { paymentService } from '../services/payment.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    const store = getMemoryStore();

    const order = store.orders.find((o) => o.id === orderId);
    if (!order) {
      return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    const razorpayOrder = await paymentService.createOrder(order.totalAmount, order.orderNumber);

    const payment = store.payments.find((p) => p.orderId === orderId);
    if (payment) {
      payment.razorpayOrderId = razorpayOrder.id;
      payment.updatedAt = new Date();
    }

    return sendSuccess(res, 200, 'Checkout session created', {
      orderId: order.id,
      amount: order.totalAmount,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create checkout session', 'SERVER_ERROR');
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const store = getMemoryStore();

    const order = store.orders.find((o) => o.id === orderId);
    if (!order) {
      return sendError(res, 404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    // Backend verification of Razorpay signature
    const isValid = paymentService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return sendError(res, 400, 'Invalid payment signature. Payment verification failed.', 'PAYMENT_VERIFICATION_FAILED');
    }

    // Update payment record
    const payment = store.payments.find((p) => p.orderId === orderId);
    if (payment) {
      payment.status = 'COMPLETED';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpayOrderId = razorpayOrderId;
      payment.razorpaySignature = razorpaySignature;
      payment.updatedAt = new Date();
    }

    order.paymentStatus = 'PAID';
    order.status = 'CONFIRMED';
    order.updatedAt = new Date();

    // Create user notification
    store.notifications.unshift({
      id: crypto.randomUUID(),
      userId: order.userId,
      title: 'Payment Received!',
      message: `Payment for order #${order.orderNumber} was successfully verified.`,
      type: 'PAYMENT',
      isRead: false,
      link: `/orders/${order.id}`,
      createdAt: new Date(),
    });

    return sendSuccess(res, 200, 'Payment verified successfully', {
      orderId: order.id,
      status: 'PAID',
    });
  } catch (error: any) {
    return sendError(res, 500, 'Payment verification failed', 'SERVER_ERROR');
  }
};
