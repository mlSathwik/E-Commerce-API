import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ArrowUpDown, X, Layers } from 'lucide-react';
import { productApi } from '../api/productApi.js';
import { categoryApi } from '../api/categoryApi.js';
import { brandApi } from '../api/brandApi.js';
import { Product, Category, Brand, ProductFilters } from '../types/index.js';
import { ProductCard } from '../components/products/ProductCard.js';
import { ProductCardSkeleton } from '../components/common/Skeleton.js';
import { FilterSidebar } from '../components/products/FilterSidebar.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { Button } from '../components/common/Button.js';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<ProductFilters>({
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 12,
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    sort: searchParams.get('sort') || 'featured',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
  });

  // Sync URL search params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.page && filters.page > 1) params.page = String(filters.page);
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.sort && filters.sort !== 'featured') params.sort = filters.sort;
    if (filters.minPrice !== undefined) params.minPrice = String(filters.minPrice);
    if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
    if (filters.rating !== undefined) params.rating = String(filters.rating);
    if (filters.inStock) params.inStock = 'true';
    setSearchParams(params, { replace: true });
  }, [filters]);

  // Fetch categories and brands on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          categoryApi.getCategories(),
          brandApi.getBrands(),
        ]);
        setCategories(catsRes.data);
        setBrands(brandsRes.data);
      } catch (err) {
        console.error('Failed to load categories/brands:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProducts(filters);
        setProducts(res.data);
        setTotalCount(res.meta?.total ?? res.data.length);
        setTotalPages(res.meta?.totalPages ?? 1);
      } catch (err) {
        console.error('Failed to fetch shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: 'featured',
    });
  };

  const startIdx = ((filters.page || 1) - 1) * (filters.limit || 12) + 1;
  const endIdx = Math.min(startIdx + (filters.limit || 12) - 1, totalCount);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Breadcrumbs and Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
            Explore All Products
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalCount > 0
              ? `Showing ${startIdx}–${endIdx} of ${totalCount} products`
              : 'No products match your current filters'}
          </p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">Sort By:</span>
            <select
              value={filters.sort || 'featured'}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
              <option value="bestselling">Best Selling</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Left Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 h-fit sticky top-24">
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Mobile Slide-Over Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-6 shadow-2xl dark:bg-gray-900">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filter Products</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="py-4">
                <FilterSidebar
                  categories={categories}
                  brands={brands}
                  filters={filters}
                  onChange={(f) => {
                    handleFilterChange(f);
                    setIsMobileFilterOpen(false);
                  }}
                  onReset={() => {
                    handleResetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Layers className="h-10 w-10" />}
              title="No products match your filters"
              description="Try adjusting your category, price range, or brand selection to find what you are looking for."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              {/* Responsive Grid: 4 cols desktop, 3 cols tablet, 2 cols mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={(filters.page || 1) <= 1}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters({ ...filters, page: pageNum })}
                        className={`h-9 w-9 rounded-xl text-xs font-bold transition shadow-sm ${
                          (filters.page || 1) === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={(filters.page || 1) >= totalPages}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
