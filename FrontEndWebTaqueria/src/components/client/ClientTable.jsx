import React from 'react';
import FAIcon from '../commons/FAIcon';
import PaginationControls from '../commons/PaginationControls';
import usePagination from '../../hooks/usePagination';

const ClientTable = ({ clients, onView, isLoading }) => {
  const { page, totalPages, paginatedItems, goTo, next, prev } = usePagination(clients || [], 5);

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
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <h2 className="text-lg font-display font-bold text-gray-800">Clientes registrados</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="bg-gray-50/80 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="p-3 sm:p-4 pl-4 sm:pl-6">Foto</th>
              <th className="p-3 sm:p-4">Cliente</th>
              <th className="p-3 sm:p-4">Contacto</th>
              <th className="p-3 sm:p-4">Estado</th>
              <th className="p-3 sm:p-4">Fecha registro</th>
              <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {paginatedItems.map((client) => {
              const id = client._id || client.id;
              const fullName = `${client.personalInfo?.name || ''} ${client.personalInfo?.lastname || ''}`.trim() || 'Sin Nombre';
              const email = client.loginInfo?.email || 'Sin correo';
              const phone = client.personalInfo?.phones?.[0] || 'Sin teléfono';
              const registerDate = client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A';
              const isVerified = !!client.loginInfo?.isVerified;
              const initials = fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

              return (
                <tr key={id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                    {client.personalInfo?.image ? (
                      <img src={client.personalInfo.image} alt={fullName} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-display font-bold shadow-sm">
                        {initials || '?'}
                      </div>
                    )}
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="font-display font-bold text-gray-900">{fullName}</div>
                    <div className="text-xs text-gray-500">{phone}</div>
                  </td>
                  <td className="p-3 sm:p-4 text-gray-700 font-medium">{email}</td>
                  <td className="p-3 sm:p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-semibold border ${isVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                      {isVerified ? 'Verificado' : 'Sin verificar'}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-gray-600">{registerDate}</td>
                  <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">
                    <button
                      onClick={() => onView(client)}
                      aria-label="Ver información del cliente"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <FAIcon icon="eye" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <PaginationControls page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGoTo={goTo} />
      </div>
    </div>
  );
};

export default ClientTable;
