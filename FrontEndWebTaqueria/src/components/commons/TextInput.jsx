
// Input reutilizable con icono a la izquierda y opcional elemento a la derecha
const TextInput = ({ id, label, type, name, value, onChange, placeholder, disabled, error }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-500 mb-2">{label}</label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:border-red-500"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default TextInput
