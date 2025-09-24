s// api/index.js - Punto de entrada principal para todos los servicios de API
import authAPI from '../utilidades/authAPI';
import adminAPI from '../utilidades/adminAPI';
import driversAPI from '../utilidades/driversAPI';
import vehiculosAPI from '../utilidades/vehiculosAPI';
import rutasAPI from '../utilidades/rutasAPI';
import viajesAPI from '../utilidades/viajesAPI';
import informesAPI from '../utilidades/informesAPI';
import emergencyAPI from '../utilidades/emergencyAPI';
import dashboardAPI from '../utilidades/dashboardAPI';
import chatbotAPI from '../utilidades/chatbotAPI';
import { healthCheck, apiUtils } from './baseAPI';

// Exportación principal con todos los servicios organizados
const API = {
  // Servicios de autenticación
  auth: authAPI,
  
  // Servicios de administración
  admin: adminAPI,
  
  // Servicios de datos principales
  drivers: driversAPI,
  vehiculos: vehiculosAPI, // Actualizado
  rutas: rutasAPI,
  viajes: viajesAPI,
  
  // Servicios de reportes y análisis
  informes: informesAPI,
  dashboard: dashboardAPI,
  
  // Servicios de emergencias
  emergency: emergencyAPI,
  
  // Utilidades y salud del sistema
  utils: apiUtils,
  healthCheck,
  
  // Método para verificar conectividad general
  checkAllServices: async () => {
    const results = {};
    const services = ['auth', 'drivers', 'vehiculos', 'rutas'];
    
    for (const service of services) {
      try {
        results[service] = { status: 'OK', timestamp: new Date().toISOString() };
      } catch (error) {
        results[service] = { 
          status: 'ERROR', 
          error: error.message,
          timestamp: new Date().toISOString() 
        };
      }
    }
    
    return {
      overall: Object.values(results).every(r => r.status === 'OK') ? 'HEALTHY' : 'DEGRADED',
      services: results,
      timestamp: new Date().toISOString()
    };
  }
};

export default API;

// Exportaciones individuales para importación específica
export {
  authAPI,
  adminAPI,
  driversAPI,
  vehiculosAPI, // Actualizado
  rutasAPI,
  viajesAPI,
  informesAPI,
  emergencyAPI,
  dashboardAPI,
  apiUtils,
  healthCheck
};