import React from 'react';
import ComboStats from '../dashboard/ComboStats';

const ClientKpis = ({ clients = [] }) => {
  const totalClients = clients.length;
  const verifiedClients = clients.filter(c => c.loginInfo?.isVerified).length;

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
        icon="user-check"
        title="CUENTAS VERIFICADAS"
        value={verifiedClients}
        label={`${verifiedClients} usuarios validados`}
        highlighted={true}
      />
    </div>
  );
};

export default ClientKpis;