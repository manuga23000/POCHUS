import jsPDF from 'jspdf';
import { Sale } from './types';

interface ReportData {
  totalSales: number;
  totalProfit: number;
  totalItems: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export function generatePDF(sales: Sale[], reportData: ReportData) {
  const doc = new jsPDF();

  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Header - Logo y título
  doc.setFillColor(29, 41, 61); // Azul oscuro #1D293D
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Agregar logo si está disponible
  try {
    const logoImg = document.querySelector('img[src="/logo.png"]') as HTMLImageElement;
    if (logoImg && logoImg.complete) {
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.naturalWidth;
      canvas.height = logoImg.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(logoImg, 0, 0);
        const imgData = canvas.toDataURL('image/png');
        // Logo centrado
        const logoSize = 15;
        doc.addImage(imgData, 'PNG', (pageWidth - logoSize) / 2, 8, logoSize, logoSize);
      }
    }
  } catch (error) {
    console.log('Logo no disponible para PDF');
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('POCHUS', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Ventas', pageWidth / 2, 40, { align: 'center' });

  yPos = 60;

  // Fecha del reporte
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const today = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generado: ${today}`, margin, yPos);
  yPos += 10;

  // Período
  if (reportData.dateRange.start || reportData.dateRange.end) {
    const startDate = reportData.dateRange.start
      ? new Date(reportData.dateRange.start).toLocaleDateString('es-AR')
      : 'Inicio';
    const endDate = reportData.dateRange.end
      ? new Date(reportData.dateRange.end).toLocaleDateString('es-AR')
      : 'Hoy';
    doc.text(`Período: ${startDate} - ${endDate}`, margin, yPos);
    yPos += 15;
  } else {
    doc.text('Período: Todos los registros', margin, yPos);
    yPos += 15;
  }

  // Resumen (Cuadros de estadísticas)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen', margin, yPos);
  yPos += 10;

  // Cajas de resumen
  const boxWidth = (pageWidth - margin * 2 - 10) / 2;
  const boxHeight = 25;

  // Total Ventas
  doc.setFillColor(240, 248, 255);
  doc.rect(margin, yPos, boxWidth, boxHeight, 'F');
  doc.setDrawColor(135, 206, 235);
  doc.rect(margin, yPos, boxWidth, boxHeight);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Total Ventas', margin + 5, yPos + 8);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`$${reportData.totalSales.toLocaleString()}`, margin + 5, yPos + 18);

  // Total Items
  doc.setFillColor(240, 248, 255);
  doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, 'F');
  doc.setDrawColor(135, 206, 235);
  doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Productos Vendidos', margin + boxWidth + 15, yPos + 8);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`${reportData.totalItems}`, margin + boxWidth + 15, yPos + 18);

  yPos += boxHeight + 5;

  // Ganancias
  doc.setFillColor(240, 255, 240);
  doc.rect(margin, yPos, boxWidth, boxHeight, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.rect(margin, yPos, boxWidth, boxHeight);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Ganancias', margin + 5, yPos + 8);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text(`$${reportData.totalProfit.toLocaleString()}`, margin + 5, yPos + 18);

  // Número de Ventas
  doc.setFillColor(255, 247, 237);
  doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, 'F');
  doc.setDrawColor(249, 115, 22);
  doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Número de Ventas', margin + boxWidth + 15, yPos + 8);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text(`${sales.length}`, margin + boxWidth + 15, yPos + 18);

  yPos += boxHeight + 15;

  // Detalle de Ventas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Detalle de Ventas', margin, yPos);
  yPos += 10;

  // Tabla de ventas
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  sales.forEach((sale, index) => {
    // Verificar si necesitamos nueva página
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Fondo de la venta
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'F');

    // Fecha y total
    const saleDate = new Date(sale.createdAt).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.setFont('helvetica', 'bold');
    doc.text(`Venta #${index + 1}`, margin + 2, yPos + 7);
    doc.text(`${saleDate}`, margin + 50, yPos + 7);
    doc.text(`$${sale.total.toLocaleString()}`, pageWidth - margin - 30, yPos + 7);

    yPos += 12;

    // Items de la venta
    doc.setFont('helvetica', 'normal');
    sale.items.forEach((item) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      const sizeText = item.size !== 'Sin talle' ? ` (${item.size})` : '';
      const itemText = `  • ${item.quantity}x ${item.productName}${sizeText}`;
      const itemPrice = `$${item.totalPrice.toLocaleString()}`;

      doc.text(itemText, margin + 5, yPos + 5);
      doc.text(itemPrice, pageWidth - margin - 30, yPos + 5);

      yPos += 6;
    });

    // Notas
    if (sale.notes) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const noteLines = doc.splitTextToSize(`  Nota: ${sale.notes}`, pageWidth - margin * 2 - 10);
      doc.text(noteLines, margin + 5, yPos + 5);
      yPos += noteLines.length * 4 + 2;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
    }

    yPos += 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'POCHUS - Gestión de Inventario',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Descargar PDF
  const fileName = `reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
