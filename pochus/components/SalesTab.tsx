"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Modal from "./ui/Modal";
import { Product, SaleItem } from "@/lib/types";
import { getAllProducts, addSale, getActiveFair } from "@/lib/db";

export default function SalesTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      // Solo mostrar productos con stock
      const inStock = data.filter((p) => p.totalStock > 0);
      setProducts(inStock);
      setFilteredProducts(inStock);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    const existingItem = cart.find(
      (item) => item.productId === product.id && item.size === size
    );

    if (existingItem) {
      updateCartQuantity(
        existingItem.productId,
        existingItem.size,
        existingItem.quantity + quantity
      );
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        size,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (
    productId: string,
    size: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId && item.size === size
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(
      cart.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setProcessing(true);
    try {
      const activeFair = await getActiveFair();

      await addSale({
        items: cart,
        total: getTotalAmount(),
        profit: getTotalAmount(), // Podés ajustar esto si tenés costo de productos
        fairId: activeFair?.id,
        fairName: activeFair?.name,
        notes,
      });

      alert("¡Venta registrada exitosamente!");
      setCart([]);
      setNotes("");
      setIsCartOpen(false);
      await loadProducts(); // Recargar para actualizar stock
    } catch (error) {
      console.error("Error registrando venta:", error);
      alert("Error al registrar la venta");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-2.5 rounded-xl">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">Ventas</h1>
              <p className="text-xs text-gray-400">
                {products.length}{" "}
                {products.length === 1
                  ? "producto disponible"
                  : "productos disponibles"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-sky-500 hover:bg-sky-600 p-2.5 rounded-xl transition-colors"
          >
            <ShoppingCart size={20} className="text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No se encontraron productos con stock
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Carrito de Venta"
        size="lg"
      >
        <CartContent
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          total={getTotalAmount()}
          notes={notes}
          onNotesChange={setNotes}
          onCheckout={handleCheckout}
          processing={processing}
        />
      </Modal>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const availableSizes = product.sizes.filter((s) => s.stock > 0);
  const maxStock =
    availableSizes.find((s) => s.size === selectedSize)?.stock || 0;

  const handleAdd = () => {
    if (!selectedSize) {
      alert("Por favor seleccioná un talle");
      return;
    }
    if (quantity > maxStock) {
      alert(`Stock disponible: ${maxStock}`);
      return;
    }
    onAddToCart(product, selectedSize, quantity);
    setQuantity(1);
    setSelectedSize("");
  };

  return (
    <Card padding="md">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-100 mb-1">{product.name}</h3>
          <p className="text-sky-400 font-bold text-xl">
            ${product.price.toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {availableSizes.map((size) => (
            <button
              key={size.size}
              onClick={() => setSelectedSize(size.size)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedSize === size.size
                  ? "bg-sky-500 text-white"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              {size.size} ({size.stock})
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-slate-600 rounded transition-colors text-gray-300"
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold text-gray-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
              className="p-2 hover:bg-slate-600 rounded transition-colors text-gray-300"
              disabled={quantity >= maxStock}
            >
              <Plus size={16} />
            </button>
          </div>

          <Button onClick={handleAdd} fullWidth disabled={!selectedSize}>
            Agregar al carrito
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Cart Content Component
interface CartContentProps {
  cart: SaleItem[];
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemove: (productId: string, size: string) => void;
  total: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onCheckout: () => void;
  processing: boolean;
}

function CartContent({
  cart,
  onUpdateQuantity,
  onRemove,
  total,
  notes,
  onNotesChange,
  onCheckout,
  processing,
}: CartContentProps) {
  if (cart.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <ShoppingCart size={48} className="mx-auto text-gray-600 mb-3" />
        <p>El carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {cart.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center bg-slate-700 p-3 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-100">
                {item.productName}
              </h4>
              <p className="text-xs text-gray-400">Talle: {item.size}</p>
              <p className="text-sky-400 font-bold mt-1">
                ${item.totalPrice.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      item.productId,
                      item.size,
                      item.quantity - 1
                    )
                  }
                  className="p-1 hover:bg-slate-800 rounded text-gray-300"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-gray-100">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      item.productId,
                      item.size,
                      item.quantity + 1
                    )
                  }
                  className="p-1 hover:bg-slate-800 rounded text-gray-300"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => onRemove(item.productId, item.size)}
                className="p-2 text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Agregar notas sobre esta venta..."
          className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          rows={3}
        />
      </div>

      {/* Total */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-300">Total:</span>
          <span className="text-2xl font-bold text-sky-400">
            ${total.toLocaleString()}
          </span>
        </div>

        <Button onClick={onCheckout} fullWidth size="lg" disabled={processing}>
          {processing ? "Procesando..." : "Confirmar Venta"}
        </Button>
      </div>
    </div>
  );
}
