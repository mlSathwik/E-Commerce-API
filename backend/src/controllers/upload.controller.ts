import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please provide an image file', 'FILE_REQUIRED');
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return sendSuccess(res, 200, 'Image uploaded successfully', {
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error: any) {
    return sendError(res, 500, error.message || 'File upload failed', 'SERVER_ERROR');
  }
};
