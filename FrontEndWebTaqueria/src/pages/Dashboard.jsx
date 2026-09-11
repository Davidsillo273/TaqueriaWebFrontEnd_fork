// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import Card from '../components/commons/Card';
import StatCard from '../components/dashboard/StatCard';
import ActivityRow from '../components/dashboard/ActivityRow';
import StaffCard from '../components/dashboard/StaffCard';
import AlertCard from '../components/dashboard/AlertCard';
import StockRiskPanel from '../components/dashboard/StockRiskPanel';
import OrderDetailModal from '../components/dashboard/OrderDetailModal';
import EmployeeDetailModal from '../components/dashboard/EmployeeDetailModal';
import TablesUseModal from '../components/dashboard/TablesUseModal';
import StockAlertModal from '../components/dashboard/StockAlertModal';
import NewClientsModal from '../components/dashboard/NewClientsModal';
import InventoryModal from '../components/inventory/InventoryModal';
import FAIcon from '../components/commons/FAIcon';
import Select from '../components/commons/Select';
import { usePagination } from '../hooks/usePagination';
import useDashboard from '../hooks/useDashboard';
import { useEmployees } from '../hooks/useEmployees';
import useTables from '../hooks/useTables';
import { useInventory } from '../hooks/useInventory';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';
import { useAuth } from '../hooks/auth/useAuth';
import { EMPLOYEE_TYPE_LABELS } from '../constants/employeeTypes';

const ORDER_TYPE_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'online', label: 'Pedido en línea' },
  { id: 'local', label: 'Pedido en local' },
];

const CHART_COLORS = ['#ef4444', '#3b82f6'];

function DashboardContent() {
  const { user } = useAuth();
  const { isLoading, errors, stats, todayVsYesterday, activityData, staffData, analytics, clientesHoyList, employees, insumos } = useDashboard();
  const { addToast } = useToast();
  // Mismos permisos que useDashboard: sin ellos, ni pedimos employees/inventory
  // (admin-only en el backend). "employees"/"insumos" ya vienen de useDashboard,
  // así que aquí solo se piden las funciones de mutación, sin volver a hacer fetch.
  const { updateEmployee, sendPasswordResetInvitation } = useEmployees(false);
  const { tables, updateTable, bulkUpdateStatus } = useTables();
  const { saveInsumo } = useInventory(false);

  const [activeTab, setActiveTab] = useState('actividad');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [staffTypeFilter, setStaffTypeFilter] = useState('all');
  // Independiente del puesto: "en turno ahora" según el horario configurado.
  const [staffAvailabilityFilter, setStaffAvailabilityFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tablesModalOpen, setTablesModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [clientsModalOpen, setClientsModalOpen] = useState(false);
  const [completingInsumo, setCompletingInsumo] = useState(null);

  useEffect(() => {
    if (errors.length > 0) {
      addToast('Algunos datos no se pudieron cargar. Verifica la conexión.', 'warning');
    }
  }, [errors, addToast]);

  // El umbral es propio de cada insumo (obligatorio en insumos completos); los
  // pendientes o incompletos no cuentan aquí porque todavía no tienen uno.
  const insumosBajoStock = insumos.filter((i) => {
    if (i.pending || i.lowStockAlert === undefined || i.lowStockAlert === null) return false;
    return Number(i.quantity ?? i.stock) <= Number(i.lowStockAlert);
  });
  const insumosPendientes = insumos.filter((i) => i.pending && (i.itemType || 'producto') === 'producto');

  // Un insumo "incompleto" (pendiente, o creado antes sin ubicación/precio)
  // no se puede actualizar con un simple +cantidad: el backend exige el
  // formulario completo. En ese caso abrimos el editor completo en vez de
  // intentar un guardado que va a fallar.
  const isInsumoIncomplete = (insumo) => insumo.pending || !insumo.ubication || insumo.price === undefined || insumo.price === null;

  const handleAddStock = async (insumo, newQuantity) => {
    if (isInsumoIncomplete(insumo)) {
      setCompletingInsumo(insumo);
      return { success: false, message: 'Este insumo todavía no tiene toda su información. Complétala para poder actualizar su stock.' };
    }
    const formData = new FormData();
    formData.append('name', insumo.name);
    formData.append('itemType', insumo.itemType || 'producto');
    formData.append('price', insumo.price ?? 0);
    formData.append('ubication', insumo.ubication || '');
    formData.append('type', insumo.type || '');
    formData.append('quantity', newQuantity);
    formData.append('status', insumo.status || 'disponible');
    if (insumo.unit) formData.append('unit', insumo.unit);
    formData.append('lowStockAlert', insumo.lowStockAlert ?? 0);
    return saveInsumo(formData, insumo._id);
  };

  const filteredActivity = useMemo(() => {
    if (orderTypeFilter === 'all') return activityData;
    return activityData.filter((item) => item.orderType === orderTypeFilter);
  }, [activityData, orderTypeFilter]);

  const filteredStaff = useMemo(() => {
    return staffData
      .filter((s) => staffTypeFilter === 'all' || s.type === staffTypeFilter)
      .filter((s) => {
        if (staffAvailabilityFilter === 'available') return s.workingNow;
        if (staffAvailabilityFilter === 'unavailable') return !s.workingNow;
        return true;
      });
  }, [staffData, staffTypeFilter, staffAvailabilityFilter]);

  const { page, totalPages, paginatedItems, next, prev } = usePagination(filteredStaff, 4);

  const staffTypeOptions = useMemo(() => {
    const present = new Set(staffData.map((s) => s.type));
    return ['all', ...Array.from(present)];
  }, [staffData]);

  const salesTrendData = (analytics?.last14Days || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit' }),
  }));

  const orderTypePieData = analytics
    ? [
        { name: 'En local', value: analytics.byOrderType?.local?.total || 0 },
        { name: 'En línea', value: analytics.byOrderType?.online?.total || 0 },
      ]
    : [];

  return (
    <div className="p-6 sm:p-8">
      {/* Encabezado */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">Actividad y Análisis</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {activeTab === 'actividad' ? 'Seguimiento de pedidos en tiempo real' : 'Reportes y tendencias de todo el sistema'}
          </p>
        </div>

        {/* Selector de apartado: para que el dashboard no sea una sola página larguísima */}
        <div className="flex gap-2 bg-white/70 rounded-2xl p-1.5 border border-white/80 shadow-sm w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('actividad')}
            className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all ${
              activeTab === 'actividad' ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]' : 'text-gray-600 hover:bg-white'
            }`}
          >
            <FAIcon icon="bolt" size="xs" className="mr-1.5" />
            Actividad
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analisis')}
            className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all ${
              activeTab === 'analisis' ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]' : 'text-gray-600 hover:bg-white'
            }`}
          >
            <FAIcon icon="chart-pie" size="xs" className="mr-1.5" />
            Análisis
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 sm:mb-6 bg-yellow-100/80 backdrop-blur-sm border border-yellow-200 text-yellow-800 text-xs sm:text-sm rounded-2xl p-3">
          Algunos datos no se pudieron cargar correctamente. Verifica la conexión con el servidor.
        </div>
      )}

      {activeTab === 'actividad' ? (
        <>
          {/* Tarjetas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <FAIcon icon="receipt" size="2xl" className="text-red-500" />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-2">Órdenes Hoy (facturadas)</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3">
                {isLoading ? '—' : stats.ordersTodayCount}
              </h3>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayVsYesterday}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="pedidos" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <StatCard
              icon="dollar-sign"
              title="Ventas Netas"
              value={isLoading ? '—' : `$${stats.ventasNetas.toFixed(2)}`}
              change={isLoading ? 'Cargando...' : 'Correspondiente a facturas de hoy'}
            />
            <StatCard
              icon="clock"
              title="Pedidos Pendientes"
              value={isLoading ? '—' : stats.pendingOrdersCount}
              change={isLoading ? 'Cargando...' : 'Sin facturar todavía'}
              alert={!isLoading && stats.pendingOrdersCount > 0}
            />
          </div>

          {/* Actividad Reciente + Estado del Equipo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 sm:mb-8">
            <Card className="lg:col-span-2 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900">Actividad Reciente</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Últimos pedidos registrados</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {ORDER_TYPE_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setOrderTypeFilter(f.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        orderTypeFilter === f.id ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead className="bg-white/40 border-b border-gray-100">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-display font-semibold text-gray-700 uppercase">ID Pedido</th>
                      {orderTypeFilter === 'all' && (
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-display font-semibold text-gray-700 uppercase">Tipo</th>
                      )}
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-display font-semibold text-gray-700 uppercase">Mesa / Cliente</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-display font-semibold text-gray-700 uppercase">cliente/ Familia</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-display font-semibold text-gray-700 uppercase">Monto</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-display font-semibold text-gray-700 uppercase">Estado</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-display font-semibold text-gray-700 uppercase">Hora</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-display font-semibold text-gray-700 uppercase">Ver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="px-4 sm:px-6 py-6 text-center text-sm text-gray-500">Cargando pedidos...</td></tr>
                    ) : filteredActivity.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 sm:px-6 py-6 text-center text-sm text-gray-500">No hay pedidos para este filtro</td></tr>
                    ) : (
                      filteredActivity.map((item, idx) => (
                        <ActivityRow
                          key={idx}
                          {...item}
                          showType={orderTypeFilter === 'all'}
                          onView={() => setSelectedOrder(item.raw)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900">Estado del Equipo</h2>
                <div className="flex items-center gap-2">
                  {/* Disponibilidad: independiente del puesto, según si su
                      horario configurado lo tiene trabajando ahora mismo. */}
                  <Select
                    size="sm"
                    value={staffAvailabilityFilter}
                    onChange={(e) => setStaffAvailabilityFilter(e.target.value)}
                    className="w-auto min-w-[110px]"
                  >
                    <option value="all">Cualquiera</option>
                    <option value="available">Disponibles</option>
                    <option value="unavailable">Fuera de turno</option>
                  </Select>
                  <Select
                    size="sm"
                    value={staffTypeFilter}
                    onChange={(e) => setStaffTypeFilter(e.target.value)}
                    className="w-auto min-w-[110px]"
                  >
                    {staffTypeOptions.map((t) => (
                      <option key={t} value={t}>{t === 'all' ? 'Todos' : (EMPLOYEE_TYPE_LABELS[t] || t)}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {isLoading ? 'Cargando personal...' : `${stats.staffWorkingNowCount} de ${stats.totalEmployees} en turno ahora`}
              </p>
              <div className="space-y-3 min-h-[220px]">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Cargando personal...</p>
                ) : paginatedItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay personal para este filtro</p>
                ) : (
                  paginatedItems.map((staff) => (
                    <div
                      key={staff.id}
                      onClick={() => setSelectedEmployee(employees.find((e) => e._id === staff.id) || null)}
                      className="cursor-pointer"
                    >
                      <StaffCard {...staff} />
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-100">
                  <button type="button" onClick={prev} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40">
                    <FAIcon icon="chevron-left" size="xs" />
                  </button>
                  <span className="text-xs text-gray-500">{page}/{totalPages}</span>
                  <button type="button" onClick={next} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40">
                    <FAIcon icon="chevron-right" size="xs" />
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Indicadores operativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <button type="button" onClick={() => setTablesModalOpen(true)} className="text-left cursor-pointer">
              <AlertCard
                type="dark"
                icon="chair"
                title="Mesas en Uso"
                value={isLoading ? '—' : `${stats.mesasOcupadas}/${stats.totalMesas}`}
                subtitle={isLoading ? 'Cargando...' : `${stats.mesasOcupadas} de ${stats.totalMesas} mesas ocupadas`}
                percent={isLoading || stats.totalMesas === 0 ? 0 : (stats.mesasOcupadas / stats.totalMesas) * 100}
              />
            </button>
            <button type="button" onClick={() => setStockModalOpen(true)} className="text-left cursor-pointer">
              <AlertCard
                type="warning"
                icon="triangle-exclamation"
                title="Alerta de Stock"
                value={isLoading ? '—' : stats.insumosBajoStockCount}
                subtitle={isLoading ? 'Cargando...' : stats.primerAlertaStock}
                percent={isLoading ? 0 : Math.min(100, stats.insumosBajoStockCount * 20)}
              />
            </button>
            <button type="button" onClick={() => setClientsModalOpen(true)} className="text-left cursor-pointer">
              <AlertCard
                type="success"
                icon="user-plus"
                title="Clientes Nuevos"
                value={isLoading ? '—' : stats.clientesNuevos}
                subtitle={isLoading ? 'Cargando...' : `Registrados hoy`}
                percent={isLoading || stats.totalClientes === 0 ? 0 : (stats.clientesNuevos / stats.totalClientes) * 100}
              />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* KPIs de negocio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            <Card accent className="p-4 sm:p-6">
              <FAIcon icon="sack-dollar" size="2xl" className="text-red-500 mb-3" />
              <p className="text-gray-600 text-sm mb-2">Ventas del Mes</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                {isLoading ? '—' : `$${stats.monthTotal.toFixed(2)}`}
              </h3>
            </Card>
            <Card accent className="p-4 sm:p-6">
              <FAIcon icon="receipt" size="2xl" className="text-orange-500 mb-3" />
              <p className="text-gray-600 text-sm mb-2">Ticket Promedio</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                {isLoading ? '—' : `$${stats.avgTicket.toFixed(2)}`}
              </h3>
            </Card>
            <Card accent className="p-4 sm:p-6">
              <FAIcon icon="globe" size="2xl" className="text-purple-500 mb-3" />
              <p className="text-gray-600 text-sm mb-2">Ventas en línea</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                {isLoading ? '—' : `$${(analytics?.byOrderType?.online?.total || 0).toFixed(2)}`}
              </h3>
              <p className="text-xs text-gray-500 mt-2">Últimos 14 días</p>
            </Card>
            <Card accent className="p-4 sm:p-6">
              <FAIcon icon="store" size="2xl" className="text-sky-500 mb-3" />
              <p className="text-gray-600 text-sm mb-2">Ventas en local</p>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                {isLoading ? '—' : `$${(analytics?.byOrderType?.local?.total || 0).toFixed(2)}`}
              </h3>
              <p className="text-xs text-gray-500 mt-2">Últimos 14 días</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 sm:mb-8">
            <Card className="lg:col-span-2 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-display font-bold text-gray-900 mb-1">Ventas de los últimos 14 días</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">Basado en pedidos ya facturados</p>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                    <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-display font-bold text-gray-900 mb-1">Ventas por tipo</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">Últimos 14 días</p>
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={orderTypePieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={4}>
                      {orderTypePieData.map((entry, idx) => (
                        <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-display font-bold text-gray-900 mb-1">Productos más vendidos</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">Últimos 14 días, por cantidad</p>
              <div className="space-y-3">
                {(analytics?.topItems || []).length === 0 ? (
                  <p className="text-sm text-gray-500">Todavía no hay suficientes ventas para mostrar un top</p>
                ) : (
                  analytics.topItems.map((item, idx) => {
                    const max = analytics.topItems[0]?.quantity || 1;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                          <span className="font-display font-semibold text-gray-800">{idx + 1}. {item.name}</span>
                          <span className="text-gray-500">{item.quantity} vendidos · ${item.total.toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(item.quantity / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            <StockRiskPanel />
          </div>
        </>
      )}

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />

      <EmployeeDetailModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        onSave={updateEmployee}
        onSendPasswordReset={sendPasswordResetInvitation}
        addToast={addToast}
      />

      <TablesUseModal
        isOpen={tablesModalOpen}
        onClose={() => setTablesModalOpen(false)}
        tables={tables}
        onUpdate={updateTable}
        onBulkUpdate={bulkUpdateStatus}
        addToast={addToast}
      />

      <StockAlertModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        insumos={insumosBajoStock}
        pendingInsumos={insumosPendientes}
        isIncomplete={isInsumoIncomplete}
        onAddStock={handleAddStock}
        onCompleteInsumo={(insumo) => setCompletingInsumo(insumo)}
        addToast={addToast}
      />

      <NewClientsModal
        isOpen={clientsModalOpen}
        onClose={() => setClientsModalOpen(false)}
        clients={clientesHoyList}
      />

      <InventoryModal
        isOpen={!!completingInsumo}
        onClose={() => setCompletingInsumo(null)}
        insumoData={completingInsumo}
        itemType="producto"
        onSave={saveInsumo}
      />
    </div>
  );
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
        <Sidebar activeMenu="activity" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <DashboardContent />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
