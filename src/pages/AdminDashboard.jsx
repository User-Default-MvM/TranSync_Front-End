// src/pages/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaCog, FaUserShield, FaSearch, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { getUserRole } from '../utilidades/authAPI';
import adminAPI from '../utilidades/adminAPI';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

// ====================================================================
// COMPONENTE DEL FORMULARIO DE EDICIÓN (NUEVO)
// ====================================================================
const EditUserForm = ({ user, onSave, onCancel, theme }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData.idUsuario, formData.rol);
  };

  return (
    <div>
      <button onClick={onCancel} className={`flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
        <FaArrowLeft size={14} className="sm:w-4 sm:h-4"/> {t('adminDashboard.editUser.backToList')}
      </button>
      <div className={`p-4 sm:p-6 md:p-8 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t('adminDashboard.editUser.title')}</h2>
        <p className={`mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('adminDashboard.editUser.modifying')} <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{user.nomUsuario} {user.apeUsuario}</span>.</p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Fila 1: Nombre y Apellido (no editables por ahora) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('adminDashboard.editUser.name')}</label>
              <input type="text" value={formData.nomUsuario} disabled className={`text-xs sm:text-sm rounded-lg block w-full p-2 sm:p-2.5 cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-gray-400' : 'bg-gray-100 border border-gray-300 text-gray-500'}`} />
            </div>
            <div>
              <label className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('adminDashboard.editUser.lastname')}</label>
              <input type="text" value={formData.apeUsuario} disabled className={`text-xs sm:text-sm rounded-lg block w-full p-2 sm:p-2.5 cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-gray-400' : 'bg-gray-100 border border-gray-300 text-gray-500'}`} />
            </div>
          </div>

          {/* Fila 2: Rol (editable) */}
          <div>
            <label htmlFor="role-select" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('adminDashboard.editUser.role')}</label>
            <select
              id="role-select"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className={`text-xs sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 sm:p-2.5 ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
            >
              <option value="CONDUCTOR">{t('adminDashboard.editUser.conductor')}</option>
              <option value="GESTOR">{t('adminDashboard.editUser.gestor')}</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-3 sm:pt-4">
            <button type="button" onClick={onCancel} className={`py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition text-sm sm:text-base ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>{t('adminDashboard.editUser.cancel')}</button>
            <button type="submit" className="py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white text-sm sm:text-base">{t('adminDashboard.editUser.updateRole')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// COMPONENTE PRINCIPAL DEL DASHBOARD
// ====================================================================
const AdminDashboard = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null); // <-- Controla si mostramos la lista o el formulario

  useEffect(() => {
    const role = getUserRole();
    if (role === 'SUPERADMIN') {
      loadUsers();
    } else {
      setLoading(false);
      setError(t('adminDashboard.messages.noPermission'));
    }
  }, [t]);

  useEffect(() => {
    const filtered = searchTerm
      ? usuarios.filter(u =>
        (u.nomUsuario + ' ' + u.apeUsuario).toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.numDocUsuario?.includes(searchTerm)
      )
      : usuarios;
    setFilteredUsuarios(filtered);
  }, [searchTerm, usuarios]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers();
      setUsuarios(data || []);
      setError('');
    } catch (err) {
      setError('Error al cargar la lista de usuarios');
      toast.error('No se pudo cargar la lista de usuarios.', {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (idUsuario) => {
    console.log(`%cPASO 1: Botón presionado. Intentando eliminar usuario con ID: ${idUsuario}`, 'color: yellow; font-weight: bold;');

    toast((t) => (
      <div className="flex flex-col items-center gap-3 p-2">
        <p className="font-semibold text-white">¿Estás seguro?</p>
        <p className="text-sm text-center text-gray-300">Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 mt-2">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
            onClick={() => {
              toast.dismiss(t.id);
              const promise = adminAPI.deleteUser(idUsuario).then(() => {
                setUsuarios(prev => prev.filter(u => u.idUsuario !== idUsuario));
              });

              toast.promise(promise, {
                loading: 'Eliminando usuario...',
                success: 'Usuario eliminado exitosamente.',
                error: 'No se pudo eliminar el usuario.',
              }, {
                duration: 5000,
              });
            }}
          >
            Eliminar
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      style: { background: '#374151', color: '#F9FAFB', borderRadius: '10px' },
      duration: 5000,
    });
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
  };

  const handleUpdateUser = (idUsuario, nuevoRol) => {
    const promise = adminAPI.updateUserRole(idUsuario, nuevoRol).then(() => {
      setEditingUser(null); // Volver a la lista
      loadUsers();
    });

    toast.promise(promise, {
      loading: 'Actualizando rol...',
      success: 'Rol actualizado exitosamente.',
      error: 'No se pudo actualizar el rol.',
    }, {
      duration: 5000,
    });
  };

  const formatRole = (role) => ({ 'SUPERADMIN': 'Super Admin', 'GESTOR': 'Gestor', 'CONDUCTOR': 'Conductor' }[role] || role);

  const getStats = () => ({
    total: usuarios.length,
    gestorCount: usuarios.filter(u => u.rol === 'GESTOR').length,
    conductorCount: usuarios.filter(u => u.rol === 'CONDUCTOR').length,
    activosCount: usuarios.filter(u => u.estActivo).length,
  });

  if (loading) return <div className={`p-8 min-h-screen text-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>{t('adminDashboard.messages.loading')}</div>;

  const stats = getStats();

  return (
    <div className={`p-2 sm:p-4 md:p-6 lg:p-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-surface-light text-text-primary-light'}`}>
      {editingUser ? (
        // VISTA DE FORMULARIO DE EDICIÓN
        <EditUserForm
          user={editingUser}
          onSave={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
          theme={theme}
        />
      ) : (
        // VISTA DE LISTA DE USUARIOS
        <>
          <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{t('adminDashboard.title')}</h1>
          <p className={`mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>{t('adminDashboard.subtitle')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            <div className={`p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg min-h-[80px] sm:min-h-[90px] md:min-h-[100px] flex flex-col justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
              <FaUsers className="text-blue-500 mb-1 sm:mb-2 mx-auto md:mx-0" size={16} />
              <h3 className={`text-lg sm:text-xl md:text-2xl font-semibold text-center md:text-left ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{stats.total}</h3>
              <p className={`text-xs sm:text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.stats.totalUsers')}</p>
            </div>
            <div className={`p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg min-h-[80px] sm:min-h-[90px] md:min-h-[100px] flex flex-col justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
              <FaUserShield className="text-green-500 mb-1 sm:mb-2 mx-auto md:mx-0" size={16} />
              <h3 className={`text-lg sm:text-xl md:text-2xl font-semibold text-center md:text-left ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{stats.gestorCount}</h3>
              <p className={`text-xs sm:text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.stats.managers')}</p>
            </div>
            <div className={`p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg min-h-[80px] sm:min-h-[90px] md:min-h-[100px] flex flex-col justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
              <FaCog className="text-yellow-500 mb-1 sm:mb-2 mx-auto md:mx-0" size={16} />
              <h3 className={`text-lg sm:text-xl md:text-2xl font-semibold text-center md:text-left ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{stats.conductorCount}</h3>
              <p className={`text-xs sm:text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.stats.drivers')}</p>
            </div>
            <div className={`p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg min-h-[80px] sm:min-h-[90px] md:min-h-[100px] flex flex-col justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
              <div className="text-purple-500 mb-1 sm:mb-2 mx-auto md:mx-0 text-lg sm:text-xl">✅</div>
              <h3 className={`text-lg sm:text-xl md:text-2xl font-semibold text-center md:text-left ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{stats.activosCount}</h3>
              <p className={`text-xs sm:text-sm text-center md:text-left ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.stats.active')}</p>
            </div>
          </div>

          <div className={`p-2 sm:p-3 md:p-4 rounded-lg mb-3 sm:mb-4 md:mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
            <div className="relative w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
              <FaSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder={t('adminDashboard.search.placeholder')}
                className={`pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-h-[40px] sm:min-h-[44px] text-sm sm:text-base ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-surface-light text-text-primary-light'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className={`text-center mb-4 p-3 rounded-lg ${theme === 'dark' ? 'text-red-400 bg-red-900/50' : 'text-red-600 bg-red-50'}`}>
              {error}
              <button onClick={loadUsers} className={`underline ml-2 min-h-[44px] px-3 py-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-red-800' : 'hover:bg-red-100'}`}>
                Reintentar
              </button>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3 sm:space-y-4 mb-3 sm:mb-4 md:mb-6">
            {loading ? (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
                <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Cargando usuarios...</p>
              </div>
            ) : filteredUsuarios.length > 0 ? (
              filteredUsuarios.map(u => (
                <div key={u.idUsuario} className={`rounded-xl shadow-sm border p-3 sm:p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-background-light border-border-light'}`}>
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-xs sm:text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>
                        {u.nomUsuario} {u.apeUsuario}
                      </h3>
                      <p className={`text-xs mt-0.5 sm:mt-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>
                        {u.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 sm:gap-2 ml-2">
                      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${u.rol === 'GESTOR' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'}`}>
                        {formatRole(u.rol)}
                      </span>
                      <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${u.estActivo ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>
                        {u.estActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Documento:</span>
                      <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{u.numDocUsuario}</span>
                    </div>
                  </div>

                  <div className={`flex justify-end gap-1 sm:gap-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                    <button
                      onClick={() => handleEditUser(u)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-surface-light'}`}
                      title="Editar usuario"
                    >
                      <FaEdit size={14} className="sm:w-4 sm:h-4"/>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.idUsuario)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-surface-light'}`}
                      title="Eliminar usuario"
                    >
                      <FaTrash size={14} className="sm:w-4 sm:h-4"/>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-10 md:py-12">
                <div className={`text-3xl sm:text-4xl mb-3 sm:mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>👥</div>
                <p className={`mb-1 sm:mb-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>No se encontraron usuarios</p>
                {searchTerm && (
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-text-secondary-light'}`}>
                    Intenta con otros términos de búsqueda
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className={`hidden md:block overflow-x-auto rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                  <th className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.table.name')}</th>
                  <th className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.table.email')}</th>
                  <th className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.table.document')}</th>
                  <th className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.table.role')}</th>
                  <th className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.table.status')}</th>
                  <th className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{t('adminDashboard.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className={`text-center p-6 sm:p-8 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      Cargando...
                    </td>
                  </tr>
                ) : filteredUsuarios.length > 0 ? (
                  filteredUsuarios.map(u => (
                    <tr key={u.idUsuario} className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-border-light hover:bg-surface-light'}`}>
                      <td className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{u.nomUsuario} {u.apeUsuario}</td>
                      <td className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{u.email}</td>
                      <td className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{u.numDocUsuario}</td>
                      <td className="p-2 sm:p-3 md:p-4">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${u.rol === 'GESTOR' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'}`}>
                          {formatRole(u.rol)}
                        </span>
                      </td>
                      <td className={`p-2 sm:p-3 md:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary-light'}`}>{u.estActivo ? 'Activo' : 'Inactivo'}</td>
                      <td className="p-2 sm:p-3 md:p-4">
                        <button onClick={() => handleEditUser(u)} className={`mr-2 sm:mr-4 min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' : 'text-blue-600 hover:text-blue-700 hover:bg-surface-light'}`}>
                          <FaEdit size={14} className="sm:w-4 sm:h-4"/>
                        </button>
                        <button onClick={() => handleDeleteUser(u.idUsuario)} className={`min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' : 'text-red-600 hover:text-red-700 hover:bg-surface-light'}`}>
                          <FaTrash size={14} className="sm:w-4 sm:h-4"/>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={`text-center p-6 sm:p-8 ${theme === 'dark' ? 'text-gray-500' : 'text-text-secondary-light'}`}>{t('adminDashboard.messages.noUsersFound')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;