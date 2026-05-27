import React, { useState } from 'react'
import Icon from '../components/Icon'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import AuthCard from '../components/AuthCard'

// Página de login. Usa componentes reutilizables y TailwindCSS.
export default function Login() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [errors, setErrors] = useState({})

	const validate = () => {
		const newErrors = {}
		if (!username) newErrors.username = 'El usuario es requerido'
		if (!password) newErrors.password = 'La contraseña es requerida'
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		if (!validate()) return
		// Aquí se implementaría la llamada al backend para autenticar
		// Por ahora solo mostramos en consola
		console.log('Login attempt', { username, password })
	}

	return (
		<div className="min-h-screen bg-rose-50 flex items-center justify-center relative overflow-hidden">
			{/* Fondos suaves en las esquinas para efecto visual */}
			<div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-rose-100 opacity-60 blur-3xl" />
			<div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-50 opacity-60 blur-3xl" />

			<AuthCard>
				<div className="flex flex-col items-center text-center">
					<div className="mb-6">
						<img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
					</div>
					<h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Portal</h1>
					<p className="text-sm text-gray-500 mb-6">Panel de Administración</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<TextInput
						id="username"
						label="Usuario"
						placeholder="JuanPerez1323"
						leftIcon="mail"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						error={errors.username}
					/>

					<TextInput
						id="password"
						label="Contraseña"
						placeholder=""
						type={showPassword ? 'text' : 'password'}
						leftIcon="lock"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						error={errors.password}
						rightElement={
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="text-gray-500 hover:text-gray-700 focus:outline-none"
							>
								<Icon name={showPassword ? 'eyeOff' : 'eye'} className="w-5 h-5" />
							</button>
						}
					/>

					<div className="flex items-center justify-between">
						<a className="text-sm text-red-600 hover:underline" href="#">¿Olvidó su contraseña?</a>
					</div>

					<PrimaryButton type="submit">Iniciar Sesión ↵</PrimaryButton>
				</form>

				<p className="mt-6 text-xs text-gray-400 text-center">© 2024 Taquería El Corral Admin Portal. Acceso restringido a personal autorizado.</p>
			</AuthCard>
		</div>
	)
}

