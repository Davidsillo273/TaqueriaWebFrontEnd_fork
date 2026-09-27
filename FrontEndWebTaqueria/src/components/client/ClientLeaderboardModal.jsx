// src/components/client/ClientLeaderboardModal.jsx
import React, { useState, useEffect } from 'react';
import FAIcon from '../commons/FAIcon';
import { ModalHeader, FormSection, MODAL_BTN_PRIMARY } from '../commons/FormModal';
import PeriodSelector from '../commons/PeriodSelector';

const TABS = [
  { id: 'mostActive', label: 'Más activos', icon: 'bolt', defaultHint: '7 días' },
  { id: 'topSpenders', label: 'Mayor gasto total', icon: 'sack-dollar', defaultHint: null },
  { id: 'priciestWeek', label: 'Compras más caras', icon: 'receipt', defaultHint: 'semana' },
];

const PERIOD_HINTS = {
  day: 'hoy',
  week: 'semana',
  month: 'mes',
  year: 'año',
  all: 'todo',
  custom: 'rango elegido',
};

const clientName = (customer) =>
  `${customer?.personalInfo?.name || ''} ${customer?.personalInfo?.lastname || ''}`.trim() || 'Cliente';

const Row = ({ rank, name, email, primary, secondary }) => (
  <div className="flex items-center gap-3.5 bg-surface rounded-lg border border-line p-3 hover:border-ac/40 transition-colors shadow-xs">
    <span className="w-7 h-7 rounded-lg bg-ac text-white num text-xs flex items-center justify-center shrink-0 shadow-2xs">
      {rank}
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-display font-medium text-ink text-sm truncate">{name}</p>
      <p className="text-xs text-muted truncate num">{email || 'Sin correo'}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="num text-ac text-base">{primary}</p>
      {secondary && <p className="text-xs text-muted num">{secondary}</p>}
    </div>
  </div>
);

const ClientLeaderboardModal = ({
  isOpen,
  onClose,
  mostActive,
  topSpenders,
  priciestWeek,
  loading,
  onOpen,
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
}) => {
  const [tab, setTab] = useState('mostActive');

  useEffect(() => {
    if (isOpen) onOpen?.(period, customRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePeriodChange = (nextPeriod) => onPeriodChange(nextPeriod, customRange);
  const handleCustomRangeChange = (nextRange) => {
    onCustomRangeChange(nextRange);
    if (nextRange.from && nextRange.to) onPeriodChange('custom', nextRange);
  };

  const rows = tab === 'mostActive' ? mostActive : tab === 'topSpenders' ? topSpenders : priciestWeek;
  const isOrderList = tab === 'priciestWeek';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Contenedor del Modal con borde superior de acento rojo institucional */}
      <div className="bg-surface rounded-2xl border border-line w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <ModalHeader
          icon="trophy"
          title="Clientes destacados"
          badge="Fidelización"
          subtitle="Rankings basados en pedidos en línea entregados"
          onClose={onClose}
        />

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4 bg-surfalt/30">
          {/* Selector de período */}
          <FormSection icon="calendar" title="Periodo">
            <PeriodSelector
              value={period}
              onChange={handlePeriodChange}
              customRange={customRange}
              onCustomRangeChange={handleCustomRangeChange}
            />
          </FormSection>

          <FormSection icon="trophy" title="Ranking de clientes">
          {/* Pestañas de métrica: mismas píldoras que los días de la ficha */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold rounded-full border transition-all cursor-pointer ${
                  tab === t.id
                    ? 'bg-ac text-white border-ac shadow-2xs'
                    : 'bg-white dark:bg-surface text-inkalt border-line hover:border-ac hover:text-ac'
                }`}
              >
                <FAIcon icon={t.icon} size="xs" />
                <span>{t.label}</span>
                {period
                  ? ` (${PERIOD_HINTS[period] || period})`
                  : t.defaultHint
                  ? ` (${t.defaultHint})`
                  : ''}
              </button>
            ))}
          </div>

          {/* Lista de posiciones con borde rojo sutil y hover */}
          {loading ? (
            <div className="p-6 text-center text-xs text-muted">
              Cargando ranking de clientes...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
              Todavía no hay suficientes pedidos registrados para este ranking.
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row, idx) => {
                if (isOrderList) {
                  return (
                    <Row
                      key={row._id}
                      rank={idx + 1}
                      name={clientName(row.customer)}
                      email={row.customer?.loginInfo?.email}
                      primary={`$${Number(row.total || 0).toFixed(2)}`}
                      secondary={
                        row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-SV') : ''
                      }
                    />
                  );
                }
                return (
                  <Row
                    key={row.customer?._id || idx}
                    rank={idx + 1}
                    name={clientName(row.customer)}
                    email={row.customer?.loginInfo?.email}
                    primary={
                      tab === 'mostActive'
                        ? `${row.orderCount} pedidos`
                        : `$${Number(row.totalSpent || 0).toFixed(2)}`
                    }
                    secondary={
                      tab === 'mostActive'
                        ? `$${Number(row.totalSpent || 0).toFixed(2)} gastado`
                        : `${row.orderCount} pedidos`
                    }
                  />
                );
              })}
            </div>
          )}
          </FormSection>
        </div>

        {/* Footer del Modal */}
        <div className="px-5 py-3.5 border-t border-line bg-surface flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={MODAL_BTN_PRIMARY}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLeaderboardModal;
