// src/pages/Payroll.jsx
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FAIcon from '../components/commons/FAIcon';
import ComboStats from '../components/dashboard/ComboStats';
import PaginationControls from '../components/commons/PaginationControls';
import usePayroll, { formatPeriodLabel, getCurrentPeriod } from '../hooks/usePayroll';
import { usePagination } from '../hooks/usePagination';
import { exportPayrollToPdf } from '../utils/payrollPdf';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

// Los últimos 12 meses como opciones del selector de período. Se generan
// desde la fecha actual en vez de tener una lista fija, para que la pantalla
// no quede desactualizada con el paso del tiempo.
const buildPeriodOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value, label: formatPeriodLabel(value) });
  }
  return options;
};

const BADGE_BY_TYPE = {
  Gerente: 'bg-gray-100 text-gray-700 border border-gray-200',
  Cocina: 'bg-blue-50 text-blue-700 border border-blue-200',
  Cajero: 'bg-blue-50 text-blue-700 border border-blue-200',
};

function PayrollContent() {
  const [activeMenu] = useState('payroll');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { rows, totals, loading, error, period, setPeriod, status, setStatus } = usePayroll(getCurrentPeriod());
  const { addToast } = useToast();

  const periodOptions = useMemo(() => buildPeriodOptions(), []);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) => row.name.toLowerCase().includes(term));
  }, [rows, searchTerm]);

  const { page, totalPages, paginatedItems, goTo, next, prev } = usePagination(filteredRows, 8);

  const handleExport = () => {
    if (!rows.length) {
      addToast('No hay empleados en la planilla de este período', 'error');
      return;
    }

    try {
      // El PDF siempre lleva la planilla COMPLETA del período, no lo que
      // quedó filtrado en pantalla: es un documento contable, y omitir
      // empleados por una búsqueda momentánea lo volvería incorrecto.
      exportPayrollToPdf({ rows, totals, period });
      addToast('Planilla exportada correctamente', 'success');
    } catch (err) {
      console.error('Error al exportar la planilla:', err);
      addToast('No se pudo generar el PDF de la planilla', 'error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activeMenu={activeMenu} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1">
                  Planilla
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Salarios y descuentos de ley del personal por período.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={loading || !rows.length}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-2xl text-sm font-display font-semibold shadow-[0_4px_12px_rgba(220,38,38,0.3),inset_1px_1px_2px_rgba(255,255,255,0.3)] hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FAIcon icon="file-pdf" />
                Exportar PDF
              </button>
            </div>

            {/* Resumen del período */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
              <ComboStats
                icon="users"
                title="EMPLEADOS"
                value={loading ? '—' : String(rows.length)}
                label={`En la planilla de ${formatPeriodLabel(period)}`}
              />
              <ComboStats
                icon="money-bill"
                title="SALARIO BRUTO"
                value={loading ? '—' : money(totals?.grossSalary)}
                label="Suma de los salarios base"
              />
              <ComboStats
                icon="scissors"
                title="DESCUENTOS"
                value={loading ? '—' : money(totals?.totalDeductions)}
                label="AFP + ISSS + Renta"
              />
              <ComboStats
                icon="hand-holding-dollar"
                title="TOTAL A PAGAR"
                value={loading ? '—' : money(totals?.netSalary)}
                label="Neto, incluyendo bonos"
                highlighted={true}
              />
            </div>

            {/* Tabla de planilla */}
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 overflow-hidden">
              <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                <h2 className="text-lg font-display font-bold text-gray-800">
                  Detalle de {formatPeriodLabel(period)}
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm text-gray-700 placeholder:text-gray-400 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
                  />

                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium text-gray-700 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] appearance-none"
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-4 py-2 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium text-gray-700 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] appearance-none"
                  >
                    <option value="active">Solo activos</option>
                    <option value="all">Todos</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500 text-sm">Calculando planilla...</div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500 text-sm">{error}</div>
                ) : rows.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No hay empleados en la planilla de este período.
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Ningún empleado coincide con la búsqueda.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[920px]">
                    <thead>
                      <tr className="bg-gray-50/80 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <th className="p-3 sm:p-4 pl-4 sm:pl-6">Empleado</th>
                        <th className="p-3 sm:p-4">Puesto</th>
                        <th className="p-3 sm:p-4 text-right">Salario base</th>
                        <th className="p-3 sm:p-4 text-right">Bonos</th>
                        <th className="p-3 sm:p-4 text-right">AFP</th>
                        <th className="p-3 sm:p-4 text-right">ISSS</th>
                        <th className="p-3 sm:p-4 text-right">Renta</th>
                        <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">Neto a pagar</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {paginatedItems.map((row) => {
                        const isInactive = row.status !== 'active';

                        return (
                          <tr
                            key={row.employeeId}
                            className={`hover:bg-gray-50/80 transition-colors ${isInactive ? 'opacity-60 bg-gray-50/30' : ''}`}
                          >
                            <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                              <div className="flex items-center gap-3">
                                {row.image ? (
                                  <img src={row.image} alt={row.name} className="w-9 h-9 rounded-xl object-cover shadow-sm" />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                    <FAIcon icon="user" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-display font-bold text-gray-900">{row.name}</div>
                                  {isInactive && (
                                    <div className="text-xs text-red-500 font-medium">Inactivo</div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-3 sm:p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-semibold ${BADGE_BY_TYPE[row.typeLabel] || 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                                {row.typeLabel}
                              </span>
                            </td>

                            <td className="p-3 sm:p-4 text-right font-medium">{money(row.grossSalary)}</td>
                            <td className="p-3 sm:p-4 text-right text-gray-500">
                              {row.additionalPay > 0 ? `+${money(row.additionalPay)}` : '—'}
                            </td>
                            <td className="p-3 sm:p-4 text-right text-gray-500">-{money(row.afp)}</td>
                            <td className="p-3 sm:p-4 text-right text-gray-500">-{money(row.isss)}</td>
                            <td className="p-3 sm:p-4 text-right text-gray-500">
                              {row.isr > 0 ? `-${money(row.isr)}` : '—'}
                            </td>
                            <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right font-display font-bold text-gray-900">
                              {money(row.netSalary)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Totales del período: siempre sobre la planilla completa,
                        no sobre lo que quedó visible tras filtrar o paginar. */}
                    {totals && (
                      <tfoot>
                        <tr className="bg-gray-50/80 border-t-2 border-gray-200 text-sm font-display font-bold text-gray-900">
                          <td className="p-3 sm:p-4 pl-4 sm:pl-6" colSpan={2}>
                            TOTALES ({rows.length})
                          </td>
                          <td className="p-3 sm:p-4 text-right">{money(totals.grossSalary)}</td>
                          <td className="p-3 sm:p-4 text-right">{money(totals.additionalPay)}</td>
                          <td className="p-3 sm:p-4 text-right">-{money(totals.afp)}</td>
                          <td className="p-3 sm:p-4 text-right">-{money(totals.isss)}</td>
                          <td className="p-3 sm:p-4 text-right">-{money(totals.isr)}</td>
                          <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right text-red-600">
                            {money(totals.netSalary)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}
              </div>

              {totalPages > 1 && (
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPrev={prev}
                  onNext={next}
                  onGoTo={goTo}
                />
              )}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Los descuentos de AFP, ISSS y renta se calculan automáticamente a partir del salario base,
              según las tasas de ley vigentes. Los bonos se suman al neto sin descuentos.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

// Igual que las demás pantallas con acciones, el contenido va envuelto en el
// proveedor de avisos para poder mostrar el resultado de la exportación.
export default function Payroll() {
  return (
    <ToastProvider>
      <PayrollContent />
    </ToastProvider>
  );
}
