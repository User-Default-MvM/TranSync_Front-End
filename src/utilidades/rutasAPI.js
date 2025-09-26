// api/rutasAPI.js - Servicio específico para rutas
import { apiClient, apiUtils } from '../api/baseAPI';

const rutasAPI = {
  // ================================
  // GESTIÓN BÁSICA DE RUTAS
  // ================================
  
  // Obtener rutas con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/rutas${params ? `?${params}` : ''}`);
      // Adaptar la respuesta para que tenga la estructura esperada
      const rutas = response.data.map(ruta => ({
        ...ruta,
        estRuta: ruta.estRuta || 'ACTIVA'
      }));
      return { rutas };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener ruta por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');
      const response = await apiClient.get(`/api/rutas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nueva ruta
  create: async (routeData) => {
    try {
      // Validaciones específicas para rutas según la base de datos
      const {
        nomRuta,
        oriRuta,
        desRuta,
        idEmpresa
      } = routeData;

      const missing = apiUtils.validateRequired({
        nomRuta,
        oriRuta,
        desRuta
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar que origen y destino sean diferentes
      if (oriRuta.trim().toLowerCase() === desRuta.trim().toLowerCase()) {
        throw new Error('El origen y destino deben ser diferentes');
      }

      // Validar longitud de campos
      if (nomRuta.trim().length < 3) {
        throw new Error('El nombre de la ruta debe tener al menos 3 caracteres');
      }

      if (oriRuta.trim().length < 2) {
        throw new Error('El origen debe tener al menos 2 caracteres');
      }

      if (desRuta.trim().length < 2) {
        throw new Error('El destino debe tener al menos 2 caracteres');
      }

      const response = await apiClient.post('/api/rutas', {
        nomRuta: nomRuta.trim(),
        oriRuta: oriRuta.trim(),
        desRuta: desRuta.trim(),
        idEmpresa: idEmpresa || 1
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar ruta
  update: async (id, routeData) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');

      // Validar que origen y destino sean diferentes si ambos están presentes
      if (routeData.oriRuta && routeData.desRuta &&
          routeData.oriRuta.trim().toLowerCase() === routeData.desRuta.trim().toLowerCase()) {
        throw new Error('El origen y destino deben ser diferentes');
      }

      // Validar longitud de campos si se proporcionan
      if (routeData.nomRuta && routeData.nomRuta.trim().length < 3) {
        throw new Error('El nombre de la ruta debe tener al menos 3 caracteres');
      }

      if (routeData.oriRuta && routeData.oriRuta.trim().length < 2) {
        throw new Error('El origen debe tener al menos 2 caracteres');
      }

      if (routeData.desRuta && routeData.desRuta.trim().length < 2) {
        throw new Error('El destino debe tener al menos 2 caracteres');
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...routeData };
      if (cleanedData.nomRuta) cleanedData.nomRuta = cleanedData.nomRuta.trim();
      if (cleanedData.oriRuta) cleanedData.oriRuta = cleanedData.oriRuta.trim();
      if (cleanedData.desRuta) cleanedData.desRuta = cleanedData.desRuta.trim();

      const response = await apiClient.put(`/api/rutas/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar ruta
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de ruta requerido');
      const response = await apiClient.delete(`/api/rutas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================
  
  // Cambiar estado de ruta
  changeStatus: async (id, nuevoEstado) => {
    try {
      if (!id || !nuevoEstado) {
        throw new Error('ID de ruta y nuevo estado son requeridos');
      }

      const validStates = ['ACTIVA', 'INACTIVA', 'EN_MANTENIMIENTO', 'SUSPENDIDA'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Estados válidos: ' + validStates.join(', '));
      }

      const response = await apiClient.patch(`/api/rutas/${id}/estado`, {
        estRuta: nuevoEstado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Activar ruta
  activate: async (id) => {
    return rutasAPI.changeStatus(id, 'ACTIVA');
  },

  // Desactivar ruta
  deactivate: async (id) => {
    return rutasAPI.changeStatus(id, 'INACTIVA');
  },

  // Marcar como en mantenimiento
  setMaintenance: async (id) => {
    return rutasAPI.changeStatus(id, 'EN_MANTENIMIENTO');
  },

  // Suspender ruta
  suspend: async (id) => {
    return rutasAPI.changeStatus(id, 'SUSPENDIDA');
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener rutas activas (por ahora todas las rutas ya que no hay campo estRuta)
  getActive: async () => {
    try {
      const response = await apiClient.get('/api/rutas');
      // Adaptar la respuesta para que tenga la estructura esperada
      const rutas = response.data.map(ruta => ({
        ...ruta,
        estRuta: ruta.estRuta || 'ACTIVA'
      }));
      return { rutas };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Buscar rutas por origen o destino
  search: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      // Buscar en todas las rutas y filtrar por origen o destino
      const response = await rutasAPI.getAll();
      const filteredRoutes = response.rutas.filter(ruta =>
        ruta.oriRuta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.desRuta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.nomRuta.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return { rutas: filteredRoutes };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener rutas por origen
  getByOrigin: async (origen) => {
    try {
      if (!origen) throw new Error('Origen requerido');
      const response = await rutasAPI.getAll();
      const filteredRoutes = response.rutas.filter(ruta =>
        ruta.oriRuta.toLowerCase().includes(origen.toLowerCase())
      );
      return { rutas: filteredRoutes };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener rutas por destino
  getByDestination: async (destino) => {
    try {
      if (!destino) throw new Error('Destino requerido');
      const response = await rutasAPI.getAll();
      const filteredRoutes = response.rutas.filter(ruta =>
        ruta.desRuta.toLowerCase().includes(destino.toLowerCase())
      );
      return { rutas: filteredRoutes };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // PARADAS Y PUNTOS DE RUTA
  // ================================
  
  // Obtener paradas de una ruta
  getStops: async (idRuta) => {
    try {
      if (!idRuta) throw new Error('ID de ruta requerido');
      const response = await apiClient.get(`/api/rutas/${idRuta}/paradas`);
      return response.data;
    } catch (error) {
      // Si las paradas no están implementadas, retornar array vacío
      console.warn(`Paradas no disponibles para ruta ${idRuta}:`, error.message);
      return { paradas: [] };
    }
  },

  // Agregar parada a ruta
  addStop: async (idRuta, stopData) => {
    try {
      if (!idRuta) throw new Error('ID de ruta requerido');
      
      const { nombreParada, latitud, longitud, orden, tiempoEstimado } = stopData;
      
      const missing = apiUtils.validateRequired({ 
        nombreParada, 
        latitud, 
        longitud, 
        orden 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar coordenadas
      if (latitud < -90 || latitud > 90) {
        throw new Error('La latitud debe estar entre -90 y 90');
      }

      if (longitud < -180 || longitud > 180) {
        throw new Error('La longitud debe estar entre -180 y 180');
      }

      // Validar orden
      if (orden < 1) {
        throw new Error('El orden debe ser mayor a 0');
      }

      const response = await apiClient.post(`/api/rutas/${idRuta}/paradas`, {
        nombreParada: nombreParada.trim(),
        latitud,
        longitud,
        orden,
        tiempoEstimado: tiempoEstimado || 0
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar parada
  updateStop: async (idRuta, idParada, stopData) => {
    try {
      if (!idRuta || !idParada) throw new Error('ID de ruta e ID de parada requeridos');

      // Validar coordenadas si se proporcionan
      if (stopData.latitud && (stopData.latitud < -90 || stopData.latitud > 90)) {
        throw new Error('La latitud debe estar entre -90 y 90');
      }

      if (stopData.longitud && (stopData.longitud < -180 || stopData.longitud > 180)) {
        throw new Error('La longitud debe estar entre -180 y 180');
      }

      if (stopData.orden && stopData.orden < 1) {
        throw new Error('El orden debe ser mayor a 0');
      }

      const cleanedData = { ...stopData };
      if (cleanedData.nombreParada) cleanedData.nombreParada = cleanedData.nombreParada.trim();

      const response = await apiClient.put(`/api/rutas/${idRuta}/paradas/${idParada}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar parada
  deleteStop: async (idRuta, idParada) => {
    try {
      if (!idRuta || !idParada) throw new Error('ID de ruta e ID de parada requeridos');
      const response = await apiClient.delete(`/api/rutas/${idRuta}/paradas/${idParada}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // REPORTES Y ESTADÍSTICAS
  // ================================
  
  // Obtener estadísticas de rutas
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/rutas/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener distribución por estado
  getStatusDistribution: async () => {
    try {
      const response = await apiClient.get('/api/rutas/distribucion-estados');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener rutas más utilizadas
  getMostUsed: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/api/rutas/mas-utilizadas?limite=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener análisis de rentabilidad
  getProfitabilityAnalysis: async (fechaInicio, fechaFin) => {
    try {
      const params = apiUtils.createUrlParams({ fechaInicio, fechaFin });
      const response = await apiClient.get(`/api/rutas/analisis-rentabilidad${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES ESPECÍFICAS
  // ================================
  
  // Validar datos de ruta
  validateRouteData: (routeData) => {
    const errors = [];

    // Validar nombre
    if (!routeData.nomRuta || routeData.nomRuta.trim().length < 3) {
      errors.push('El nombre de la ruta debe tener al menos 3 caracteres');
    }

    // Validar origen
    if (!routeData.oriRuta || routeData.oriRuta.trim().length < 2) {
      errors.push('El origen debe tener al menos 2 caracteres');
    }

    // Validar destino
    if (!routeData.desRuta || routeData.desRuta.trim().length < 2) {
      errors.push('El destino debe tener al menos 2 caracteres');
    }

    // Validar que origen y destino sean diferentes
    if (routeData.oriRuta && routeData.desRuta &&
        routeData.oriRuta.trim().toLowerCase() === routeData.desRuta.trim().toLowerCase()) {
      errors.push('El origen y destino deben ser diferentes');
    }

    return errors;
  },

  // Formatear datos de ruta para mostrar
  formatRouteData: (route) => {
    return {
      ...route,
      descripcionCompleta: `${route.oriRuta} → ${route.desRuta}`,
      estadoFormateado: rutasAPI.getStatusLabel(route.estRuta),
      rutaDisplay: `${route.nomRuta} (${route.oriRuta} - ${route.desRuta})`
    };
  },

  // Obtener etiqueta del estado
  getStatusLabel: (status) => {
    const statusLabels = {
      'ACTIVA': 'Activa',
      'INACTIVA': 'Inactiva',
      'EN_MANTENIMIENTO': 'En mantenimiento',
      'SUSPENDIDA': 'Suspendida'
    };
    return statusLabels[status] || status || 'Activa';
  },

  // Obtener color del estado para UI
  getStatusColor: (status) => {
    const statusColors = {
      'ACTIVA': 'green',
      'INACTIVA': 'red',
      'EN_MANTENIMIENTO': 'blue',
      'SUSPENDIDA': 'orange'
    };
    return statusColors[status] || 'gray';
  },

  // Calcular distancia entre dos coordenadas (fórmula de Haversine)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Exportar lista de rutas
  exportRoutes: async (format = 'csv', filters = {}) => {
    try {
      const params = apiUtils.createUrlParams({ ...filters, formato: format });
      const response = await apiClient.get(`/api/rutas/export${params ? `?${params}` : ''}`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rutas_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Rutas exportadas exitosamente' };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

export default rutasAPI;