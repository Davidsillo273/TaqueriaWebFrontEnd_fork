// src/components/commons/Card.jsx
const Card = ({ children, className = '', accent = false, ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-3xl
        shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.05)]
        border border-white/80
        ${accent ? 'border-l-4 border-l-red-500' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;