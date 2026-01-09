'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Modal from './ui/Modal';
import Select from './ui/Select';
import { Product, PRODUCT_CATEGORIES } from '@/lib/types';
import { getAllProducts, deleteProduct, addProduct, updateProduct } from '@/lib/db';

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('¿Estás segura de que querés eliminar este producto?')) {
      try {
        await deleteProduct(productId);
        await loadProducts();
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    loadProducts();
    handleModalClose();
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-2.5 rounded-xl">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">Productos</h1>
              <p className="text-xs text-gray-400">
                {products.length} {products.length === 1 ? 'producto' : 'productos'} en inventario
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search & Add */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="px-4"
            size="lg"
          >
            <Plus size={20} />
          </Button>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos cargados'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                Agregar primer producto
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} padding="md" className="relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-gray-100 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sky-400 font-bold text-lg mb-2">
                      ${product.price.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${
                            size.stock > 0
                              ? 'bg-green-900/40 text-green-400 border border-green-700'
                              : 'bg-red-900/40 text-red-400 border border-red-700'
                          }`}
                        >
                          {size.size}: {size.stock}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {product.category} • Stock total: {product.totalStock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-sky-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSave={handleProductSaved}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
}

// Formulario de producto
interface ProductFormProps {
  product: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    category: product?.category || PRODUCT_CATEGORIES[0],
    sizes: product?.sizes || [{ size: '', stock: 0 }],
  });
  const [saving, setSaving] = useState(false);
  const [stockMode, setStockMode] = useState<'total' | 'detallado'>('detallado');
  const [totalStock, setTotalStock] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const totalStock = formData.sizes.reduce((sum, s) => sum + s.stock, 0);

      if (product) {
        await updateProduct(product.id, {
          ...formData,
          totalStock,
        });
      } else {
        await addProduct({
          ...formData,
          totalStock,
        });
      }

      onSave();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '', stock: 0 }],
    });
  };

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const updateSize = (index: number, field: 'size' | 'stock', value: string | number) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleTotalStockChange = (value: number) => {
    setTotalStock(value);
    // Distribuir equitativamente entre todos los talles
    const stockPerSize = Math.floor(value / formData.sizes.length);
    const remainder = value % formData.sizes.length;

    const newSizes = formData.sizes.map((size, idx) => ({
      ...size,
      stock: stockPerSize + (idx < remainder ? 1 : 0)
    }));

    setFormData({ ...formData, sizes: newSizes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del producto"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="Ej: Conjunto body + pañalero con volados"
      />

      <Input
        label="Precio"
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
        onFocus={(e) => e.target.select()}
        required
        min="0"
        step="100"
      />

      <Select
        label="Categoría"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        options={PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Talles y Stock
        </label>

        {/* Toggle Stock Mode */}
        <div className="flex gap-2 mb-3 bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setStockMode('total')}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              stockMode === 'total'
                ? 'bg-sky-500 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Stock Total
          </button>
          <button
            type="button"
            onClick={() => setStockMode('detallado')}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              stockMode === 'detallado'
                ? 'bg-sky-500 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Por Talle
          </button>
        </div>

        {/* Stock Total Mode */}
        {stockMode === 'total' && (
          <div className="mb-3">
            <input
              type="number"
              placeholder="Stock total"
              value={totalStock}
              onChange={(e) => handleTotalStockChange(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="0"
            />
          </div>
        )}

        {/* Talles */}
        <div className="space-y-2">
          {formData.sizes.map((size, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                placeholder="Talle (ej: 3/6)"
                value={size.size}
                onChange={(e) => updateSize(idx, 'size', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              {stockMode === 'detallado' && (
                <input
                  type="number"
                  placeholder="Stock"
                  value={size.stock}
                  onChange={(e) => updateSize(idx, 'stock', Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  min="0"
                  required
                />
              )}
              {stockMode === 'total' && (
                <div className="w-24 px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-gray-400 flex items-center justify-center text-sm">
                  {size.stock}
                </div>
              )}
              {formData.sizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSize(idx)}
                  className="px-3 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={addSize}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          + Agregar talle
        </Button>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          fullWidth
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
