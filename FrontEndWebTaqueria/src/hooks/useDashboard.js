import { useMemo } from 'react';
import useOrders from './useOrders';
import { useEmployees } from './useEmployees';
import useTables from './useTables';
import { useInventory } from './useInventory';
import useClients from './useClients';
import { useSettings } from './useSettings';

// Etiquetas en español para el estado del pedido (ajustar si el enum del back cambia)
const ORDER_STATUS_LABELS = {
  pending: 'PENDIENTE',
  cooking: 'PREPARANDO',
  ready: 'LISTO',
  delivered: 'COMPLETADO',
};

// Hook exclusivo para el Dashboard: combina orders, employees, tables,
// inventory y clients en los datos que necesita la vista de Actividad.
export default function useDashboard() {
  const { orders, loading: loadingOrders } = useOrders();
  const { employees, loading: loadingEmployees, error: employeesError } = useEmployees();
  const { tables, loading: loadingTables, error: tablesError } = useTables();
  const { insumos, loading: loadingInventory, error: inventoryError } = useInventory();
  const { clients, isLoading: loadingClients, error: clientsError } = useClients();
  // El umbral de stock bajo ya no está fijo en el código: lo define el
  // administrador desde Ajustes y se comparte con las alertas del backend.
  const { settings } = useSettings();
  const lowStockThreshold = settings.operation.lowStockThresholds?.inventory ?? 10;

  const isLoading =
    loadingOrders || loadingEmployees || loadingTables || loadingInventory || loadingClients;

  const errors = [employeesError, tablesError, inventoryError, clientsError].filter(Boolean);

  const today = new Date().toDateString();

  // --- Pedidos de hoy ---
  const ordersToday = useMemo(() => {
    return orders.filter((order) => {
      const fecha = order.createdAt || order.date;
      return fecha ? new Date(fecha).toDateString() === today : false;
    });
  }, [orders, today]);

  const ventasNetas = useMemo(() => {
    return ordersToday.reduce((acc, order) => acc + (Number(order.total ?? order.amount) || 0), 0);
  }, [ordersToday]);

  const ticketPromedio = ordersToday.length > 0 ? ventasNetas / ordersToday.length : 0;

  // --- Actividad reciente: últimos 5 pedidos, sin importar el día ---
  const activityData = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
      .slice(0, 5)
      .map((order) => {
        const cliente = order.idCustomer?.personalInfo
          ? `${order.idCustomer.personalInfo.name || ''} ${order.idCustomer.personalInfo.lastname || ''}`.trim()
          : order.customerName || 'Cliente';

        return {
          id: `#${(order._id || '').toString().slice(-4).toUpperCase() || '----'}`,
          mesa: order.table?.number ? `Mesa ${order.table.number}` : cliente,
          cliente,
          monto: `$${(Number(order.total ?? order.amount) || 0).toFixed(2)}`,
          estado: ORDER_STATUS_LABELS[order.status] || (order.status || 'pendiente').toUpperCase(),
          hora: order.createdAt
            ? new Date(order.createdAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })
            : '--:--',
        };
      });
  }, [orders]);

  // --- Staff en turno ---
  const staffData = useMemo(() => {
    return employees
      .filter((emp) => emp.workInfo?.status === true || emp.workInfo?.isAuthorized === true)
      .slice(0, 4)
      .map((emp) => ({
        name: `${emp.personalInfo?.name || ''} ${emp.personalInfo?.lastname || ''}`.trim() || 'Sin nombre',
        role: emp.personalInfo?.type || 'Empleado',
        shift: emp.workInfo?.shift || 'Turno',
        time: emp.workInfo?.schedule || '—',
      }));
  }, [employees]);

  // --- Mesas ---
  const mesasOcupadas = useMemo(
    () => tables.filter((t) => (t.status || '').toLowerCase() !== 'disponible').length,
    [tables]
  );
  const totalMesas = tables.length;

  // --- Inventario ---
  const insumosBajoStock = useMemo(
    () => insumos.filter((i) => Number(i.quantity ?? i.stock) <= lowStockThreshold),
    [insumos, lowStockThreshold]
  );

  const primerAlertaStock = insumosBajoStock[0]
    ? `${insumosBajoStock[0].name || 'Insumo'} (${insumosBajoStock[0].quantity ?? insumosBajoStock[0].stock} unidades)`
    : 'Sin alertas de stock';

  // --- Clientes ---
  const clientesNuevos = useMemo(() => {
    return clients.filter((c) => {
      const fecha = c.createdAt;
      if (!fecha) return false;
      const dias = (Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24);
      return dias <= 7;
    }).length;
  }, [clients]);

  return {
    isLoading,
    errors,
    stats: {
      ordersTodayCount: ordersToday.length,
      ventasNetas,
      ticketPromedio,
      staffEnTurnoCount: staffData.length,
      totalEmployees: employees.length,
      mesasOcupadas,
      totalMesas,
      insumosBajoStockCount: insumosBajoStock.length,
      primerAlertaStock,
      clientesNuevos,
      totalClientes: clients.length,
    },
    activityData,
    staffData,
  };
}