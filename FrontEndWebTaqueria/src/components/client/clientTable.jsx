import React from 'react'
import FAIcon from '../commons/FAIcon'

// La tabla que muestra la lista de la base de datos
const ClientTable = () => {
  // Quemamos estos datos de prueba en lo que conectamos el backend completo
  const dataFalsa = [
    { id: '1', name: 'Carlos Mendoza', email: 'carlos.men@gmail.com', phone: '7123-4567', date: '12 Feb 2026', card: 'CR-9921' },
    { id: '2', name: 'Gabriela Torres', email: 'gaby.torres@outlook.com', phone: '6098-1122', date: '18 Mar 2026', card: 'Ninguna' },
    { id: '3', name: 'Fernando Rivas', email: 'fer_rivas@elcorral.com', phone: '7544-8901', date: '05 May 2026', card: 'CR-4402' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Cliente</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Contacto</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Fecha Registro</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase">Tarjeta Fidelidad</th>
              <th className="p-4 text-xs font-bold text-gray-700 uppercase text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm text-gray-900">
            {dataFalsa.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50/70 transition-colors">
                
                {/* Nombre */}
                <td className="p-4 font-semibold text-gray-900">{client.name}</td>
                
                {/* Correo y cel metidos en una sola celda para ahorrar espacio */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">{client.email}</span>
                    <span className="text-gray-500 text-xs">{client.phone}</span>
                  </div>
                </td>
                
                {/* Fecha */}
                <td className="p-4 text-gray-600">{client.date}</td>
                
                {/* Validamos si pintar gris o rojo según si tiene tarjeta */}
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${client.card === 'Ninguna' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-[#AF101A]'}`}>
                    {client.card}
                  </span>
                </td>
                
                {/* Botoncitos para editar y borrar */}
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800 cursor-pointer border-0 bg-transparent">
                      <FAIcon icon="edit" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 cursor-pointer border-0 bg-transparent">
                      <FAIcon icon="trash-alt" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}

export default ClientTable