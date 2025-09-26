// src/utilidades/conversationMemory.js - Sistema de Memoria de Conversación
const conversationMemory = {
  // Almacenamiento en memoria de las conversaciones activas
  activeConversations: new Map(),

  // Configuración de memoria
  config: {
    maxConversations: 100,
    maxMessagesPerConversation: 50,
    memoryExpirationHours: 24,
    contextWindowSize: 10
  },

  /**
   * Inicializar o recuperar conversación para un usuario
   */
  getConversation: function(userId, empresaId) {
    const conversationKey = `${userId}_${empresaId || 1}`;

    if (!this.activeConversations.has(conversationKey)) {
      this.activeConversations.set(conversationKey, {
        userId: userId,
        empresaId: empresaId,
        messages: [],
        context: {
          currentIntent: null,
          lastTopic: null,
          userPreferences: {},
          sessionVariables: {},
          entityReferences: new Map()
        },
        metadata: {
          startTime: new Date(),
          lastActivity: new Date(),
          messageCount: 0,
          topicsDiscussed: new Set(),
          successfulQueries: 0,
          failedQueries: 0
        }
      });
    }

    const conversation = this.activeConversations.get(conversationKey);

    // Actualizar última actividad
    conversation.metadata.lastActivity = new Date();

    // Limpiar conversaciones antiguas
    this.cleanupExpiredConversations();

    return conversation;
  },

  /**
   * Agregar mensaje a la conversación
   */
  addMessage: function(userId, message, empresaId) {
    const conversation = this.getConversation(userId, empresaId);

    const messageEntry = {
      id: Date.now(),
      text: message.text,
      sender: message.sender,
      timestamp: message.timestamp || new Date(),
      intent: message.intent || null,
      entities: message.entities || {},
      context: message.context || {},
      success: message.success !== false
    };

    // Agregar mensaje
    conversation.messages.push(messageEntry);
    conversation.metadata.messageCount++;

    // Actualizar contexto
    if (message.intent) {
      conversation.context.currentIntent = message.intent;
      conversation.context.lastTopic = message.intent;
      conversation.metadata.topicsDiscussed.add(message.intent);
    }

    // Actualizar estadísticas
    if (message.success !== false) {
      conversation.metadata.successfulQueries++;
    } else {
      conversation.metadata.failedQueries++;
    }

    // Almacenar referencias de entidades
    if (message.entities) {
      Object.entries(message.entities).forEach(([type, values]) => {
        if (Array.isArray(values)) {
          values.forEach(value => {
            conversation.context.entityReferences.set(`${type}:${value}`, {
              value: value,
              type: type,
              lastUsed: new Date(),
              frequency: (conversation.context.entityReferences.get(`${type}:${value}`)?.frequency || 0) + 1
            });
          });
        }
      });
    }

    // Mantener límite de mensajes por conversación
    if (conversation.messages.length > this.config.maxMessagesPerConversation) {
      conversation.messages = conversation.messages.slice(-this.config.maxMessagesPerConversation);
    }

    return conversation;
  },

  /**
   * Recuperar contexto relevante para una nueva consulta
   */
  getRelevantContext: function(userId, currentMessage = '', empresaId) {
    const conversation = this.getConversation(userId, empresaId);

    const context = {
      recentMessages: [],
      currentTopic: conversation.context.currentIntent,
      userPreferences: conversation.context.userPreferences,
      entityReferences: [],
      conversationStats: {
        totalMessages: conversation.metadata.messageCount,
        successRate: conversation.metadata.successfulQueries /
          Math.max(conversation.metadata.messageCount, 1),
        topicsDiscussed: Array.from(conversation.metadata.topicsDiscussed)
      },
      temporalContext: this.getTemporalContext(conversation),
      relationalContext: this.getRelationalContext(conversation, currentMessage)
    };

    // Obtener mensajes recientes relevantes
    const recentMessages = conversation.messages.slice(-this.config.contextWindowSize);
    context.recentMessages = recentMessages.map(msg => ({
      text: msg.text,
      sender: msg.sender,
      intent: msg.intent,
      timestamp: msg.timestamp,
      success: msg.success
    }));

    // Obtener referencias de entidades más frecuentes
    const entityRefs = Array.from(conversation.context.entityReferences.entries())
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 5)
      .map(([key, data]) => ({
        key: key,
        value: data.value,
        type: data.type,
        frequency: data.frequency,
        lastUsed: data.lastUsed
      }));

    context.entityReferences = entityRefs;

    return context;
  },

  /**
   * Obtener contexto temporal basado en el historial
   */
  getTemporalContext: function(conversation) {
    const recentMessages = conversation.messages.slice(-5);
    const temporalPatterns = {
      today: /\bhoy\b/gi,
      yesterday: /\bayer\b/gi,
      tomorrow: /\bmañana\b/gi,
      thisWeek: /\besta semana\b/gi,
      thisMonth: /\beste mes\b/gi,
      lastWeek: /\bla semana pasada\b|\bsemana anterior\b/gi,
      lastMonth: /\bel mes pasado\b|\bmes anterior\b/gi
    };

    const temporalContext = {
      preferredTimeframe: null,
      lastTimeReference: null,
      frequency: {}
    };

    recentMessages.forEach(message => {
      Object.entries(temporalPatterns).forEach(([timeframe, pattern]) => {
        if (pattern.test(message.text)) {
          temporalContext.frequency[timeframe] = (temporalContext.frequency[timeframe] || 0) + 1;
          temporalContext.lastTimeReference = timeframe;
        }
      });
    });

    // Determinar timeframe preferido
    if (Object.keys(temporalContext.frequency).length > 0) {
      const [preferred] = Object.entries(temporalContext.frequency)
        .sort((a, b) => b[1] - a[1]);
      temporalContext.preferredTimeframe = preferred[0];
    }

    return temporalContext;
  },

  /**
   * Obtener contexto relacional basado en el historial
   */
  getRelationalContext: function(conversation, currentMessage) {
    const relationalContext = {
      scope: 'general', // 'general', 'company', 'user', 'specific'
      relationships: [],
      preferences: {}
    };

    // Analizar mensajes recientes para determinar alcance
    const recentMessages = conversation.messages.slice(-10);
    const companyReferences = recentMessages.filter(msg =>
      /\b(empresa|compañía|organización|mi empresa|nuestra)\b/gi.test(msg.text)
    ).length;

    const userReferences = recentMessages.filter(msg =>
      /\b(mi|mis|yo|mío|mía|nuestro|nuestra)\b/gi.test(msg.text)
    ).length;

    if (companyReferences > userReferences) {
      relationalContext.scope = 'company';
    } else if (userReferences > companyReferences) {
      relationalContext.scope = 'user';
    }

    // Extraer relaciones mencionadas
    const relationshipPatterns = [
      { pattern: /\bconductor.*vehículo\b|\bvehículo.*conductor\b/gi, type: 'driver_vehicle' },
      { pattern: /\bruta.*vehículo\b|\bvehículo.*ruta\b/gi, type: 'vehicle_route' },
      { pattern: /\bempresa.*usuario\b|\busuario.*empresa\b/gi, type: 'company_user' },
      { pattern: /\bviaje.*ruta\b|\bruta.*viaje\b/gi, type: 'trip_route' }
    ];

    relationshipPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(currentMessage) ||
          recentMessages.some(msg => pattern.test(msg.text))) {
        relationalContext.relationships.push(type);
      }
    });

    return relationalContext;
  },

  /**
   * Almacenar variables de sesión
   */
  setSessionVariable: function(userId, key, value, empresaId) {
    const conversation = this.getConversation(userId, empresaId);
    conversation.context.sessionVariables[key] = {
      value: value,
      timestamp: new Date(),
      usageCount: 0
    };
  },

  /**
   * Recuperar variable de sesión
   */
  getSessionVariable: function(userId, key, empresaId) {
    const conversation = this.getConversation(userId, empresaId);
    const variable = conversation.context.sessionVariables[key];

    if (variable) {
      variable.usageCount++;
      return variable.value;
    }

    return null;
  },

  /**
   * Actualizar preferencias del usuario
   */
  updateUserPreferences: function(userId, preferences, empresaId) {
    const conversation = this.getConversation(userId, empresaId);

    Object.entries(preferences).forEach(([key, value]) => {
      conversation.context.userPreferences[key] = {
        value: value,
        timestamp: new Date(),
        confidence: preferences.confidence || 1
      };
    });
  },

  /**
   * Obtener sugerencias basadas en el historial
   */
  getSuggestions: function(userId, empresaId) {
    const conversation = this.getConversation(userId, empresaId);
    const suggestions = [];

    // Sugerencias basadas en temas discutidos
    const topics = Array.from(conversation.metadata.topicsDiscussed);
    if (topics.includes('drivers')) {
      suggestions.push({
        text: '¿Quieres ver los conductores disponibles?',
        category: 'drivers',
        icon: '👨‍💼',
        relevance: 0.8
      });
    }

    if (topics.includes('vehicles')) {
      suggestions.push({
        text: '¿Te interesa el estado de la flota?',
        category: 'vehicles',
        icon: '🚗',
        relevance: 0.8
      });
    }

    if (topics.includes('expirations')) {
      suggestions.push({
        text: '¿Hay documentos próximos a vencer?',
        category: 'expirations',
        icon: '⚠️',
        relevance: 0.9
      });
    }

    // Sugerencias basadas en contexto temporal
    const temporalContext = this.getTemporalContext(conversation);
    if (temporalContext.preferredTimeframe === 'today') {
      suggestions.push({
        text: '¿Qué viajes hay programados para hoy?',
        category: 'schedules',
        icon: '⏰',
        relevance: 0.7
      });
    }

    return suggestions.slice(0, 4);
  },

  /**
   * Limpiar conversaciones expiradas
   */
  cleanupExpiredConversations: function() {
    const now = new Date();
    const expirationTime = this.config.memoryExpirationHours * 60 * 60 * 1000;

    for (const [key, conversation] of this.activeConversations.entries()) {
      const timeDiff = now - conversation.metadata.lastActivity;
      if (timeDiff > expirationTime) {
        this.activeConversations.delete(key);
      }
    }

    // Limitar número máximo de conversaciones activas
    if (this.activeConversations.size > this.config.maxConversations) {
      const entries = Array.from(this.activeConversations.entries());
      entries.sort((a, b) => a[1].metadata.lastActivity - b[1].metadata.lastActivity);

      const toRemove = entries.slice(0, entries.length - this.config.maxConversations);
      toRemove.forEach(([key]) => this.activeConversations.delete(key));
    }
  },

  /**
   * Obtener estadísticas de la conversación
   */
  getConversationStats: function(userId, empresaId) {
    const conversation = this.getConversation(userId, empresaId);

    return {
      ...conversation.metadata,
      context: {
        currentIntent: conversation.context.currentIntent,
        topicsDiscussed: Array.from(conversation.metadata.topicsDiscussed),
        entityReferencesCount: conversation.context.entityReferences.size,
        sessionVariablesCount: Object.keys(conversation.context.sessionVariables).length
      },
      memoryUsage: {
        activeConversations: this.activeConversations.size,
        maxConversations: this.config.maxConversations
      }
    };
  },

  /**
   * Resetear conversación
   */
  resetConversation: function(userId, empresaId) {
    const conversationKey = `${userId}_${empresaId}`;
    this.activeConversations.delete(conversationKey);
  }
};

export default conversationMemory;