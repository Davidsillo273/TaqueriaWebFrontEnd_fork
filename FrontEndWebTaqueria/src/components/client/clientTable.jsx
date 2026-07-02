import React from 'react'
import FAIcon from '../commons/FAIcon'

const ClientTable = ({ clients, onEdit, isLoading }) => {
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500 font-medium">
        Cargando comensales fieles de la base de datos...
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500 font-medium">
        No hay clientes registrados en el sistema en este momento.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Cliente</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Contacto</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Fecha Registro</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Teléfono</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase text-center">Acciones</th>
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
                <tr key={id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{fullName}</td>
                  <td className="p-4 text-gray-900 font-medium">{email}</td>
                  <td className="p-4 text-gray-600">{registerDate}</td>
                  <td className="p-4 text-gray-600">{phone}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onEdit(client)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer border-0 bg-transparent"
                    >
                      <FAIcon icon="edit" /> Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  )
}

export default ClientTable;