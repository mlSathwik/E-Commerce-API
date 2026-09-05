import { Request, Response } from 'express';
import crypto from 'crypto';
import { getMemoryStore } from '../services/db.service.js';
import { cacheService } from '../services/cache.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getBrands = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'brands:list';
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const store = getMemoryStore();
    const brandsWithCount = store.brands.map((b) => ({
      ...b,
      productCount: store.products.filter((p) => p.brandId === b.id).length,
    }));

    const responsePayload = {
      success: true,
      message: 'Brands fetched successfully',
      data: brandsWithCount,
    };

    await cacheService.set(cacheKey, responsePayload, 300);
    return res.status(200).json(responsePayload);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch brands', 'SERVER_ERROR');
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const brand = store.brands.find((b) => b.id === id || b.slug === id);
    if (!brand) {
      return sendError(res, 404, 'Brand not found', 'BRAND_NOT_FOUND');
    }
    return sendSuccess(res, 200, 'Brand fetched', brand);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch brand', 'SERVER_ERROR');
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, description, logo } = req.body;
    const store = getMemoryStore();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newBrand = {
      id: crypto.randomUUID(),
      name,
      slug,
      description: description || null,
      logo: logo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.brands.push(newBrand);
    await cacheService.del('brands:list');

    return sendSuccess(res, 201, 'Brand created successfully', newBrand);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create brand', 'SERVER_ERROR');
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const idx = store.brands.findIndex((b) => b.id === id);
    if (idx === -1) {
      return sendError(res, 404, 'Brand not found', 'BRAND_NOT_FOUND');
    }

    store.brands[idx] = {
      ...store.brands[idx],
      ...req.body,
      updatedAt: new Date(),
    };

    await cacheService.del('brands:list');
    return sendSuccess(res, 200, 'Brand updated successfully', store.brands[idx]);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update brand', 'SERVER_ERROR');
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    store.brands = store.brands.filter((b) => b.id !== id);
    await cacheService.del('brands:list');
    return sendSuccess(res, 200, 'Brand deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete brand', 'SERVER_ERROR');
  }
};
