import React from 'react';
import ComboStats from '../dashboard/ComboStats';

const ClientKpis = ({ clients = [], onOpenLeaderboard }) => {
  const totalClients = clients.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <ComboStats
        icon="users"
        title="CLIENTES TOTALES"
        value={totalClients}
        label={`${totalClients} registrados en la plataforma`}
        highlighted={true}
      />
      <ComboStats
        icon="star"
        title="CLIENTES DESTACADOS"
        value="Ver ranking"
        label="Más activos, mayor gasto y compras más caras"
        highlighted={true}
        onClick={onOpenLeaderboard}
      />
    </div>
  );
};

export default ClientKpis;
