import React, { useState, useEffect } from 'react';
import FAIcon from '../commons/FAIcon';
import Select from '../commons/Select';
import { PURCHASE_CATEGORIES } from '../../hooks/usePurchaseInvoices';

// El IVA salvadoreño. Se usa solo para SUGERIR el monto mientras el usuario
// escribe el subtotal: lo que se guarda es lo que él confirme, porque la
// factura del proveedor puede traer un desglose con centavos distintos por
// redondeo, y manda el papel.
const IVA_RATE = 0.13;

const EMPTY_FORM = {
  supplierName: '',
  supplierTaxId: '',
  invoiceNumber: '',
  issuedAt: '',
  subtotal: '',
  tax: '',
  category: 'insumos',
  notes: '',
};

const inputClass =
  'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm text-gray-700 placeholder:text-gray-400 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';

const labelClass = 'block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

const PurchaseInvoiceModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Cada vez que se abre, el formulario arranca limpio: si no, quedarían los
  // datos de la factura anterior y es fácil registrar una compra equivocada.
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setFile(null);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Al escribir el subtotal se propone el IVA correspondiente, pero solo
      // si el usuario todavía no lo escribió a mano: nunca se pisa un valor
      // que él ya haya puesto.
      if (field === 'subtotal' && !prev.tax) {
        const subtotal = Number(value);
        if (subtotal > 0) next.tax = (subtotal * IVA_RATE).toFixed(2);
      }

      return next;
    });
  };

  const subtotalNum = Number(form.subtotal) || 0;
  const taxNum = Number(form.tax) || 0;
  const totalPreview = subtotalNum + taxNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.supplierName.trim() || !form.invoiceNumber.trim() || !form.issuedAt) {
      setFormError('El proveedor, el número de factura y la fecha son obligatorios.');
      return;
    }
    if (subtotalNum <= 0) {
      setFormError('El subtotal debe ser mayor que cero.');
      return;
    }

    setSaving(true);
    const result = await onSubmit({ ...form, total: totalPreview.toFixed(2) }, file);
    setSaving(false);

    if (result?.success) {
      onClose();
    } else {
      setFormError(result?.message || 'No se pudo registrar la factura.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)]">
              <FAIcon icon="receipt" className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-gray-900">Registrar factura de compra</h3>
              <p className="text-xs text-gray-500">Facturas que el negocio recibe de sus proveedores</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Cerrar"
          >
            <FAIcon icon="times" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="supplierName">Proveedor *</label>
              <input
                id="supplierName"
                type="text"
                value={form.supplierName}
                onChange={(e) => handleChange('supplierName', e.target.value)}
                placeholder="Distribuidora La Ceiba"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="supplierTaxId">NIT / NRC del proveedor</label>
              <input
                id="supplierTaxId"
                type="text"
                value={form.supplierTaxId}
                onChange={(e) => handleChange('supplierTaxId', e.target.value)}
                placeholder="0614-010203-101-2"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="invoiceNumber">N.º de factura *</label>
              <input
                id="invoiceNumber"
                type="text"
                value={form.invoiceNumber}
                onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                placeholder="F-00123"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="issuedAt">Fecha de la factura *</label>
              <input
                id="issuedAt"
                type="date"
                value={form.issuedAt}
                onChange={(e) => handleChange('issuedAt', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="subtotal">Subtotal (sin IVA) *</label>
              <input
                id="subtotal"
                type="number"
                step="0.01"
                min="0"
                value={form.subtotal}
                onChange={(e) => handleChange('subtotal', e.target.value)}
                placeholder="150.00"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="tax">IVA de la factura</label>
              <input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                value={form.tax}
                onChange={(e) => handleChange('tax', e.target.value)}
                placeholder="19.50"
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Se sugiere el 13% del subtotal; ajústalo a lo que diga la factura.
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="category">Categoría del gasto</label>
              <Select
                id="category"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {PURCHASE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className={labelClass} htmlFor="file">Comprobante (PDF o imagen)</label>
              <input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-display file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
              />
              {file && (
                <p className="mt-1 text-[11px] text-green-600 font-medium truncate">
                  <FAIcon icon="paperclip" size="xs" /> {file.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="notes">Notas</label>
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observaciones sobre esta compra..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Total calculado en vivo, para que el usuario pueda contrastarlo
              con el que trae impreso la factura antes de guardar. */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#f3f0eb] rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)]">
            <span className="text-sm font-display font-semibold text-gray-600">Total de la factura</span>
            <span className="text-2xl font-display font-bold text-gray-900">
              ${totalPreview.toFixed(2)}
            </span>
          </div>

          {formError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-display font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-display font-semibold text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-colors shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Registrar factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseInvoiceModal;
