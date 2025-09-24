import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userRole, refreshAuth } = useAuth();
  const {
    userProfile,
    loading,
    updateProfile,
    changePassword
  } = useUser();

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Estados locales para edición
  const [editData, setEditData] = useState({
    nomUsuario: '',
    apeUsuario: '',
    email: '',
    telUsuario: ''
  });

  // Inicializar datos de edición cuando se activa la edición
  useEffect(() => {
    if (isEditing && userProfile) {
      setEditData({
        nomUsuario: userProfile.nomUsuario || '',
        apeUsuario: userProfile.apeUsuario || '',
        email: userProfile.email || '',
        telUsuario: userProfile.telUsuario || ''
      });
    }
  }, [isEditing, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setMessage({ type: '', text: '' });

      await updateProfile(editData);
      setIsEditing(false);
      setMessage({
        type: 'success',
        text: 'Perfil actualizado exitosamente'
      });

      // Refrescar datos de autenticación
      refreshAuth();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al actualizar el perfil'
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      setMessage({ type: '', text: '' });

      // Validaciones
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      await changePassword(passwordData);
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMessage({
        type: 'success',
        text: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al cambiar la contraseña'
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setMessage({ type: '', text: '' });
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      'SUPERADMIN': 'Super Administrador',
      'GESTOR': 'Gestor',
      'CONDUCTOR': 'Conductor'
    };
    return roles[role] || role || 'Usuario';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return <FaShieldAlt className="text-purple-500" />;
      case 'GESTOR':
        return <FaBuilding className="text-blue-500" />;
      case 'CONDUCTOR':
        return <FaUser className="text-green-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  if (loading.profile && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getRoleIcon(userRole)}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getRoleDisplayName(userRole)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes de estado */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaExclamationTriangle className="text-red-500" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <FaUser className="text-primary-600" />
                  {t('profile.personalInfo')}
                </h2>
                {!isEditing && !isChangingPassword && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <FaEdit size={14} />
                    Editar
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Nombres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombres
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nomUsuario"
                      value={editData.nomUsuario}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Ingresa tus nombres"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FaUser className="text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {userProfile?.nomUsuario || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Apellidos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apellidos
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="apeUsuario"
                      value={editData.apeUsuario}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Ingresa tus apellidos"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FaUser className="text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {userProfile?.apeUsuario || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Ingresa tu correo electrónico"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FaEnvelope className="text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {userProfile?.email || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telUsuario"
                      value={editData.telUsuario}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Ingresa tu número de teléfono"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FaPhone className="text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {userProfile?.telUsuario || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Documento
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaIdCard className="text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {userProfile?.numDocUsuario || 'No especificado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    El número de documento no se puede modificar
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              {isEditing && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
                  >
                    <FaSave size={14} />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <FaTimes size={14} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel Lateral - Seguridad */}
          <div className="space-y-6">
            {/* Cambio de Contraseña */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FaLock className="text-primary-600" />
                {t('profile.security')}
              </h3>

              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <FaLock size={14} />
                  Cambiar Contraseña
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Contraseña actual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.current ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.new ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPasswords.confirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm rounded-lg transition-colors"
                    >
                      <FaSave size={14} />
                      {loading ? 'Cambiando...' : 'Cambiar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
                    >
                      <FaTimes size={14} />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Información de la cuenta */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-600" />
                Información de la Cuenta
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FaUser className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">ID de Usuario</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user?.id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FaBuilding className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Empresa</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Transporte La Sabana S.A.S</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Ubicación</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Bogotá, Colombia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;