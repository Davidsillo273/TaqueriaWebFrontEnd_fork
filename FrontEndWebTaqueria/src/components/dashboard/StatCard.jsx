import React from 'react'
import FAIcon from '../FAIcon'

// Tarjeta de estadística con título, valor y cambio
const StatCard = ({ icon, title, value, change, unit = '', alert = false }) => {
	return (
		<div className={`bg-white rounded-lg p-6 border ${alert ? 'border-red-200' : 'border-gray-200'}`}>
			<div className="flex items-start justify-between mb-3">
				<FAIcon icon={icon} size="2xl" className="text-red-600" />
				{change && (
					<span className={`text-xs font-semibold ${change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
						{change}
					</span>
				)}
			</div>
			<p className="text-gray-600 text-sm mb-2">{title}</p>
			<div className="flex items-baseline gap-2">
				<h3 className="text-3xl font-bold text-gray-900">{value}</h3>
				{unit && <span className="text-gray-500 text-sm">{unit}</span>}
			</div>
		</div>
	)
}

export default StatCard
