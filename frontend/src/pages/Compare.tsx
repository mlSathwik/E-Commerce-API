import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi.js';
import { Product } from '../types/index.js';
import { formatPrice } from '../utils/formatters.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { Button } from '../components/common/Button.js';
import { useCart } from '../contexts/CartContext.js';
import { ShoppingCart, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Compare: React.FC = () => {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProducts({ limit: 30 });
        setAllProducts(res.data);

        // Pre-select first 3 products for immediate comparison demo
        if (res.data.length >= 3) {
          setComparedProducts([res.data[0], res.data[1], res.data[2]]);
        }
      } catch (err) {
        console.error('Failed to load compare items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleRemoveProduct = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddProduct = (product: Product) => {
    if (comparedProducts.length >= 4) {
      alert('You can compare a maximum of 4 products side-by-side.');
      return;
    }
    if (!comparedProducts.some((p) => p.id === product.id)) {
      setComparedProducts((prev) => [...prev, product]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
          Side-by-Side Product Comparison
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Directly compare flagship specifications, pricing, ratings, and features across multiple models.
        </p>
      </div>

      {/* Select more products drawer / selector */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Add to comparison:
        </span>
        <div className="flex gap-2">
          {allProducts
            .filter((p) => !comparedProducts.some((cp) => cp.id === p.id))
            .slice(0, 5)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddProduct(p)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:border-indigo-500 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                <Plus className="h-3 w-3" /> {p.name.slice(0, 18)}...
              </button>
            ))}
        </div>
      </div>

      {comparedProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-xs">
          No products selected for comparison. Click on products above to compare.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-400 w-44 bg-gray-50/50 dark:bg-gray-800/30">
                  Feature / Spec
                </th>
                {comparedProducts.map((product) => (
                  <th key={product.id} className="p-5 min-w-[240px]">
                    <div className="relative flex flex-col items-center text-center">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="absolute right-0 top-0 rounded-full p-1 text-gray-400 hover:text-rose-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="h-32 w-32 object-contain mb-3"
                      />
                      <Link
                        to={`/products/${product.id}`}
                        className="text-xs font-bold text-gray-900 hover:text-indigo-600 dark:text-white line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-2">
                        {formatPrice(product.discountPrice ?? product.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(product.id, 1)}
                        className="mt-3 gap-1.5 w-full"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30 dark:bg-gray-800/20">Brand</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-center font-semibold text-gray-900 dark:text-white">
                    {p.brand?.name || 'ShopSphere'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30 dark:bg-gray-800/20">Customer Rating</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <RatingStars rating={p.rating} showNumber size="sm" />
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30 dark:bg-gray-800/20">Stock Status</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-center font-bold">
                    <span className={p.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}>
                      {p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30 dark:bg-gray-800/20">Category</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                    {p.category?.name}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30 dark:bg-gray-800/20">Key Highlights</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-left text-gray-600 dark:text-gray-400 leading-relaxed">
                    {p.description.slice(0, 110)}...
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
