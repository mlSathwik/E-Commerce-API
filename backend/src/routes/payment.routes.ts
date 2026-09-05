import { Router } from 'express';
import { createCheckoutSession, verifyPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/checkout', createCheckoutSession);
router.post('/verify', verifyPayment);

export default router;
