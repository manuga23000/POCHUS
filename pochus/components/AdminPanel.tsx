'use client';

import { useState } from 'react';
import { Database, Upload, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { initialProducts } from '@/lib/initial-products';
import { addProduct } from '@/lib/db';

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleLoadProducts = async () => {
    if (!confirm('¿Estás segura de que querés cargar los productos iniciales? Esto agregará todos los productos de la lista.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const product of initialProducts) {
        try {
          const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
          await addProduct({
            name: product.name,
            price: product.price,
            category: product.category,
            sizes: product.sizes,
            totalStock,
          });
          successCount++;
        } catch (err) {
          console.error(`Error al cargar ${product.name}:`, err);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        setSuccess(true);
        alert(`¡Éxito! Se cargaron ${successCount} productos correctamente.`);
      } else {
        setError(`Se cargaron ${successCount} productos, pero ${errorCount} fallaron.`);
      }
    } catch (err) {
      console.error('Error general:', err);
      setError('Error al cargar los productos. Verificá tu conexión a Firebase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg" className="max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <div className="bg-sky-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <Database size={32} className="text-sky-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Panel de Administración
          </h2>
          <p className="text-gray-600">
            Carga los productos iniciales en la base de datos
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ¡Productos cargados exitosamente!
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg text-left">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Total de productos a cargar:</strong> {initialProducts.length}
          </p>
          <p className="text-xs text-gray-500">
            Esto incluye conjuntos, enteritos, bodys, bandanas, ajuares, ropa interior y productos de higiene femenina.
          </p>
        </div>

        <Button
          onClick={handleLoadProducts}
          disabled={loading}
          fullWidth
          size="lg"
          className="flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Cargando productos...
            </>
          ) : (
            <>
              <Upload size={20} />
              Cargar Productos Iniciales
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500">
          Solo hacé esto una vez. Si los productos ya están cargados, se duplicarán.
        </p>
      </div>
    </Card>
  );
}
