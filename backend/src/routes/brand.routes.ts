import { Router } from 'express';
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getBrands);
router.get('/:id', getBrandById);
router.post('/', authenticate, authorizeRoles('ADMIN'), createBrand);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), updateBrand);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteBrand);

export default router;
