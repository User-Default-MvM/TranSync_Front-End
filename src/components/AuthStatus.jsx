import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaSpinner } from 'react-icons/fa';

/**
 * Componente de ejemplo que muestra cómo usar el contexto de autenticación
 * Este componente puede ser usado en cualquier parte de la aplicación
 */
const AuthStatus = ({ showDetails = false }) => {
  const { isLoggedIn, user, userRole, loading, logout } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <FaSpinner className="animate-spin text-gray-600 dark:text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Verificando...</span>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {/* Avatar del usuario */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <FaUser className="text-white text-xs sm:text-sm" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200 truncate">
              {user.name || user.email || 'Usuario'}
            </span>
            {showDetails && (
              <span className="text-xs text-green-600 dark:text-green-400 truncate">
                {userRole}
              </span>
            )}
          </div>
        </div>

        {/* Botón de logout */}
        <button
          onClick={logout}
          className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center flex-shrink-0"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <FaSignOutAlt className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 dark:bg-red-900 rounded-lg">
      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
        <FaSignInAlt className="text-white text-xs sm:text-sm" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200 truncate">
        No autenticado
      </span>
    </div>
  );
};

export default AuthStatus;