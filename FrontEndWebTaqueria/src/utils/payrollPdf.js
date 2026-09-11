// Genera el PDF de la planilla de un período, listo para imprimir o pasarle
// a contabilidad.
//
// Se arma en el navegador (jsPDF) y no en el backend a propósito: el cálculo
// ya viene resuelto del servidor, así que generar el documento aquí evita
// cargar a Render con trabajo de maquetado y hace la descarga instantánea.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPeriodLabel } from '../hooks/usePayroll';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

/**
 * @param {Object}   payroll
 * @param {Array}    payroll.rows    Filas de empleados que devolvió el backend
 * @param {Object}   payroll.totals  Totales del período
 * @param {string}   payroll.period  "AAAA-MM"
 */
export const exportPayrollToPdf = ({ rows = [], totals, period }) => {
  // Horizontal: la planilla tiene 8 columnas y en vertical quedarían
  // demasiado apretadas para leerse.
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const periodLabel = formatPeriodLabel(period);

  // --- Encabezado ---
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Taquería El Corral', 40, 45);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(`Planilla de pago — ${periodLabel}`, 40, 66);

  doc.setFontSize(9);
  doc.setTextColor(120);
  const generatedAt = new Date().toLocaleString('es-SV', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  doc.text(`Generado el ${generatedAt}`, 40, 82);
  doc.text(`${rows.length} empleado${rows.length === 1 ? '' : 's'}`, pageWidth - 40, 82, { align: 'right' });
  doc.setTextColor(0);

  // --- Tabla de empleados ---
  autoTable(doc, {
    startY: 100,
    head: [[
      'Empleado',
      'Puesto',
      'Salario base',
      'Bonos',
      'AFP',
      'ISSS',
      'Renta (ISR)',
      'Neto a pagar',
    ]],
    body: rows.map((row) => [
      row.name,
      row.typeLabel,
      money(row.grossSalary),
      money(row.additionalPay),
      money(row.afp),
      money(row.isss),
      money(row.isr),
      money(row.netSalary),
    ]),
    // Fila de totales al final, separada visualmente del detalle.
    foot: totals
      ? [[
          'TOTALES',
          '',
          money(totals.grossSalary),
          money(totals.additionalPay),
          money(totals.afp),
          money(totals.isss),
          money(totals.isr),
          money(totals.netSalary),
        ]]
      : undefined,
    styles: { fontSize: 9, cellPadding: 6 },
    // Rojo de la marca, el mismo que usa el panel para los elementos activos.
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [243, 244, 246], textColor: 0, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 160 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold' },
    },
    // Pie de página con la numeración, en cada hoja.
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${doc.internal.getNumberOfPages()}`,
        pageWidth - 40,
        pageHeight - 20,
        { align: 'right' }
      );
      doc.text(
        'Descuentos de ley calculados según las tasas vigentes de AFP, ISSS y la tabla de retención de ISR.',
        data.settings.margin.left,
        pageHeight - 20
      );
      doc.setTextColor(0);
    },
  });

  doc.save(`planilla-${period}.pdf`);
};

export default { exportPayrollToPdf };
