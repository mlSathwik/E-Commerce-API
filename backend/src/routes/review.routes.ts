import { Router } from 'express';
import {
  getProductReviews,
  createProductReview,
  getAllReviewsAdmin,
  deleteReview,
} from '../controllers/review.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createReviewSchema } from '../validators/review.validator.js';

const router = Router();

// Route for product reviews
router.get('/product/:id', getProductReviews);
router.post('/product/:id', authenticate, validateRequest(createReviewSchema), createProductReview);

// Admin moderation
router.get('/admin', authenticate, authorizeRoles('ADMIN'), getAllReviewsAdmin);
router.delete('/:id', authenticate, deleteReview);

export default router;
