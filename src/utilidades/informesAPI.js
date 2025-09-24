import { apiClient, apiUtils } from '../api/baseAPI';

// utilidades/informesAPI.js - Servicio específico para informes
export const informesAPI = {
  // Obtener informes generales
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/informes${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de rutas
  generateRoutesReport: async (dateRange = {}) => {
    try {
      const response = await apiClient.post('/informes/rutas', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de vehículos
  generateVehiclesReport: async (dateRange = {}) => {
    try {
      const response = await apiClient.post('/informes/vehiculos', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de conductores
  generateDriversReport: async (dateRange = {}) => {
    try {
      const response = await apiClient.post('/informes/conductores', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte de productividad
  generateProductivityReport: async (filters = {}) => {
    try {
      const response = await apiClient.post('/informes/productividad', filters);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Generar reporte financiero
  generateFinancialReport: async (dateRange = {}) => {
    try {
      const { fechaInicio, fechaFin } = dateRange;
      
      if (!fechaInicio || !fechaFin) {
        throw new Error('Fechas de inicio y fin son requeridas');
      }

      const response = await apiClient.post('/informes/financiero', dateRange);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Exportar reporte
  exportReport: async (tipo, formato = 'pdf', filters = {}) => {
    try {
      const validTypes = ['rutas', 'vehiculos', 'conductores', 'productividad', 'financiero'];
      if (!validTypes.includes(tipo)) {
        throw new Error('Tipo de reporte inválido');
      }

      const params = apiUtils.createUrlParams({ ...filters, formato });
      const response = await apiClient.get(`/informes/export/${tipo}${params ? `?${params}` : ''}`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${tipo}_${new Date().getTime()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte descargado exitosamente' };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Programar reporte automático
  scheduleReport: async (reportConfig) => {
    try {
      const { tipo, frecuencia, destinatarios, configuracion } = reportConfig;
      
      const missing = apiUtils.validateRequired({ tipo, frecuencia, destinatarios });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const response = await apiClient.post('/informes/programar', reportConfig);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};