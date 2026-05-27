import React from 'react'

// Fila de la tabla de actividad reciente
const ActivityRow = ({ id, mesa, cliente, monto, estado, hora }) => {
	const estadoStyles = {
		COMPLETADO: 'bg-green-100 text-green-700',
		PREPARANDO: 'bg-orange-100 text-orange-700',
		PENDIENTE: 'bg-red-100 text-red-700',
	}

	return (
		<tr className="border-b border-gray-200 hover:bg-gray-50">
			<td className="px-6 py-4 text-sm font-semibold text-gray-900">{id}</td>
			<td className="px-6 py-4 text-sm text-gray-600">{mesa}</td>
			<td className="px-6 py-4 text-sm text-gray-600">{cliente}</td>
			<td className="px-6 py-4 text-sm font-semibold text-gray-900">{monto}</td>
			<td className="px-6 py-4">
				<span className={`px-3 py-1 text-xs font-semibold rounded-full ${estadoStyles[estado]}`}>
					{estado}
				</span>
			</td>
			<td className="px-6 py-4 text-sm text-gray-600">{hora}</td>
		</tr>
	)
}

export default ActivityRow
