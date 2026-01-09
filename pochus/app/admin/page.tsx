'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Volver a la app
          </Link>

          <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              {/* Logo placeholder - Reemplazar con tu logo */}
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-3xl font-bold">POCHUS</h1>
            </div>
            <p className="text-sky-100">Panel de Administración</p>
          </div>
        </div>

        {/* Admin Panel */}
        <AdminPanel />

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">
            Instrucciones de uso:
          </h3>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>
              Asegúrate de haber configurado Firebase correctamente en el archivo{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>
            </li>
            <li>
              Hacé clic en "Cargar Productos Iniciales" para importar todos los productos
            </li>
            <li>
              Una vez cargados, podés ir a la sección "Productos" para editarlos
            </li>
            <li>
              Desde la app principal podés gestionar productos, registrar ventas y generar reportes
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
