import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2 } from 'lucide-react';
import { categoryApi } from '../../api/categoryApi.js';
import { Category } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const fetchCats = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getCategories();
      setCategories(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await categoryApi.createCategory({ name, description, image });
      setCategories((prev) => [...prev, res.data]);
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setImage('');
    } catch {
      alert('Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await categoryApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Categories</h1>
          <p className="text-xs text-gray-400 mt-1">Organize products into hierarchical departments</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="md" className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=100&q=80'}
                alt={cat.name}
                className="h-12 w-12 rounded-2xl object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{cat.name}</h4>
                <p className="text-[10px] text-gray-400">{cat.slug} • {cat.productCount ?? 0} items</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="rounded-lg p-1 text-gray-400 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
