// Motor de reportes del sistema: convierte cualquier listado del panel en un
// documento descargable (PDF, XML o JSON).
//
// La idea es que cada pantalla solo declare QUÉ columnas quiere exportar (ver
// constants/reportConfigs.js) y este módulo se encarga del resto: maquetar el
// PDF, serializar el XML/JSON y disparar la descarga. Así agregar el reporte a
// una pantalla nueva no implica escribir un exportador entero otra vez.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND_RED = [220, 38, 38];

// Miniaturas dentro del PDF: alto de fila y lado del cuadrado, en puntos.
// 34pt da una imagen reconocible sin inflar el documento ni el tiempo de
// generación cuando hay decenas de filas.
const IMAGE_CELL_SIZE = 34;

const nowStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
};

// Dispara la descarga de un texto como archivo. Se usa para XML y JSON; el
// PDF lo guarda jsPDF por su cuenta.
const downloadText = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar la URL temporal: si no, el blob se queda en memoria hasta que se
  // recargue la página.
  URL.revokeObjectURL(url);
};

/**
 * Reescribe una URL de Cloudinary para que devuelva ya la miniatura, en vez
 * de la imagen a resolución completa.
 *
 * Sin esto el PDF pesa muchísimo: la foto original puede rondar el megabyte y
 * se incrusta entera aunque en el documento se vea a 34 puntos. Pedirle el
 * recorte a Cloudinary (que lo hace en su servidor) deja el PDF en un tamaño
 * razonable y además descarga mucho más rápido.
 *
 * Si la URL no es de Cloudinary se devuelve tal cual: el reporte igual
 * funciona, solo que sin esta optimización.
 */
const toThumbnailUrl = (url) => {
  if (typeof url !== 'string' || !url.includes('/upload/')) return url;

  // c_fill,w_120,h_120 = recorte cuadrado de 120px (suficiente para 34pt
  // incluso en pantallas de alta densidad); q_auto deja que Cloudinary elija
  // la compresión.
  return url.replace('/upload/', '/upload/c_fill,w_120,h_120,q_auto/');
};

/**
 * Descarga una imagen y la convierte a data URL para poder incrustarla en el
 * PDF (jsPDF necesita los bytes, no puede resolver una URL remota por su
 * cuenta).
 *
 * Devuelve null si falla, para que una imagen rota no tumbe todo el reporte:
 * esa fila simplemente queda sin miniatura.
 */
const fetchImageAsDataUrl = async (url) => {
  if (!url) return null;

  try {
    const response = await fetch(toThumbnailUrl(url));
    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      // Un error de lectura tampoco debe romper nada
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    // Normalmente CORS o red caída. Se reporta sin la imagen.
    return null;
  }
};

// Detecta el formato que jsPDF necesita declarar al incrustar la imagen.
const imageFormatFromDataUrl = (dataUrl) => {
  if (typeof dataUrl !== 'string') return 'JPEG';
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
};

/**
 * Genera el PDF de un listado.
 *
 * @param {Object}   config
 * @param {string}   config.title       Título del documento ("Bebidas")
 * @param {string}   config.subtitle    Línea de contexto opcional
 * @param {Array}    config.columns     [{ header, value(row), align, width }]
 * @param {Array}    config.rows        Los datos ya filtrados por la pantalla
 * @param {Object}   config.imageOptions { mode: 'none'|'thumbnail'|'link', getUrl(row) }
 * @param {Array}    config.summary     [{ label, value }] para el bloque de resumen
 */
