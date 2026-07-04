import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import ProtectedRoute from './components/auth/protectedRoute'
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
			<AuthProvider>
				<Routes>
					{/* Rutas públicas */}
					<Route path="/" element={<Login />} />
					<Route path="/recovery" element={<Recovery />} />
					<Route path="/verify-code" element={<VerifyCode />} />
					<Route path="/admin/accept-invitation" element={<AcceptInvitation />} />

					{/* Rutas privadas: requieren sesión iniciada */}
					<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
					<Route path="/combos" element={<ProtectedRoute><ComboManagement /></ProtectedRoute>} />
					<Route path="/drinks" element={<ProtectedRoute><Drinks /></ProtectedRoute>} />
					<Route path="/dishes" element={<ProtectedRoute><Dishes /></ProtectedRoute>} />
					<Route path="/clients" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />
					<Route path="/extras" element={<ProtectedRoute><Extras /></ProtectedRoute>} />
					<Route path="/employees" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
					<Route path="/mesas" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
					<Route path="/inventario" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
					<Route path="/pedidos" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
					<Route path="/InviteStaff" element={<ProtectedRoute><InviteStaff /></ProtectedRoute>} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}