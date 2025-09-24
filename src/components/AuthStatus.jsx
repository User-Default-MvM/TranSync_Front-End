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
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <FaSpinner className="animate-spin text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Verificando...</span>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-3">
        {/* Avatar del usuario */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {user.name || user.email || 'Usuario'}
            </span>
            {showDetails && (
              <span className="text-xs text-green-600 dark:text-green-400">
                {userRole}
              </span>
            )}
          </div>
        </div>

        {/* Botón de logout */}
        <button
          onClick={logout}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <FaSignOutAlt />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 rounded-lg">
      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
        <FaSignInAlt className="text-white text-sm" />
      </div>
      <span className="text-sm font-medium text-red-800 dark:text-red-200">
        No autenticado
      </span>
    </div>
  );
};

export default AuthStatus;