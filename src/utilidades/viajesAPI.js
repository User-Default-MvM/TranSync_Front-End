// utilidades/viajesAPI.js - Servicio para viajes (tabla Viajes)
import { apiClient, apiUtils } from '../api/baseAPI';

const viajesAPI = {
  // ================================
  // GESTIÓN BÁSICA DE VIAJES
  // ================================
  
  // Obtener todos los viajes con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/viajes${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener viaje por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de viaje requerido');
      const response = await apiClient.get(`/api/viajes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nuevo viaje
  create: async (viajeData) => {
    try {
      const { 
        idVehiculo, 
        idConductor, 
        idRuta, 
        fecHorSalViaje, 
        fecHorLleViaje,
        estViaje,
        obsViaje
      } = viajeData;

      // Validaciones básicas
      const missing = apiUtils.validateRequired({ 
        idVehiculo,
        idConductor, 
        idRuta, 
        fecHorSalViaje
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar que fecha de salida sea futura (opcional)
      const fechaSalida = new Date(fecHorSalViaje);
      const hoy = new Date();
      if (fechaSalida < hoy) {
        console.warn('Creando viaje con fecha de salida en el pasado');
      }

      // Validar que si hay fecha de llegada, sea posterior a la salida
      if (fecHorLleViaje) {
        const fechaLlegada = new Date(fecHorLleViaje);
        if (fechaLlegada <= fechaSalida) {
          throw new Error('La fecha de llegada debe ser posterior a la fecha de salida');
        }
      }

      // Validar estado
      const validStates = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
      if (estViaje && !validStates.includes(estViaje)) {
        throw new Error('Estado de viaje inválido. Debe ser: ' + validStates.join(', '));
      }

      const response = await apiClient.post('/api/viajes', {
        idVehiculo: parseInt(idVehiculo),
        idConductor: parseInt(idConductor),
        idRuta: parseInt(idRuta),
        fecHorSalViaje,
        fecHorLleViaje: fecHorLleViaje || null,
        estViaje: estViaje || 'PROGRAMADO',
        obsViaje: obsViaje || null
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar viaje
  update: async (id, viajeData) => {
    try {
      if (!id) throw new Error('ID de viaje requerido');

      // Validar estado si se proporciona
      if (viajeData.estViaje) {
        const validStates = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
        if (!validStates.includes(viajeData.estViaje)) {
          throw new Error('Estado de viaje inválido');
        }
      }

      // Validar fechas si se proporcionan
      if (viajeData.fecHorSalViaje && viajeData.fecHorLleViaje) {
        const fechaSalida = new Date(viajeData.fecHorSalViaje);
        const fechaLlegada = new Date(viajeData.fecHorLleViaje);
        if (fechaLlegada <= fechaSalida) {
          throw new Error('La fecha de llegada debe ser posterior a la fecha de salida');
        }
      }

      const response = await apiClient.put(`/api/viajes/${id}`, viajeData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar viaje
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de viaje requerido');
      const response = await apiClient.delete(`/api/viajes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================
  
  // Cambiar estado de viaje
  changeStatus: async (id, nuevoEstado) => {
    try {
      if (!id || !nuevoEstado) {
        throw new Error('ID de viaje y nuevo estado son requeridos');
      }

      const validStates = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Estados válidos: ' + validStates.join(', '));
      }

      const response = await apiClient.patch(`/api/viajes/${id}/estado`, {
        estViaje: nuevoEstado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Iniciar viaje
  startTrip: async (id) => {
    return viajesAPI.changeStatus(id, 'EN_CURSO');
  },

  // Finalizar viaje
  finishTrip: async (id) => {
    return viajesAPI.changeStatus(id, 'FINALIZADO');
  },

  // Cancelar viaje
  cancelTrip: async (id) => {
    return viajesAPI.changeStatus(id, 'CANCELADO');
  },

  // Programar viaje
  scheduleTrip: async (id) => {
    return viajesAPI.changeStatus(id, 'PROGRAMADO');
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener viajes por estado
  getByStatus: async (estado) => {
    try {
      const response = await apiClient.get(`/api/viajes?estViaje=${estado}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener viajes programados
  getProgrammed: async () => {
    return viajesAPI.getByStatus('PROGRAMADO');
  },

  // Obtener viajes en curso
  getInProgress: async () => {
    return viajesAPI.getByStatus('EN_CURSO');
  },

  // Obtener viajes finalizados
  getFinished: async () => {
    return viajesAPI.getByStatus('FINALIZADO');
  },

  // Obtener viajes por conductor
  getByConductor: async (idConductor) => {
    try {
      if (!idConductor) throw new Error('ID de conductor requerido');
      const response = await apiClient.get(`/api/viajes?idConductor=${idConductor}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener viajes por vehículo
  getByVehicle: async (idVehiculo) => {
    try {
      if (!idVehiculo) throw new Error('ID de vehículo requerido');
      const response = await apiClient.get(`/api/viajes?idVehiculo=${idVehiculo}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener viajes por ruta
  getByRoute: async (idRuta) => {
    try {
      if (!idRuta) throw new Error('ID de ruta requerido');
      const response = await apiClient.get(`/api/viajes?idRuta=${idRuta}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener viajes por fecha
  getByDate: async (fecha) => {
    try {
      if (!fecha) throw new Error('Fecha requerida');
      const response = await apiClient.get(`/api/viajes?fecha=${fecha}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Buscar viajes
  search: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      const response = await apiClient.get(`/api/viajes?search=${encodeURIComponent(searchTerm.trim())}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES ESPECÍFICAS
  // ================================
  
  // Obtener etiqueta del estado
  getStatusLabel: (status) => {
    const statusLabels = {
      'PROGRAMADO': 'Programado',
      'EN_CURSO': 'En Curso',
      'FINALIZADO': 'Finalizado',
      'CANCELADO': 'Cancelado'
    };
    return statusLabels[status] || status;
  },

  // Obtener color del estado para UI
  getStatusColor: (status) => {
    const statusColors = {
      'PROGRAMADO': 'blue',
      'EN_CURSO': 'green',
      'FINALIZADO': 'gray',
      'CANCELADO': 'red'
    };
    return statusColors[status] || 'gray';
  },

  // Formatear fecha para mostrar
  formatDateTime: (dateTimeString) => {
    if (!dateTimeString) return 'No especificada';
    
    const date = new Date(dateTimeString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('es-CO', options);
  },

  // Calcular duración del viaje
  calculateDuration: (fecHorSalViaje, fecHorLleViaje) => {
    if (!fecHorSalViaje || !fecHorLleViaje) return null;
    
    const salida = new Date(fecHorSalViaje);
    const llegada = new Date(fecHorLleViaje);
    
    const diffMs = llegada - salida;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMins}m`;
  },

  // Validar datos de viaje
  validateViajeData: (viajeData) => {
    const errors = [];
    
    if (!viajeData.idVehiculo) {
      errors.push('Vehículo es requerido');
    }
    
    if (!viajeData.idConductor) {
      errors.push('Conductor es requerido');
    }
    
    if (!viajeData.idRuta) {
      errors.push('Ruta es requerida');
    }

    if (!viajeData.fecHorSalViaje) {
      errors.push('Fecha y hora de salida son requeridas');
    }

    if (viajeData.fecHorSalViaje && viajeData.fecHorLleViaje) {
      const salida = new Date(viajeData.fecHorSalViaje);
      const llegada = new Date(viajeData.fecHorLleViaje);
      
      if (llegada <= salida) {
        errors.push('La fecha de llegada debe ser posterior a la de salida');
      }
    }

    if (viajeData.estViaje) {
      const validStates = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
      if (!validStates.includes(viajeData.estViaje)) {
        errors.push('Estado de viaje inválido');
      }
    }

    return errors;
  }
};

export default viajesAPI;