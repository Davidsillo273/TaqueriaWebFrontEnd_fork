// src/components/dashboard/StockAlertModal.jsx
import { useState } from 'react';
import FAIcon from '../commons/FAIcon';
import { ModalShell, ModalHeader, ModalBody, ModalFooter, FormSection, RequiredBadge, CountBadge, MODAL_BTN_PRIMARY } from '../commons/FormModal';

const StockRow = ({ insumo, incomplete, onAddStock, onCompleteInsumo, addToast }) => {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const currentQty = Number(insumo.quantity ?? insumo.stock) || 0;

  const handleAdd = async () => {
    const add = Number(amount);
    if (!add || add <= 0) return;
    setSaving(true);
    const result = await onAddStock(insumo, currentQty + add);
    setSaving(false);
    if (result.success) {
      addToast?.(`Se agregaron ${add} ${insumo.unit || 'unidades'} a ${insumo.name}`, 'success');
      setAmount('');
    } else if (result.message) {
      addToast?.(result.message, 'error');
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between hover:border-ac/40 transition-colors">
      <div className="min-w-0">
        <p className="font-display font-medium text-ink truncate text-[14px]">{insumo.name}</p>
        <p className="text-xs text-ac font-medium mt-0.5 flex items-center gap-1.5">
          <FAIcon icon="triangle-exclamation" size="xs" />
          <span><span className="num">{currentQty}</span> {insumo.unit || 'unidades'} disponibles (umbral: <span className="num">{insumo.lowStockAlert}</span> {insumo.unit || ''})</span>
        </p>
      </div>
      {incomplete ? (
        <button
          type="button"
          onClick={() => onCompleteInsumo(insumo)}
          className="px-3 py-1.5 rounded-lg text-xs font-display font-medium bg-warnsoft text-warn border border-warn/70 hover:bg-warnsoft/80 inline-flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <FAIcon icon="circle-exclamation" size="xs" />
          Completar información
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Cantidad"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24 px-2.5 py-1.5 rounded-lg bg-surface border border-line text-xs num focus:border-ac"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || !amount}
            className="px-3.5 py-1.5 rounded-lg text-xs font-display font-medium border border-ac text-ac bg-acsoft/20 hover:bg-acsoft disabled:opacity-50 transition-colors"
          >
            {saving ? '...' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  );
};

const PendingRow = ({ insumo, onCompleteInsumo }) => (
  <div className="bg-surface rounded-lg border border-line p-3 flex items-center justify-between gap-3 hover:border-ac/40 transition-colors">
    <div className="min-w-0">
      <p className="font-display font-medium text-ink truncate text-[14px]">{insumo.name}</p>
      <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
        <FAIcon icon="circle-info" size="xs" className="text-warn shrink-0" />
        <span className="truncate">Insumo pendiente: le falta ubicación, precio y umbral</span>
      </p>
    </div>
    <button
      type="button"
      onClick={() => onCompleteInsumo(insumo)}
      className="px-3 py-1.5 rounded-lg text-xs font-display font-medium bg-warnsoft text-warn border border-warn/70 hover:bg-warnsoft/80 inline-flex items-center gap-1.5 shrink-0 transition-colors"
    >
      <FAIcon icon="pen" size="xs" />
      Completar
    </button>
  </div>
);

const StockAlertModal = ({ isOpen, onClose, insumos = [], pendingInsumos = [], isIncomplete, onAddStock, onCompleteInsumo, addToast }) => {
  if (!isOpen) return null;

  const totalAlerts = insumos.length;
  const totalPending = pendingInsumos.length;

  return (
    <ModalShell maxWidth="max-w-xl">
      <ModalHeader
        icon="triangle-exclamation"
        title={'Alerta de stock'}
        badge={`${totalAlerts} en alerta`}
        subtitle={totalPending > 0 ? `${totalPending} insumos pendientes de completar` : 'Insumos por debajo de su umbral'}
        onClose={onClose}
      />

      <ModalBody>
        {/* Insumos en alerta de stock */}
        <FormSection
          icon="triangle-exclamation"
          title="Insumos por debajo del umbral"
          badge={insumos.length > 0 ? <RequiredBadge label={`${insumos.length} en alerta`} /> : <CountBadge>Todo en orden</CountBadge>}
        >
          {insumos.length === 0 ? (
            <p className="text-xs text-muted flex items-center gap-2">
              <FAIcon icon="circle-check" size="xs" className="text-ok" />
              No hay insumos en alerta de stock en este momento
            </p>
          ) : (
            <div className="space-y-2.5">
              {insumos.map((i) => (
                <StockRow
                  key={i._id}
                  insumo={i}
                  incomplete={isIncomplete?.(i)}
                  onAddStock={onAddStock}
                  onCompleteInsumo={onCompleteInsumo}
                  addToast={addToast}
                />
              ))}
            </div>
          )}
        </FormSection>

        {/* Insumos pendientes de completar */}
        {pendingInsumos.length > 0 && (
          <FormSection
            icon="circle-info"
            title="Insumos pendientes de completar"
            badge={<RequiredBadge label={`${pendingInsumos.length} pendientes`} />}
          >
            <div className="space-y-2.5">
              {pendingInsumos.map((i) => (
                <PendingRow key={i._id} insumo={i} onCompleteInsumo={onCompleteInsumo} />
              ))}
            </div>
          </FormSection>
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={onClose} className={MODAL_BTN_PRIMARY}>
          Cerrar
        </button>
      </ModalFooter>
    </ModalShell>
  );
};

export default StockAlertModal;
