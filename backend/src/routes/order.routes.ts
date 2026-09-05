import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorizeRoles('ADMIN'), validateRequest(updateOrderStatusSchema), updateOrderStatus);

export default router;
