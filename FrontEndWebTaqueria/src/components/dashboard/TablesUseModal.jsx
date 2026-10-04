// src/components/dashboard/TablesUseModal.jsx
import { useState } from 'react';
import FAIcon from '../commons/FAIcon';
import FormModal, { FormSection, PillGroup, CountBadge, MODAL_BTN_SECONDARY } from '../commons/FormModal';
import Select from '../commons/Select';
import ConfirmModal from '../commons/ConfirmModal';

const STATUS_OPTIONS = [
  { value: 'libre', label: 'Libre' },
  { value: 'ocupada', label: 'Ocupada' },
  { value: 'reservada', label: 'Reservada' },
];

const STATUS_STYLES = {
  libre: 'bg-oksoft text-ok border-ok',
  ocupada: 'bg-acsoft text-ac border-acline',
  reservada: 'bg-infosoft text-info border-info',
};

const TableCard = ({ table, onUpdate, addToast }) => {
  const [status, setStatus] = useState(table.status);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    const result = await onUpdate(table._id, { number: table.number, status: newStatus });
    setSaving(false);
    if (!result.success) {
      setStatus(table.status);
      addToast?.(result.message || 'No se pudo actualizar la mesa', 'error');
    } else {
      addToast?.(`Mesa ${table.number} actualizada a "${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}"`, 'success');
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FAIcon icon="chair" size="sm" className="text-ac" />
          <span className="font-display font-medium text-[14px] text-ink">Mesa <span className="num">{table.number}</span></span>
        </div>
        <span className={`kick px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || 'bg-surfalt text-inkalt border-line'}`}>
          {STATUS_OPTIONS.find((s) => s.value === status)?.label || status}
        </span>
      </div>
      <Select size="sm" value={status} onChange={handleChange} disabled={saving}>
        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
    </div>
  );
};

const TablesUseModal = ({ isOpen, onClose, tables, onUpdate, onBulkUpdate, addToast }) => {
  const [filter, setFilter] = useState('ocupada');
  const [bulkStatus, setBulkStatus] = useState('libre');
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  if (!isOpen) return null;

  const shown = filter === 'all' ? tables : tables.filter((t) => t.status === filter);

  const handleBulkConfirm = async () => {
    setBulkLoading(true);
    const result = await onBulkUpdate(bulkStatus);
    setBulkLoading(false);
    setConfirmBulk(false);
    const label = STATUS_OPTIONS.find((s) => s.value === bulkStatus)?.label || bulkStatus;
    addToast?.(result.success ? `Todas las mesas se pusieron en "${label}"` : (result.message || 'No se pudo actualizar las mesas'), result.success ? 'success' : 'error');
  };

  return (
    <>
      <FormModal
        icon="chair"
        title="Mesas"
        badge={`${tables.length} mesas`}
        subtitle="Estado del salón en tiempo real"
        onClose={onClose}
        cancelLabel="Cerrar"
        maxWidth="max-w-2xl"
      >
        {/* Acción masiva */}
        {onBulkUpdate && (
          <FormSection icon="layer-group" title="Cambiar todas las mesas">
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="flex-1">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
              <button
                type="button"
                onClick={() => setConfirmBulk(true)}
                disabled={tables.length === 0}
                className={`${MODAL_BTN_SECONDARY} shrink-0 whitespace-nowrap`}
              >
                Aplicar a todas
              </button>
            </div>
          </FormSection>
        )}

        {/* Lista de mesas */}
        <FormSection icon="chair" title="Estado de las mesas" badge={<CountBadge>{shown.length} mostradas</CountBadge>}>
          <div className="mb-4">
            <PillGroup
              value={filter}
              onChange={setFilter}
              options={['ocupada', 'all', 'libre', 'reservada'].map((f) => {
                const count = f === 'all' ? tables.length : tables.filter((t) => t.status === f).length;
                const label = f === 'all' ? 'Todas' : STATUS_OPTIONS.find((s) => s.value === f)?.label;
                return { value: f, label: count > 0 ? `${label} (${count})` : label };
              })}
            />
          </div>

          {shown.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No hay mesas para este filtro</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {shown.map((t) => <TableCard key={t._id} table={t} onUpdate={onUpdate} addToast={addToast} />)}
            </div>
          )}
        </FormSection>
      </FormModal>

      <ConfirmModal
        isOpen={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        onConfirm={handleBulkConfirm}
        title="Cambiar todas las mesas"
        message={`¿Poner las ${tables.length} mesas en estado "${STATUS_OPTIONS.find((s) => s.value === bulkStatus)?.label}"? Si alguna tiene un pedido activo, ese pedido se cancelará.`}
        confirmText="Aplicar a todas"
        variant="warning"
        icon="chair"
        loading={bulkLoading}
      />
    </>
  );
};

export default TablesUseModal;
