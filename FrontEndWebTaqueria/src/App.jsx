import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Recovery from './pages/recovery'
import VerifyCode from './pages/verifyCode'
import Dashboard from './pages/dashboard'
import ComboManagement from './pages/comboManagement'

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
			</Routes>
		</BrowserRouter>
	)
}

