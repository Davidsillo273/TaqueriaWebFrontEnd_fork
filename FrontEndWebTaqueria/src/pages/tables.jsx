import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import TableModal from '../components/tables/TableModal' // <--- Traemos el modal que hicimos arriba

export default function Tables() {
    // Este hook controla si el menu de "Mesas" se ve activo en el sidebar
    const [activeMenu] = useState('tables')
    
    // Este hook abre y cierra el modal de añadir mesa
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Aquí van las mesas quemadas como dijimos, para meter el backend después
    const mesas = [
        { id: 1, numero: '01', estado: 'Sirviendo', personas: 4, tiempo: '45 min' },
        { id: 2, numero: '02', estado: 'Disponible', personas: 2 },
        { id: 3, numero: '03', estado: 'Reservada', personas: 6, reserva: '19:30' },
        { id: 4, numero: '04', estado: 'En Limpieza', personas: 4 },
        { id: 5, numero: '05', estado: 'Sirviendo', personas: 2, tiempo: '15 min' },
        { id: 6, numero: '06', estado: 'Disponible', personas: 4 },
        { id: 7, numero: '07', estado: 'Sirviendo', personas: 8, tiempo: '1h 10m' },
    ]

    // Función rápida para ponerle los colores correctos a las etiquetas según el estado
    const getBadgeClass = (estado) => {
        if (estado === 'Disponible') return 'bg-green-50 text-green-600 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded'
        if (estado === 'Sirviendo') return 'bg-red-50 text-red-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded'
        if (estado === 'Reservada') return 'bg-orange-50 text-orange-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded'
        return 'bg-gray-100 text-gray-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded' // Para limpieza
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* El menú de la izquierda */}
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* La barra de arriba con el buscador y el perfil */}
                <TopBar />

                {/* El contenedor con scroll para todo el contenido */}
                <main className="flex-1 overflow-y-auto p-8">
                    
                    {/* Título de la pantalla y el botón rojo de Añadir */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Mesas</h1>
                            <p className="text-gray-400 text-xs font-medium">Monitoreo en tiempo real del área de comedor.</p>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)} // Al darle clic abre el modal
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#AF101A] text-white text-xs font-bold rounded-lg hover:bg-red-800 border-0 cursor-pointer transition-colors shadow-sm"
                        >
                            <FAIcon icon="plus" /> Nueva Mesa
                        </button>
                    </div>

                    {/* Las 3 tarjetas de estadísticas de arriba */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tarjeta 1: Total */}
                        <div className="bg-white p-6 rounded-xl border-l-4 border-l-[#AF101A] border-y-gray-200 border-r-gray-200 shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <FAIcon icon="utensils" />
                                <span className="text-[11px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded">+2</span>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Mesas</span>
                            <span className="text-3xl font-bold text-gray-800">24</span>
                        </div>

                        {/* Tarjeta 2: Ocupación con su barrita */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between">
                            <div className="text-gray-400 mb-1"><FAIcon icon="percentage" /></div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ocupación</span>
                            <span className="text-3xl font-bold text-gray-800 my-1">75%</span>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div className="bg-[#AF101A] h-full" style={{ width: '75%' }}></div>
                            </div>
                            <span className="text-right text-[10px] text-gray-400 mt-1 font-medium">18 / 24</span>
                        </div>

                        {/* Tarjeta 3: Libres */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                            <div className="text-green-500 mb-2"><FAIcon icon="check-circle" /></div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mesas Libres</span>
                            <span className="text-3xl font-bold text-gray-800">6</span>
                            <div className="mt-1"><span className="bg-green-50 text-green-600 font-bold text-[10px] px-2 py-0.5 rounded">AVAILABLE NOW</span></div>
                        </div>
                    </div>

                    {/* La cuadrícula con todas las mesas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                        {mesas.map((mesa) => (
                            <div key={mesa.id} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[170px]">
                                
                                {/* Fila superior de la mesa: Nombre y su Badge */}
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                                        <FAIcon icon="chair" className="text-gray-400" />
                                        Mesa {mesa.numero}
                                    </div>
                                    <span className={getBadgeClass(mesa.estado)}>{mesa.estado}</span>
                                </div>

                                {/* Cuerpo de la mesa: Capacidad y Tiempos */}
                                <div className="flex flex-col gap-2 flex-1 justify-center">
                                    <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                        <FAIcon icon="user" className="text-gray-300" /> {mesa.personas} Pers
                                    </div>
                                    
                                    {/* Si está sirviendo, muestra el cuadro rojo de tiempo */}
                                    {mesa.estado === 'Sirviendo' && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                            <FAIcon icon="clock" /> Tiempo <span className="ml-auto font-black">{mesa.tiempo}</span>
                                        </div>
                                    )}

                                    {/* Si está reservada, muestra la hora de la reserva */}
                                    {mesa.estado === 'Reservada' && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                                            <FAIcon icon="calendar-alt" className="text-gray-400" /> Reserva <span className="ml-auto font-black">{mesa.reserva}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Botón de acción de abajo según el estado de la mesa */}
                                <div className="mt-4">
                                    {mesa.estado === 'Sirviendo' && (
                                        <button className="w-full py-1.5 bg-[#AF101A] text-white text-[11px] font-bold rounded-lg border-0 cursor-pointer hover:bg-red-800">Ver Comanda</button>
                                    )}
                                    {mesa.estado === 'Disponible' && (
                                        <button className="w-full py-1.5 bg-white text-gray-700 text-[11px] font-bold rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">Asignar Mesa</button>
                                    )}
                                    {mesa.estado === 'Reservada' && (
                                        <button className="w-full py-1.5 bg-white text-gray-700 text-[11px] font-bold rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">Registrar Entrada</button>
                                    )}
                                    {mesa.estado === 'En Limpieza' && (
                                        <button className="w-full py-1.5 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-lg border-0 cursor-pointer hover:bg-gray-200 flex items-center justify-center gap-1">
                                            <FAIcon icon="broom" /> Finalizar Limpieza
                                        </button>
                                    )}
                                </div>

                            </div>
                        ))}

                        {/* Tarjeta extra: El botón discontinuo para Agregar Mesa rápido */}
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-5 min-h-[170px] hover:border-[#AF101A] hover:text-[#AF101A] cursor-pointer transition-colors"
                        >
                            <FAIcon icon="plus-circle" size="lg" className="mb-2" />
                            <span className="text-xs font-bold">Agregar Mesa</span>
                        </div>
                    </div>

                    {/* El pie de página con los circulitos de colores explicativos */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-wrap items-center gap-6">
                        <span className="text-xs font-bold text-gray-800">ESTADO:</span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Disponible</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-[#AF101A]"></span> Ocupada</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Reservada</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Limpieza</div>
                    </div>

                </main>
            </div>

            {/* Renderizamos el modal pasándole los estados para abrir y cerrar */}
            <TableModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}