import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import i18n from '../i18n';
import { useAuth } from '../hooks/useAuth';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserPreferences,
  updateUserPreferences,
  getNotificationSettings,
  updateNotificationSettings as updateNotificationSettingsAPI,
  getUserCompany,
  getUserActivity,
  verifyAccountStatus
} from '../utilidades/profileAPI';

// Crear el contexto de usuario
const UserContext = createContext();

// Proveedor del contexto de usuario
export const UserProvider = ({ children }) => {
  const { isLoggedIn, user, refreshAuth } = useAuth();

  // Estados para la información del usuario
  const [userProfile, setUserProfile] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard: {
      defaultView: 'overview',
      itemsPerPage: 10,
      autoRefresh: true
    }
  });
  const [notificationSettings, setNotificationSettings] = useState({
    newMessages: true,
    systemUpdates: true,
    securityAlerts: true,
    maintenanceReminders: true,
    reportNotifications: false
  });
  const [companyInfo, setCompanyInfo] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [accountStatus, setAccountStatus] = useState({
    isVerified: false,
    isActive: true,
    lastLogin: null,
    createdAt: null
  });

  // Estados de carga y error
  const [loading, setLoading] = useState({
    profile: false,
    preferences: false,
    notifications: false,
    company: false,
    activity: false,
    account: false
  });
  const [error, setError] = useState({
    profile: null,
    preferences: null,
    notifications: null,
    company: null,
    activity: null,
    account: null
  });

  // Función para limpiar errores
  const clearError = useCallback((section) => {
    setError(prev => ({
      ...prev,
      [section]: null
    }));
  }, []);

  // Función para establecer errores
  const setErrorMessage = useCallback((section, message) => {
    setError(prev => ({
      ...prev,
      [section]: message
    }));
  }, []);

  // Cargar datos del perfil del usuario
  const loadUserProfile = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(prev => ({ ...prev, profile: true }));
      clearError('profile');

      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (err) {
      setErrorMessage('profile', err.message);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [isLoggedIn, clearError, setErrorMessage]);

  // Actualizar perfil del usuario
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      clearError('profile');

      const updatedProfile = await updateUserProfile(profileData);
      setUserProfile(prev => ({ ...prev, ...updatedProfile }));

      // Refrescar datos de autenticación si se actualizó el email
      if (profileData.email) {
        refreshAuth();
      }

      return updatedProfile;
    } catch (err) {
      setErrorMessage('profile', err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [clearError, setErrorMessage, refreshAuth]);

  // Cambiar contraseña del usuario
  const changePassword = useCallback(async (passwordData) => {
    try {
      clearError('profile');

      const result = await changeUserPassword(passwordData);
      return result;
    } catch (err) {
      setErrorMessage('profile', err.message);
      throw err;
    }
  }, [clearError, setErrorMessage]);

  // Cargar preferencias del usuario
  const loadUserPreferences = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(prev => ({ ...prev, preferences: true }));
      clearError('preferences');

      const preferences = await getUserPreferences();
      setUserPreferences(prev => ({ ...prev, ...preferences }));
    } catch (err) {
      setErrorMessage('preferences', err.message);
      console.error('Error loading user preferences:', err);
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }));
    }
  }, [isLoggedIn, clearError, setErrorMessage]);

  // Actualizar preferencias del usuario
  const updatePreferences = useCallback(async (preferences) => {
    try {
      setLoading(prev => ({ ...prev, preferences: true }));
      clearError('preferences');

      const updatedPreferences = await updateUserPreferences(preferences);
      setUserPreferences(prev => ({ ...prev, ...updatedPreferences }));
      return updatedPreferences;
    } catch (err) {
      setErrorMessage('preferences', err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }));
    }
  }, [clearError, setErrorMessage]);

  // Cargar configuración de notificaciones
  const loadNotificationSettings = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      clearError('notifications');

      const settings = await getNotificationSettings();
      setNotificationSettings(prev => ({ ...prev, ...settings }));
    } catch (err) {
      setErrorMessage('notifications', err.message);
      console.error('Error loading notification settings:', err);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [isLoggedIn, clearError, setErrorMessage]);

  // Actualizar configuración de notificaciones
  const updateNotificationSettings = useCallback(async (settings) => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      clearError('notifications');

      const updatedSettings = await updateNotificationSettingsAPI(settings);
      setNotificationSettings(prev => ({ ...prev, ...updatedSettings }));
      return updatedSettings;
    } catch (err) {
      setErrorMessage('notifications', err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [clearError, setErrorMessage]);

  // Cambiar idioma del usuario
  const changeLanguage = useCallback(async (language) => {
    try {
      // Cambiar idioma en i18n
      await i18n.changeLanguage(language);

      // Actualizar preferencias locales inmediatamente
      setUserPreferences(prev => ({
        ...prev,
        language: language
      }));

      // Si el usuario está logueado, persistir en el servidor
      if (isLoggedIn) {
        setLoading(prev => ({ ...prev, preferences: true }));
        clearError('preferences');

        const updatedPreferences = await updateUserPreferences({
          ...userPreferences,
          language: language
        });

        setUserPreferences(prev => ({ ...prev, ...updatedPreferences }));
      }
    } catch (err) {
      setErrorMessage('preferences', err.message);
      console.error('Error changing language:', err);
      throw err;
    } finally {
      if (isLoggedIn) {
        setLoading(prev => ({ ...prev, preferences: false }));
      }
    }
  }, [isLoggedIn, userPreferences, clearError, setErrorMessage]);

  // Cargar información de la empresa
  const loadCompanyInfo = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(prev => ({ ...prev, company: true }));
      clearError('company');

      const company = await getUserCompany();
      setCompanyInfo(company);
    } catch (err) {
      setErrorMessage('company', err.message);
      console.error('Error loading company info:', err);
    } finally {
      setLoading(prev => ({ ...prev, company: false }));
    }
  }, [isLoggedIn, clearError, setErrorMessage]);

  // Cargar actividad del usuario
  const loadUserActivity = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(prev => ({ ...prev, activity: true }));
      clearError('activity');

      const activity = await getUserActivity();
      setUserActivity(activity);
    } catch (err) {
      setErrorMessage('activity', err.message);
      console.error('Error loading user activity:', err);
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }
  }, [isLoggedIn, clearError, setErrorMessage]);

  // Verificar estado de la cuenta
  const loadAccountStatus = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(prev => ({ ...prev, account: true }));
      clearError('account');

      const status = await verifyAccountStatus();
      setAccountStatus(prev => ({ ...prev, ...status }));
    } catch (err) {
      setErrorMessage('account', err.message);
      console.error('Error loading account status:', err);
    } finally {
      setLoading(prev => ({ ...prev, account: false }));
    }
  }, [isLoggedIn, clearError, setErrorMessage]);

  // Cargar todos los datos del usuario
  const loadAllUserData = useCallback(async () => {
    if (!isLoggedIn) return;

    await Promise.allSettled([
      loadUserProfile(),
      loadUserPreferences(),
      loadNotificationSettings(),
      loadCompanyInfo(),
      loadUserActivity(),
      loadAccountStatus()
    ]);
  }, [isLoggedIn, loadUserProfile, loadUserPreferences, loadNotificationSettings, loadCompanyInfo, loadUserActivity, loadAccountStatus]);

  // Cargar datos cuando el usuario se loguea
  useEffect(() => {
    if (isLoggedIn && user) {
      loadAllUserData();
    } else {
      // Limpiar datos cuando no hay usuario logueado
      setUserProfile(null);
      setUserPreferences({
        theme: 'light',
        language: 'es',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          defaultView: 'overview',
          itemsPerPage: 10,
          autoRefresh: true
        }
      });
      setNotificationSettings({
        newMessages: true,
        systemUpdates: true,
        securityAlerts: true,
        maintenanceReminders: true,
        reportNotifications: false
      });
      setCompanyInfo(null);
      setUserActivity(null);
      setAccountStatus({
        isVerified: false,
        isActive: true,
        lastLogin: null,
        createdAt: null
      });
    }
  }, [isLoggedIn, user, loadAllUserData]);

  // Sincronizar idioma de i18n con las preferencias del usuario
  useEffect(() => {
    if (userPreferences.language && userPreferences.language !== i18n.language) {
      i18n.changeLanguage(userPreferences.language);
    }
  }, [userPreferences.language]);

  // Funciones de utilidad
  const getUserDisplayName = useCallback(() => {
    if (userProfile?.nomUsuario && userProfile?.apeUsuario) {
      return `${userProfile.nomUsuario} ${userProfile.apeUsuario}`;
    }
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  }, [userProfile, user]);

  const getUserInitials = useCallback(() => {
    const displayName = getUserDisplayName();
    return displayName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [getUserDisplayName]);

  const isProfileComplete = useCallback(() => {
    return !!(
      userProfile?.nomUsuario &&
      userProfile?.apeUsuario &&
      userProfile?.email &&
      userProfile?.telUsuario
    );
  }, [userProfile]);

  const getProfileCompletionPercentage = useCallback(() => {
    const fields = [
      userProfile?.nomUsuario,
      userProfile?.apeUsuario,
      userProfile?.email,
      userProfile?.telUsuario,
      userProfile?.numDocUsuario
    ];

    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [userProfile]);

  // Valor del contexto
  const contextValue = {
    // Datos del usuario
    userProfile,
    userPreferences,
    notificationSettings,
    companyInfo,
    userActivity,
    accountStatus,

    // Estados
    loading,
    error,

    // Funciones de carga
    loadUserProfile,
    loadUserPreferences,
    loadNotificationSettings,
    loadCompanyInfo,
    loadUserActivity,
    loadAccountStatus,
    loadAllUserData,

    // Funciones de actualización
    updateProfile,
    changePassword,
    updatePreferences,
    updateNotificationSettings,
    changeLanguage,

    // Funciones de utilidad
    getUserDisplayName,
    getUserInitials,
    isProfileComplete,
    getProfileCompletionPercentage,

    // Funciones de manejo de errores
    clearError,
    setErrorMessage
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar el contexto de usuario
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }

  return context;
};

export default UserContext;