// src/components/layout/TopBar.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';
import { useAuth } from '../../hooks/auth/useAuth';

const ROLE_LABELS = {
  admin: 'Administrador',
  employee: 'Empleado',
  customer: 'Cliente',
};

const getInitials = (name, lastname) => {
  const first = name?.trim()?.[0] || '';
  const second = lastname?.trim()?.[0] || '';
  return (first + second).toUpperCase() || '?';
};

const TopBar = ({ onMenuClick }) => {
  const { user, isLoading } = useAuth();

  const fullName = user ? `${user.name || ''} ${user.lastname || ''}`.trim() : '';
  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role) : '';

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-white/80 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between
      shadow-[0_4px_20px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.7)]
    ">
      <button
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-colors mr-2"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <FAIcon icon="bars" size="lg" />
      </button>

      <div className="flex-1 max-w-md" />

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <FAIcon icon="bell" size="lg" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-sm" />
        </button>

        <button className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <FAIcon icon="cog" size="lg" />
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-3 pr-4 py-1.5 ml-2 rounded-full bg-white border border-white/80
          shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.6)]
        ">
          {isLoading ? (
            <>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-col text-xs sm:text-sm hidden sm:flex gap-1">
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-14 h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            </>
          ) : (
            <>
              {user?.image ? (
                <img
                  src={user.image}
                  alt={fullName}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/80 shadow-sm"
                />
              ) : (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-display font-semibold text-xs sm:text-sm ring-2 ring-white/80 shadow-sm">
                  {getInitials(user?.name, user?.lastname)}
                </div>
              )}
              <div className="relative flex-col text-xs sm:text-sm hidden sm:flex">
                <span className="font-display font-semibold text-gray-900 leading-tight">{fullName || 'Usuario'}</span>
                <span className="text-xs text-gray-500 font-sans">{roleLabel}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;