'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Modal from './ui/Modal';
import Select from './ui/Select';
import AlertModal from './ui/AlertModal';
import ConfirmModal from './ui/ConfirmModal';
import { Product, PRODUCT_CATEGORIES } from '@/lib/types';
import { getAllProducts, deleteProduct, addProduct, updateProduct } from '@/lib/db';

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | typeof PRODUCT_CATEGORIES[number]>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
    type: 'info'
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = products.filter(product => {
      const matchesText =
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === 'Todas' || product.category === selectedCategory;
      return matchesText && matchesCategory;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products, selectedCategory]);

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

  const handleDelete = (productId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '¿Estás segura de que querés eliminar este producto?',
      onConfirm: async () => {
        try {
          await deleteProduct(productId);
          await loadProducts();
          setAlertModal({
            isOpen: true,
            message: 'Producto eliminado exitosamente',
            type: 'success'
          });
        } catch (error) {
          console.error('Error eliminando producto:', error);
          setAlertModal({
            isOpen: true,
            message: 'Error al eliminar el producto',
            type: 'error'
          });
        }
      }
    });
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

  // Pagination (8 per page)
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

        {/* Category Filter */}
        <div>
          <Select
            label="Filtrar por categoría"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            options={[{ value: 'Todas', label: 'Todas' }, ...PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))]}
          />
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
          <>
            <div className="space-y-3">
              {pageProducts.map((product) => (
                <Card key={product.id} padding="md" className="relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-gray-100 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sky-400 font-bold text-lg mb-2">
                        ${product.price.toLocaleString('es-AR')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.length > 0 ? (
                          product.sizes.map((size, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-slate-700 text-gray-200 border border-slate-600"
                            >
                              {size.size}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-gray-400 border border-slate-600">
                            Sin talles
                          </span>
                        )}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="w-10 h-10 rounded-lg bg-slate-800 text-gray-300 border border-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        page === safePage
                          ? 'bg-sky-500 text-white font-semibold'
                          : 'bg-slate-800 text-gray-300 border border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="w-10 h-10 rounded-lg bg-slate-800 text-gray-300 border border-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
        closeOnOutsideClick={false}
      >
        <ProductForm
          product={editingProduct}
          onSave={handleProductSaved}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Alert & Confirm Modals */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        type={alertModal.type}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        message={confirmModal.message}
        type="danger"
      />
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
    sizes: product?.sizes && product.sizes.length > 0 ? product.sizes : [{ size: '', stock: 0 }],
  });
  const [saving, setSaving] = useState(false);
  const [stockMode, setStockMode] = useState<'total' | 'detallado'>('detallado');
  const [totalStock, setTotalStock] = useState(0);

  // Modal state
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalSizes = formData.sizes;
      let computedTotalStock = 0;

      if (stockMode === 'total') {
        // En modo Stock Total
        computedTotalStock = totalStock;

        // Filtrar talles válidos (que tengan nombre)
        const validSizes = formData.sizes.filter(s => s.size.trim() !== '');

        // Si no hay talles válidos, crear un array vacío (producto sin talles)
        if (validSizes.length === 0) {
          finalSizes = [];
        } else {
          // Usar los talles válidos con stock en 0
          finalSizes = validSizes.map(s => ({ size: s.size, stock: 0 }));
        }
      } else {
        // En modo Por Talle, calcular el total sumando los talles
        finalSizes = formData.sizes;
        computedTotalStock = formData.sizes.reduce((sum, s) => sum + s.stock, 0);
      }

      if (product) {
        await updateProduct(product.id, {
          ...formData,
          sizes: finalSizes,
          totalStock: computedTotalStock,
        });
      } else {
        await addProduct({
          ...formData,
          sizes: finalSizes,
          totalStock: computedTotalStock,
        });
      }

      onSave();
    } catch (error) {
      console.error('Error guardando producto:', error);
      setAlertModal({
        isOpen: true,
        message: 'Error al guardar el producto',
        type: 'error'
      });
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
    // En modo 'Stock Total', no distribuir: dejar todos los talles en 0
    const newSizes = formData.sizes.map((size) => ({
      ...size,
      stock: 0,
    }));
    setFormData({ ...formData, sizes: newSizes });
  };

  return (
    <>
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
              required
            />
            <p className="text-xs text-gray-400 mt-2">
              Los talles son opcionales en este modo. Si no agregás talles, el producto se guardará sin variantes.
            </p>
          </div>
        )}

        {/* Talles */}
        {formData.sizes.length === 0 && stockMode === 'total' ? (
          <div className="text-center py-3 px-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-sm text-gray-400 mb-2">
              Este producto no tiene talles definidos
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {formData.sizes.map((size, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={stockMode === 'total' ? 'Talle (opcional)' : 'Talle (ej: 3/6)'}
                  value={size.size}
                  onChange={(e) => updateSize(idx, 'size', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required={stockMode === 'detallado'}
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
              {(formData.sizes.length > 1 || stockMode === 'total') && (
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
        )}
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

    {/* Modal */}
    <AlertModal
      isOpen={alertModal.isOpen}
      onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      message={alertModal.message}
      type={alertModal.type}
    />
  </>
  );
}
