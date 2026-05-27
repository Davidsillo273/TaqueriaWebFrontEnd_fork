import React from 'react'

// Tarjeta de miembro del equipo con información de turno
const StaffCard = ({ name, role, shift, time }) => {
	return (
		<div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
					{name.split(' ')[0][0]}{name.split(' ')[1][0]}
				</div>
				<div>
					<p className="font-semibold text-gray-900 text-sm">{name}</p>
					<p className="text-xs text-gray-500">{role}</p>
				</div>
			</div>
			<div className="text-right">
				<p className="text-sm font-semibold text-gray-900">{shift}</p>
				<p className="text-xs text-gray-500">{time}</p>
			</div>
		</div>
	)
}

export default StaffCard
