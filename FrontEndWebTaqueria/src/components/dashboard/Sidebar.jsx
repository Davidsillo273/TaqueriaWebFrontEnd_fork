import React from 'react'
import { Link } from 'react-router-dom'
import FAIcon from '../commons/FAIcon'

// Sidebar con navegación del dashboard
const Sidebar = ({ activeMenu }) => {
	const menuItems = [
		{ id: 'activity', label: 'Actividad', icon: 'chart-line', path: '/dashboard' },
		{ id: 'orders', label: 'Combos', icon: 'shopping-bag', path: '/combos' },
		{ id: 'drinks', label: 'Bebidas', icon: 'wine-glass', path: '/drinks' },
		{ id: 'dishes', label: 'Platillo', icon: 'utensils', path: '/dishes' },
		{ id: 'extras', label: 'Extras', icon: 'star', path: '/extras' },
		{ id: 'inventory', label: 'Inventario', icon: 'box', path: '#' },
		{ id: 'tables', label: 'Mesas', icon: 'chair', path: '#' },
		{ id: 'clients', label: 'Clientes', icon: 'users', path: '#' },
		{ id: 'staff', label: 'Empleados', icon: 'user-tie', path: '#' },
		{ id: 'orders-list', label: 'Pedidos', icon: 'list', path: '#' },
	]

	return (
		<aside className="w-56 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
			<div className="p-6 border-b border-gray-200">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
						EC
					</div>
					<div className="flex flex-col">
						<h1 className="font-bold text-gray-900">El Corral Admin</h1>
						<p className="text-xs text-gray-500">Administración</p>
					</div>
				</div>
			</div>

			<nav className="p-4 space-y-1">
				{menuItems.map((item) => (
					<Link
						key={item.id}
						to={item.path}
						className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
							activeMenu === item.id
								? 'bg-red-50 text-red-600 border-l-4 border-red-600'
								: 'text-gray-700 hover:bg-gray-100'
						}`}
					>
						<FAIcon icon={item.icon} />
						<span>{item.label}</span>
					</Link>
				))}
			</nav>

			<div className="absolute bottom-6 left-4 right-4">
				<Link
					to="/"
					className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
				>
					<FAIcon icon="sign-out-alt" />
					<span>Cerrar sesión</span>
				</Link>
			</div>
		</aside>
	)
}

export default Sidebar
