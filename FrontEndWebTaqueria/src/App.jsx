import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import { NotificationsProvider } from './context/notificationsContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import Login from './pages/Login'
import Recovery from './pages/Recovery'
import VerifyCode from './pages/VerifyCode'
import ResetPassword from "./pages/ResetPassword"
import Dashboard from './pages/Dashboard'
import ComboManagement from './pages/ComboManagement'
import Drinks from './pages/Drinks'
import Dishes from './pages/Dishes'
import ClientManagement from './pages/ClientManagement'
import Extras from './pages/Extras'
import EmployeeManagement from './pages/EmployeeManagement'
import Tables from './pages/Tables'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import InviteStaff from './pages/InviteStaff'
import AcceptInvitation from './pages/AcceptInvitation'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Recipes from './pages/Recipes'

// App entry: setup rutas con React Router
export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				{/* El provider de notificaciones va dentro del de sesión porque
				    necesita saber si hay usuario para empezar a consultar */}
				<NotificationsProvider>
				<Routes>
					{/* Rutas públicas: si ya hay sesión iniciada, PublicRoute
					    redirige automáticamente al dashboard */}
					<Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
					<Route path="/recovery" element={<PublicRoute><Recovery /></PublicRoute>} />
					<Route path="/verify-code" element={<PublicRoute><VerifyCode /></PublicRoute>} />
					<Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

					{/* Rutas de aceptar invitación: quien entra aquí todavía NO
					    tiene cuenta creada, así que no encajan ni como "públicas
					    de login" ni como "privadas de dashboard". Se dejan sin
					    wrapper para no bloquear ni redirigir a nadie */}
					<Route path="/admin/accept-invitation" element={<AcceptInvitation />} />
					<Route path="/employee/accept-invitation" element={<AcceptInvitation />} />

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
					<Route path="/notificaciones" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
					<Route path="/ajustes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
					<Route path="/recetas" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
				</Routes>
				</NotificationsProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}