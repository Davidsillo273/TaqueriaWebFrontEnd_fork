import { useState } from 'react';

// Íconos de ojo simples en SVG, para no depender de una librería de
// iconos extra solo para esto (FAIcon queda libre para el resto del proyecto)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const TextInput = ({ id, label, type, name, value, onChange, placeholder, disabled, error }) => {
  // Solo se activa el toggle si el campo realmente es de contraseña;
  // para email/text/etc. el input se comporta exactamente igual que antes.
  const isPasswordField = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2.5 ${isPasswordField ? 'pr-11' : ''} bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] disabled:opacity-60`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default TextInput;