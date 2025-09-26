// api/baseAPI.js - Configuración unificada para todos los servicios
import axios from "axios";

// ================================
// CONFIGURACIÓN BASE
// ================================
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? "https://transyncbackend-production.up.railway.app"
    : process.env.NODE_ENV === 'development'
    ? "http://localhost:3001"
    : "https://transyncbackend-production.up.railway.app");

const REQUEST_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000; // Aumentado a 30 segundos

// Configuración de reintentos
const MAX_RETRIES = parseInt(process.env.REACT_APP_MAX_RETRIES) || 3;
const RETRY_DELAY = parseInt(process.env.REACT_APP_RETRY_DELAY) || 1000;

console.log('🚀 BaseAPI initialized with URL:', API_BASE_URL);
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('⏱️ Timeout:', REQUEST_TIMEOUT, 'ms');
console.log('🔄 Max retries:', MAX_RETRIES);

// Crear instancia de axios con configuración base SIN /api
export const apiClient = axios.create({
  baseURL: API_BASE_URL, // Sin /api aquí - se maneja en cada servicio
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función de reintento con backoff exponencial
const retryRequest = async (error, retries = MAX_RETRIES) => {
  const config = error.config;

  if (!config || !retries) {
    return Promise.reject(error);
  }

  config.retryCount = config.retryCount || 0;

  if (config.retryCount >= retries) {
    return Promise.reject(error);
  }

  config.retryCount += 1;

  // Solo reintentar en errores de red o servidor
  if (error.code !== 'ECONNABORTED' &&
      error.response?.status !== 429 &&
      error.response?.status !== 401 &&
      error.response?.status !== 403) {
    return Promise.reject(error);
  }

  const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);

  console.log(`🔄 Reintentando solicitud (${config.retryCount}/${retries}) después de ${delay}ms`);

  return new Promise(resolve => {
    setTimeout(() => resolve(apiClient(config)), delay);
  });
};

// ================================
// INTERCEPTORES
// ================================

// Request interceptor - agregar token y logging
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe (acepta varias claves)
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("userToken") ||
      localStorage.getItem("token"); // 🔥 añadido soporte

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - manejo de errores globales y logging
apiClient.interceptors.response.use(
  (response) => {
    // Logging en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  async (error) => {
    // Intentar reintento antes de manejar el error
    try {
      return await retryRequest(error);
    } catch (retryError) {
      // Si fallan los reintentos, manejar el error normalmente
      error = retryError;
    }
    // Logging de errores - manejo especial para notificaciones 404
    const isNotification404 = error.response?.status === 404 &&
      error.config?.url?.includes('/notifications/') &&
      error.config?.url?.includes('/read');

    if (isNotification404) {
      // No loguear como error crítico las notificaciones 404 (probablemente son de ejemplo)
      console.warn("⚠️ Notificación no encontrada:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    } else {
      // Loguear otros errores normalmente
      console.error("❌ API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        fullURL: error.config
          ? `${API_BASE_URL}${error.config.url}`
          : "Unknown",
        errorObject: error,
        responseData: error.response?.data
      });
    }

    // Manejo específico de errores
    if (error.response?.status === 401) {
      // Token expirado o inválido
      const keysToRemove = [
        "authToken",
        "userToken",
        "token",
        "userData",
        "isAuthenticated",
        "userName",
        "userRole",
        "userEmail",
        "userId",
      ];

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Redirigir solo si no estamos ya en login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Agregar información adicional al error para mejor debugging
    const enhancedError = {
      ...error,
      isNetworkError: error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED',
      isServerError: error.response?.status >= 500,
      isClientError: error.response?.status >= 400 && error.response?.status < 500,
      isTimeout: error.code === 'ECONNABORTED',
      retryCount: error.config?.retryCount || 0,
      timestamp: new Date().toISOString(),
      endpoint: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };

    return Promise.reject(enhancedError);
  }
);

// ================================
// UTILIDADES GENERALES
// ================================
export const apiUtils = {
  // Verificar si hay conexión a internet
  isOnline: () => navigator.onLine,

  // Formatear errores para mostrar al usuario
  formatError: (error) => {
    if (!navigator.onLine) {
      return "Sin conexión a internet. Verifica tu conexión.";
    }

    if (error.isTimeout || error.code === "ECONNABORTED") {
      return "La solicitud tardó demasiado. Intenta de nuevo.";
    }

    if (error.isNetworkError) {
      return "Error de conexión. Verifica tu conexión a internet.";
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.status === 404) {
      return "Recurso no encontrado. Verifica la URL del servidor.";
    }

    if (error.response?.status === 429) {
      return "Demasiadas solicitudes. Intenta de nuevo en unos minutos.";
    }

    if (error.response?.status === 403) {
      return "No tienes permisos para realizar esta acción.";
    }

    if (error.response?.status === 401) {
      return "Sesión expirada. Inicia sesión nuevamente.";
    }

    if (error.response?.status >= 500) {
      return "Error del servidor. Intenta más tarde.";
    }

    if (error.response?.status >= 400) {
      return "Error en los datos enviados. Verifica la información.";
    }

    return error.message || "Error desconocido";
  },

  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar campos requeridos
  validateRequired: (fields) => {
    const missing = [];
    Object.entries(fields).forEach(([key, value]) => {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        missing.push(key);
      }
    });
    return missing;
  },

  // Crear parámetros de URL
  createUrlParams: (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });
    return params.toString();
  },

  // Formatear fechas
  formatDate: (date, format = "YYYY-MM-DD") => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      default:
        return d.toLocaleDateString();
    }
  },

  // Debounce para búsquedas
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Configuración de debounce por tipo de dato
  debounceConfig: {
    search: 300,      // Búsquedas rápidas
    filter: 500,      // Filtros
    realtime: 100,    // Datos en tiempo real
    heavy: 1000,      // Consultas pesadas
    default: 500,     // Por defecto
  },

  // Cache de funciones debounced
  debouncedCache: new Map(),

  // Consultas debounced con configuración por tipo
  debouncedQuery: (queryKey, queryFunction, dataType = 'default') => {
    const cacheKey = `${queryKey}_${dataType}`;
    const delay = apiUtils.debounceConfig[dataType] || apiUtils.debounceConfig.default;

    if (!apiUtils.debouncedCache.has(cacheKey)) {
      apiUtils.debouncedCache.set(cacheKey, apiUtils.debounce(queryFunction, delay));
    }

    return apiUtils.debouncedCache.get(cacheKey);
  },
};

