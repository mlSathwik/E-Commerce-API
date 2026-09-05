import { Request, Response } from 'express';
import crypto from 'crypto';
import { getMemoryStore } from '../services/db.service.js';
import { cacheService } from '../services/cache.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'categories:list';
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const store = getMemoryStore();
    const categoriesWithCount = store.categories.map((cat) => ({
      ...cat,
      productCount: store.products.filter((p) => p.categoryId === cat.id).length,
    }));

    const responsePayload = {
      success: true,
      message: 'Categories fetched successfully',
      data: categoriesWithCount,
    };

    await cacheService.set(cacheKey, responsePayload, 300);
    return res.status(200).json(responsePayload);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch categories', 'SERVER_ERROR');
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const category = store.categories.find((c) => c.id === id || c.slug === id);
    if (!category) {
      return sendError(res, 404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }
    return sendSuccess(res, 200, 'Category fetched', category);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch category', 'SERVER_ERROR');
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, icon } = req.body;
    const store = getMemoryStore();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newCategory = {
      id: crypto.randomUUID(),
      name,
      slug,
      description: description || null,
      image: image || null,
      icon: icon || 'Tag',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.categories.push(newCategory);
    await cacheService.del('categories:list');

    return sendSuccess(res, 201, 'Category created successfully', newCategory);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create category', 'SERVER_ERROR');
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const idx = store.categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return sendError(res, 404, 'Category not found', 'CATEGORY_NOT_FOUND');
    }

    store.categories[idx] = {
      ...store.categories[idx],
      ...req.body,
      updatedAt: new Date(),
    };

    await cacheService.del('categories:list');
    return sendSuccess(res, 200, 'Category updated successfully', store.categories[idx]);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update category', 'SERVER_ERROR');
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    store.categories = store.categories.filter((c) => c.id !== id);
    await cacheService.del('categories:list');
    return sendSuccess(res, 200, 'Category deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete category', 'SERVER_ERROR');
  }
};
