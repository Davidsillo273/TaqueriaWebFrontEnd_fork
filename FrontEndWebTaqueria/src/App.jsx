import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Recovery from './pages/recovery'
import VerifyCode from './pages/verifyCode'
import Dashboard from './pages/dashboard'
import ComboManagement from './pages/comboManagement'
import Drinks from './pages/drinks'
import Dishes from './pages/dishes'
import ClientManagement from './pages/clientManagement'
import Extras from './pages/extras'
import EmployeeManagement from './pages/employeeManagement'
import Tables from './pages/tables'
import Inventory from './pages/inventory'
import Orders from './pages/orders'
import InviteStaff from './pages/inviteStaff'
import AcceptInvitation from './pages/acceptInvitation'

// App entry: setup rutas con React Router
export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/recovery" element={<Recovery />} />
				<Route path="/verify-code" element={<VerifyCode />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/combos" element={<ComboManagement />} />
				<Route path="/drinks" element={<Drinks />} />
				<Route path="/dishes" element={<Dishes />} />
				<Route path="/clients" element={<ClientManagement />} />
				<Route path="/extras" element={<Extras />} />
				<Route path="/employees" element={<EmployeeManagement />} />
				<Route path="/mesas" element={<Tables />} />
				<Route path="/inventario" element={<Inventory />} />
				<Route path="/pedidos" element={<Orders />} />
				<Route path="/inviteStaff" element={<InviteStaff />} />
				<Route path="/admin/accept-invitation" element={<AcceptInvitation />} />

			
			</Routes>
		</BrowserRouter>
	)
}

