import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getSearchSuggestions,
  getFilterOptions,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/product.validator.js';

const router = Router();

router.get('/', validateRequest(productQuerySchema), getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/filters/options', getFilterOptions);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeRoles('ADMIN'), validateRequest(createProductSchema), createProduct);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), validateRequest(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteProduct);

export default router;
