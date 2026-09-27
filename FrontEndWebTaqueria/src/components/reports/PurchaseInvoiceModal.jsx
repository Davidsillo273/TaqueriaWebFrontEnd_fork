// src/components/reports/PurchaseInvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import FAIcon from '../commons/FAIcon';
import { ModalHeader, ModalBody, ModalFooter, FormSection, OptionalBadge, FORM_INPUT, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY } from '../commons/FormModal';
import { PURCHASE_CATEGORIES } from '../../hooks/usePurchaseInvoices';

// El IVA salvadoreño. Se usa solo para SUGERIR el monto mientras el usuario
// escribe el subtotal: lo que se guarda es lo que él confirme, porque la
// factura del proveedor puede traer un desglose con centavos distintos por
// redondeo, y manda el papel.
const IVA_RATE = 0.13;

const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

// Mismos campos que la ficha del empleado (ver FormModal); sin el mt-1 de
// FORM_INPUT porque aquí el rótulo ya trae su margen.
const inputClass = FORM_INPUT.replace('mt-1 ', '');

const labelClass =
  'block text-[11px] font-semibold text-muted tracking-wide uppercase mb-1';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Contenedor del Modal con borde superior rojo institucional de acento */}
      <div className="bg-surface rounded-2xl border border-line w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <ModalHeader
          icon="receipt"
          title="Registrar factura de compra"
          badge="Registro contable"
          subtitle="Facturas que el negocio recibe de sus proveedores"
          onClose={onClose}
        />

        {/* Formulario scrolleable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ModalBody>
          {/* Sección 1: Datos del Proveedor y Factura */}
          <FormSection icon="building" title="Proveedor y comprobante">
          <div className="space-y-3.5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelClass} htmlFor="supplierName">
                  Proveedor <span className="text-ac font-bold">*</span>
                </label>
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
                <label className={labelClass} htmlFor="supplierTaxId">
                  NIT / NRC del proveedor
                </label>
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
                <label className={labelClass} htmlFor="invoiceNumber">
                  N.º de factura <span className="text-ac font-bold">*</span>
                </label>
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
                <label className={labelClass} htmlFor="issuedAt">
                  Fecha de la factura <span className="text-ac font-bold">*</span>
                </label>
                <input
                  id="issuedAt"
                  type="date"
                  value={form.issuedAt}
                  onChange={(e) => handleChange('issuedAt', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          </FormSection>

          {/* Sección 2: Desglose de Montos y Categoría */}
          <FormSection icon="calculator" title="Montos y clasificación">
          <div className="space-y-3.5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelClass} htmlFor="subtotal">
                  Subtotal (sin IVA) <span className="text-ac font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs num">
                    $
                  </span>
                  <input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.subtotal}
                    onChange={(e) => handleChange('subtotal', e.target.value)}
                    placeholder="150.00"
                    className={`${inputClass} pl-7 num`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="tax">
                  IVA de la factura
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs num">
                    $
                  </span>
                  <input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.tax}
                    onChange={(e) => handleChange('tax', e.target.value)}
                    placeholder="19.50"
                    className={`${inputClass} pl-7 num`}
                  />
                </div>
                <p className="mt-1 text-[10.5px] text-muted leading-tight">
                  Sugerido al 13% del subtotal; editable según comprobante.
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="category">
                  Categoría del gasto
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={inputClass}
                >
                  {PURCHASE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="file">
                  Comprobante (PDF o imagen)
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  <label
                    htmlFor="file"
                    className="px-3 py-1.5 bg-surface border border-line hover:border-ac hover:text-ac text-xs font-semibold text-ink cursor-pointer transition-colors shrink-0 shadow-xs"
                  >
                    <FAIcon icon="paperclip" size="xs" className="mr-1.5" />
                    Seleccionar archivo
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="text-xs text-muted truncate">
                    {file ? file.name : 'Ningún archivo'}
                  </span>
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-muted hover:text-ac p-1 text-xs shrink-0 cursor-pointer"
                      title="Quitar archivo"
                    >
                      <FAIcon icon="times" size="xs" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </FormSection>

          {/* Sección 3: Observaciones */}
          <FormSection icon="pen" title="Observaciones" badge={<OptionalBadge />}>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="notes">
              Notas u observaciones
            </label>
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observaciones sobre esta compra..."
              className={`${inputClass} resize-none`}
            />
          </div>
          </FormSection>

          {/* Tarjeta de cálculo y total en vivo */}
          <div className="p-4 bg-white dark:bg-surface rounded-xl border border-line shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-ac text-white flex items-center justify-center shadow-2xs">
                <FAIcon icon="file-invoice-dollar" size="xs" />
              </div>
              <div>
                <p className="kick text-ink">
                  Total calculado de la factura
                </p>
                <p className="text-[11px] text-muted">
                  Subtotal: <span className="num text-ink">{money(subtotalNum)}</span> + IVA:{' '}
                  <span className="num text-ink">{money(taxNum)}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="num text-2xl sm:text-3xl text-ink font-light">
                {money(totalPreview)}
              </span>
            </div>
          </div>

          {formError && (
            <div className="px-4 py-3 bg-acsoft/30 border border-ac rounded-xl text-xs text-ac flex items-center gap-2">
              <FAIcon icon="triangle-exclamation" size="sm" />
              <span>{formError}</span>
            </div>
          )}

          </ModalBody>

          <ModalFooter note={<>Los campos con <span className="text-ac">*</span> son requeridos para la declaración de IVA · IVA <span className="num">13%</span></>}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={MODAL_BTN_SECONDARY}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={MODAL_BTN_PRIMARY}
            >
              {saving && <FAIcon icon="spinner" className="animate-spin" size="xs" />}
              <span>{saving ? 'Guardando...' : 'Registrar factura'}</span>
            </button>
          </ModalFooter>
        </form>
      </div>
    </div>
  );
};

export default PurchaseInvoiceModal;
