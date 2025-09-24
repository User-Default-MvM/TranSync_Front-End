// src/utilidades/nlpProcessor.js - Procesador Avanzado de Lenguaje Natural
const nlpProcessor = {
  /**
   * Análisis semántico avanzado del mensaje
   */
  analyzeSemantic: function(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Patrones de intención complejos
    const intentPatterns = {
      // Consultas de estado y estadísticas
      status: {
        patterns: [
          /(?:c[uú]al|qu[eé]|dime|muestra|veo|ve|hay).*(?:estado|estad[íi]stica|informaci[oó]n|datos|resumen)/i,
          /(?:est[aá]|situaci[oó]n|condici[oó]n).*(?:actual|sistema|general|flota)/i,
          /(?:cu[aá]nt[oa]s?|qu[eé]|dime).*(?:hay|existen|tengo|tenemos)/i
        ],
        confidence: 0.9
      },

      // Consultas sobre conductores
      drivers: {
        patterns: [
          /(?:conductor|conductores|chofer|choferes|driver)/i,
          /(?:licencia|documentos?|identificaci[oó]n)/i,
          /(?:disponible|activo|inactivo|asignado)/i
        ],
        confidence: 0.85
      },

      // Consultas sobre vehículos
      vehicles: {
        patterns: [
          /(?:veh[ií]culo|veh[ií]culos|bus|buses|flota|auto|carro)/i,
          /(?:placa|matr[ií]cula|n[uú]mero|marca|modelo)/i,
          /(?:mantenimiento|revisi[oó]n|soat|seguro)/i
        ],
        confidence: 0.85
      },

      // Consultas sobre rutas
      routes: {
        patterns: [
          /(?:ruta|rutas|recorrido|itinerario|destino|origen)/i,
          /(?:trayecto|viaje|destinaci[oó]n)/i
        ],
        confidence: 0.8
      },

      // Consultas sobre horarios y viajes
      schedules: {
        patterns: [
          /(?:horario|horarios|hora|tiempo|programaci[oó]n)/i,
          /(?:viaje|viajes|salida|llegada|programado)/i,
          /(?:hoy|ma[nñ]ana|ayer|semana|mes)/i
        ],
        confidence: 0.8
      },

      // Consultas sobre empresas
      companies: {
        patterns: [
          /(?:empresa|empresas|compa[nñ][ií]a|organizaci[oó]n)/i,
          /(?:sucursal|oficina|ubicaci[oó]n|direcci[oó]n)/i
        ],
        confidence: 0.75
      },

      // Consultas sobre usuarios
      users: {
        patterns: [
          /(?:usuario|usuarios|persona|personas|admin|administrador)/i,
          /(?:rol|roles|permiso|permisos|acceso)/i
        ],
        confidence: 0.75
      },

      // Consultas sobre reportes y analytics
      reports: {
        patterns: [
          /(?:reporte|reportes|informe|an[aá]lisis|estad[ií]stica)/i,
          /(?:gr[aá]fica|gr[aá]fico|dashboard|panel|resumen)/i,
          /(?:eficiencia|rendimiento|productividad)/i
        ],
        confidence: 0.8
      },

      // Consultas sobre vencimientos
      expirations: {
        patterns: [
          /(?:vencimiento|vencimientos|caduca|caducan|expira|expiran)/i,
          /(?:pr[oó]ximo|pr[oó]ximos|cerca|pronto)/i,
          /(?:documento|documentos|licencia|soat|revisi[oó]n)/i
        ],
        confidence: 0.9
      },

      // Consultas de ayuda
      help: {
        patterns: [
          /(?:ayuda|help|ay[uú]dame|asistencia)/i,
          /(?:qu[eé]|c[oó]mo|puedes?|funciones?|opciones?)/i,
          /(?:manual|gu[ií]a|instrucciones?)/i
        ],
        confidence: 0.95
      },

      // Saludos y despedidas
      greeting: {
        patterns: [
          /\b(?:hola|hello|hi|saludos|buenos|buenas)\b/i,
          /\b(?:buen|buena)(?:\s+d[ií]a|\s+tarde|\s+noche)\b/i,
          /\b(?:hey|qué|como|todo)\b.*\b(?:tal|va|está|estás)\b/i,
          /\b(?:saludos|bienvenido|bienvenida|encantado)\b/i
        ],
        confidence: 0.98
      },

      // Despedidas
      farewell: {
        patterns: [
          /\b(?:adiós|bye|chao|hasta|nos|gracias)\b/i,
          /\b(?:hasta luego|hasta pronto|hasta mañana)\b/i,
          /\b(?:me despido|nos vemos|chau)\b/i
        ],
        confidence: 0.95
      }
    };

    // Analizar cada patrón de intención
    const matches = {};
    let bestIntent = null;
    let bestConfidence = 0;

    for (const [intent, config] of Object.entries(intentPatterns)) {
      let intentMatches = 0;
      const totalPatterns = config.patterns.length;

      for (const pattern of config.patterns) {
        if (pattern.test(lowerMessage)) {
          intentMatches++;
        }
      }

      if (intentMatches > 0) {
        const confidence = (intentMatches / totalPatterns) * config.confidence;
        matches[intent] = {
          matches: intentMatches,
          confidence: confidence,
          patterns: totalPatterns
        };

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestIntent = intent;
        }
      }
    }

    return {
      intent: bestIntent,
      confidence: bestConfidence,
      matches: matches,
      originalMessage: message
    };
  },

  /**
   * Extracción de entidades del mensaje
   */
  extractEntities: function(message) {
    const entities = {
      dates: [],
      numbers: [],
      names: [],
      locations: [],
      statuses: [],
      categories: []
    };

    // Extraer fechas
    const datePatterns = [
      /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g, // DD/MM/YYYY o DD-MM-YYYY
      /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, // YYYY/MM/DD o YYYY-MM-DD
      /\bhoy\b|\bayer\b|\bmañana\b/gi,
      /\besta semana\b|\bpróxima semana\b|\beste mes\b/gi
    ];

    datePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.dates.push(...matches);
      }
    });

    // Extraer números
    const numberPatterns = [
      /\b\d+\b/g, // Números enteros
      /\b\d+[,.]\d+\b/g // Números decimales
    ];

    numberPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.numbers.push(...matches);
      }
    });

    // Extraer posibles nombres propios
    const namePatterns = [
      /\b[A-Z][a-záéíóúñ]+\s+[A-Z][a-záéíóúñ]+\b/g, // Nombres y apellidos
      /\b[A-Z][a-záéíóúñ]+\b/g // Nombres simples
    ];

    namePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.names.push(...matches);
      }
    });

    // Extraer ubicaciones/ciudades
    const locationPatterns = [
      /\b(Bogotá|Medellín|Cali|Barranquilla|Cartagena|Santa Marta|Pereira|Manizales|Bucaramanga|Cúcuta)\b/gi
    ];

    locationPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.locations.push(...matches);
      }
    });

    // Extraer estados/condiciones
    const statusPatterns = [
      /\b(activo|inactivo|disponible|ocupado|en ruta|en mantenimiento|programado|finalizado|cancelado)\b/gi
    ];

    statusPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.statuses.push(...matches);
      }
    });

    // Extraer categorías
    const categoryPatterns = [
      /\b(licencia|soat|revisión|técnico|documento|vehículo|conductor|ruta|viaje|empresa|usuario)\b/gi
    ];

    categoryPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.categories.push(...matches);
      }
    });

    return entities;
  },

  /**
   * Comprensión contextual del mensaje
   */
  understandContext: function(message, conversationHistory = []) {
    const context = {
      isFollowUp: false,
      references: [],
      temporalContext: null,
      relationalContext: null
    };

    // Detectar si es una pregunta de seguimiento
    const followUpPatterns = [
      /\b(y|o|e|entonces|además|también)\b/i,
      /\bqué|cuál|cuáles|dónde|cuándo|cómo|cuánto/i,
      /\b(es|son|está|están|hay|tiene|tienen)\b/i
    ];

    context.isFollowUp = followUpPatterns.some(pattern => pattern.test(message));

    // Extraer referencias a conversaciones anteriores
    if (conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      const references = [];

      recentMessages.forEach((msg, index) => {
        if (msg.sender === 'bot') {
          // Buscar referencias en el mensaje actual
          const words = msg.text.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 3 && message.toLowerCase().includes(word)) {
              references.push({
                word: word,
                fromMessage: index,
                context: msg.text.substring(0, 50) + '...'
              });
            }
          });
        }
      });

      context.references = references;
    }

    // Contexto temporal
    if (message.match(/\bhoy\b|\bayer\b|\bmañana\b/gi)) {
      context.temporalContext = 'specific_date';
    } else if (message.match(/\besta semana\b|\beste mes\b|\beste año\b/gi)) {
      context.temporalContext = 'current_period';
    }

    // Contexto relacional
    if (message.match(/\bde la empresa\b|\bde mi empresa\b|\bde la compañía\b/gi)) {
      context.relationalContext = 'company_scope';
    } else if (message.match(/\bmis\b|\bmi\b|\bnuestro\b|\bnuestra\b/gi)) {
      context.relationalContext = 'user_scope';
    }

    return context;
  },

  /**
   * Generar consulta inteligente basada en el análisis
   */
  generateSmartQuery: function(semanticAnalysis, entities, context) {
    const { intent, confidence } = semanticAnalysis;

    if (confidence < 0.6) {
      return {
        type: 'unclear',
        message: 'No pude entender claramente tu consulta. ¿Podrías ser más específico?'
      };
    }

    const query = {
      intent: intent,
      confidence: confidence,
      filters: {},
      joins: [],
      aggregations: [],
      orderBy: null,
      limit: null
    };

    // Aplicar filtros basados en entidades
    if (entities.dates.length > 0) {
      query.filters.dateRange = entities.dates;
    }

    if (entities.statuses.length > 0) {
      query.filters.status = entities.statuses;
    }

    if (entities.numbers.length > 0) {
      query.filters.numericFilters = entities.numbers;
    }

    // Configurar joins y relaciones según la intención
    switch (intent) {
      case 'drivers':
        query.table = 'Conductores';
        query.joins = ['Usuarios', 'Vehiculos'];
        if (entities.statuses.includes('activo')) {
          query.filters.estConductor = 'ACTIVO';
        }
        break;

      case 'vehicles':
        query.table = 'Vehiculos';
        query.joins = ['Conductores', 'Empresas'];
        if (entities.statuses.includes('disponible')) {
          query.filters.estVehiculo = 'DISPONIBLE';
        }
        break;

      case 'routes':
        query.table = 'Rutas';
        query.joins = ['Viajes', 'Empresas'];
        break;

      case 'schedules':
        query.table = 'Viajes';
        query.joins = ['Vehiculos', 'Conductores', 'Rutas'];
        query.filters.dateRange = ['today'];
        break;

      case 'expirations':
        query.table = 'Vencimientos';
        query.aggregations = ['COUNT', 'GROUP_BY'];
        query.filters.dateRange = ['next_30_days'];
        break;

      default:
        query.table = 'General';
        break;
    }

    // Aplicar contexto relacional
    if (context.relationalContext === 'company_scope') {
      query.filters.companyScope = true;
    }

    return query;
  },

  /**
   * Procesar mensaje completo con análisis avanzado
   */
  processMessage: function(message, conversationHistory = []) {
    const semanticAnalysis = this.analyzeSemantic(message);
    const entities = this.extractEntities(message);
    const context = this.understandContext(message, conversationHistory);
    const smartQuery = this.generateSmartQuery(semanticAnalysis, entities, context);

    return {
      originalMessage: message,
      semanticAnalysis,
      entities,
      context,
      smartQuery,
      timestamp: new Date().toISOString(),
      processingTime: Date.now()
    };
  }
};

export default nlpProcessor;