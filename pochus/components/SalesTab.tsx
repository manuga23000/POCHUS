'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, ChevronLeft, ChevronRight, Receipt, Search } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import AlertModal from './ui/AlertModal';
import ConfirmModal from './ui/ConfirmModal';
import { Product, Sale } from '@/lib/types';
import { getAllProducts, addSale, getAllSales, deleteSale } from '@/lib/db';

export default function SalesTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

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
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.product-search-container')) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, salesData] = await Promise.all([
        getAllProducts(),
        getAllSales()
      ]);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const availableSizes = selectedProduct?.sizes.filter(s => s.stock > 0) || [];
  const finalPrice = customPrice !== '' ? customPrice : (selectedProduct?.price || 0);

  // Filter products based on search
  const filteredProductsForSearch = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8); // Limit to 8 results

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setSelectedSize('');
    setCustomPrice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || quantity <= 0) {
      setAlertModal({
        isOpen: true,
        message: 'Por favor completá todos los campos',
        type: 'error'
      });
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Check if product has sizes
    const hasSizes = availableSizes.length > 0;

    // If product has sizes, validate size selection and stock
    if (hasSizes) {
      if (!selectedSize) {
        setAlertModal({
          isOpen: true,
          message: 'Por favor seleccioná un talle',
          type: 'error'
        });
        return;
      }

      const sizeData = product.sizes.find(s => s.size === selectedSize);
      if (!sizeData || sizeData.stock < quantity) {
        setAlertModal({
          isOpen: true,
          message: 'Stock insuficiente',
          type: 'error'
        });
        return;
      }
    } else {
      // For products without sizes, check total stock
      if (product.totalStock < quantity) {
        setAlertModal({
          isOpen: true,
          message: 'Stock insuficiente',
          type: 'error'
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const saleItem = {
        productId: product.id,
        productName: product.name,
        size: selectedSize || 'Sin talle',
        quantity,
        unitPrice: finalPrice,
        totalPrice: finalPrice * quantity,
      };

      const saleData: any = {
        items: [saleItem],
        total: saleItem.totalPrice,
        profit: saleItem.totalPrice,
      };

      if (notes.trim()) {
        saleData.notes = notes.trim();
      }

      await addSale(saleData);

      // Reset form
      setSelectedProductId('');
      setSelectedSize('');
      setQuantity(1);
      setCustomPrice('');
      setNotes('');
      setProductSearch('');

      // Reload data
      await loadData();
      setAlertModal({
        isOpen: true,
        message: 'Venta registrada exitosamente',
        type: 'success'
      });
    } catch (error) {
      console.error('Error registrando venta:', error);
      setAlertModal({
        isOpen: true,
        message: 'Error al registrar la venta',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (saleId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '¿Estás segura de que querés eliminar esta venta?',
      onConfirm: async () => {
        try {
          await deleteSale(saleId);
          await loadData();
          setAlertModal({
            isOpen: true,
            message: 'Venta eliminada exitosamente',
            type: 'success'
          });
        } catch (error) {
          console.error('Error eliminando venta:', error);
          setAlertModal({
            isOpen: true,
            message: 'Error al eliminar la venta',
            type: 'error'
          });
        }
      }
    });
  };

  // Pagination (10 per page)
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(sales.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageSales = sales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2.5 rounded-xl">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Ventas</h1>
            <p className="text-xs text-gray-400">
              {sales.length} {sales.length === 1 ? 'venta registrada' : 'ventas registradas'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Sale Form */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-sky-400" />
            Registrar Nueva Venta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Search */}
            <div className="relative product-search-container">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Producto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                    if (!e.target.value) {
                      setSelectedProductId('');
                      setSelectedSize('');
                      setCustomPrice('');
                    }
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Buscar producto..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />

                {/* Dropdown Results */}
                {showProductDropdown && productSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredProductsForSearch.length > 0 ? (
                      filteredProductsForSearch.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className="w-full px-3 py-2.5 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-gray-100 font-medium">{product.name}</p>
                              <p className="text-xs text-gray-400">{product.category}</p>
                            </div>
                            <p className="text-sky-400 font-semibold">${product.price.toLocaleString()}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-gray-400 text-sm">
                        No se encontraron productos
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Product Display */}
              {selectedProduct && !showProductDropdown && (
                <div className="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-100 font-medium">{selectedProduct.name}</p>
                      <p className="text-xs text-gray-400">{selectedProduct.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId('');
                        setProductSearch('');
                        setSelectedSize('');
                        setCustomPrice('');
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Size and Quantity Row */}
            {selectedProduct && (
              <>
                {/* Show size selector only if product has sizes */}
                {availableSizes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Talle
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {availableSizes.map(size => (
                          <option key={size.size} value={size.size}>
                            {size.size} (Stock: {size.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        min="1"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cantidad (Stock disponible: {selectedProduct.totalStock})
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      min="1"
                      max={selectedProduct.totalStock}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* Custom Price */}
            {selectedProduct && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Precio (opcional - por defecto ${selectedProduct.price.toLocaleString()})
                </label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value ? Number(e.target.value) : '')}
                  onFocus={(e) => e.target.select()}
                  placeholder={`${selectedProduct.price}`}
                  min="0"
                  step="100"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre esta venta..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                rows={2}
              />
            </div>

            {/* Total Preview */}
            {selectedProduct && selectedSize && quantity > 0 && (
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Total a registrar:</span>
                  <span className="text-2xl font-bold text-sky-400">
                    ${(finalPrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!selectedProductId || submitting}
            >
              {submitting ? 'Registrando...' : 'Registrar Venta'}
            </Button>
          </form>
        </Card>

        {/* Sales List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Receipt size={20} className="text-sky-400" />
            Historial de Ventas
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando ventas...
            </div>
          ) : sales.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No hay ventas registradas</p>
              </div>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {pageSales.map((sale) => (
                  <Card key={sale.id} padding="md">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        {/* Date */}
                        <p className="text-xs text-gray-500 mb-2">
                          {sale.createdAt.toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}{' '}
                          •{' '}
                          {sale.createdAt.toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                        {/* Items */}
                        <div className="space-y-1 mb-2">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="flex items-baseline gap-2">
                              <span className="text-gray-100 font-medium">
                                {item.productName}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {item.size !== 'Sin talle' && `• Talle ${item.size} `}• x{item.quantity}
                              </span>
                              <span className="text-sky-400 font-semibold ml-auto">
                                ${item.totalPrice.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        {sale.notes && (
                          <p className="text-sm text-gray-400 italic mt-2">
                            "{sale.notes}"
                          </p>
                        )}

                        {/* Total */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
                          <span className="text-gray-300 font-medium">Total:</span>
                          <span className="text-lg font-bold text-sky-400">
                            ${sale.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Eliminar venta"
                      >
                        <Trash2 size={18} />
                      </button>
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
      </div>

      {/* Modals */}
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
