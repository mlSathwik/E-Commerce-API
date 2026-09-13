import { useState, useEffect } from 'react';
import { Product } from '../types/index.js';
import { catalogService } from '../data/catalogService.js';

const STORAGE_KEY = 'shopsphere_recently_viewed';
const MAX_ITEMS = 8;

export const useRecentlyViewed = (currentProductId?: string) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let ids: string[] = raw ? JSON.parse(raw) : [];

      if (currentProductId) {
        // Remove existing occurrence and prepend
        ids = [currentProductId, ...ids.filter((id) => id !== currentProductId)].slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      }

      // Resolve products from catalog
      const prods: Product[] = ids
        .filter((id) => id !== currentProductId)
        .map((id) => catalogService.getProductByIdOrSlug(id))
        .filter(Boolean) as Product[];

      setRecentlyViewed(prods);
    } catch {
      // Safe fallback
    }
  }, [currentProductId]);

  return { recentlyViewed };
};
