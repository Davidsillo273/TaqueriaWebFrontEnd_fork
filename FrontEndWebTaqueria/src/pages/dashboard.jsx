import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import StatCard from '../components/dashboard/StatCard'
import ActivityRow from '../components/dashboard/ActivityRow'
import StaffCard from '../components/dashboard/StaffCard'
import AlertCard from '../components/dashboard/AlertCard'
import FAIcon from '../components/commons/FAIcon'

// Dashboard principal con todas las secciones
export default function Dashboard() {
	const [activeMenu] = useState('activity')

	// Datos de ejemplo para actividad reciente
	const activityData = [
		{ id: '#9832', mesa: 'Mesa 4', cliente: 'Ta', monto: '$45.50', estado: 'COMPLETADO', hora: '12:45 PM' },
		{ id: '#9833', mesa: 'DL', cliente: 'UberEats - David', monto: '$22.00', estado: 'PREPARANDO', hora: '12:48 PM' },
		{ id: '#9834', mesa: 'Mesa 9', cliente: 'T9', monto: '$89.15', estado: 'PENDIENTE', hora: '12:50 PM' },
		{ id: '#9835', mesa: 'PK', cliente: 'Pickup - Elena', monto: '$34.00', estado: 'COMPLETADO', hora: '12:52 PM' },
		{ id: '#9836', mesa: 'Mesa 2', cliente: 'T2', monto: '$12.50', estado: 'PREPARANDO', hora: '12:55 PM' },
	]

	// Datos de ejemplo para equipo
	const staffData = [
		{ name: 'Marco Polo', role: 'Chef de Línea', shift: 'Shift A', time: '09:00 - 16:00' },
		{ name: 'Sofía Méndez', role: 'Hostess / Mesera', shift: 'Shift B', time: '11:00 - 19:00' },
		{ name: 'Julián Reyes', role: 'Bartender Principal', shift: 'Shift A', time: '09:00 - 16:00' },
		{ name: 'Ana Lucia', role: 'Auxiliar Cocina', shift: 'Break', time: 'Descanso 30min' },
	]

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

					{/* Grid de estadísticas principales */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<StatCard icon="list" title="Órdenes Hoy" value="142" change="+12% vs ayer" />
						<StatCard icon="dollar-sign" title="Ventas Netas" value="$3,240" change="Ticket promedio: $22.8" />
						<StatCard icon="users" title="Staff en Turno" value="18" change="4 puestos por cubrir" />
					</div>						{/* Sección de Actividad Reciente y Estado del Equipo */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
							{/* Actividad Reciente */}
							<div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
								<div className="flex items-center justify-between p-6 border-b border-gray-200">
									<div>
										<h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
										<p className="text-sm text-gray-600">Seguimiento de pedidos en tiempo real</p>
									</div>
									<a href="#" className="text-red-600 hover:underline text-sm font-semibold">
										Ver Historial Completo
									</a>
								</div>
								<table className="w-full">
									<thead className="bg-gray-50 border-b border-gray-200">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID Pedido</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mesa / Cliente</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Monto</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hora</th>
										</tr>
									</thead>
									<tbody>
										{activityData.map((item, idx) => (
											<ActivityRow key={idx} {...item} />
										))}
									</tbody>
								</table>
							</div>

							{/* Estado del Equipo */}
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<h2 className="text-xl font-bold text-gray-900 mb-4">Estado del Equipo</h2>
								<p className="text-sm text-gray-600 mb-4">Personal activo en turno actual</p>
								<div className="space-y-3">
									{staffData.map((staff, idx) => (
										<StaffCard key={idx} {...staff} />
									))}
								</div>
							</div>
						</div>

						{/* Tarjetas de Alerta y Recomendaciones */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
							<AlertCard
								type="dark"
								icon="chart-line"
								title="Rendimiento de Mesa"
								subtitle="La mesa 4 está generando un 15% más de ventas adicionales en postres hoy"
							/>
							<AlertCard
								type="warning"
								icon="exclamation-triangle"
								title="ALERTA STOCK"
								subtitle="Carne Angus Queso 150g (Cortico)"
							/>
							<AlertCard
								type="success"
								icon="smile"
								title="SATISFACCIÓN"
								subtitle="4.8 / 5.0 Basado en 28 reseñas hoy"
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
										<span className="text-xs font-semibold text-green-600">+12.5%</span>
									</div>
									<p className="text-gray-600 text-sm mb-2">Ventas Diarias</p>
									<h3 className="text-3xl font-bold text-gray-900">$4,280.50</h3>
									<div className="mt-3 border-t border-red-600 pt-2">
										<p className="text-xs text-gray-500">Reabastecimiento inmediato</p>
									</div>
								</div>

								<div className="bg-white rounded-lg p-6 border border-gray-200">
									<div className="flex items-start justify-between mb-3">
										<FAIcon icon="exclamation-triangle" size="2xl" className="text-orange-600" />
										<span className="text-xs font-semibold text-red-600">3 Críticos</span>
									</div>
									<p className="text-gray-600 text-sm mb-2">Alerta de Stock</p>
									<h3 className="text-3xl font-bold text-gray-900">12 Artículos</h3>
									<p className="text-xs text-gray-500 mt-3">Reabastecimiento inmediato</p>
								</div>

								<div className="bg-white rounded-lg p-6 border border-gray-200">
									<div className="flex items-start justify-between mb-3">
										<FAIcon icon="chair" size="2xl" className="text-blue-600" />
										<span className="text-xs font-semibold text-green-600">80% Capacidad</span>
									</div>
									<p className="text-gray-600 text-sm mb-2">Mesas en uso</p>
									<h3 className="text-3xl font-bold text-gray-900">18 / 22</h3>
									<div className="flex gap-1 mt-3">
										{[...Array(4)].map((_, i) => (
											<div key={i} className="h-1 flex-1 bg-green-600 rounded-full"></div>
										))}
										{[...Array(1)].map((_, i) => (
											<div key={i + 4} className="h-1 flex-1 bg-gray-300 rounded-full"></div>
										))}
									</div>
								</div>

								<div className="bg-white rounded-lg p-6 border border-gray-200">
									<div className="flex items-start justify-between mb-3">
										<FAIcon icon="users" size="2xl" className="text-purple-600" />
										<span className="text-xs font-semibold text-green-600">+142</span>
									</div>
									<p className="text-gray-600 text-sm mb-2">Clientes Nuevos</p>
									<h3 className="text-3xl font-bold text-gray-900">156</h3>
									<p className="text-xs text-gray-500 mt-3">Comparativa semanal</p>
								</div>
							</div>

							{/* Resumen de Ventas */}
							<div className="bg-white rounded-lg border border-gray-200 p-6">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-lg font-bold text-gray-900">Resumen de Ventas</h3>
										<p className="text-sm text-gray-600">Análisis de ventas mensuales</p>
									</div>
									<div className="flex gap-2">
										<button className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">
											Mensualmente
										</button>
										<button className="px-3 py-1 text-gray-700 rounded text-xs font-semibold hover:bg-gray-100">
											Semanalmente
										</button>
										<button className="px-3 py-1 text-gray-700 rounded text-xs font-semibold hover:bg-gray-100">
											Diariamente
										</button>
									</div>
								</div>

								{/* Gráfico placeholder */}
								<div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
									<div className="text-center">
										<FAIcon icon="chart-bar" size="3xl" className="text-gray-400 mx-auto mb-2" />
										<p className="text-gray-500 text-sm">Gráfico de ventas</p>
										<div className="flex justify-center gap-1 mt-6">
											<div className="w-2 h-20 bg-red-600 rounded-full"></div>
											<div className="w-2 h-16 bg-red-600 rounded-full"></div>
											<div className="w-2 h-24 bg-red-600 rounded-full"></div>
											<div className="w-2 h-14 bg-red-600 rounded-full"></div>
											<div className="w-2 h-28 bg-red-600 rounded-full"></div>
											<div className="w-2 h-20 bg-red-600 rounded-full"></div>
											<div className="w-2 h-18 bg-red-600 rounded-full"></div>
										</div>
										<div className="flex justify-between px-4 mt-4 text-xs text-gray-500">
											<span>Ene</span>
											<span>Feb</span>
											<span>Mar</span>
											<span>Abr</span>
											<span>May</span>
											<span>Jun</span>
											<span>Jul</span>
										</div>
										<div className="mt-4 flex justify-center gap-4 text-xs">
											<div className="flex items-center gap-1">
												<div className="w-3 h-3 rounded-full bg-red-600"></div>
												<span>Ingreso Neto</span>
											</div>
											<div className="flex items-center gap-1">
												<div className="w-3 h-3 rounded-full bg-gray-400"></div>
												<span>Ingresos estimados</span>
											</div>
										</div>
										<p className="text-xs text-gray-500 mt-4">26% de crecimiento anual</p>
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
