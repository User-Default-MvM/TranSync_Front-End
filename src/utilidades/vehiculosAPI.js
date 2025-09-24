// utilidades/vehiculosAPI.js - Servicio corregido para vehículos
import { apiClient, apiUtils } from '../api/baseAPI';

const vehiculosAPI = {
  // ================================
  // GESTIÓN BÁSICA DE VEHÍCULOS
  // ================================
  
  // Obtener vehículos con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/api/vehiculos${params ? `?${params}` : ''}`);

      // Log para debugging
      console.log('vehiculosAPI.getAll - Response data type:', typeof response.data);
      console.log('vehiculosAPI.getAll - Response data:', response.data);

      // Asegurar que response.data sea un array - manejo más robusto
      let dataArray = [];

      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si es un objeto, verificar si es un vehículo individual o un objeto contenedor
        if (response.data.idVehiculo || response.data.plaVehiculo) {
          // Es un vehículo individual, convertirlo en array
          dataArray = [response.data];
        } else if (response.data.vehiculos && Array.isArray(response.data.vehiculos)) {
          // Es un objeto contenedor con array de vehículos
          dataArray = response.data.vehiculos;
        } else {
          // Es otro tipo de objeto, intentar convertirlo
          dataArray = [response.data];
        }
      } else if (typeof response.data === 'string') {
        // Si es un string, intentar parsear como JSON
        try {
          const parsedData = JSON.parse(response.data);
          if (Array.isArray(parsedData)) {
            dataArray = parsedData;
          } else if (parsedData && typeof parsedData === 'object') {
            if (parsedData.idVehiculo || parsedData.plaVehiculo) {
              dataArray = [parsedData];
            } else if (parsedData.vehiculos && Array.isArray(parsedData.vehiculos)) {
              dataArray = parsedData.vehiculos;
            }
          }
        } catch (parseError) {
          console.warn('vehiculosAPI.getAll - No se pudo parsear response.data como JSON:', response.data);
          dataArray = [];
        }
      }
      // Si response.data es null, undefined, número, boolean, etc., dataArray queda como array vacío

      // Adaptar la respuesta para que tenga la estructura esperada
      const vehiculos = dataArray.map(vehiculo => ({
        ...vehiculo,
        estVehiculo: vehiculo.estVehiculo || 'DISPONIBLE',
        lat: vehiculo.lat,
        lng: vehiculo.lng,
        speed: vehiculo.speed || 0,
        direction: vehiculo.direction || 0
      }));

      console.log('vehiculosAPI.getAll - Vehículos procesados:', vehiculos.length);
      return { vehiculos };
    } catch (error) {
      console.error('Error en vehiculosAPI.getAll:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      // Retornar datos vacíos si hay error
      return { vehiculos: [] };
    }
  },

  // Obtener vehículo por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.get(`/api/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.getById:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nuevo vehículo
  create: async (vehicleData) => {
    try {
      // Validaciones específicas para vehículos según la base de datos
      const { 
        numVehiculo, 
        plaVehiculo, 
        marVehiculo, 
        modVehiculo, 
        anioVehiculo,
        fecVenSOAT,
        fecVenTec,
        estVehiculo,
        idEmpresa,
        idConductorAsignado
      } = vehicleData;

      const missing = apiUtils.validateRequired({ 
        numVehiculo,
        plaVehiculo, 
        marVehiculo, 
        modVehiculo, 
        anioVehiculo,
        fecVenSOAT,
        fecVenTec
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar placa (formato básico)
      if (plaVehiculo.length < 6) {
        throw new Error('La placa debe tener al menos 6 caracteres');
      }

      // Validar año
      const currentYear = new Date().getFullYear();
      if (anioVehiculo < 1950 || anioVehiculo > currentYear + 1) {
        throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
      }

      // Validar estado de vehículo
      const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
      if (estVehiculo && !validStates.includes(estVehiculo)) {
        throw new Error('Estado de vehículo inválido. Debe ser: ' + validStates.join(', '));
      }

      // Validar fechas de vencimiento
      const fechaSOAT = new Date(fecVenSOAT);
      const fechaTec = new Date(fecVenTec);
      const hoy = new Date();
      
      if (fechaSOAT <= hoy) {
        throw new Error('La fecha de vencimiento del SOAT debe ser futura');
      }

      if (fechaTec <= hoy) {
        throw new Error('La fecha de vencimiento de la revisión técnica debe ser futura');
      }

      const response = await apiClient.post('/api/vehiculos', {
        numVehiculo: numVehiculo.trim(),
        plaVehiculo: plaVehiculo.trim().toUpperCase(),
        marVehiculo: marVehiculo.trim(),
        modVehiculo: modVehiculo.trim(),
        anioVehiculo,
        fecVenSOAT,
        fecVenTec,
        estVehiculo: estVehiculo || 'DISPONIBLE',
        idEmpresa: idEmpresa || 1,
        idConductorAsignado: idConductorAsignado || null
      });

      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.create:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar vehículo
  update: async (id, vehicleData) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');

      // Validar datos si se proporcionan
      if (vehicleData.plaVehiculo && vehicleData.plaVehiculo.length < 6) {
        throw new Error('La placa debe tener al menos 6 caracteres');
      }

      if (vehicleData.anioVehiculo) {
        const currentYear = new Date().getFullYear();
        if (vehicleData.anioVehiculo < 1950 || vehicleData.anioVehiculo > currentYear + 1) {
          throw new Error(`El año debe estar entre 1950 y ${currentYear + 1}`);
        }
      }

      if (vehicleData.estVehiculo) {
        const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
        if (!validStates.includes(vehicleData.estVehiculo)) {
          throw new Error('Estado de vehículo inválido');
        }
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...vehicleData };
      if (cleanedData.plaVehiculo) cleanedData.plaVehiculo = cleanedData.plaVehiculo.trim().toUpperCase();
      if (cleanedData.marVehiculo) cleanedData.marVehiculo = cleanedData.marVehiculo.trim();
      if (cleanedData.modVehiculo) cleanedData.modVehiculo = cleanedData.modVehiculo.trim();
      if (cleanedData.numVehiculo) cleanedData.numVehiculo = cleanedData.numVehiculo.trim();

      const response = await apiClient.put(`/api/vehiculos/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.update:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar vehículo
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de vehículo requerido');
      const response = await apiClient.delete(`/api/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.delete:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================
  
  // Cambiar estado de vehículo
  changeStatus: async (id, nuevoEstado) => {
    try {
      if (!id || !nuevoEstado) {
        throw new Error('ID de vehículo y nuevo estado son requeridos');
      }

      const validStates = ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Estados válidos: ' + validStates.join(', '));
      }

      const response = await apiClient.patch(`/api/vehiculos/${id}/estado`, {
        estVehiculo: nuevoEstado
      });

      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.changeStatus:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Asignar conductor a vehículo
  assignDriver: async (idVehiculo, idConductor) => {
    try {
      if (!idVehiculo || !idConductor) {
        throw new Error('ID de vehículo e ID de conductor son requeridos');
      }

      const response = await apiClient.patch(`/api/vehiculos/${idVehiculo}/asignar-conductor`, {
        idConductor
      });

      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.assignDriver:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Desasignar conductor de vehículo
  unassignDriver: async (idVehiculo) => {
    try {
      if (!idVehiculo) {
        throw new Error('ID de vehículo es requerido');
      }

      const response = await apiClient.patch(`/api/vehiculos/${idVehiculo}/desasignar-conductor`);
      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.unassignDriver:', error);
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener estadísticas de vehículos
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/vehiculos/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error en vehiculosAPI.getStatistics:', error);
      // Retornar estadísticas vacías si hay error
      return {
        estadisticas: {
          total: 0,
          disponibles: 0,
          enRuta: 0,
          enMantenimiento: 0,
          fueraDeServicio: 0
        }
      };
    }
  },

  // Obtener conductores disponibles para asignar
  getConductoresDisponibles: async () => {
    try {
      // Usar el endpoint existente de conductores con filtro de estado
      const response = await apiClient.get('/api/conductores?estConductor=ACTIVO');
      // Filtrar conductores que no tienen vehículo asignado
      const conductoresDisponibles = response.data.filter(conductor =>
        !conductor.plaVehiculo // Si no tiene placa asignada, está disponible
      );
      return { conductoresDisponibles };
    } catch (error) {
      console.error('Error en vehiculosAPI.getConductoresDisponibles:', error);
      // Retornar array vacío si hay error
      return { conductoresDisponibles: [] };
    }
  }
};

export default vehiculosAPI;