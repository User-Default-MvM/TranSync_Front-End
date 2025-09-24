// api/baseAPI.js - Configuración unificada para todos los servicios
import axios from "axios";

// ================================
// CONFIGURACIÓN BASE
// ================================
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const REQUEST_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;

// Crear instancia de axios con configuración base SIN /api
export const apiClient = axios.create({
  baseURL: API_BASE_URL, // Sin /api aquí - se maneja en cada servicio
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
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
      });
    }

    // Manejo específico de errores
    if (error.response?.status === 401) {
      // Token expirado o inválido
      const keysToRemove = [
        "authToken",
        "userToken",
        "token", // 🔥 añadido
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

    return Promise.reject(error);
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

    if (error.code === "ECONNABORTED") {
      return "La solicitud tardó demasiado. Intenta de nuevo.";
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.status === 404) {
      return "Recurso no encontrado. Verifica la URL del servidor.";
    }

    if (error.response?.status >= 500) {
      return "Error del servidor. Intenta más tarde.";
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
    };
  } catch (error) {
    return {
      status: "ERROR",
      connectivity: false,
      message: apiUtils.formatError(error),
      timestamp: new Date().toISOString(),
      responseTime: null,
    };
  }
};

export default apiClient;
