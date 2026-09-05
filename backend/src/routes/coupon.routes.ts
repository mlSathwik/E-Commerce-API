import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createCouponSchema, validateCouponSchema } from '../validators/coupon.validator.js';

const router = Router();

router.post('/validate', validateRequest(validateCouponSchema), validateCoupon);
router.get('/', getCoupons);
router.post('/', authenticate, authorizeRoles('ADMIN'), validateRequest(createCouponSchema), createCoupon);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), updateCoupon);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteCoupon);

export default router;