const exportToPdf = async ({ title, subtitle, columns, rows, imageOptions, summary }) => {
  const imageMode = imageOptions?.mode || 'none';
  const getImageUrl = imageOptions?.getUrl;

  // Con miniaturas conviene apaisado: la columna de imagen se come el ancho
  // que en vertical haría ilegibles las demás.
  const orientation = imageMode === 'thumbnail' || columns.length > 6 ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Encabezado ---
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Taquería El Corral', 40, 45);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 40, 66);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generado el ${new Date().toLocaleString('es-SV', { dateStyle: 'long', timeStyle: 'short' })}`,
    40,
    82
  );
  doc.text(`${rows.length} registro${rows.length === 1 ? '' : 's'}`, pageWidth - 40, 82, { align: 'right' });
  if (subtitle) {
    doc.text(subtitle, 40, 95);
  }
  doc.setTextColor(0);

  let startY = subtitle ? 112 : 100;

  // --- Resumen opcional (totales, conteos por estado, etc.) ---
  if (summary?.length) {
    autoTable(doc, {
      startY,
      body: summary.map((s) => [s.label, String(s.value)]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 160 },
        1: { halign: 'left' },
      },
    });
    startY = doc.lastAutoTable.finalY + 16;
  }

  // --- Miniaturas: se descargan todas ANTES de maquetar ---
  // autoTable dibuja de forma síncrona, así que no puede esperar a un fetch
  // dentro del callback de la celda; hay que tener los bytes listos de antemano.
  let imagesByRow = [];
  if (imageMode === 'thumbnail' && getImageUrl) {
    imagesByRow = await Promise.all(rows.map((row) => fetchImageAsDataUrl(getImageUrl(row))));
  }

  // Columnas finales: la de imagen se antepone solo si corresponde
  const showImageColumn = imageMode !== 'none' && Boolean(getImageUrl);
  const headers = [
    ...(showImageColumn ? [imageMode === 'thumbnail' ? 'Imagen' : 'Enlace de imagen'] : []),
    ...columns.map((c) => c.header),
  ];

  const body = rows.map((row, index) => {
    const dataCells = columns.map((c) => {
      const value = c.value(row);
      return value === null || value === undefined || value === '' ? '—' : String(value);
    });

    if (!showImageColumn) return dataCells;

    if (imageMode === 'link') {
      return [getImageUrl(row) || '—', ...dataCells];
    }

    // En modo miniatura la celda va vacía: la imagen se pinta encima en
    // didDrawCell, porque autoTable no sabe dibujar imágenes por sí solo.
    return [imagesByRow[index] ? '' : '—', ...dataCells];
  });

  const columnStyles = {};
  let offset = 0;

  if (showImageColumn) {
    columnStyles[0] = imageMode === 'thumbnail'
      ? { cellWidth: IMAGE_CELL_SIZE + 8, halign: 'center' }
      : { cellWidth: 150, fontSize: 6, textColor: [80, 80, 160] };
    offset = 1;
  }

  columns.forEach((c, i) => {
    columnStyles[i + offset] = {
      ...(c.align ? { halign: c.align } : {}),
      ...(c.width ? { cellWidth: c.width } : {}),
    };
  });

  autoTable(doc, {
    startY,
    head: [headers],
    body,
    styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
    headStyles: { fillColor: BRAND_RED, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles,
    // Las filas con miniatura necesitan alto fijo para que la imagen quepa
    ...(imageMode === 'thumbnail' ? { bodyStyles: { minCellHeight: IMAGE_CELL_SIZE + 6 } } : {}),

    didDrawCell: (data) => {
      // Pintar la miniatura dentro de la celda de imagen
      if (
        imageMode === 'thumbnail' &&
        data.section === 'body' &&
        data.column.index === 0
      ) {
        const dataUrl = imagesByRow[data.row.index];
        if (!dataUrl) return;

        try {
          const x = data.cell.x + (data.cell.width - IMAGE_CELL_SIZE) / 2;
          const y = data.cell.y + (data.cell.height - IMAGE_CELL_SIZE) / 2;
          doc.addImage(dataUrl, imageFormatFromDataUrl(dataUrl), x, y, IMAGE_CELL_SIZE, IMAGE_CELL_SIZE);
        } catch {
          // Un formato que jsPDF no reconozca no debe romper el resto del PDF
        }
      }
    },

    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
      doc.setTextColor(0);
    },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${nowStamp()}.pdf`);
};

// Escapa los caracteres que romperían el XML si aparecen en un nombre o
// descripción (ej. "Café & Té", comillas en una nota).
const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Convierte el encabezado de una columna en un nombre de etiqueta XML válido
// ("Precio unitario" -> "precio_unitario"). XML no admite espacios, tildes ni
// que la etiqueta empiece por un número.
const toXmlTag = (header) => {
  const normalized = String(header)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return /^[a-z]/.test(normalized) ? normalized : `campo_${normalized || 'sin_nombre'}`;
};

const exportToXml = ({ title, columns, rows, imageOptions, itemTag = 'registro' }) => {
  const includeImage = imageOptions?.mode !== 'none' && Boolean(imageOptions?.getUrl);

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<reporte>',
    '  <metadatos>',
    `    <titulo>${escapeXml(title)}</titulo>`,
    `    <generado>${new Date().toISOString()}</generado>`,
    `    <total>${rows.length}</total>`,
    '  </metadatos>',
    '  <registros>',
  ];

  rows.forEach((row) => {
    lines.push(`    <${itemTag}>`);

    if (includeImage) {
      lines.push(`      <imagen>${escapeXml(imageOptions.getUrl(row) || '')}</imagen>`);
    }

    columns.forEach((c) => {
      const tag = toXmlTag(c.header);
      lines.push(`      <${tag}>${escapeXml(c.value(row))}</${tag}>`);
    });

    lines.push(`    </${itemTag}>`);
  });

  lines.push('  </registros>', '</reporte>');

  downloadText(
    lines.join('\n'),
    `${title.toLowerCase().replace(/\s+/g, '-')}-${nowStamp()}.xml`,
    'application/xml'
  );
};

const exportToJson = ({ title, columns, rows, imageOptions }) => {
  const includeImage = imageOptions?.mode !== 'none' && Boolean(imageOptions?.getUrl);

  const payload = {
    reporte: title,
    generado: new Date().toISOString(),
    total: rows.length,
    // Las claves salen de los encabezados normalizados, igual que en el XML,
    // para que ambos formatos describan los mismos campos.
    registros: rows.map((row) => {
      const item = {};
      if (includeImage) item.imagen = imageOptions.getUrl(row) || null;

      columns.forEach((c) => {
        const value = c.value(row);
        item[toXmlTag(c.header)] = value === undefined ? null : value;
      });

      return item;
    }),
  };

  downloadText(
    JSON.stringify(payload, null, 2),
    `${title.toLowerCase().replace(/\s+/g, '-')}-${nowStamp()}.json`,
    'application/json'
  );
};

/**
 * Punto de entrada único: genera el reporte en el formato pedido.
 *
 * Es asíncrono porque el PDF con miniaturas tiene que descargar las imágenes
 * antes de poder maquetarse; XML y JSON resuelven al instante.
 */
export const generateReport = async ({ format, ...config }) => {
  switch (format) {
    case 'pdf':
      return exportToPdf(config);
    case 'xml':
      return exportToXml(config);
    case 'json':
      return exportToJson(config);
    default:
      throw new Error(`Formato de reporte no soportado: ${format}`);
  }
};

export default { generateReport };
