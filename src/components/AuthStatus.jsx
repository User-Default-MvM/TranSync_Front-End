import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaSpinner, FaTools, FaBug } from 'react-icons/fa';
import { diagnoseConnection } from '../utilidades/authAPI';

/**
 * Componente de ejemplo que muestra cómo usar el contexto de autenticación
 * Este componente puede ser usado en cualquier parte de la aplicación
 */
const AuthStatus = ({ showDetails = false }) => {
  const { isLoggedIn, user, userRole, loading, logout, recoverUserData } = useAuthContext();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const runDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const result = await diagnoseConnection();
      setDiagnostics(result);
    } catch (error) {
      setDiagnostics({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const handleRecoverUserData = async () => {
    setRecovering(true);
    try {
      const recovered = await recoverUserData();
      if (recovered) {
        setShowDiagnostics(false);
      }
    } catch (error) {
      console.error('Error recovering user data:', error);
    } finally {
      setRecovering(false);
    }
  };

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

  // Estado de error o datos incompletos
  if (isLoggedIn && !user) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
            <FaUser className="text-white text-xs sm:text-sm" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200 truncate">
              Error: Usuario no encontrado
            </span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400 truncate">
              Intente recargar la página
            </span>
          </div>
        </div>

        {/* Botón de recuperación */}
        <button
          onClick={handleRecoverUserData}
          disabled={recovering}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-xs sm:text-sm disabled:opacity-50"
          title="Recuperar datos del usuario"
        >
          <FaSpinner className={`w-3 h-3 sm:w-4 sm:h-4 ${recovering ? 'animate-spin' : ''}`} />
          <span>{recovering ? 'Recuperando...' : 'Recuperar Usuario'}</span>
        </button>

        {/* Botón de diagnóstico */}
        <button
          onClick={() => {
            setShowDiagnostics(!showDiagnostics);
            if (!diagnostics) runDiagnostics();
          }}
          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-xs sm:text-sm"
          title="Ejecutar diagnóstico de conexión"
        >
          <FaBug className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Diagnóstico</span>
        </button>

        {/* Panel de diagnóstico */}
        {showDiagnostics && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            {diagnosticsLoading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin w-4 h-4" />
                <span className="text-sm">Ejecutando diagnóstico...</span>
              </div>
            ) : diagnostics ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resultados del diagnóstico:</span>
                  <button
                    onClick={() => setShowDiagnostics(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                {diagnostics.issues && diagnostics.issues.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                    <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Problemas detectados:</div>
                    {diagnostics.issues.map((issue, index) => (
                      <div key={index} className="text-xs text-red-700 dark:text-red-300">• {issue}</div>
                    ))}
                  </div>
                )}

                <div className="text-xs space-y-1">
                  <div><strong>Backend Health:</strong> {diagnostics.backend?.health?.ok ? '✅ OK' : '❌ Error'}</div>
                  <div><strong>Login Endpoint:</strong> {diagnostics.backend?.loginEndpoint?.ok ? '✅ Accesible' : '❌ Error'}</div>
                  <div><strong>CORS:</strong> {diagnostics.backend?.corsTest?.note || (diagnostics.backend?.corsTest?.ok ? '✅ OK' : '❌ Error')}</div>
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer font-medium">Detalles técnicos</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(diagnostics, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}
          </div>
        )}
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