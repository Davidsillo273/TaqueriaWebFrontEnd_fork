import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import StatCard from '../components/dashboard/StatCard'
import ActivityRow from '../components/dashboard/ActivityRow'
import StaffCard from '../components/dashboard/StaffCard'
import AlertCard from '../components/dashboard/AlertCard'
import FAIcon from '../components/commons/FAIcon'
import useDashboard from '../hooks/useDashboard'

// Dashboard principal con todas las secciones, conectado a datos reales del backend
export default function Dashboard() {
	const [activeMenu] = useState('activity')
	const { isLoading, errors, stats, activityData, staffData } = useDashboard()

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar activeMenu={activeMenu} />

			<div className="flex-1 flex flex-col">
				<TopBar />

				<main className="flex-1 overflow-y-auto">
					<div className="p-8">
						{/* Encabezado */}
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Actividad</h1>
							<p className="text-gray-600">Seguimiento de pedidos en tiempo real</p>
						</div>

						{/* Aviso de errores parciales de carga (no bloquea la vista) */}
						{errors.length > 0 && (
							<div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-3">
								Algunos datos no se pudieron cargar correctamente. Verifica la conexión con el servidor.
							</div>
						)}

						{/* Grid de estadísticas principales */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<StatCard
								icon="list"
								title="Órdenes Hoy"
								value={isLoading ? '—' : stats.ordersTodayCount}
								change={isLoading ? 'Cargando...' : `Ticket promedio: $${stats.ticketPromedio.toFixed(2)}`}
							/>
							<StatCard
								icon="dollar-sign"
								title="Ventas Netas"
								value={isLoading ? '—' : `$${stats.ventasNetas.toFixed(2)}`}
								change={isLoading ? 'Cargando...' : 'Correspondiente a pedidos de hoy'}
							/>
							<StatCard
								icon="users"
								title="Staff en Turno"
								value={isLoading ? '—' : stats.staffEnTurnoCount}
								change={isLoading ? 'Cargando...' : `${stats.totalEmployees} empleados registrados`}
							/>
						</div>

						{/* Sección de Actividad Reciente y Estado del Equipo */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
							{/* Actividad Reciente */}
							<div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
								<div className="flex items-center justify-between p-6 border-b border-gray-200">
									<div>
										<h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
										<p className="text-sm text-gray-600">Seguimiento de pedidos en tiempo real</p>
									</div>
								</div>
								<table className="w-full">
									<thead className="bg-gray-50 border-b border-gray-200">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID Pedido</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mesa / Cliente</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre cliente</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Monto</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hora</th>
										</tr>
									</thead>
									<tbody>
										{isLoading ? (
											<tr>
												<td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
													Cargando pedidos...
												</td>
											</tr>
										) : activityData.length === 0 ? (
											<tr>
												<td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
													No hay pedidos registrados todavía
												</td>
											</tr>
										) : (
											activityData.map((item, idx) => (
												<ActivityRow key={idx} {...item} />
											))
										)}
									</tbody>
								</table>
							</div>

							{/* Estado del Equipo */}
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<h2 className="text-xl font-bold text-gray-900 mb-4">Estado del Equipo</h2>
								<p className="text-sm text-gray-600 mb-4">Personal activo en turno actual</p>
								<div className="space-y-3">
									{isLoading ? (
										<p className="text-sm text-gray-500">Cargando personal...</p>
									) : staffData.length === 0 ? (
										<p className="text-sm text-gray-500">No hay personal activo en turno</p>
									) : (
										staffData.map((staff, idx) => (
											<StaffCard key={idx} {...staff} />
										))
									)}
								</div>
							</div>
						</div>

						{/* Tarjetas de Alerta y Recomendaciones */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
							<AlertCard
								type="dark"
								icon="chart-line"
								title="Mesas en Uso"
								subtitle={isLoading ? 'Cargando...' : `${stats.mesasOcupadas} de ${stats.totalMesas} mesas ocupadas`}
							/>
							<AlertCard
								type="warning"
								icon="exclamation-triangle"
								title="ALERTA STOCK"
								subtitle={isLoading ? 'Cargando...' : stats.primerAlertaStock}
							/>
							<AlertCard
								type="success"
								icon="smile"
								title="CLIENTES NUEVOS"
								subtitle={isLoading ? 'Cargando...' : `${stats.clientesNuevos} nuevos en los últimos 7 días`}
							/>
						</div>

						{/* Sección Actividad General */}
						<div className="mb-12">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">Actividad General</h2>
									<p className="text-gray-600 text-sm">Análisis de resultados en tiempo real</p>
								</div>
							</div>

							{/* Estadísticas Generales */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
								<div className="bg-white rounded-lg p-6 border border-gray-200">
									<div className="flex items-start justify-between mb-3">
										<FAIcon icon="credit-card" size="2xl" className="text-red-600" />
									</div>
									<p className="text-gray-600 text-sm mb-2">Ventas del Día</p>
									<h3 className="text-3xl font-bold text-gray-900">
										{isLoading ? '—' : `$${stats.ventasNetas.toFixed(2)}`}
									</h3>
									<div className="mt-3 border-t border-red-600 pt-2">
										<p className="text-xs text-gray-500">
											{isLoading ? 'Cargando...' : `${stats.ordersTodayCount} pedidos registrados hoy`}
										</p>
									</div>
								</div>

								<div className="bg-white rounded-lg p-6 border border-gray-200">
									<div className="flex items-start justify-between mb-3">
										<FAIcon icon="exclamation-triangle" size="2xl" className="text-orange-600" />
										{!isLoading && (
											<span className="text-xs font-semibold text-red-600">
												{stats.insumosBajoStockCount} Críticos
											</span>
										)}
									</div>
									<p className="text-gray-600 text-sm mb-2">Alerta de Stock</p>
									<h3 className="text-3xl font-bold text-gray-900">
										{isLoading ? '—' : `${stats.insumosBajoStockCount} Artículos`}
									</h3>
									<p className="text-xs text-gray-500 mt-3">
										{isLoading ? 'Cargando...' : stats.primerAlertaStock}
									</p>
								</div>

								<div className="bg-white rounded-lg p-6 border border-gray-200">
									<div className="flex items-start justify-between mb-3">
										<FAIcon icon="chair" size="2xl" className="text-blue-600" />
										{!isLoading && stats.totalMesas > 0 && (
											<span className="text-xs font-semibold text-green-600">
												{Math.round((stats.mesasOcupadas / stats.totalMesas) * 100)}% Capacidad
											</span>
										)}
									</div>
									<p className="text-gray-600 text-sm mb-2">Mesas en uso</p>
									<h3 className="text-3xl font-bold text-gray-900">
										{isLoading ? '—' : `${stats.mesasOcupadas} / ${stats.totalMesas}`}
									</h3>
								</div>

								<div className="bg-white rounded-lg p-6 border border-gray-200">
									<div className="flex items-start justify-between mb-3">
										<FAIcon icon="users" size="2xl" className="text-purple-600" />
										{!isLoading && (
											<span className="text-xs font-semibold text-green-600">+{stats.clientesNuevos}</span>
										)}
									</div>
									<p className="text-gray-600 text-sm mb-2">Clientes Nuevos</p>
									<h3 className="text-3xl font-bold text-gray-900">
										{isLoading ? '—' : stats.totalClientes}
									</h3>
									<p className="text-xs text-gray-500 mt-3">Últimos 7 días: {isLoading ? '—' : stats.clientesNuevos}</p>
								</div>
							</div>

							{/* Resumen de Ventas (gráfico pendiente de endpoint de reportes) */}
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-lg font-bold text-gray-900">Resumen de Ventas</h3>
										<p className="text-sm text-gray-600">Pendiente de endpoint de reportes históricos</p>
									</div>
								</div>

								<div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
									<div className="text-center">
										<FAIcon icon="chart-bar" size="3xl" className="text-gray-400 mx-auto mb-2" />
										<p className="text-gray-500 text-sm">
											El gráfico de ventas mensuales se conectará cuando exista un endpoint de reportes
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}