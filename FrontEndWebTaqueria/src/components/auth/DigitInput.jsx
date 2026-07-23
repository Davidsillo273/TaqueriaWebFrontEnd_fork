import React from 'react';

const DigitInput = ({ value, onChange, onKeyDown, inputRef, index }) => {
  const handleChange = (e) => {
    // Permite letras y números, y convierte a mayúsculas
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (val.length <= 1) {
      onChange(val, index);
    }
  };

  const handleKeyDown = (e) => {
    if (onKeyDown) onKeyDown(e, index);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      autoCapitalize="characters"
      maxLength="1"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-display font-semibold border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 bg-[#f3f0eb] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-gray-700 uppercase"
    />
  );
};

export default DigitInput;