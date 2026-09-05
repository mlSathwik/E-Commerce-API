import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorizeRoles('ADMIN'), createCategory);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteCategory);

export default router;
