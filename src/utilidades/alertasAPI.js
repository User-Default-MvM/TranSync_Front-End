// src/utilidades/alertasAPI.js - Servicio para el sistema de alertas
import { apiClient, apiUtils } from '../api/baseAPI';

const alertasAPI = {
  // ================================
  // GESTIÓN DE ALERTAS
  // ================================

  /**
   * Obtener todas las alertas
   * @param {Object} filters - Filtros para la consulta
   * @param {number} filters.idEmpresa - ID de la empresa
   * @param {string} filters.tipoDocumento - Tipo de documento (opcional)
   * @param {string} filters.estado - Estado de la alerta (opcional)
   * @returns {Promise<Object>} Lista de alertas
   */
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/alertas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener alerta por ID
   * @param {number} id - ID de la alerta
   * @returns {Promise<Object>} Datos de la alerta
   */
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de alerta requerido');
      const response = await apiClient.get(`/api/alertas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Marcar alerta como resuelta
   * @param {number} id - ID de la alerta
   * @param {string} observaciones - Observaciones de la resolución (opcional)
   * @returns {Promise<Object>} Respuesta del servidor
   */
  resolveAlert: async (id, observaciones = '') => {
    try {
      if (!id) throw new Error('ID de alerta requerido');

      const response = await apiClient.put(`/api/alertas/${id}/resolve`, {
        observaciones: observaciones.trim()
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Crear nueva alerta manualmente
   * @param {Object} alertData - Datos de la alerta
   * @returns {Promise<Object>} Respuesta del servidor
   */
  createAlert: async (alertData) => {
    try {
      const {
        idEmpresa,
        tipoDocumento,
        idReferencia,
        descripcion,
        fechaVencimiento,
        diasParaVencer
      } = alertData;

      const missing = apiUtils.validateRequired({
        idEmpresa,
        tipoDocumento,
        idReferencia,
        descripcion,
        fechaVencimiento
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar tipo de documento
      const validTypes = ['LICENCIA_CONDUCCION', 'SOAT', 'TECNICO_MECANICA', 'SEGURO'];
      if (!validTypes.includes(tipoDocumento)) {
        throw new Error('Tipo de documento inválido');
      }

      // Validar fecha de vencimiento
      const fechaVenc = new Date(fechaVencimiento);
      const hoy = new Date();
      if (fechaVenc <= hoy) {
        throw new Error('La fecha de vencimiento debe ser futura');
      }

      const response = await apiClient.post('/api/alertas', {
        idEmpresa: parseInt(idEmpresa),
        tipoDocumento,
        idReferencia: parseInt(idReferencia),
        descripcion: descripcion.trim(),
        fechaVencimiento,
        diasParaVencer: diasParaVencer || 30,
        estado: 'PENDIENTE'
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // ESTADÍSTICAS Y REPORTES
  // ================================

  /**
   * Obtener estadísticas de alertas
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Object>} Estadísticas de alertas
   */
  getStatistics: async (idEmpresa) => {
    try {
      if (!idEmpresa) throw new Error('ID de empresa requerido');

      const response = await apiClient.get(`/api/alertas/stats?idEmpresa=${idEmpresa}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener alertas vencidas
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Object>} Lista de alertas vencidas
   */
  getOverdue: async (idEmpresa) => {
    try {
      if (!idEmpresa) throw new Error('ID de empresa requerido');

      const response = await apiClient.get(`/api/alertas/overdue?idEmpresa=${idEmpresa}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener alertas próximas a vencer
   * @param {number} idEmpresa - ID de la empresa
   * @param {number} dias - Días para considerar como "próximas" (default: 30)
   * @returns {Promise<Object>} Lista de alertas próximas
   */
  getUpcoming: async (idEmpresa, dias = 30) => {
    try {
      if (!idEmpresa) throw new Error('ID de empresa requerido');

      const response = await apiClient.get(`/api/alertas/upcoming?idEmpresa=${idEmpresa}&dias=${dias}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE DASHBOARD
  // ================================

  /**
   * Obtener resumen de alertas para dashboard
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Object>} Resumen de alertas
   */
  getDashboardSummary: async (idEmpresa) => {
    try {
      if (!idEmpresa) throw new Error('ID de empresa requerido');

      const response = await apiClient.get(`/api/alertas/dashboard?idEmpresa=${idEmpresa}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES
  // ================================

  /**
   * Tipos de documento válidos
   */
  getDocumentTypes: () => {
    return [
      { value: 'LICENCIA_CONDUCCION', label: 'Licencia de Conducción' },
      { value: 'SOAT', label: 'SOAT' },
      { value: 'TECNICO_MECANICA', label: 'Revisión Técnico-Mecánica' },
      { value: 'SEGURO', label: 'Seguro' }
    ];
  },

  /**
   * Estados de alerta válidos
   */
  getAlertStates: () => {
    return [
      { value: 'PENDIENTE', label: 'Pendiente' },
      { value: 'VENCIDA', label: 'Vencida' },
      { value: 'RESUELTA', label: 'Resuelta' }
    ];
  },

  /**
   * Obtener etiqueta de tipo de documento
   * @param {string} tipo - Tipo de documento
   * @returns {string} Etiqueta legible
   */
  getDocumentTypeLabel: (tipo) => {
    const types = {
      'LICENCIA_CONDUCCION': 'Licencia de Conducción',
      'SOAT': 'SOAT',
      'TECNICO_MECANICA': 'Revisión Técnico-Mecánica',
      'SEGURO': 'Seguro'
    };
    return types[tipo] || tipo;
  },

  /**
   * Obtener etiqueta de estado
   * @param {string} estado - Estado de la alerta
   * @returns {string} Etiqueta legible
   */
  getStateLabel: (estado) => {
    const states = {
      'PENDIENTE': 'Pendiente',
      'VENCIDA': 'Vencida',
      'RESUELTA': 'Resuelta'
    };
    return states[estado] || estado;
  },

  /**
   * Obtener color para el estado (para UI)
   * @param {string} estado - Estado de la alerta
   * @returns {string} Color CSS
   */
  getStateColor: (estado) => {
    const colors = {
      'PENDIENTE': 'yellow',
      'VENCIDA': 'red',
      'RESUELTA': 'green'
    };
    return colors[estado] || 'gray';
  },

  /**
   * Calcular días hasta vencimiento
   * @param {string} fechaVencimiento - Fecha de vencimiento
   * @returns {number} Días hasta vencimiento (negativo si ya venció)
   */
  calculateDaysUntilDue: (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  /**
   * Verificar si una alerta está vencida
   * @param {string} fechaVencimiento - Fecha de vencimiento
   * @returns {boolean} True si está vencida
   */
  isOverdue: (fechaVencimiento) => {
    return alertasAPI.calculateDaysUntilDue(fechaVencimiento) < 0;
  },

  /**
   * Verificar si una alerta está próxima a vencer
   * @param {string} fechaVencimiento - Fecha de vencimiento
   * @param {number} dias - Días para considerar como "próxima"
   * @returns {boolean} True si está próxima a vencer
   */
  isUpcoming: (fechaVencimiento, dias = 30) => {
    const daysUntilDue = alertasAPI.calculateDaysUntilDue(fechaVencimiento);
    return daysUntilDue >= 0 && daysUntilDue <= dias;
  },

  /**
   * Formatear fecha para mostrar
   * @param {string} fecha - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate: (fecha) => {
    if (!fecha) return 'No especificada';

    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
};

export default alertasAPI;