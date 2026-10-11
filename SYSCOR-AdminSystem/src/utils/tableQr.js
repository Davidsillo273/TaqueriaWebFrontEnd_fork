// Códigos QR de las mesas. El contenido es el enlace a la página de la mesa
// (SYSCOR-tableSystem): con la cámara del teléfono, el cliente pide la
// cuenta o llama a su mesero; con la app, registra su llegada si reservó
// (el backend acepta ese mismo enlace, ver utils/tables/tableQrUtils.js).
// El token es aleatorio para que nadie pueda usarlo sin estar frente a la mesa.
//
// VITE_TABLE_URL es el dominio de la página en Vercel (sin / al final).
import QRCode from 'qrcode';
import { TABLE_ZONES } from '../constants/tables';

const TABLE_URL = String(import.meta.env.VITE_TABLE_URL || '').trim().replace(/\/+$/, '');

export const tableQrText = (table) => `${TABLE_URL}/mesa/${table.qrToken}`;

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// Abre una hoja lista para imprimir con el QR de cada mesa (una tarjeta por
// mesa, para recortar y pegar). La ventana se abre antes de generar los
// códigos: si se abre después de un await, el navegador la bloquea.
export async function printTableQrs(tables) {
  if (!TABLE_URL) {
    return { success: false, message: 'Falta configurar VITE_TABLE_URL (el enlace de la página de la mesa) para generar los QR.' };
  }
  const withToken = tables.filter((t) => t.qrToken).sort((a, b) => Number(a.number) - Number(b.number));
  if (withToken.length === 0) return { success: false, message: 'Estas mesas todavía no tienen código QR.' };

  const win = window.open('', '_blank');
  if (!win) return { success: false, message: 'El navegador bloqueó la ventana. Permite ventanas emergentes.' };

  const cards = await Promise.all(
    withToken.map(async (table) => {
      const src = await QRCode.toDataURL(tableQrText(table), { width: 480, margin: 1, errorCorrectionLevel: 'M' });
      const zone = TABLE_ZONES[table.zone];
      return `
        <div class="card">
          <div class="brand">Taquería El Corral</div>
          <div class="num">Mesa ${escapeHtml(String(table.number).padStart(2, '0'))}</div>
          <img src="${src}" alt="QR de la mesa ${escapeHtml(table.number)}" />
          <div class="hint">Escanéame con tu cámara para <b>pedir la cuenta</b> o <b>llamar a tu mesero</b>.</div>
          <div class="sub">¿Reservaste desde la app? Escanéalo ahí al llegar.</div>
          ${zone ? `<div class="zone">${escapeHtml(zone.label)} · ${escapeHtml(zone.floor)}</div>` : ''}
        </div>`;
    }),
  );

  win.document.write(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Códigos QR de las mesas</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 16px; font-family: Inter, system-ui, sans-serif; color: #292b31; background: #fff; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
  .card { border: 1px dashed #9397ab; padding: 16px; text-align: center; break-inside: avoid; }
  .brand { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #75798c; }
  .num { font-size: 28px; font-weight: 700; margin: 4px 0 8px; }
  img { width: 100%; max-width: 220px; height: auto; }
  .hint { font-size: 13px; margin-top: 8px; line-height: 1.35; }
  .sub { font-size: 10.5px; color: #75798c; margin-top: 4px; }
  .zone { font-size: 11px; color: #75798c; margin-top: 4px; }
  @media print { body { padding: 0; } .grid { grid-template-columns: repeat(3, 1fr); } }
</style></head>
<body><div class="grid">${cards.join('')}</div>
<script>window.onload = () => setTimeout(() => window.print(), 200);</script>
</body></html>`);
  win.document.close();
  return { success: true };
}
