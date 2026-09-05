import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import { brandApi } from '../../api/brandApi.js';
import { Brand } from '../../types/index.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';

export const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');

  const fetchBrands = async () => {
    const res = await brandApi.getBrands();
    setBrands(res.data);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await brandApi.createBrand({ name, logo, description });
      setBrands((prev) => [...prev, res.data]);
      setIsModalOpen(false);
      setName('');
      setLogo('');
      setDescription('');
    } catch {
      alert('Failed to create brand');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete brand?')) return;
    await brandApi.deleteBrand(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Brands</h1>
          <p className="text-xs text-gray-400 mt-1">Manage brand partnerships and manufacturer catalogs</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="md" className="gap-2">
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {brands.map((b) => (
          <div
            key={b.id}
            className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2 border border-gray-100 dark:border-gray-800">
                <img src={b.logo || ''} alt={b.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{b.name}</h4>
                <p className="text-[10px] text-gray-400">{b.productCount ?? 0} listed products</p>
              </div>
            </div>
            <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Brand Partner">
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Brand Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Logo URL</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Brand</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
