import React from 'react'
import { Link } from 'react-router-dom'
import FAIcon from '../commons/FAIcon'
import { useLogout } from '../../hooks/auth/useLogout'

// Sidebar con navegación. En móvil/tableta se comporta como panel deslizante.
const Sidebar = ({ activeMenu, isOpen, onClose }) => {
  const { logout, loading } = useLogout()

  const menuItems = [
    { id: 'activity', label: 'Actividad', icon: 'chart-line', path: '/dashboard' },
    { id: 'orders', label: 'Combos', icon: 'shopping-bag', path: '/combos' },
    { id: 'drinks', label: 'Bebidas', icon: 'wine-glass', path: '/drinks' },
    { id: 'dishes', label: 'Platillo', icon: 'utensils', path: '/dishes' },
    { id: 'extras', label: 'Extras', icon: 'star', path: '/extras' },
    { id: 'inventory', label: 'Inventario', icon: 'box', path: '/inventario' },
    { id: 'tables', label: 'Mesas', icon: 'chair', path: '/mesas' },
    { id: 'clients', label: 'Clientes', icon: 'users', path: '/clients' },
    { id: 'staff', label: 'Empleados', icon: 'user-tie', path: '/employees' },
    { id: 'orders-list', label: 'Pedidos', icon: 'list', path: '/pedidos' },
    { id: 'invite-staff', label: 'Invitar staff', icon: 'users', path: '/InviteStaff' },
  ]

  const handleLogout = async (e) => {
    e.preventDefault()
    if (loading) return
    await logout()
  }

  return (
    <>
      {/* Sidebar para escritorio: siempre visible, estático */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-30 h-20 flex items-center justify-center">
              <img src="../public/logo.png" className="h-30 w-60" alt="Logo" />
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeMenu === item.id
                  ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FAIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FAIcon icon="sign-out-alt" />
            <span>{loading ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar móvil/tableta: panel deslizante con transición */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="w-30 h-20 flex items-center justify-center">
              <img src="../public/logo.png" className="h-30 w-60" alt="Logo" />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Cerrar menú"
            >
              <FAIcon icon="times" size="lg" />
            </button>
          </div>

          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeMenu === item.id
                    ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FAIcon icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FAIcon icon="sign-out-alt" />
              <span>{loading ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar