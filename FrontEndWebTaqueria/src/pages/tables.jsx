import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FAIcon from '../components/commons/FAIcon';
import TableModal from '../components/tables/TableModal';
import useTables from '../hooks/useTables'; // Traemos el hook que armamos

export default function Tables() {
    const [activeMenu] = useState('tables');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);

    // Consumimos las funciones reales conectadas a la base de datos
    const { tables, loading, createTable, updateTable, deleteTable } = useTables();

    // Calculamos las estadísticas en tiempo real usando el arreglo del backend
    const totalMesas = tables.length;
    const mesasLibres = tables.filter(m => m.status === 'Disponible').length;
    const porcentajeOcupacion = totalMesas > 0 ? Math.round(((totalMesas - mesasLibres) / totalMesas) * 100) : 0;

    // Función para manejar las clases de color de las etiquetas de estado
    const getBadgeClass = (estado) => {
        if (estado === 'Disponible') return 'bg-green-50 text-green-600 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
        if (estado === 'Sirviendo') return 'bg-red-50 text-red-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
        if (estado === 'Reservada') return 'bg-orange-50 text-orange-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
        return 'bg-gray-100 text-gray-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
    };

    // Guarda los datos ya sea creando una mesa nueva o editando una vieja
    const handleSaveTable = async (formData) => {
        if (editingTable) {
            const res = await updateTable(editingTable._id, formData);
            if (!res.success) alert(res.message);
        } else {
            const res = await createTable(formData);
            if (!res.success) alert(res.message);
        }
        setIsModalOpen(false);
        setEditingTable(null);
    };

    // Cambia el estado rápido de la mesa al darle clic al botón principal de la tarjeta
    const handleQuickAction = async (mesa) => {
        let nuevoEstado = mesa.status;
        if (mesa.status === 'Disponible') nuevoEstado = 'Sirviendo';
        else if (mesa.status === 'Sirviendo') nuevoEstado = 'En Limpieza';
        else if (mesa.status === 'En Limpieza' || mesa.status === 'Reservada') nuevoEstado = 'Disponible';

        await updateTable(mesa._id, { number: mesa.number, status: nuevoEstado });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-y-auto p-8">
                    
                    {/* Título e indicador de la página */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Mesas</h1>
                            <p className="text-gray-400 text-xs font-medium">Monitoreo en tiempo real del área de comedor.</p>
                        </div>
                        <button 
                            onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#AF101A] text-white text-xs font-bold rounded-lg hover:bg-red-800 border-0 cursor-pointer transition-colors shadow-sm"
                        >
                            <FAIcon icon="plus" /> Nueva Mesa
                        </button>
                    </div>

                    {/* Spinner o aviso mientras caen los datos de MongoDB */}
                    {loading ? (
                        <div className="text-center py-10 font-bold text-gray-500">Cargando mesas desde el servidor...</div>
                    ) : (
                        <>
                            {/* Tarjetas informativas dinámicas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl border-l-4 border-l-[#AF101A] border-gray-200 shadow-sm flex flex-col gap-1">
                                    <div className="text-gray-400 mb-2"><FAIcon icon="utensils" /></div>
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Mesas</span>
                                    <span className="text-3xl font-bold text-gray-800">{totalMesas}</span>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
                                    <div className="text-gray-400 mb-1"><FAIcon icon="percentage" /></div>
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ocupación</span>
                                    <span className="text-3xl font-bold text-gray-800 my-1">{porcentajeOcupacion}%</span>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                        <div className="bg-[#AF101A] h-full" style={{ width: `${porcentajeOcupacion}%` }}></div>
                                    </div>
                                    <span className="text-right text-[10px] text-gray-400 mt-1 font-medium">{totalMesas - mesasLibres} / {totalMesas}</span>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                                    <div className="text-green-500 mb-2"><FAIcon icon="check-circle" /></div>
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mesas Libres</span>
                                    <span className="text-3xl font-bold text-gray-800">{mesasLibres}</span>
                                </div>
                            </div>

                            {/* Mapeo de la lista de mesas reales */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                                {tables.map((mesa) => (
                                    <div key={mesa._id} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[170px] relative group">
                                        
                                        {/* Botones chiquitos para borrar/editar que aparecen al pasar el mouse */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingTable(mesa); setIsModalOpen(true); }}
                                                className="p-1 text-gray-400 hover:text-blue-600 bg-transparent border-0 cursor-pointer"
                                            >
                                                <FAIcon icon="edit" />
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm("¿Seguro que quieres borrar la mesa?")) deleteTable(mesa._id); }}
                                                className="p-1 text-gray-400 hover:text-red-600 bg-transparent border-0 cursor-pointer"
                                            >
                                                <FAIcon icon="trash" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                                                <FAIcon icon="chair" className="text-gray-400" />
                                                Mesa {String(mesa.number).padStart(2, '0')}
                                            </div>
                                            <span className={getBadgeClass(mesa.status)}>{mesa.status}</span>
                                        </div>

                                        {/* Botones interactivos que cambian según el estado de la mesa */}
                                        <div className="mt-auto">
                                            <button 
                                                onClick={() => handleQuickAction(mesa)}
                                                className={`w-full py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                                                    mesa.status === 'Sirviendo' ? 'bg-[#AF101A] text-white hover:bg-red-800 border-0' :
                                                    mesa.status === 'Disponible' ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' :
                                                    mesa.status === 'En Limpieza' ? 'bg-gray-100 text-gray-500 border-0 hover:bg-gray-200' :
                                                    'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {mesa.status === 'Sirviendo' && 'Liberar / Limpieza'}
                                                {mesa.status === 'Disponible' && 'Asignar Mesa'}
                                                {mesa.status === 'En Limpieza' && 'Finalizar Limpieza'}
                                                {mesa.status === 'Reservada' && 'Registrar Ocupación'}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Cuadro punteado para crear una mesa de volada */}
                                <div 
                                    onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
                                    className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-5 min-h-[170px] hover:border-[#AF101A] hover:text-[#AF101A] cursor-pointer transition-colors"
                                >
                                    <FAIcon icon="plus-circle" size="lg" className="mb-2" />
                                    <span className="text-xs font-bold">Agregar Mesa</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Nomenclatura o glosario de colores al pie de la página */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-wrap items-center gap-6">
                        <span className="text-xs font-bold text-gray-800">ESTADO:</span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Disponible</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-[#AF101A]"></span> Ocupada</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Reservada</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Limpieza</div>
                    </div>

                </main>
            </div>

            {/* Inyección del Modal pasándole las funciones correspondientes */}
            <TableModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setEditingTable(null); }} 
                onSave={handleSaveTable}
                currentTable={editingTable}
            />
        </div>
    );
}