// ================================
// VERIFICACIÓN DE SALUD DEL API
// ================================
export const healthCheck = async () => {
  try {
    const startTime = Date.now();
    const response = await apiClient.get("/api/health", { timeout: 5000 });
    const responseTime = Date.now() - startTime;

    return {
      ...response.data,
      connectivity: true,
      responseTime,
      timestamp: new Date().toISOString(),
      status: "OK"
    };
  } catch (error) {
    return {
      status: "ERROR",
      connectivity: false,
      message: apiUtils.formatError(error),
      timestamp: new Date().toISOString(),
      responseTime: null,
      errorType: error.isNetworkError ? 'NETWORK' : error.isServerError ? 'SERVER' : 'UNKNOWN',
      canRetry: error.isNetworkError || error.isServerError
    };
  }
};

// Verificar múltiples endpoints para diagnóstico
export const comprehensiveHealthCheck = async () => {
  const endpoints = ['/api/health', '/api/rutas', '/api/vehiculos'];
  const results = {
    overall: { status: 'OK', connectivity: true },
    endpoints: {},
    timestamp: new Date().toISOString()
  };

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      await apiClient.get(endpoint, { timeout: 3000 });
      const responseTime = Date.now() - startTime;

      results.endpoints[endpoint] = {
        status: 'OK',
        connectivity: true,
        responseTime
      };
    } catch (error) {
      results.endpoints[endpoint] = {
        status: 'ERROR',
        connectivity: false,
        message: apiUtils.formatError(error),
        errorType: error.isNetworkError ? 'NETWORK' : error.isServerError ? 'SERVER' : 'UNKNOWN'
      };

      results.overall.status = 'ERROR';
      results.overall.connectivity = false;
    }
  }

  return results;
};

export default apiClient;
