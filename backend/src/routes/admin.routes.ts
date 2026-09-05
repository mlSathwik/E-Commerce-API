import { Router } from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getCustomers,
  getInventory,
  updateInventoryStock,
} from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/customers', getCustomers);
router.get('/inventory', getInventory);
router.put('/inventory/:productId', updateInventoryStock);

export default router;
