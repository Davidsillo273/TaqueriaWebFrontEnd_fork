import React from 'react'

// Input individual para un dígito. Auto-enfoca el siguiente cuando se completa.
const DigitInput = ({ value, onChange, onKeyDown, inputRef, index }) => {
	const handleChange = (e) => {
		const val = e.target.value.replace(/[^0-9]/g, '')
		if (val.length <= 1) {
			onChange(val, index)
		}
	}

	const handleKeyDown = (e) => {
		if (onKeyDown) onKeyDown(e, index)
	}

	return (
		<input
			ref={inputRef}
			type="text"
			inputMode="numeric"
			maxLength="1"
			value={value}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 bg-gray-50"
		/>
	)
}

export default DigitInput
