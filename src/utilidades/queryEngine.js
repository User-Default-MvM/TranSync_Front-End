// src/utilidades/queryEngine.js - Motor de Consultas Inteligentes
const queryEngine = {
  /**
   * Generar consulta SQL optimizada basada en el análisis NLP
   */
  generateQuery: function(intent, entities, context, userContext) {
    // Manejar intenciones especiales que no requieren consulta a BD
    if (intent === 'greeting') {
      return {
        type: 'direct_response',
        response: '¡Hola! Soy el asistente virtual de TransSync. Tengo acceso a datos reales del sistema y puedo ayudarte con información sobre conductores, vehículos, rutas y más. ¿En qué puedo ayudarte hoy?',
        metadata: {
          intent: intent,
          estimatedComplexity: 0,
          expectedResultSize: 1,
          cacheable: false
        }
      };
    }

    if (intent === 'farewell') {
      return {
        type: 'direct_response',
        response: '¡Hasta luego! Ha sido un placer ayudarte. Que tengas un excelente día.',
        metadata: {
          intent: intent,
          estimatedComplexity: 0,
          expectedResultSize: 1,
          cacheable: false
        }
      };
    }

    if (intent === 'help') {
      return {
        type: 'direct_response',
        response: 'Puedo ayudarte consultando datos reales del sistema sobre:\n• Estado de conductores y disponibilidad\n• Información de vehículos y flota\n• Rutas y recorridos registrados\n• Horarios y programación de viajes\n• Reportes y estadísticas\n• Alertas de vencimientos\n\nSolo pregúntame lo que necesites saber!',
        metadata: {
          intent: intent,
          estimatedComplexity: 0,
          expectedResultSize: 1,
          cacheable: false
        }
      };
    }

    const queryConfig = {
      table: this.getPrimaryTable(intent),
      joins: this.getRequiredJoins(intent),
      filters: this.buildFilters(intent, entities, context, userContext),
      aggregations: this.getAggregations(intent),
      orderBy: this.getOrderBy(intent),
      limit: this.getLimit(intent, context),
      groupBy: this.getGroupBy(intent)
    };

    return {
      sql: this.buildSQL(queryConfig),
      params: this.extractParams(queryConfig),
      metadata: {
        intent: intent,
        estimatedComplexity: this.calculateComplexity(queryConfig),
        expectedResultSize: this.estimateResultSize(queryConfig),
        cacheable: this.isCacheable(queryConfig)
      }
    };
  },

  /**
   * Determinar tabla principal según la intención
   */
  getPrimaryTable: function(intent) {
    const tableMap = {
      drivers: 'Conductores',
      vehicles: 'Vehiculos',
      routes: 'Rutas',
      schedules: 'Viajes',
      companies: 'Empresas',
      users: 'Usuarios',
      reports: 'InteraccionesChatbot',
      expirations: 'AlertasVencimientos',
      status: 'ResumenOperacional',
      help: null,
      greeting: null, // No requiere consulta a BD
      farewell: null  // No requiere consulta a BD
    };

    return tableMap[intent] || 'Conductores';
  },

  /**
   * Determinar joins necesarios según la intención
   */
  getRequiredJoins: function(intent) {
    const joinMap = {
      drivers: [
        { table: 'Usuarios', on: 'Conductores.idUsuario = Usuarios.idUsuario', type: 'LEFT' },
        { table: 'Vehiculos', on: 'Conductores.idConductor = Vehiculos.idConductorAsignado', type: 'LEFT' },
        { table: 'Empresas', on: 'Conductores.idEmpresa = Empresas.idEmpresa', type: 'INNER' }
      ],
      vehicles: [
        { table: 'Conductores', on: 'Vehiculos.idConductorAsignado = Conductores.idConductor', type: 'LEFT' },
        { table: 'Empresas', on: 'Vehiculos.idEmpresa = Empresas.idEmpresa', type: 'INNER' }
      ],
      routes: [
        { table: 'Empresas', on: 'Rutas.idEmpresa = Empresas.idEmpresa', type: 'INNER' },
        { table: 'Viajes', on: 'Rutas.idRuta = Viajes.idRuta', type: 'LEFT' }
      ],
      schedules: [
        { table: 'Vehiculos', on: 'Viajes.idVehiculo = Vehiculos.idVehiculo', type: 'INNER' },
        { table: 'Conductores', on: 'Viajes.idConductor = Conductores.idConductor', type: 'INNER' },
        { table: 'Rutas', on: 'Viajes.idRuta = Rutas.idRuta', type: 'INNER' }
      ],
      users: [
        { table: 'Roles', on: 'Usuarios.idRol = Roles.idRol', type: 'INNER' },
        { table: 'Empresas', on: 'Usuarios.idEmpresa = Empresas.idEmpresa', type: 'INNER' }
      ],
      reports: [
        { table: 'Empresas', on: 'InteraccionesChatbot.idEmpresa = Empresas.idEmpresa', type: 'INNER' },
        { table: 'Usuarios', on: 'InteraccionesChatbot.idUsuario = Usuarios.idUsuario', type: 'LEFT' }
      ]
    };

    return joinMap[intent] || [];
  },

  /**
   * Construir filtros basados en entidades y contexto
   */
  buildFilters: function(intent, entities, context, userContext) {
    const filters = [];

    // Filtro de empresa (siempre aplicar para seguridad)
    if (userContext.idEmpresa) {
      filters.push({
        column: 'idEmpresa',
        operator: '=',
        value: userContext.idEmpresa,
        table: this.getPrimaryTable(intent)
      });
    }

    // Filtros basados en entidades
    if (entities.statuses && entities.statuses.length > 0) {
      entities.statuses.forEach(status => {
        const statusFilter = this.mapStatusToFilter(intent, status);
        if (statusFilter) {
          filters.push(statusFilter);
        }
      });
    }

    // Filtros de fecha
    if (entities.dates && entities.dates.length > 0) {
      entities.dates.forEach(date => {
        const dateFilter = this.parseDateFilter(date);
        if (dateFilter) {
          filters.push(dateFilter);
        }
      });
    }

    // Filtros numéricos
    if (entities.numbers && entities.numbers.length > 0) {
      entities.numbers.forEach(number => {
        const numericFilter = this.parseNumericFilter(intent, number);
        if (numericFilter) {
          filters.push(numericFilter);
        }
      });
    }

    // Filtros basados en contexto relacional
    if (context.relationalContext === 'company_scope') {
      // Ya se maneja con el filtro de empresa
    }

    return filters;
  },

  /**
   * Mapear estados a filtros de base de datos
   */
  mapStatusToFilter: function(intent, status) {
    const statusMap = {
      drivers: {
        'activo': { column: 'estConductor', value: 'ACTIVO' },
        'inactivo': { column: 'estConductor', value: 'INACTIVO' },
        'disponible': { column: 'estConductor', value: 'ACTIVO' }
      },
      vehicles: {
        'disponible': { column: 'estVehiculo', value: 'DISPONIBLE' },
        'en ruta': { column: 'estVehiculo', value: 'EN_RUTA' },
        'en mantenimiento': { column: 'estVehiculo', value: 'EN_MANTENIMIENTO' }
      },
      schedules: {
        'programado': { column: 'estViaje', value: 'PROGRAMADO' },
        'en curso': { column: 'estViaje', value: 'EN_CURSO' },
        'finalizado': { column: 'estViaje', value: 'FINALIZADO' }
      }
    };

    const intentMap = statusMap[intent];
    if (intentMap && intentMap[status.toLowerCase()]) {
      return {
        column: intentMap[status.toLowerCase()].column,
        operator: '=',
        value: intentMap[status.toLowerCase()].value,
        table: this.getPrimaryTable(intent)
      };
    }

    return null;
  },

  /**
   * Parsear filtros de fecha
   */
  parseDateFilter: function(dateString) {
    const today = new Date();
    let filter = null;

    switch (dateString.toLowerCase()) {
      case 'hoy':
        filter = {
          column: 'DATE(fecha)',
          operator: '=',
          value: today.toISOString().split('T')[0],
          type: 'date'
        };
        break;
      case 'ayer':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filter = {
          column: 'DATE(fecha)',
          operator: '=',
          value: yesterday.toISOString().split('T')[0],
          type: 'date'
        };
        break;
      case 'mañana':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filter = {
          column: 'DATE(fecha)',
          operator: '=',
          value: tomorrow.toISOString().split('T')[0],
          type: 'date'
        };
        break;
      default:
        // Intentar parsear fecha en formato DD/MM/YYYY o YYYY-MM-DD
        const dateMatch = dateString.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const parsedDate = new Date(year, month - 1, day);
          if (!isNaN(parsedDate.getTime())) {
            filter = {
              column: 'DATE(fecha)',
              operator: '=',
              value: parsedDate.toISOString().split('T')[0],
              type: 'date'
            };
          }
        }
    }

    return filter;
  },

  /**
   * Parsear filtros numéricos
   */
  parseNumericFilter: function(intent, numberString) {
    const number = parseFloat(numberString.replace(',', '.'));

    if (isNaN(number)) return null;

    const numericFilters = {
      drivers: { column: 'idConductor', operator: '=' },
      vehicles: { column: 'idVehiculo', operator: '=' },
      routes: { column: 'idRuta', operator: '=' },
      schedules: { column: 'idViaje', operator: '=' }
    };

    const filter = numericFilters[intent];
    if (filter) {
      return {
        column: filter.column,
        operator: filter.operator,
        value: number,
        table: this.getPrimaryTable(intent)
      };
    }

    return null;
  },

  /**
   * Obtener agregaciones según la intención
   */
  getAggregations: function(intent) {
    const aggregationMap = {
      drivers: ['COUNT(*)', 'COUNT(CASE WHEN estConductor = "ACTIVO" THEN 1 END)'],
      vehicles: ['COUNT(*)', 'COUNT(CASE WHEN estVehiculo = "DISPONIBLE" THEN 1 END)'],
      routes: ['COUNT(*)', 'COUNT(DISTINCT idEmpresa)'],
      schedules: ['COUNT(*)', 'COUNT(CASE WHEN estViaje = "EN_CURSO" THEN 1 END)'],
      reports: ['COUNT(*)', 'AVG(tiempoRespuesta)', 'COUNT(DISTINCT idUsuario)'],
      status: ['COUNT(*)', 'SUM(conductoresActivos)', 'SUM(vehiculosDisponibles)']
    };

    return aggregationMap[intent] || ['COUNT(*)'];
  },

  /**
   * Obtener ordenamiento
   */
  getOrderBy: function(intent) {
    // Para consultas con GROUP BY, usar columnas agregadas o del GROUP BY
    const groupByQueries = ['status', 'reports', 'expirations'];

    if (groupByQueries.includes(intent)) {
      // No usar ORDER BY para evitar conflictos con GROUP BY
      return null;
    }

    const orderMap = {
      drivers: 'fecCreConductor DESC',
      vehicles: 'fecCreVehiculo DESC',
      routes: 'nomRuta ASC',
      schedules: 'fecHorSalViaje DESC'
    };

    // Usar el ordenamiento específico o el primary key de la tabla
    const primaryKeyMap = {
      drivers: 'idConductor DESC',
      vehicles: 'idVehiculo DESC',
      routes: 'idRuta DESC',
      schedules: 'idViaje DESC',
      companies: 'idEmpresa DESC',
      users: 'idUsuario DESC'
    };

    return orderMap[intent] || primaryKeyMap[intent] || null;
  },

  /**
   * Obtener límite de resultados
   */
  getLimit: function(intent, context) {
    // Si es una pregunta de "cuántos", no limitar
    if (context && context.isCountQuery) {
      return null;
    }

    const limitMap = {
      drivers: 20,
      vehicles: 20,
      routes: 10,
      schedules: 15,
      reports: 50,
      status: null // Sin límite para resúmenes
    };

    return limitMap[intent] || 10;
  },

  /**
   * Obtener agrupamiento
   */
  getGroupBy: function(intent) {
    const groupMap = {
      reports: 'DATE(fechaInteraccion)',
      status: 'idEmpresa',
      expirations: 'tipoDocumento'
    };

    return groupMap[intent] || null;
  },

  /**
   * Construir consulta SQL completa
   */
  buildSQL: function(queryConfig) {
    const { table, joins, filters, aggregations, orderBy, limit, groupBy } = queryConfig;

    if (!table) return null;

    let sql = `SELECT `;

    // Agregaciones o campos específicos
    if (aggregations && aggregations.length > 0) {
      sql += aggregations.join(', ');
    } else {
      sql += '*';
    }

    sql += ` FROM ${table}`;

    // Joins
    if (joins && joins.length > 0) {
      joins.forEach(join => {
        sql += ` ${join.type} JOIN ${join.table} ON ${join.on}`;
      });
    }

    // Where conditions
    const whereConditions = [];
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        let condition = '';
        if (filter.table) {
          condition = `${filter.table}.${filter.column}`;
        } else {
          condition = filter.column;
        }
        condition += ` ${filter.operator} ?`;
        whereConditions.push(condition);
      });
    }

    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Group by
    if (groupBy) {
      sql += ` GROUP BY ${groupBy}`;
    }

    // Order by
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }

    // Limit
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    return sql;
  },

  /**
   * Extraer parámetros para la consulta preparada
   */
  extractParams: function(queryConfig) {
    const params = [];

    if (queryConfig.filters) {
      queryConfig.filters.forEach(filter => {
        params.push(filter.value);
      });
    }

    return params;
  },

  /**
   * Calcular complejidad estimada de la consulta
   */
  calculateComplexity: function(queryConfig) {
    let complexity = 1;

    // Joins aumentan complejidad
    if (queryConfig.joins) {
      complexity += queryConfig.joins.length * 0.5;
    }

    // Filtros aumentan complejidad
    if (queryConfig.filters) {
      complexity += queryConfig.filters.length * 0.3;
    }

    // Agregaciones aumentan complejidad
    if (queryConfig.aggregations) {
      complexity += queryConfig.aggregations.length * 0.2;
    }

    // Group by aumenta complejidad significativamente
    if (queryConfig.groupBy) {
      complexity += 1;
    }

    return Math.min(complexity, 5); // Máximo 5
  },

  /**
   * Estimar tamaño del resultado
   */
  estimateResultSize: function(queryConfig) {
    const baseSizes = {
      Conductores: 100,
      Vehiculos: 200,
      Rutas: 50,
      Viajes: 500,
      Empresas: 10,
      Usuarios: 150
    };

    let size = baseSizes[queryConfig.table] || 100;

    // Filtros reducen el tamaño
    if (queryConfig.filters) {
      size = Math.max(size * Math.pow(0.7, queryConfig.filters.length), 1);
    }

    // Limit reduce el tamaño
    if (queryConfig.limit) {
      size = Math.min(size, queryConfig.limit);
    }

    return Math.round(size);
  },

  /**
   * Determinar si la consulta es cacheable
   */
  isCacheable: function(queryConfig) {
    // Consultas sin filtros de tiempo específicos son cacheables
    const hasTimeFilter = queryConfig.filters?.some(filter =>
      filter.type === 'date' || filter.column.includes('fecha') || filter.column.includes('hora')
    );

    // Consultas con límites son más cacheables
    const hasLimit = !!queryConfig.limit;

    // Consultas de solo lectura son cacheables
    const isReadOnly = !queryConfig.sql?.toLowerCase().includes('insert') &&
                      !queryConfig.sql?.toLowerCase().includes('update') &&
                      !queryConfig.sql?.toLowerCase().includes('delete');

    return isReadOnly && (hasLimit || !hasTimeFilter);
  },

  /**
   * Optimizar consulta existente
   */
  optimizeQuery: function(query) {
    // Sugerencias de optimización
    const optimizations = [];

    if (query.metadata.estimatedComplexity > 3) {
      optimizations.push('Considerar agregar índices en las columnas filtradas');
    }

    if (query.metadata.expectedResultSize > 1000) {
      optimizations.push('Resultado grande - considerar paginación');
    }

    if (!query.metadata.cacheable) {
      optimizations.push('Consulta no cacheable - considerar estrategia de cache');
    }

    return {
      ...query,
      optimizations: optimizations
    };
  }
};

export default queryEngine;