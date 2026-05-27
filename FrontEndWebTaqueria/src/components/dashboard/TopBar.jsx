import React from 'react'
import FAIcon from '../FAIcon'

// TopBar con búsqueda y opciones del usuario
const TopBar = () => {
	return (
		<div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
			<div className="flex-1 max-w-md">
				<input
					type="text"
					placeholder="Buscar combos, productos..."
					className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-600"
				/>
			</div>

			<div className="flex items-center gap-6">
				<button className="relative p-2 text-gray-600 hover:text-gray-900">
					<FAIcon icon="bell" size="lg" />
					<span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
				</button>

				<button className="p-2 text-gray-600 hover:text-gray-900">
					<FAIcon icon="cog" size="lg" />
				</button>

				<div className="flex items-center gap-3 pl-6 border-l border-gray-200">
					<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
						AC
					</div>
					<div className="flex flex-col text-sm">
						<span className="font-semibold text-gray-900">Admin Corral</span>
						<span className="text-xs text-gray-500">Super User</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TopBar
