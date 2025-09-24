// src/utilidades/cacheService.js - Servicio de Cache Inteligente
const cacheService = {
  // Cache en memoria usando Map para mejor rendimiento
  memoryCache: new Map(),

  // Configuración del cache
  config: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxSize: 100, // Máximo 100 entradas
    cleanupInterval: 60 * 1000, // Limpieza cada minuto
    compressionEnabled: true
  },

  // Estadísticas del cache
  stats: {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  },

  /**
   * Inicializar el servicio de cache
   */
  init: function() {
    const self = this;
    // Iniciar limpieza automática
    setInterval(() => {
      self.cleanup();
    }, self.config.cleanupInterval);

    console.log('🗄️ Cache service initialized');
  },

  /**
   * Generar clave de cache inteligente
   */
  generateCacheKey: function(query, params = [], userContext = {}) {
    const keyData = {
      query: query.toLowerCase().trim(),
      params: params,
      userId: userContext.idUsuario,
      empresaId: userContext.idEmpresa,
      timestamp: Math.floor(Date.now() / (5 * 60 * 1000)) // Agrupar por intervalos de 5 minutos
    };

    // Crear hash simple para la clave
    const keyString = JSON.stringify(keyData);
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32 bits
    }

    return `query_${Math.abs(hash)}`;
  },

  /**
   * Obtener datos del cache
   */
  get: function(key) {
    const cached = this.memoryCache.get(key);

    if (!cached) {
      this.stats.misses++;
      return null;
    }

    // Verificar si expiró
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return cached.data;
  },

  /**
   * Almacenar datos en cache
   */
  set: function(key, data, ttl = this.config.defaultTTL) {
    // Verificar límite de tamaño
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const cacheEntry = {
      data: data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      accessCount: 0,
      lastAccess: Date.now()
    };

    this.memoryCache.set(key, cacheEntry);
    this.stats.sets++;
    this.stats.size = this.memoryCache.size;
  },

  /**
   * Eliminar entrada del cache
   */
  delete: function(key) {
    const deleted = this.memoryCache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.memoryCache.size;
    }
    return deleted;
  },

  /**
   * Limpiar cache completo
   */
  clear: function() {
    const size = this.memoryCache.size;
    this.memoryCache.clear();
    this.stats.size = 0;
    console.log(`🗑️ Cache cleared: ${size} entries removed`);
  },

  /**
   * Invalidar cache por patrón
   */
  invalidateByPattern: function(pattern) {
    let invalidated = 0;
    for (const [key] of this.memoryCache) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    }
    this.stats.deletes += invalidated;
    this.stats.size = this.memoryCache.size;
    console.log(`🚫 Cache invalidated by pattern "${pattern}": ${invalidated} entries removed`);
  },

  /**
   * Invalidar cache por tabla
   */
  invalidateByTable: function(tableName) {
    this.invalidateByPattern(tableName.toLowerCase());
  },

  /**
   * Invalidar cache por empresa
   */
  invalidateByEmpresa: function(empresaId) {
    this.invalidateByPattern(`empresa_${empresaId}`);
  },

  /**
   * Obtener datos con cache inteligente
   */
  getWithCache: async function(query, params = [], userContext = {}, fetchFunction, options = {}) {
    const cacheKey = this.generateCacheKey(query, params, userContext);
    const ttl = options.ttl || this.config.defaultTTL;

    // Intentar obtener del cache
    let data = this.get(cacheKey);

    if (data !== null) {
      console.log('✅ Cache hit for query:', cacheKey);
      return data;
    }

    // Si no está en cache, ejecutar la función
    console.log('❌ Cache miss for query:', cacheKey);
    try {
      data = await fetchFunction();

      // Almacenar en cache si la consulta es cacheable
      if (this.isCacheable(query, params)) {
        this.set(cacheKey, data, ttl);
      }

      return data;
    } catch (error) {
      console.error('Error fetching data for cache:', error);
      throw error;
    }
  },

  /**
   * Determinar si una consulta es cacheable
   */
  isCacheable: function(query, params = []) {
    const lowerQuery = query.toLowerCase();

    // No cachear consultas de escritura
    if (lowerQuery.includes('insert') ||
        lowerQuery.includes('update') ||
        lowerQuery.includes('delete')) {
      return false;
    }

    // No cachear consultas con parámetros de tiempo actuales
    if (params.some(param =>
      param instanceof Date ||
      (typeof param === 'string' && param.match(/\d{4}-\d{2}-\d{2}/))
    )) {
      return false;
    }

    // Cachear consultas SELECT con límites
    if (lowerQuery.includes('select') && lowerQuery.includes('limit')) {
      return true;
    }

    // Cachear consultas de estadísticas
    if (lowerQuery.includes('count') || lowerQuery.includes('sum') || lowerQuery.includes('avg')) {
      return true;
    }

    return false;
  },

  /**
   * Evitar entrada más antigua (LRU)
   */
  evictOldest: function() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.stats.deletes++;
      console.log('🚫 Evicted oldest cache entry:', oldestKey);
    }
  },

  /**
   * Limpiar entradas expiradas
   */
  cleanup: function() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache) {
      if (now > entry.expiry) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.deletes += cleaned;
      this.stats.size = this.memoryCache.size;
      console.log(`🧹 Cache cleanup: ${cleaned} expired entries removed`);
    }
  },

  /**
   * Obtener estadísticas del cache
   */
  getStats: function() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      size: this.memoryCache.size,
      maxSize: this.config.maxSize,
      entries: Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
        key: key,
        size: JSON.stringify(entry.data).length,
        age: Date.now() - entry.timestamp,
        expiry: entry.expiry - Date.now(),
        accessCount: entry.accessCount
      }))
    };
  },

  /**
   * Optimizar cache basado en patrones de uso
   */
  optimize: function() {
    const stats = this.getStats();

    // Si el hit rate es bajo, aumentar TTL
    if (stats.hitRate < 50) {
      this.config.defaultTTL *= 1.5;
      console.log('📈 Low hit rate detected, increasing TTL to:', this.config.defaultTTL);
    }

    // Si el cache está muy lleno, reducir TTL
    if (stats.size > this.config.maxSize * 0.8) {
      this.config.defaultTTL *= 0.8;
      console.log('📉 Cache nearly full, reducing TTL to:', this.config.defaultTTL);
    }

    // Limpiar entradas poco accedidas
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache) {
      // Si no se accede en más de 2 horas, considerar para limpieza
      if (now - entry.lastAccess > 2 * 60 * 60 * 1000) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧽 Cache optimization: ${cleaned} stale entries removed`);
    }
  },

  /**
   * Pre-cargar datos comunes
   */
  preloadCommonQueries: async function(userContext, apiClient) {
    // Solo pre-cargar si tenemos contexto de usuario válido
    if (!userContext || !userContext.idEmpresa) {
      console.log('⏭️ Skipping preload - no valid user context');
      return;
    }

    const commonQueries = [
      {
        name: 'active_drivers',
        query: 'SELECT COUNT(*) as count FROM Conductores WHERE estConductor = ? AND idEmpresa = ?',
        params: ['ACTIVO', userContext.idEmpresa]
      },
      {
        name: 'available_vehicles',
        query: 'SELECT COUNT(*) as count FROM Vehiculos WHERE estVehiculo = ? AND idEmpresa = ?',
        params: ['DISPONIBLE', userContext.idEmpresa]
      },
      {
        name: 'today_trips',
        query: 'SELECT COUNT(*) as count FROM Viajes WHERE DATE(fecHorSalViaje) = CURDATE() AND idEmpresa = ?',
        params: [userContext.idEmpresa]
      }
    ];

    for (const query of commonQueries) {
      try {
        const cacheKey = this.generateCacheKey(query.query, query.params, userContext);
        const data = await apiClient.post('/api/chatbot/query', {
          sql: query.query,
          params: query.params
        });

        this.set(cacheKey, data.data, this.config.defaultTTL * 2); // TTL más largo para datos comunes
        console.log(`📦 Preloaded common query: ${query.name}`);
      } catch (error) {
        console.error(`Error preloading query ${query.name}:`, error);
        // No propagar el error para evitar romper la inicialización
      }
    }
  },

  /**
   * Actualizar acceso a entrada del cache
   */
  touch: function(key) {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
      entry.accessCount++;
    }
  }
};

// Inicializar el servicio
cacheService.init();

export default cacheService;