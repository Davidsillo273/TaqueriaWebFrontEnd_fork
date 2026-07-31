import React from 'react';
import FAIcon from '../commons/FAIcon';

const ClientTable = ({ clients, onEdit, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 p-6 sm:p-8 text-center text-gray-500 font-medium text-sm">
        Cargando comensales fieles de la base de datos...
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 p-6 sm:p-8 text-center text-gray-500 font-medium text-sm">
        No hay clientes registrados en el sistema en este momento.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="p-3 sm:p-4 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="p-3 sm:p-4 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="p-3 sm:p-4 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
              <th className="p-3 sm:p-4 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="p-3 sm:p-4 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-900">
            {clients.map((client) => {
              const id = client._id || client.id;
              const fullName = `${client.personalInfo?.name || ''} ${client.personalInfo?.lastname || ''}`.trim() || 'Sin Nombre';
              const email = client.loginInfo?.email || 'Sin correo';
              const phone = client.personalInfo?.phones?.[0] || 'Sin teléfono';
              const registerDate = client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A';

              return (
                <tr key={id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 sm:p-4 font-display font-semibold text-gray-900">{fullName}</td>
                  <td className="p-3 sm:p-4 text-gray-700 font-medium">{email}</td>
                  <td className="p-3 sm:p-4 text-gray-600">{registerDate}</td>
                  <td className="p-3 sm:p-4 text-gray-600">{phone}</td>
                  <td className="p-3 sm:p-4 text-center">
                    <button
                      onClick={() => onEdit(client)}
                      className="text-red-500 hover:text-red-600 font-display font-semibold text-sm hover:underline transition-colors"
                    >
                      <FAIcon icon="edit" className="mr-1" /> Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;