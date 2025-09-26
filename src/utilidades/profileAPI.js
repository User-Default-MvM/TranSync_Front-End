// src/utilidades/profileAPI.js - APIs específicas para gestión de perfil de usuario
import { apiClient, apiUtils } from '../api/baseAPI';

/**
 * API para gestión de perfil de usuario
 * Funcionalidades específicas para la gestión de datos personales
 */
const profileAPI = {
  // ================================
  // GESTIÓN DE PERFIL BÁSICO
  // ================================

  /**
   * Obtener datos completos del perfil del usuario
   * @returns {Promise<Object>} Datos del perfil del usuario
   */
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/profile');

      // El backend devuelve los datos en response.data.data
      const profileData = response.data.data || response.data;

      return profileData;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar información básica del perfil
   * @param {Object} profileData - Datos a actualizar
   * @param {string} profileData.nomUsuario - Nombres del usuario
   * @param {string} profileData.apeUsuario - Apellidos del usuario
   * @param {string} profileData.email - Correo electrónico
   * @param {string} profileData.telUsuario - Teléfono del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateUserProfile: async (profileData) => {
    try {
      // Validaciones
      if (!profileData.nomUsuario || !profileData.apeUsuario) {
        throw new Error('Nombres y apellidos son requeridos');
      }

      if (profileData.email && !apiUtils.isValidEmail(profileData.email)) {
        throw new Error('Formato de email inválido');
      }

      if (profileData.telUsuario && !/^\+?[\d\s-()]+$/.test(profileData.telUsuario)) {
        throw new Error('Formato de teléfono inválido');
      }

      const response = await apiClient.put('/api/user/profile', {
        nomUsuario: profileData.nomUsuario.trim(),
        apeUsuario: profileData.apeUsuario.trim(),
        email: profileData.email?.trim().toLowerCase(),
        telUsuario: profileData.telUsuario?.trim()
      }, { timeout: 10000 }); // Timeout reducido a 10 segundos

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Cambiar contraseña del usuario
   * @param {Object} passwordData - Datos de la contraseña
   * @param {string} passwordData.currentPassword - Contraseña actual
   * @param {string} passwordData.newPassword - Nueva contraseña
   * @param {string} passwordData.confirmPassword - Confirmación de nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   */
  changeUserPassword: async (passwordData) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Validaciones
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Todos los campos de contraseña son requeridos');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      if (currentPassword === newPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }

      const response = await apiClient.put('/api/user/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      }, { timeout: 10000 }); // Timeout reducido a 10 segundos

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE PREFERENCIAS
  // ================================

  /**
   * Obtener preferencias del usuario
   * @returns {Promise<Object>} Preferencias del usuario
   */
  getUserPreferences: async () => {
    try {
      const response = await apiClient.get('/api/user/preferences');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar preferencias del usuario
   * @param {Object} preferences - Preferencias a actualizar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateUserPreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/api/user/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE NOTIFICACIONES
  // ================================

  /**
   * Obtener configuración de notificaciones
   * @returns {Promise<Object>} Configuración de notificaciones
   */
  getNotificationSettings: async () => {
    try {
      const response = await apiClient.get('/api/user/notifications/settings');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar configuración de notificaciones
   * @param {Object} settings - Configuración de notificaciones
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateNotificationSettings: async (settings) => {
    try {
      const response = await apiClient.put('/api/user/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE EMPRESA
  // ================================

  /**
   * Obtener información de la empresa del usuario
   * @returns {Promise<Object>} Información de la empresa
   */
  getUserCompany: async () => {
    try {
      const response = await apiClient.get('/api/user/company');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar información de la empresa (solo para gestores)
   * @param {Object} companyData - Datos de la empresa
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateCompanyInfo: async (companyData) => {
    try {
      const response = await apiClient.put('/api/user/company', companyData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // ESTADÍSTICAS Y ACTIVIDAD
  // ================================

  /**
   * Obtener estadísticas de actividad del usuario
   * @returns {Promise<Object>} Estadísticas de actividad
   */
  getUserActivity: async () => {
    try {
      const response = await apiClient.get('/api/user/activity');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener historial de sesiones del usuario
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Historial de sesiones
   */
  getUserSessions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiClient.get(`/api/user/sessions?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Cerrar todas las sesiones activas (excepto la actual)
   * @returns {Promise<Object>} Respuesta del servidor
   */
  logoutAllSessions: async () => {
    try {
      const response = await apiClient.post('/api/user/sessions/logout-all');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // VERIFICACIÓN Y SEGURIDAD
  // ================================

  /**
   * Verificar estado de la cuenta
   * @returns {Promise<Object>} Estado de la cuenta
   */
  verifyAccountStatus: async () => {
    try {
      const response = await apiClient.get('/api/user/account-status');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Solicitar verificación de email
   * @param {string} email - Email a verificar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  requestEmailVerification: async (email) => {
    try {
      if (!email) {
        throw new Error('Email es requerido');
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      const response = await apiClient.post('/api/user/request-verification', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Verificar email con token
   * @param {string} token - Token de verificación
   * @returns {Promise<Object>} Respuesta del servidor
   */
  verifyEmail: async (token) => {
    try {
      if (!token) {
        throw new Error('Token de verificación requerido');
      }

      const response = await apiClient.post('/api/user/verify-email', { token });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // EXPORTAR DATOS
  // ================================

  /**
   * Exportar datos del usuario
   * @param {string} format - Formato de exportación (json, csv, pdf)
   * @returns {Promise<Object>} Datos exportados
   */
  exportUserData: async (format = 'json') => {
    try {
      const response = await apiClient.get(`/api/user/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Solicitar eliminación de cuenta
   * @param {string} reason - Razón de la eliminación
   * @returns {Promise<Object>} Respuesta del servidor
   */
  requestAccountDeletion: async (reason = '') => {
    try {
      const response = await apiClient.post('/api/user/request-deletion', {
        reason: reason.trim()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// Exportaciones
export default profileAPI;
export const {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserPreferences,
  updateUserPreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getUserCompany,
  updateCompanyInfo,
  getUserActivity,
  getUserSessions,
  logoutAllSessions,
  verifyAccountStatus,
  requestEmailVerification,
  verifyEmail,
  exportUserData,
  requestAccountDeletion
} = profileAPI;