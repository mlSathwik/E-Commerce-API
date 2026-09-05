import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { productApi } from '../../api/productApi.js';
import { categoryApi } from '../../api/categoryApi.js';
import { brandApi } from '../../api/brandApi.js';
import { adminApi } from '../../api/adminApi.js';
import { Product, Category, Brand } from '../../types/index.js';
import { formatPrice } from '../../utils/formatters.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { TableRowSkeleton } from '../../components/common/Skeleton.js';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    sku: '',
    stock: '',
    categoryId: '',
    brandId: '',
    imageUrl: '',
    isFeatured: false,
    isTrending: false,
    isFlashSale: false,
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, bRes] = await Promise.all([
        productApi.getProducts({ limit: 100 }),
        categoryApi.getCategories(),
        brandApi.getBrands(),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
      setBrands(bRes.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      stock: '25',
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      isFeatured: false,
      isTrending: false,
      isFlashSale: false,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      sku: p.sku,
      stock: String(p.stock),
      categoryId: p.categoryId,
      brandId: p.brandId,
      imageUrl: p.images?.[0] || '',
      isFeatured: Boolean(p.isFeatured),
      isTrending: Boolean(p.isTrending),
      isFlashSale: Boolean(p.isFlashSale),
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete product');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSaving(true);
    setModalError('');

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        sku: formData.sku,
        stock: parseInt(formData.stock, 10),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isFlashSale: formData.isFlashSale,
      };

      if (editingProduct) {
        const res = await productApi.updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.data : p)));
      } else {
        const res = await productApi.createProduct(payload);
        setProducts((prev) => [res.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setModalSaving(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Product Catalog</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Create, update specifications, adjust inventory, and manage product listings.
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="md" className="gap-2 self-start sm:self-auto shadow-md">
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>
        <span className="text-xs text-gray-400">Total: {filteredProducts.length} items</span>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/30">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                        alt={product.name}
                        className="h-10 w-10 rounded-xl object-cover bg-gray-50 dark:bg-gray-800"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-xs">{product.name}</h4>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{product.brand?.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium text-gray-600 dark:text-gray-400">{product.sku}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{product.category?.name}</td>
                  <td className="p-4">
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {formatPrice(product.discountPrice ?? product.price)}
                    </span>
                    {product.discountPrice && (
                      <span className="ml-1 text-[10px] text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                        product.stock <= 0
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : product.stock <= 5
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          maxWidth="2xl"
        >
          {modalError && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200">
              {modalError}
            </div>
          )}
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Regular Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Discounted Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional sale price"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Brand *
                </label>
                <select
                  required
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              {formData.imageUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={formData.imageUrl} alt="Preview" className="h-14 w-14 rounded-xl object-cover border" />
                  <span className="text-[11px] text-gray-400">Live Image Preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-4 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Trending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFlashSale}
                  onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Flash Sale</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={modalSaving}>
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
