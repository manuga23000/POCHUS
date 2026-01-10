'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import AlertModal from './ui/AlertModal';
import { Sale } from '@/lib/types';
import { getAllSales } from '@/lib/db';
import { generatePDF } from '@/lib/pdf-generator';

export default function ReportsTab() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    if (!dateRange.start && !dateRange.end) {
      setFilteredSales(sales);
      return;
    }

    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);

      let start = dateRange.start ? new Date(dateRange.start) : null;
      if (start) start.setHours(0, 0, 0, 0);

      let end = dateRange.end ? new Date(dateRange.end) : null;
      if (end) end.setHours(23, 59, 59, 999);

      if (start && saleDate < start) return false;
      if (end && saleDate > end) return false;
      return true;
    });

    setFilteredSales(filtered);
  }, [dateRange, sales]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getAllSales();
      setSales(data);
      setFilteredSales(data);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getTotalProfit = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  };

  const getTotalItems = () => {
    return filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
  };

  const handleGeneratePDF = () => {
    if (filteredSales.length === 0) {
      setAlertModal({
        isOpen: true,
        message: 'No hay ventas para generar el reporte',
        type: 'error'
      });
      return;
    }

    try {
      generatePDF(filteredSales, {
        totalSales: getTotalSales(),
        totalProfit: getTotalProfit(),
        totalItems: getTotalItems(),
        dateRange,
      });
      setAlertModal({
        isOpen: true,
        message: 'Reporte PDF generado exitosamente',
        type: 'success'
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      setAlertModal({
        isOpen: true,
        message: 'Error al generar el reporte PDF',
        type: 'error'
      });
    }
  };

  return (
    <div className="pb-20">
      {/* Logo oculto para PDF */}
      <img src="/logo.png" alt="Logo" className="hidden" crossOrigin="anonymous" />

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2.5 rounded-xl">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Reportes</h1>
            <p className="text-xs text-gray-400">
              Análisis de ventas y ganancias
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Date Filter */}
        <Card padding="md">
          <h3 className="font-semibold text-gray-100 mb-3 flex items-center gap-2 text-sm">
            <Calendar size={16} />
            Filtrar por fecha
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Desde</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Hasta</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-600 bg-slate-900 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          {(dateRange.start || dateRange.end) && (
            <Button
              onClick={() => setDateRange({ start: '', end: '' })}
              variant="outline"
              size="sm"
              className="mt-3 w-full"
            >
              Limpiar filtros
            </Button>
          )}
        </Card>

        {/* Stats */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Cargando reportes...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card padding="md" className="bg-gradient-to-br from-sky-900/40 to-slate-800">
                <div className="flex items-start gap-3">
                  <div className="bg-sky-500 p-2 rounded-lg flex-shrink-0">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Total Ventas</p>
                    <p className="text-lg font-bold text-gray-100 truncate">
                      ${getTotalSales().toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="bg-gradient-to-br from-green-900/40 to-slate-800">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Ganancias</p>
                    <p className="text-lg font-bold text-gray-100 truncate">
                      ${getTotalProfit().toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="bg-gradient-to-br from-purple-900/40 to-slate-800">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500 p-2 rounded-lg flex-shrink-0">
                    <Package size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Productos</p>
                    <p className="text-lg font-bold text-gray-100">
                      {getTotalItems()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="bg-gradient-to-br from-orange-900/40 to-slate-800">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-500 p-2 rounded-lg flex-shrink-0">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">Transacciones</p>
                    <p className="text-lg font-bold text-gray-100">
                      {filteredSales.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Generate PDF Button */}
            <Button
              onClick={handleGeneratePDF}
              fullWidth
              size="lg"
              className="flex items-center justify-center gap-2"
              disabled={filteredSales.length === 0}
            >
              <Download size={20} />
              Descargar Reporte PDF
            </Button>

            {/* Sales List */}
            <div>
              <h3 className="font-semibold text-gray-100 mb-3">
                Detalle de Ventas ({filteredSales.length})
              </h3>
              {filteredSales.length === 0 ? (
                <Card padding="lg">
                  <div className="text-center text-gray-400">
                    <FileText size={48} className="mx-auto text-gray-600 mb-3" />
                    <p>No hay ventas registradas</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredSales.map((sale) => (
                    <Card key={sale.id} padding="md">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-400">
                              {new Date(sale.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {sale.fairName && (
                              <p className="text-sm font-medium text-sky-400 mt-1">
                                {sale.fairName}
                              </p>
                            )}
                          </div>
                          <p className="text-lg font-bold text-gray-100">
                            ${sale.total.toLocaleString()}
                          </p>
                        </div>

                        <div className="border-t border-slate-700 pt-2">
                          {sale.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm py-1"
                            >
                              <span className="text-gray-400">
                                {item.quantity}x {item.productName}
                                {item.size !== 'Sin talle' && ` (${item.size})`}
                              </span>
                              <span className="text-gray-200 font-medium">
                                ${item.totalPrice.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {sale.notes && (
                          <div className="border-t border-slate-700 pt-2">
                            <p className="text-xs text-gray-400 italic">
                              Nota: {sale.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
