import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/themeContext'
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
import ErrorScreen from './pages/ErrorScreen'
import AssistantChatWidget from './components/chat/AssistantChatWidget'

// App entry: setup rutas con React Router
export default function App() {
	return (
		<ThemeProvider>
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

					{/* Rutas privadas: requieren sesión iniciada. "/dashboard" se deja
					    siempre accesible (sin requiredPermission) porque es a donde se
					    manda a cualquier empleado sin acceso a la pantalla que pidió:
					    si también estuviera restringida, un empleado sin ese permiso
					    quedaría en un loop de redirecciones. */}
					<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
					<Route path="/combos" element={<ProtectedRoute requiredPermission="combos"><ComboManagement /></ProtectedRoute>} />
					<Route path="/drinks" element={<ProtectedRoute requiredPermission="drinks"><Drinks /></ProtectedRoute>} />
					<Route path="/dishes" element={<ProtectedRoute requiredPermission="dishes"><Dishes /></ProtectedRoute>} />
					<Route path="/clients" element={<ProtectedRoute requiredPermission="clients"><ClientManagement /></ProtectedRoute>} />
					<Route path="/extras" element={<ProtectedRoute requiredPermission="extras"><Extras /></ProtectedRoute>} />
					<Route path="/employees" element={<ProtectedRoute requiredPermission="employees"><EmployeeManagement /></ProtectedRoute>} />
					<Route path="/mesas" element={<ProtectedRoute requiredPermission="tables"><Tables /></ProtectedRoute>} />
					<Route path="/inventario" element={<ProtectedRoute requiredPermission="inventory"><Inventory /></ProtectedRoute>} />
					<Route path="/pedidos" element={<ProtectedRoute requiredPermission="orders"><Orders /></ProtectedRoute>} />
					<Route path="/InviteStaff" element={<ProtectedRoute requiredPermission="invite_staff"><InviteStaff /></ProtectedRoute>} />
					<Route path="/notificaciones" element={<ProtectedRoute requiredPermission="notifications"><Notifications /></ProtectedRoute>} />
					{/* Sin requiredPermission: cualquier sesión iniciada puede entrar
					    a editar SU PROPIO perfil (pestaña "Perfil y cuenta"). Los
					    ajustes generales del sistema, dentro de la misma pantalla,
					    quedan ocultos si el usuario no tiene el permiso "settings"
					    (ver TABS en Settings.jsx). */}
					<Route path="/ajustes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
					<Route path="/recetas" element={<ProtectedRoute requiredPermission="recipes"><Recipes /></ProtectedRoute>} />

					{/* Catch-all: cualquier URL que no coincida con ninguna ruta
					    de arriba cae aquí y muestra la pantalla de 404. */}
					<Route path="*" element={<ErrorScreen variant={404} />} />
				</Routes>

				{/* Botón flotante del asistente de IA: vive fuera de <Routes> para
				    estar disponible en cualquier pantalla sin tener que montarlo
				    página por página. Él mismo decide si mostrarse según la sesión. */}
				<AssistantChatWidget />
				</NotificationsProvider>
			</AuthProvider>
		</BrowserRouter>
		</ThemeProvider>
	)
}