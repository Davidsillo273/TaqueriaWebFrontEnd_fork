// src/components/employee/EmployeeLeaderboardModal.jsx
import { useEffect } from 'react';
import FormModal, { FormSection } from '../commons/FormModal';
import PeriodSelector from '../commons/PeriodSelector';

const employeeName = (emp) => `${emp?.personalInfo?.name || ''} ${emp?.personalInfo?.lastname || ''}`.trim() || 'Empleado';

const EmployeeLeaderboardModal = ({
  isOpen, onClose, topEmployees, period, loading, onOpen, onPeriodChange,
  customRange, onCustomRangeChange,
}) => {
  useEffect(() => {
    if (isOpen) onOpen?.(period, customRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePeriodChange = (nextPeriod) => onPeriodChange(nextPeriod, customRange);
  const handleCustomRangeChange = (nextRange) => {
    onCustomRangeChange(nextRange);
    // Si ambas fechas ya están puestas, se vuelve a consultar de inmediato
    // con el rango recién editado (no con el que quedó en el estado, que
    // todavía no se actualizó cuando corre este mismo callback).
    if (nextRange.from && nextRange.to) onPeriodChange('custom', nextRange);
  };

  return (
    <FormModal
      icon="trophy"
      title="Empleados destacados"
      subtitle="Empleado con más ventas (pedidos locales entregados)"
      onClose={onClose}
      cancelLabel="Cerrar"
    >
      <FormSection icon="calendar" title="Periodo">
            <PeriodSelector
              value={period}
              onChange={handlePeriodChange}
              customRange={customRange}
              onCustomRangeChange={handleCustomRangeChange}
            />
      </FormSection>

      <FormSection icon="trophy" title="Ranking de ventas">

          {loading ? (
            <p className="text-sm text-muted text-center py-8">Cargando ranking...</p>
          ) : topEmployees.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Todavía no hay ventas registradas en este periodo</p>
          ) : (
            <div className="space-y-2">
              {topEmployees.map((row, idx) => (
                <div key={row.employee?._id || idx} className="flex items-center gap-3 bg-surface rounded-lg border border-line p-3">
                  <span className="w-7 h-7 rounded-lg bg-ac text-white num text-xs flex shadow-2xs items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {row.employee?.personalInfo?.image ? (
                    <img src={row.employee.personalInfo.image} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center text-muted text-xs font-display font-medium shrink-0">
                      {employeeName(row.employee).split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-medium text-ink text-sm truncate">{employeeName(row.employee)}</p>
                    <p className="text-xs text-muted truncate"><span className="num">{row.orderCount}</span> pedidos entregados</p>
                  </div>
                  <p className="num text-ac text-sm shrink-0">${Number(row.totalSales || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
      </FormSection>
    </FormModal>
  );
};

export default EmployeeLeaderboardModal;
