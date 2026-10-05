// Reporte de IVA del período, listo para entregarle al contador.
//
// Mismo enfoque que payrollPdf: se arma en el navegador con jsPDF, porque el
// cálculo ya viene resuelto del backend y generar el documento aquí evita
// cargar el servidor con trabajo de maquetado.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPeriodLabel } from '../hooks/usePayroll';
import { CATEGORY_LABELS } from '../hooks/usePurchaseInvoices';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const shortDate = (d) => (d ? new Date(d).toLocaleDateString('es-SV') : '—');

/**
 * @param {Object} report  La respuesta de /purchase-invoices/tax-report
 */
export const exportTaxReportToPdf = (report) => {
  if (!report) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const periodLabel = formatPeriodLabel(report.period);

  // --- Encabezado ---
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Taquería El Corral', 40, 45);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reporte de IVA — ${periodLabel}`, 40, 66);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generado el ${new Date().toLocaleString('es-SV', { dateStyle: 'long', timeStyle: 'short' })}`,
    40,
    82
  );
  doc.setTextColor(0);

  // --- Resumen de la declaración ---
  // Es lo primero que mira el contador, así que va arriba de todo el detalle.
  const isInFavor = report.result.inFavor;

  autoTable(doc, {
    startY: 100,
    head: [['Concepto', 'Base imponible', 'IVA']],
    body: [
      ['Ventas del período (débito fiscal)', money(report.sales.base), money(report.sales.tax)],
      ['Compras del período (crédito fiscal)', money(report.purchases.subtotal), money(report.purchases.tax)],
    ],
    foot: [[
      isInFavor ? 'REMANENTE A FAVOR' : 'IVA A PAGAR',
      '',
      money(Math.abs(report.result.taxPayable)),
    ]],
    styles: { fontSize: 10, cellPadding: 7 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    // Verde cuando queda saldo a favor, rojo suave cuando hay que pagar:
    // el color comunica el resultado antes de leer el número.
    footStyles: {
      fillColor: isInFavor ? [220, 252, 231] : [254, 226, 226],
      textColor: 0,
      fontStyle: 'bold',
      fontSize: 11,
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // --- Detalle de compras por categoría ---
  if (report.purchases.byCategory?.length) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Compras por categoría', 40, doc.lastAutoTable.finalY + 28);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 38,
      head: [['Categoría', 'Facturas', 'Subtotal', 'IVA', 'Total']],
      body: report.purchases.byCategory.map((c) => [
        CATEGORY_LABELS[c.category] || c.category,
        String(c.count),
        money(c.subtotal),
        money(c.tax),
        money(c.total),
      ]),
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [107, 114, 128], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
    });
  }

  // --- Detalle factura por factura ---
  // El contador necesita poder rastrear cada crédito fiscal hasta su
  // comprobante, así que va el listado completo, no solo los totales.
  if (report.purchaseList?.length) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de facturas de compra', 40, doc.lastAutoTable.finalY + 28);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 38,
      head: [['Fecha', 'Proveedor', 'N.º factura', 'Subtotal', 'IVA', 'Total', 'Procesada']],
      body: report.purchaseList.map((p) => [
        shortDate(p.issuedAt),
        p.supplierName,
        p.invoiceNumber,
        money(p.subtotal),
        money(p.tax),
        money(p.total),
        p.processedForTax ? 'Sí' : 'No',
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [107, 114, 128], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'center' },
      },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
        doc.setTextColor(0);
      },
    });
  }

  // Aviso al pie: el IVA de las ventas sale de desglosar el total, porque los
  // precios del menú ya lo llevan incluido. Conviene que quede escrito en el
  // documento para que el contador sepa de dónde salió el número.
  const finalY = doc.lastAutoTable.finalY + 24;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    'El IVA de las ventas se obtiene desglosando el total facturado (los precios de venta ya incluyen el 13%).',
    40,
    finalY,
    { maxWidth: pageWidth - 80 }
  );
  doc.text(
    'El IVA de las compras es el monto que consta en cada factura del proveedor.',
    40,
    finalY + 12,
    { maxWidth: pageWidth - 80 }
  );
  doc.setTextColor(0);

  doc.save(`reporte-iva-${report.period}.pdf`);
};

export default { exportTaxReportToPdf };
