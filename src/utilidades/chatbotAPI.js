// src/utilidades/chatbotAPI.js - Servicio para el sistema de chatbot
import { apiClient, apiUtils } from '../api/baseAPI';

const chatbotAPI = {
  // ================================
  // GESTIÓN DE INTERACCIONES
  // ================================

  /**
   * Enviar mensaje al chatbot
   * @param {string} mensaje - Mensaje del usuario
   * @param {number} idEmpresa - ID de la empresa
   * @param {number} idUsuario - ID del usuario (opcional)
   * @returns {Promise<Object>} Respuesta del chatbot
   */
  sendMessage: async (mensaje, idEmpresa, idUsuario = null) => {
    try {
      if (!mensaje || !idEmpresa) {
        throw new Error('Mensaje e ID de empresa son requeridos');
      }

      console.log('🤖 Enviando mensaje al chatbot:', {
        mensaje: mensaje.trim(),
        idEmpresa: parseInt(idEmpresa),
        idUsuario: idUsuario ? parseInt(idUsuario) : null,
        endpoint: '/api/chatbot/consulta'
      });

      const response = await apiClient.post('/api/chatbot/consulta', {
        mensaje: mensaje.trim(),
        idEmpresa: parseInt(idEmpresa),
        idUsuario: idUsuario ? parseInt(idUsuario) : null
      });

      console.log('✅ Respuesta del chatbot recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en sendMessage:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        endpoint: '/api/chatbot/consulta'
      });
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener historial de interacciones
   * @param {Object} filters - Filtros para la consulta
   * @param {number} filters.idEmpresa - ID de la empresa
   * @param {number} filters.idUsuario - ID del usuario (opcional)
   * @param {string} filters.intencion - Intención específica (opcional)
   * @param {boolean} filters.exitosa - Si la respuesta fue exitosa (opcional)
   * @param {number} filters.limit - Límite de resultados (opcional)
   * @returns {Promise<Object>} Historial de interacciones
   */
  getInteractionHistory: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/chatbot/interactions${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Obtener estadísticas de uso del chatbot
   * @param {number} idEmpresa - ID de la empresa
   * @param {string} period - Período (dia, semana, mes)
   * @returns {Promise<Object>} Estadísticas de uso
   */
  getChatbotStats: async (idEmpresa, period = 'semana') => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      console.log('📊 Obteniendo estadísticas del chatbot:', {
        idEmpresa,
        period,
        endpoint: '/api/chatbot/estadisticas'
      });

      const response = await apiClient.get(`/api/chatbot/estadisticas?idEmpresa=${idEmpresa}&dias=${period === 'semana' ? 7 : period === 'mes' ? 30 : 1}`);
      console.log('✅ Estadísticas del chatbot obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del chatbot:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Probar conectividad del chatbot
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Object>} Estado de conectividad
   */
  testConnection: async (idEmpresa) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      console.log('🔍 Probando conectividad del chatbot:', {
        idEmpresa,
        endpoint: '/api/chatbot/health'
      });

      const response = await apiClient.get('/api/chatbot/health');
      console.log('✅ Conectividad del chatbot verificada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error probando conectividad del chatbot:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE CONFIGURACIÓN
  // ================================

  /**
   * Obtener configuración del chatbot
   * @param {number} idEmpresa - ID de la empresa
   * @returns {Promise<Object>} Configuración del chatbot
   */
  getConfiguration: async (idEmpresa) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      const response = await apiClient.get(`/api/chatbot/config?idEmpresa=${idEmpresa}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar configuración del chatbot
   * @param {number} idEmpresa - ID de la empresa
   * @param {Object} configData - Datos de configuración
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updateConfiguration: async (idEmpresa, configData) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      const response = await apiClient.put(`/api/chatbot/config?idEmpresa=${idEmpresa}`, configData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE RESPUESTAS PREDEFINIDAS
  // ================================

  /**
   * Obtener respuestas predefinidas
   * @param {number} idEmpresa - ID de la empresa
   * @param {string} categoria - Categoría específica (opcional)
   * @returns {Promise<Object>} Lista de respuestas predefinidas
   */
  getPredefinedResponses: async (idEmpresa, categoria = null) => {
    try {
      if (!idEmpresa) {
        throw new Error('ID de empresa es requerido');
      }

      const params = categoria ? `?idEmpresa=${idEmpresa}&categoria=${categoria}` : `?idEmpresa=${idEmpresa}`;
      const response = await apiClient.get(`/api/chatbot/responses${params}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Crear nueva respuesta predefinida
   * @param {Object} responseData - Datos de la respuesta
   * @returns {Promise<Object>} Respuesta del servidor
   */
  createPredefinedResponse: async (responseData) => {
    try {
      const { idEmpresa, palabrasClave, categoria, respuesta, prioridad } = responseData;

      const missing = apiUtils.validateRequired({
        idEmpresa,
        palabrasClave,
        categoria,
        respuesta
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const response = await apiClient.post('/api/chatbot/responses', {
        idEmpresa: parseInt(idEmpresa),
        palabrasClave: palabrasClave.trim(),
        categoria,
        respuesta: respuesta.trim(),
        prioridad: prioridad || 1,
        activa: true
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualizar respuesta predefinida
   * @param {number} idRespuesta - ID de la respuesta
   * @param {Object} responseData - Datos a actualizar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  updatePredefinedResponse: async (idRespuesta, responseData) => {
    try {
      if (!idRespuesta) {
        throw new Error('ID de respuesta es requerido');
      }

      const response = await apiClient.put(`/api/chatbot/responses/${idRespuesta}`, responseData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Eliminar respuesta predefinida
   * @param {number} idRespuesta - ID de la respuesta
   * @returns {Promise<Object>} Respuesta del servidor
   */
  deletePredefinedResponse: async (idRespuesta) => {
    try {
      if (!idRespuesta) {
        throw new Error('ID de respuesta es requerido');
      }

      const response = await apiClient.delete(`/api/chatbot/responses/${idRespuesta}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES
  // ================================

  /**
   * Categorías disponibles para respuestas predefinidas
   */
  getAvailableCategories: () => {
    return [
      'saludo',
      'conductores',
      'vehiculos',
      'rutas',
      'horarios',
      'reportes',
      'ayuda',
      'despedida',
      'personalizada'
    ];
  },

  /**
   * Obtener etiqueta de categoría
   * @param {string} categoria - Categoría
   * @returns {string} Etiqueta legible
   */
  getCategoryLabel: (categoria) => {
    const labels = {
      'saludo': 'Saludo',
      'conductores': 'Conductores',
      'vehiculos': 'Vehículos',
      'rutas': 'Rutas',
      'horarios': 'Horarios',
      'reportes': 'Reportes',
      'ayuda': 'Ayuda',
      'despedida': 'Despedida',
      'personalizada': 'Personalizada'
    };
    return labels[categoria] || categoria;
  },

  /**
   * Validar datos de respuesta predefinida
   * @param {Object} responseData - Datos a validar
   * @returns {Array} Array de errores
   */
  validateResponseData: (responseData) => {
    const errors = [];

    if (!responseData.palabrasClave || responseData.palabrasClave.trim().length < 2) {
      errors.push('Las palabras clave deben tener al menos 2 caracteres');
    }

    if (!responseData.respuesta || responseData.respuesta.trim().length < 5) {
      errors.push('La respuesta debe tener al menos 5 caracteres');
    }

    const validCategories = chatbotAPI.getAvailableCategories();
    if (!validCategories.includes(responseData.categoria)) {
      errors.push('Categoría inválida');
    }

    return errors;
  }
};

export default chatbotAPI;