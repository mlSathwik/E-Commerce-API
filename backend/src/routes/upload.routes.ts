import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', authenticate, upload.single('image') as any, uploadImage);

export default router;
