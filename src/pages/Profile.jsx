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

  // Estados para validación de contraseña
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados locales para edición
  const [editData, setEditData] = useState({
    nomUsuario: '',
    apeUsuario: '',
    email: '',
    telUsuario: ''
  });

  // Estados para errores de validación
  const [editErrors, setEditErrors] = useState({
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

    // Validación en tiempo real
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nomUsuario':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'apeUsuario':
        if (!value.trim()) {
          error = 'Los apellidos son requeridos';
        } else if (value.trim().length < 2) {
          error = 'Los apellidos deben tener al menos 2 caracteres';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Ingresa un correo electrónico válido';
        }
        break;
      case 'telUsuario':
        if (value.trim() && !/^\d{7,15}$/.test(value.replace(/\s+/g, ''))) {
          error = 'Ingresa un número de teléfono válido (solo dígitos, 7-15 caracteres)';
        }
        break;
      default:
        break;
    }

    setEditErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación en tiempo real
    validatePasswordField(name, value);
  };

  const validatePasswordField = (name, value) => {
    let error = '';

    switch (name) {
      case 'currentPassword':
        if (!value.trim()) {
          error = 'La contraseña actual es requerida';
        }
        break;
      case 'newPassword':
        if (!value.trim()) {
          error = 'La nueva contraseña es requerida';
        } else if (value.length < 6) {
          error = 'La contraseña debe tener al menos 6 caracteres';
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          error = 'La confirmación de contraseña es requerida';
        } else if (value !== passwordData.newPassword) {
          error = 'Las contraseñas no coinciden';
        }
        break;
      default:
        break;
    }

    setPasswordErrors(prev => ({
      ...prev,
      [name]: error
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

      // Validar todos los campos antes de guardar
      const errors = {};
      Object.keys(editData).forEach(key => {
        validateField(key, editData[key]);
        if (editErrors[key]) {
          errors[key] = editErrors[key];
        }
      });

      // Si hay errores, no continuar
      if (Object.keys(errors).length > 0) {
        setMessage({
          type: 'error',
          text: 'Por favor corrige los errores en el formulario'
        });
        return;
      }

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

      // Validar todos los campos antes de enviar
      const errors = {};
      Object.keys(passwordData).forEach(key => {
        validatePasswordField(key, passwordData[key]);
        if (passwordErrors[key]) {
          errors[key] = passwordErrors[key];
        }
      });

      // Si hay errores, no continuar
      if (Object.keys(errors).length > 0) {
        setMessage({
          type: 'error',
          text: 'Por favor corrige los errores en el formulario'
        });
        return;
      }

      await changePassword(passwordData);
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({
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

    // Limpiar errores de validación
    setEditErrors({
      nomUsuario: '',
      apeUsuario: '',
      email: '',
      telUsuario: ''
    });

    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Limpiar datos de formularios
    setEditData({
      nomUsuario: '',
      apeUsuario: '',
      email: '',
      telUsuario: ''
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
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
      <div className="min-h-screen bg-surface-light dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-400">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-gray-900">
      {/* Header */}
      <div className="bg-background-light dark:bg-gray-800 shadow-sm border-b border-border-light dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 sm:p-2 text-text-secondary-light dark:text-gray-400 hover:text-text-primary-light dark:hover:text-gray-100 hover:bg-surface-light dark:hover:bg-gray-700 rounded-md sm:rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex-shrink-0"
              >
                <FaArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary-light dark:text-gray-100 truncate">{t('profile.title')}</h1>
                <p className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-400 truncate">{t('profile.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0">
              {getRoleIcon(userRole)}
              <span className="text-xs sm:text-sm font-medium text-text-primary-light dark:text-gray-300 truncate">
                {getRoleDisplayName(userRole)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Mensajes de estado */}
        {message.text && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
            message.type === 'success'
              ? 'bg-surface-light dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-border-light dark:border-green-800'
              : 'bg-surface-light dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-border-light dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <FaCheckCircle className="text-green-500 flex-shrink-0" />
            ) : (
              <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <div className="bg-background-light dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-border-light dark:border-gray-700 p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-text-primary-light dark:text-gray-100 flex items-center gap-2 sm:gap-3">
                  <FaUser className="text-primary-600 flex-shrink-0" />
                  <span className="truncate">{t('profile.personalInfo')}</span>
                </h2>
                {!isEditing && !isChangingPassword && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-md sm:rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors min-h-[40px] sm:min-h-[44px]"
                  >
                    <FaEdit size={12} className="sm:w-[14px] sm:h-[14px]" />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Nombres */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    Nombres
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="nomUsuario"
                        value={editData.nomUsuario}
                        onChange={handleInputChange}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-100 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
                          editErrors.nomUsuario
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-border-light dark:border-gray-600'
                        }`}
                        placeholder="Ingresa tus nombres"
                      />
                      {editErrors.nomUsuario && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{editErrors.nomUsuario}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                      <FaUser className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                      <span className="text-text-primary-light dark:text-gray-100 text-sm sm:text-base truncate">
                        {userProfile?.nomUsuario || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Apellidos */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    Apellidos
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="apeUsuario"
                        value={editData.apeUsuario}
                        onChange={handleInputChange}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-100 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
                          editErrors.apeUsuario
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-border-light dark:border-gray-600'
                        }`}
                        placeholder="Ingresa tus apellidos"
                      />
                      {editErrors.apeUsuario && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{editErrors.apeUsuario}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                      <FaUser className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                      <span className="text-text-primary-light dark:text-gray-100 text-sm sm:text-base truncate">
                        {userProfile?.apeUsuario || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleInputChange}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-100 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
                          editErrors.email
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-border-light dark:border-gray-600'
                        }`}
                        placeholder="Ingresa tu correo electrónico"
                      />
                      {editErrors.email && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{editErrors.email}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                      <FaEnvelope className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                      <span className="text-text-primary-light dark:text-gray-100 text-sm sm:text-base truncate">
                        {userProfile?.email || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        name="telUsuario"
                        value={editData.telUsuario}
                        onChange={handleInputChange}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-100 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
                          editErrors.telUsuario
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-border-light dark:border-gray-600'
                        }`}
                        placeholder="Ingresa tu número de teléfono"
                      />
                      {editErrors.telUsuario && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{editErrors.telUsuario}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                      <FaPhone className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                      <span className="text-text-primary-light dark:text-gray-100 text-sm sm:text-base truncate">
                        {userProfile?.telUsuario || 'No especificado'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Documento */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    Número de Documento
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                    <FaIdCard className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                    <span className="text-text-primary-light dark:text-gray-100 text-sm sm:text-base truncate">
                      {userProfile?.numDocUsuario || 'No especificado'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-gray-400 mt-1">
                    El número de documento no se puede modificar
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-border-light dark:border-gray-700">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading.profile}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-md sm:rounded-lg transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                  >
                    <FaSave size={12} className="sm:w-[14px] sm:h-[14px]" />
                    <span>{loading.profile ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading.profile}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-surface-light dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-text-primary-light dark:text-gray-300 rounded-md sm:rounded-lg transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                  >
                    <FaTimes size={12} className="sm:w-[14px] sm:h-[14px]" />
                    <span>{loading.profile ? 'Procesando...' : 'Cancelar'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel Lateral - Seguridad */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Cambio de Contraseña */}
            <div className="bg-background-light dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-border-light dark:border-gray-700 p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-text-primary-light dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                <FaLock className="text-primary-600 flex-shrink-0" />
                <span className="truncate">{t('profile.security')}</span>
              </h3>

              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-md sm:rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                >
                  <FaLock size={12} className="sm:w-[14px] sm:h-[14px]" />
                  <span>Cambiar Contraseña</span>
                </button>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Contraseña actual */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 pr-8 sm:pr-10 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-100 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
                          passwordErrors.currentPassword
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-border-light dark:border-gray-600'
                        }`}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-gray-400 hover:text-text-primary-light dark:hover:text-gray-300"
                        aria-label={showPasswords.current ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                      >
                        {showPasswords.current ? <FaEyeSlash size={14} className="sm:w-[16px] sm:h-[16px]" /> : <FaEye size={14} className="sm:w-[16px] sm:h-[16px]" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* Nueva contraseña */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 pr-8 sm:pr-10 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-100 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
                          passwordErrors.newPassword
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-border-light dark:border-gray-600'
                        }`}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-gray-400 hover:text-text-primary-light dark:hover:text-gray-300"
                        aria-label={showPasswords.new ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                      >
                        {showPasswords.new ? <FaEyeSlash size={14} className="sm:w-[16px] sm:h-[16px]" /> : <FaEye size={14} className="sm:w-[16px] sm:h-[16px]" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 pr-8 sm:pr-10 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-100 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] md:min-h-[48px] ${
                          passwordErrors.confirmPassword
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-border-light dark:border-gray-600'
                        }`}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-gray-400 hover:text-text-primary-light dark:hover:text-gray-300"
                        aria-label={showPasswords.confirm ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                      >
                        {showPasswords.confirm ? <FaEyeSlash size={14} className="sm:w-[16px] sm:h-[16px]" /> : <FaEye size={14} className="sm:w-[16px] sm:h-[16px]" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading.profile}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-xs sm:text-sm rounded-md sm:rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                    >
                      <FaSave size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span>{loading.profile ? 'Cambiando...' : 'Cambiar'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading.profile}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 bg-surface-light dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-text-primary-light dark:text-gray-300 text-xs sm:text-sm rounded-md sm:rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                    >
                      <FaTimes size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span>{loading.profile ? 'Procesando...' : 'Cancelar'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Información de la cuenta */}
            <div className="bg-background-light dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-border-light dark:border-gray-700 p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-text-primary-light dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-600 flex-shrink-0" />
                <span className="truncate">Información de la Cuenta</span>
              </h3>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                  <FaUser className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-text-primary-light dark:text-gray-100 truncate">ID de Usuario</p>
                    <p className="text-xs text-text-secondary-light dark:text-gray-400 truncate">{user?.id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                  <FaBuilding className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-text-primary-light dark:text-gray-100 truncate">Empresa</p>
                    <p className="text-xs text-text-secondary-light dark:text-gray-400 truncate">Transporte La Sabana S.A.S</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-light dark:bg-gray-700 rounded-md sm:rounded-lg min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
                  <FaMapMarkerAlt className="text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-text-primary-light dark:text-gray-100 truncate">Ubicación</p>
                    <p className="text-xs text-text-secondary-light dark:text-gray-400 truncate">Bogotá, Colombia</p>
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