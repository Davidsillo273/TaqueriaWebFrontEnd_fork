import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import { NotificationsProvider } from './context/notificationsContext'
import ProtectedRoute from './components/auth/protectedRoute'
import PublicRoute from './components/auth/publicRoute'
import Login from './pages/login'
import Recovery from './pages/recovery'
import VerifyCode from './pages/verifyCode'
import ResetPassword from "./pages/resetPassword"
import Dashboard from './pages/dashboard'
import ComboManagement from './pages/ComboManagement'
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
import Notifications from './pages/notifications'
import Settings from './pages/settings'
import Recipes from './pages/recipes'

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