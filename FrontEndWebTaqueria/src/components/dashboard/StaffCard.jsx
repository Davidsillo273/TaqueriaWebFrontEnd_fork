// src/components/dashboard/StaffCard.jsx
import React from 'react';
import Card from '../commons/Card';

const StaffCard = ({ name, role, shift, time }) => {
  const [firstName = '', lastName = ''] = name.split(' ');

  return (
    <Card className="flex items-center justify-between p-3 sm:p-4 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-display font-semibold text-xs sm:text-sm ring-2 ring-white/80 shadow-sm">
          {firstName[0]}{lastName[0]}
        </div>
        <div>
          <p className="font-display font-semibold text-gray-900 text-xs sm:text-sm">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs sm:text-sm font-display font-semibold text-gray-900">{shift}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </Card>
  );
};

export default StaffCard;