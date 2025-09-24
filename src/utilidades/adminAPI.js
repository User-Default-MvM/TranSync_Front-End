// src/utilidades/adminAPI.js - API para funciones de administración
import { apiClient, apiUtils } from '../api/baseAPI';

const adminAPI = {
  // ================================
  // GESTIÓN DE USUARIOS
  // ================================

  // Listar conductores y usuarios pendientes
  getUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      // Agregar filtros si existen
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Listar conductores y gestores
  getConductoresYGestionadores: async () => {
    try {
      const response = await apiClient.get('/api/admin/conductores-gestores');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      const response = await apiClient.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar rol de usuario
  updateUserRole: async (userId, newRole) => {
    try {
      if (!userId || !newRole) {
        throw new Error('ID de usuario y nuevo rol son requeridos');
      }

      const response = await apiClient.put(`/api/admin/users/${userId}/role`, {
        nuevoRol: newRole
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ROLES Y PERMISOS
  // ================================

  // Obtener todos los roles disponibles
  getRoles: async () => {
    try {
      const response = await apiClient.get('/api/admin/roles');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nuevo rol
  createRole: async (roleData) => {
    try {
      const { name, description, permissions } = roleData;

      if (!name) {
        throw new Error('Nombre del rol es requerido');
      }

      const response = await apiClient.post('/api/admin/roles', {
        name: name.trim(),
        description: description?.trim() || '',
        permissions: permissions || []
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar rol
  updateRole: async (roleId, roleData) => {
    try {
      if (!roleId) {
        throw new Error('ID del rol requerido');
      }

      const response = await apiClient.put(`/api/admin/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar rol
  deleteRole: async (roleId) => {
    try {
      if (!roleId) {
        throw new Error('ID del rol requerido');
      }

      const response = await apiClient.delete(`/api/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // ESTADÍSTICAS Y REPORTES
  // ================================

  // Obtener estadísticas generales
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/api/admin/stats/users');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas de sistema
  getSystemStats: async () => {
    try {
      const response = await apiClient.get('/api/admin/stats/system');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // CONFIGURACIÓN DEL SISTEMA
  // ================================

  // Obtener configuración del sistema
  getSystemConfig: async () => {
    try {
      const response = await apiClient.get('/api/admin/config');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar configuración del sistema
  updateSystemConfig: async (configData) => {
    try {
      const response = await apiClient.put('/api/admin/config', configData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // AUDITORÍA Y LOGS
  // ================================

  // Obtener logs del sistema
  getSystemLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.level) params.append('level', filters.level);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const endpoint = `/api/admin/logs${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener logs de auditoría
  getAuditLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const queryString = params.toString();
      const endpoint = `/api/admin/audit${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES
  // ================================

  // Verificar permisos de administrador
  checkAdminAccess: async () => {
    try {
      const response = await apiClient.get('/api/admin/access-check');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Health check del sistema de administración
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/api/admin/health');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

// Exportaciones individuales para compatibilidad
export const {
  getUsers,
  getConductoresYGestionadores,
  deleteUser,
  updateUserRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getStats,
  getUserStats,
  getSystemStats,
  getSystemConfig,
  updateSystemConfig,
  getSystemLogs,
  getAuditLogs,
  checkAdminAccess,
  healthCheck
} = adminAPI;

export default adminAPI;