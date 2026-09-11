// src/components/dashboard/StaffCard.jsx
import React from 'react';
import Card from '../commons/Card';

const StaffCard = ({ name, image, role, time, workingNow }) => {
  const [firstName = '', lastName = ''] = name.split(' ');

  return (
    <Card className="flex items-center justify-between p-3 sm:p-4 hover:shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          {/* Foto de perfil real cuando existe; si no, se cae a las
              iniciales sobre el mismo degradado de siempre, para que la
              tarjeta no quede con un hueco vacío. */}
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/80 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-display font-semibold text-xs sm:text-sm ring-2 ring-white/80 shadow-sm">
              {firstName[0]}{lastName[0]}
            </div>
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${workingNow ? 'bg-green-500' : 'bg-gray-300'}`}
            title={workingNow ? 'Trabajando ahora' : 'Fuera de turno'}
          />
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-gray-900 text-xs sm:text-sm truncate">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-[11px] font-display font-semibold ${workingNow ? 'text-green-600' : 'text-gray-400'}`}>
          {workingNow ? 'En turno' : 'Fuera de turno'}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </Card>
  );
};

export default StaffCard;
