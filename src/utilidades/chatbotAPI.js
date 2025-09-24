// src/utilidades/chatbotAPI.js - API Avanzada del ChatBot con IA
import { apiClient, apiUtils } from '../api/baseAPI';
import nlpProcessor from './nlpProcessor';
import conversationMemory from './conversationMemory';
import queryEngine from './queryEngine';
import cacheService from './cacheService';

/**
 * API Avanzada para el servicio de ChatBot con Inteligencia Artificial
 */
const chatbotAPI = {
  /**
   * Procesar consulta inteligente con análisis NLP completo
   */
  procesarConsultaInteligente: async function(mensaje, opciones = {}) {
    const startTime = Date.now();

    try {
      // Obtener contexto del usuario
      const userContext = this.obtenerContextoUsuario();

      if (!userContext.esUsuarioAutenticado) {
        return {
          success: false,
          respuesta: 'Para usar el chatbot, necesitas iniciar sesión en el sistema.',
          intencion: 'auth_required',
          timestamp: new Date().toISOString()
        };
      }

      // Análisis NLP avanzado
      const nlpAnalysis = nlpProcessor.processMessage(mensaje);

      // Obtener contexto de conversación
      const conversationContext = conversationMemory.getRelevantContext(
        userContext.idUsuario,
        mensaje,
        userContext.idEmpresa
      );

      // Generar consulta inteligente
      const smartQuery = queryEngine.generateQuery(
        nlpAnalysis.semanticAnalysis.intent,
        nlpAnalysis.entities,
        nlpAnalysis.context,
        userContext
      );

      // Ejecutar consulta con cache
      const resultado = await this.ejecutarConsultaInteligente(
        smartQuery,
        userContext,
        opciones
      );

      // Generar respuesta inteligente
      const respuestaInteligente = await this.generarRespuestaInteligente(
        nlpAnalysis,
        resultado,
        conversationContext,
        userContext
      );

      // Registrar en memoria de conversación
      conversationMemory.addMessage(
        userContext.idUsuario,
        {
          text: mensaje,
          sender: 'user',
          intent: nlpAnalysis.semanticAnalysis.intent,
          entities: nlpAnalysis.entities,
          context: nlpAnalysis.context,
          success: resultado.success
        },
        userContext.idEmpresa
      );

      conversationMemory.addMessage(
        userContext.idUsuario,
        {
          text: respuestaInteligente.respuesta,
          sender: 'bot',
          intent: nlpAnalysis.semanticAnalysis.intent,
          success: resultado.success
        },
        userContext.idEmpresa
      );

      const processingTime = Date.now() - startTime;

      return {
        success: resultado.success,
        respuesta: respuestaInteligente.respuesta,
        intencion: nlpAnalysis.semanticAnalysis.intent,
        confianza: nlpAnalysis.semanticAnalysis.confidence,
        entidades: nlpAnalysis.entities,
        consultaSQL: smartQuery.sql,
        tiempoProcesamiento: processingTime,
        sugerencias: conversationMemory.getSuggestions(userContext.idUsuario, userContext.idEmpresa),
        timestamp: new Date().toISOString(),
        metadata: {
          nlpAnalysis,
          conversationContext,
          smartQuery,
          cacheUsed: resultado.fromCache || false
        }
      };

    } catch (error) {
      console.error('Error en procesamiento inteligente:', error);

      const processingTime = Date.now() - startTime;

      return {
        success: false,
        respuesta: this.generarRespuestaError(error, mensaje),
        intencion: 'error',
        tiempoProcesamiento: processingTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  },

  /**
   * Ejecutar consulta inteligente con cache
   */
  ejecutarConsultaInteligente: async function(smartQuery, userContext, opciones = {}) {
    if (!smartQuery.sql) {
      return {
        success: false,
        data: null,
        message: 'No se pudo generar una consulta válida'
      };
    }

    try {
      // Usar cache inteligente
      const resultado = await cacheService.getWithCache(
        smartQuery.sql,
        smartQuery.params,
        userContext,
        async () => {
          const response = await apiClient.post('/api/chatbot/query', {
            sql: smartQuery.sql,
            params: smartQuery.params,
            metadata: smartQuery.metadata
          });
          return response.data;
        },
        { ttl: opciones.ttl || 5 * 60 * 1000 } // 5 minutos por defecto
      );

      return {
        success: true,
        data: resultado,
        fromCache: true
      };

    } catch (error) {
      console.error('Error ejecutando consulta inteligente:', error);

      // Intentar con consulta simplificada como fallback
      try {
        const fallbackResult = await this.ejecutarConsultaFallback(
          smartQuery.intent,
          userContext
        );

        return {
          success: true,
          data: fallbackResult,
          fromCache: false,
          isFallback: true
        };

      } catch (fallbackError) {
        return {
          success: false,
          data: null,
          error: fallbackError.message
        };
      }
    }
  },

  /**
   * Ejecutar consulta de fallback cuando la inteligente falla
   */
  ejecutarConsultaFallback: async function(intent, userContext) {
    const fallbacks = {
      drivers: async () => {
        const response = await apiClient.get(`/api/conductores?limit=10&idEmpresa=${userContext.idEmpresa}`);
        return {
          tipo: 'drivers',
          datos: response.data,
          mensaje: `Encontré ${response.data.length} conductores en el sistema.`
        };
      },
      vehicles: async () => {
        const response = await apiClient.get(`/api/vehiculos?limit=10&idEmpresa=${userContext.idEmpresa}`);
        return {
          tipo: 'vehicles',
          datos: response.data,
          mensaje: `Encontré ${response.data.length} vehículos en el sistema.`
        };
      },
      status: async () => {
        const response = await apiClient.get(`/api/dashboard/estadisticas`);
        return {
          tipo: 'status',
          datos: response.data,
          mensaje: 'Aquí tienes el estado general del sistema.'
        };
      }
    };

    const fallback = fallbacks[intent];
    if (fallback) {
      return await fallback();
    }

    // Fallback genérico
    return {
      tipo: 'general',
      datos: [],
      mensaje: 'Consulta procesada con método alternativo.'
    };
  },

  /**
   * Generar respuesta inteligente basada en análisis y datos
   */
  generarRespuestaInteligente: async function(nlpAnalysis, resultado, conversationContext, userContext) {
    const { intent, confidence } = nlpAnalysis.semanticAnalysis;

    // Caso especial para saludos - siempre responder apropiadamente
    if (intent === 'greeting') {
      return {
        respuesta: '¡Hola! Soy el asistente virtual de TransSync. Tengo acceso a datos reales del sistema y puedo ayudarte con información sobre conductores, vehículos, rutas y más. ¿En qué puedo ayudarte hoy?',
        tipo: 'greeting_success',
        sugerencias: []
      };
    }

    // Caso especial para despedidas
    if (intent === 'farewell') {
      return {
        respuesta: '¡Hasta luego! Ha sido un placer ayudarte. Que tengas un excelente día.',
        tipo: 'farewell_success',
        sugerencias: []
      };
    }

    // Caso especial para ayuda
    if (intent === 'help') {
      return {
        respuesta: this.generarRespuestaAyuda(),
        tipo: 'help_success',
        sugerencias: []
      };
    }

    // Si la confianza es baja, pedir clarificación
    if (confidence < 0.6) {
      return {
        respuesta: `No estoy completamente seguro de entender tu consulta sobre "${nlpAnalysis.originalMessage}". ¿Podrías ser más específico? Por ejemplo: "${this.generarEjemploConsulta(intent)}"`,
        tipo: 'clarification_needed',
        sugerencias: this.generarSugerenciasClarificacion(intent)
      };
    }

    // Si no hay datos, manejar caso especial
    if (!resultado.success || !resultado.data) {
      return {
        respuesta: this.generarRespuestaSinDatos(intent, nlpAnalysis.originalMessage),
        tipo: 'no_data',
        sugerencias: this.generarSugerenciasAlternativas(intent)
      };
    }

    // Generar respuesta basada en intención y datos
    const respuesta = await this.generarRespuestaPorIntencion(
      intent,
      resultado.data,
      nlpAnalysis.entities,
      conversationContext,
      userContext
    );

    return {
      respuesta: respuesta,
      tipo: 'success',
      datos: resultado.data,
      metadata: {
        intent: intent,
        confidence: confidence,
        dataCount: Array.isArray(resultado.data) ? resultado.data.length : 1,
        fromCache: resultado.fromCache,
        isFallback: resultado.isFallback
      }
    };
  },

  /**
   * Generar respuesta específica por intención
   */
  generarRespuestaPorIntencion: async function(intent, data, entities, conversationContext, userContext) {
    const generators = {
      drivers: (data) => this.generarRespuestaConductores(data, entities),
      vehicles: (data) => this.generarRespuestaVehiculos(data, entities),
      routes: (data) => this.generarRespuestaRutas(data, entities),
      schedules: (data) => this.generarRespuestaHorarios(data, entities),
      status: (data) => this.generarRespuestaEstado(data),
      reports: (data) => this.generarRespuestaReportes(data),
      expirations: (data) => this.generarRespuestaVencimientos(data),
      companies: (data) => this.generarRespuestaEmpresas(data),
      users: (data) => this.generarRespuestaUsuarios(data),
      help: () => this.generarRespuestaAyuda(),
      greeting: () => '¡Hola! Soy el asistente virtual de TransSync. Tengo acceso a datos reales del sistema y puedo ayudarte con información sobre conductores, vehículos, rutas y más. ¿En qué puedo ayudarte hoy?',
      farewell: () => '¡Hasta luego! Ha sido un placer ayudarte. Que tengas un excelente día.'
    };

    const generator = generators[intent];
    if (generator) {
      return generator(data);
    }

    // Respuesta genérica
    return `He procesado tu consulta y encontré ${Array.isArray(data) ? data.length : 'información'} resultados relevantes.`;
  },

  /**
   * Generadores de respuesta específicos
   */
  generarRespuestaConductores: function(data, entities) {
    if (Array.isArray(data) && data.length > 0) {
      const activos = data.filter(d => d.estConductor === 'ACTIVO').length;
      const total = data.length;

      let respuesta = `📊 **Estado de Conductores:**\n`;
      respuesta += `• **Total:** ${total} conductores\n`;
      respuesta += `• **Activos:** ${activos}\n`;
      respuesta += `• **Inactivos:** ${total - activos}\n`;

      if (entities.statuses?.includes('activo')) {
        const activosList = data.filter(d => d.estConductor === 'ACTIVO').slice(0, 5);
        respuesta += `\n**Conductores Activos:**\n`;
        activosList.forEach((conductor, index) => {
          respuesta += `${index + 1}. ${conductor.nomConductor || 'Sin nombre'} ${conductor.apeConductor || ''}\n`;
        });
      }

      return respuesta;
    }

    return 'No encontré información de conductores en este momento.';
  },

  generarRespuestaVehiculos: function(data, entities) {
    if (Array.isArray(data) && data.length > 0) {
      const disponibles = data.filter(d => d.estVehiculo === 'DISPONIBLE').length;
      const total = data.length;

      let respuesta = `🚗 **Estado de la Flota:**\n`;
      respuesta += `• **Total:** ${total} vehículos\n`;
      respuesta += `• **Disponibles:** ${disponibles}\n`;
      respuesta += `• **En ruta:** ${data.filter(d => d.estVehiculo === 'EN_RUTA').length}\n`;
      respuesta += `• **En mantenimiento:** ${data.filter(d => d.estVehiculo === 'EN_MANTENIMIENTO').length}\n`;

      if (entities.statuses?.includes('disponible')) {
        const disponiblesList = data.filter(d => d.estVehiculo === 'DISPONIBLE').slice(0, 5);
        respuesta += `\n**Vehículos Disponibles:**\n`;
        disponiblesList.forEach((vehiculo, index) => {
          respuesta += `${index + 1}. ${vehiculo.marVehiculo || 'Sin marca'} ${vehiculo.modVehiculo || ''} - ${vehiculo.plaVehiculo || 'Sin placa'}\n`;
        });
      }

      return respuesta;
    }

    return 'No encontré información de vehículos en este momento.';
  },

  generarRespuestaRutas: function(data, entities) {
    if (Array.isArray(data) && data.length > 0) {
      let respuesta = `🗺️ **Rutas Disponibles (${data.length}):**\n\n`;
      data.slice(0, 10).forEach((ruta, index) => {
        respuesta += `${index + 1}. **${ruta.nomRuta || 'Sin nombre'}**\n`;
        respuesta += `   📍 Origen: ${ruta.oriRuta || 'No especificado'}\n`;
        respuesta += `   🎯 Destino: ${ruta.desRuta || 'No especificado'}\n\n`;
      });

      if (data.length > 10) {
        respuesta += `*Mostrando 10 de ${data.length} rutas. Para ver más, especifica criterios de búsqueda.*`;
      }

      return respuesta;
    }

    return 'No encontré rutas registradas en el sistema.';
  },

  generarRespuestaHorarios: function(data, entities) {
    if (Array.isArray(data) && data.length > 0) {
      const hoy = data.filter(d => {
        const fecha = new Date(d.fecHorSalViaje);
        const hoy = new Date();
        return fecha.toDateString() === hoy.toDateString();
      });

      let respuesta = `⏰ **Programación de Viajes:**\n`;
      respuesta += `• **Total programados:** ${data.length}\n`;
      respuesta += `• **Viajes de hoy:** ${hoy.length}\n`;
      respuesta += `• **En curso:** ${data.filter(d => d.estViaje === 'EN_CURSO').length}\n`;

      if (hoy.length > 0) {
        respuesta += `\n**Viajes de Hoy:**\n`;
        hoy.slice(0, 5).forEach((viaje, index) => {
          const hora = new Date(viaje.fecHorSalViaje).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
          respuesta += `${index + 1}. ${hora} - ${viaje.nomRuta || 'Ruta sin nombre'}\n`;
        });
      }

      return respuesta;
    }

    return 'No encontré información de horarios en este momento.';
  },

  generarRespuestaEstado: function(data) {
    if (data && typeof data === 'object') {
      let respuesta = `📊 **Estado General del Sistema:**\n\n`;

      if (data.conductoresActivos !== undefined) {
        respuesta += `🟢 **Conductores activos:** ${data.conductoresActivos}\n`;
      }
      if (data.vehiculosDisponibles !== undefined) {
        respuesta += `🟢 **Vehículos disponibles:** ${data.vehiculosDisponibles}\n`;
      }
      if (data.viajesEnCurso !== undefined) {
        respuesta += `🔵 **Viajes en curso:** ${data.viajesEnCurso}\n`;
      }
      if (data.totalRutas !== undefined) {
        respuesta += `🗺️ **Rutas registradas:** ${data.totalRutas}\n`;
      }

      respuesta += `\n✅ Todo funcionando correctamente.`;
      return respuesta;
    }

    return 'No pude obtener el estado general del sistema.';
  },

  generarRespuestaReportes: function(data) {
    return `📊 **Reportes Disponibles:**\n\n• **Dashboard Principal:** Métricas en tiempo real\n• **Informes de Conductores:** Rendimiento y estadísticas\n• **Reportes de Flota:** Estado y utilización de vehículos\n• **Análisis de Rutas:** Eficiencia y tiempos\n• **Reportes de Mantenimiento:** Historial y programación\n\nAccede a la sección Informes para generar reportes detallados.`;
  },

  generarRespuestaVencimientos: function(data) {
    if (Array.isArray(data) && data.length > 0) {
      const criticos = data.filter(d => d.estado === 'CRÍTICO' || d.estado === 'VENCIDO');
      const normales = data.filter(d => d.estado === 'NORMAL');

      let respuesta = `⚠️ **Alertas de Vencimiento:**\n\n`;
      respuesta += `🚨 **Críticos/Vencidos:** ${criticos.length}\n`;
      respuesta += `⚠️ **Próximos (60 días):** ${normales.length}\n\n`;

      if (criticos.length > 0) {
        respuesta += `**Documentos Críticos:**\n`;
        criticos.slice(0, 5).forEach((doc, index) => {
          respuesta += `${index + 1}. ${doc.tipoDocumento}: ${doc.titular} (${doc.diasParaVencer} días)\n`;
        });
      }

      return respuesta;
    }

    return '✅ No hay documentos próximos a vencer en los próximos 30 días.';
  },

  generarRespuestaEmpresas: function(data) {
    if (Array.isArray(data) && data.length > 0) {
      let respuesta = `🏢 **Empresas Registradas (${data.length}):**\n\n`;
      data.forEach((empresa, index) => {
        respuesta += `${index + 1}. **${empresa.nomEmpresa || 'Sin nombre'}**\n`;
        respuesta += `   📋 NIT: ${empresa.nitEmpresa || 'No especificado'}\n`;
        respuesta += `   📍 ${empresa.dirEmpresa || 'Dirección no especificada'}\n\n`;
      });
      return respuesta;
    }

    return 'No encontré información de empresas.';
  },

  generarRespuestaUsuarios: function(data) {
    if (Array.isArray(data) && data.length > 0) {
      const porRol = {};
      data.forEach(user => {
        const rol = user.nomRol || 'Sin rol';
        porRol[rol] = (porRol[rol] || 0) + 1;
      });

      let respuesta = `👥 **Usuarios del Sistema (${data.length}):**\n\n`;
      Object.entries(porRol).forEach(([rol, count]) => {
        respuesta += `• **${rol}:** ${count} usuarios\n`;
      });

      return respuesta;
    }

    return 'No encontré información de usuarios.';
  },

  generarRespuestaAyuda: function() {
    return `🔧 **¿En qué puedo ayudarte?**\n\nPuedo consultar información sobre:\n\n🚗 **Vehículos:** Estado, disponibilidad, mantenimiento\n👨‍💼 **Conductores:** Disponibilidad, licencias, asignaciones\n📍 **Rutas:** Recorridos registrados y programación\n⏰ **Horarios:** Viajes programados y en curso\n📊 **Reportes:** Estadísticas y análisis del sistema\n⚠️ **Vencimientos:** Alertas de documentos próximos a vencer\n🏢 **Empresas:** Información general\n👥 **Usuarios:** Roles y permisos\n\n**Ejemplos de consultas:**\n• "¿Cuántos conductores están activos?"\n• "Muéstrame el estado de los vehículos"\n• "¿Hay licencias por vencer?"\n• "¿Qué rutas tenemos disponibles?"`;
  },

  /**
   * Generar respuesta de error inteligente
   */
  generarRespuestaError: function(error, mensajeOriginal) {
    const errores = {
      'NETWORK_ERROR': 'Sin conexión a internet. Verifica tu conexión e intenta nuevamente.',
      'TIMEOUT': 'La consulta está tardando más de lo esperado. Intenta con una consulta más específica.',
      'UNAUTHORIZED': 'No tienes permisos para acceder a esta información. Contacta al administrador.',
      'NOT_FOUND': 'No encontré la información solicitada. Verifica los datos e intenta nuevamente.',
      'SERVER_ERROR': 'Error del servidor. Nuestros técnicos han sido notificados.',
      'DATABASE_ERROR': 'Error de base de datos. Intenta nuevamente en unos momentos.'
    };

    // Intentar identificar el tipo de error
    let tipoError = 'SERVER_ERROR';

    if (!navigator.onLine || error.code === 'NETWORK_ERROR') {
      tipoError = 'NETWORK_ERROR';
    } else if (error.code === 'ECONNABORTED') {
      tipoError = 'TIMEOUT';
    } else if (error.response?.status === 401) {
      tipoError = 'UNAUTHORIZED';
    } else if (error.response?.status === 404) {
      tipoError = 'NOT_FOUND';
    }

    return errores[tipoError] || 'Lo siento, ocurrió un error procesando tu consulta. Por favor intenta nuevamente.';
  },

  /**
   * Generar ejemplo de consulta para clarificación
   */
  generarEjemploConsulta: function(intent) {
    const ejemplos = {
      drivers: '¿Cuántos conductores activos hay?',
      vehicles: '¿Qué vehículos están disponibles?',
      routes: '¿Qué rutas tenemos registradas?',
      schedules: '¿Qué viajes hay programados para hoy?',
      status: '¿Cuál es el estado general del sistema?',
      reports: '¿Puedes mostrarme estadísticas de uso?',
      expirations: '¿Hay documentos próximos a vencer?',
      companies: '¿Qué empresas están registradas?',
      users: '¿Cuántos usuarios hay por rol?'
    };

    return ejemplos[intent] || '¿Puedes ser más específico con tu consulta?';
  },

  /**
   * Generar sugerencias para clarificación
   */
  generarSugerenciasClarificacion: function(intent) {
    const sugerencias = {
      drivers: [
        '¿Quieres saber sobre conductores activos?',
        '¿Te interesa información sobre licencias?',
        '¿Buscas conductores disponibles?'
      ],
      vehicles: [
        '¿Quieres ver vehículos disponibles?',
        '¿Te interesa el estado de mantenimiento?',
        '¿Buscas información sobre asignaciones?'
      ],
      routes: [
        '¿Quieres ver todas las rutas?',
        '¿Buscas una ruta específica?',
        '¿Te interesa información de destinos?'
      ]
    };

    return sugerencias[intent] || [
      '¿Puedes ser más específico?',
      '¿Qué tipo de información necesitas?',
      'Intenta reformular tu pregunta'
    ];
  },

  /**
   * Generar respuesta cuando no hay datos
   */
  generarRespuestaSinDatos: function(intent, mensajeOriginal) {
    const respuestas = {
      drivers: 'No encontré información de conductores. Verifica que tengas conductores registrados en el sistema.',
      vehicles: 'No encontré información de vehículos. Asegúrate de tener vehículos registrados.',
      routes: 'No hay rutas registradas en el sistema. Crea algunas rutas primero.',
      schedules: 'No encontré viajes programados. Programa algunos viajes para ver información.',
      status: 'No pude obtener el estado del sistema. Verifica tu conexión.',
      reports: 'No hay datos suficientes para generar reportes.',
      expirations: 'No hay documentos próximos a vencer. ¡Todo está al día!',
      companies: 'No encontré información de empresas.',
      users: 'No encontré información de usuarios.'
    };

    return respuestas[intent] || `No encontré información para tu consulta: "${mensajeOriginal}". Verifica los datos e intenta nuevamente.`;
  },

  /**
   * Generar sugerencias alternativas
   */
  generarSugerenciasAlternativas: function(intent) {
    const alternativas = {
      drivers: ['Ver estado general del sistema', 'Consultar información de vehículos'],
      vehicles: ['Ver estado general del sistema', 'Consultar información de conductores'],
      routes: ['Ver viajes programados', 'Consultar estado del sistema'],
      schedules: ['Ver rutas disponibles', 'Consultar estado del sistema']
    };

    return alternativas[intent] || ['Ver estado general del sistema', 'Consultar ayuda'];
  },

  /**
   * Enviar consulta al chatbot (método legacy para compatibilidad)
   */
  enviarConsulta: async function(mensaje, idEmpresa = null, idUsuario = null) {
    // Usar el nuevo método inteligente
    const resultado = await this.procesarConsultaInteligente(mensaje, {
      legacyMode: true,
      idEmpresa: idEmpresa,
      idUsuario: idUsuario
    });

    // Adaptar respuesta al formato legacy
    return {
      success: resultado.success,
      respuesta: resultado.respuesta,
      intencion: resultado.intencion,
      timestamp: resultado.timestamp,
      error: resultado.error,
      // Nuevos campos
      confianza: resultado.confianza,
      entidades: resultado.entidades,
      tiempoProcesamiento: resultado.tiempoProcesamiento,
      sugerencias: resultado.sugerencias
    };
  },

  /**
   * Obtener estadísticas de uso del chatbot
   */
  obtenerEstadisticas: async function(dias = 30) {
    try {
      // Usar ruta completa con /api/
      const response = await apiClient.get('/api/chatbot/estadisticas', {
        params: { dias }
      });

      return {
        success: true,
        data: response.data.estadisticas || [],
        periodo: response.data.periodo,
        error: null
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas del chatbot:', error);

      return {
        success: false,
        data: [],
        error: apiUtils.formatError(error)
      };
    }
  },

  /**
   * Verificar el estado del servicio de chatbot
   */
  verificarEstado: async function() {
    try {
      // Usar ruta completa con /api/
      const response = await apiClient.get('/api/chatbot/health');

      return {
        success: true,
        estado: response.data.status,
        servicio: response.data.service,
        version: response.data.version,
        timestamp: response.data.timestamp,
        error: null
      };

    } catch (error) {
      console.error('Error verificando estado del chatbot:', error);

      return {
        success: false,
        estado: 'ERROR',
        error: apiUtils.formatError(error)
      };
    }
  },

  /**
   * Obtener sugerencias de consultas predefinidas
   */
  obtenerSugerencias: function() {
    return [
      {
        texto: '¿Cuántos conductores están activos?',
        categoria: 'conductores',
        icono: '👨‍💼'
      },
      {
        texto: '¿Qué vehículos están disponibles?',
        categoria: 'vehiculos',
        icono: '🚗'
      },
      {
        texto: 'Muestra el estado general del sistema',
        categoria: 'estado',
        icono: '📊'
      },
      {
        texto: '¿Hay documentos próximos a vencer?',
        categoria: 'vencimientos',
        icono: '⚠️'
      },
      {
        texto: '¿Qué rutas tenemos registradas?',
        categoria: 'rutas',
        icono: '🗺'
      },
      {
        texto: '¿Cuántos viajes hay programados?',
        categoria: 'horarios',
        icono: '⏰'
      },
      {
        texto: 'Necesito ayuda con el sistema',
        categoria: 'ayuda',
        icono: '❓'
      },
      {
        texto: 'Genera un reporte de la flota',
        categoria: 'reportes',
        icono: '📋'
      }
    ];
  },

  /**
   * Formatear mensaje para mejorar la experiencia del usuario
   */
  formatearMensaje: function(mensaje) {
    if (!mensaje) return '';

    return mensaje
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/• /g, '• ')
      .replace(/\n/g, '<br>');
  },

  /**
   * Validar mensaje antes de enviarlo
   */
  validarMensaje: function(mensaje) {
    if (!mensaje || mensaje.trim() === '') {
      return {
        esValido: false,
        error: 'El mensaje no puede estar vacío'
      };
    }

    if (mensaje.length > 1000) {
      return {
        esValido: false,
        error: 'El mensaje es demasiado largo (máximo 1000 caracteres)'
      };
    }

    const caracteresProhibidos = ['<script', 'onload=', 'onerror='];
    const tieneCaracteresProhibidos = caracteresProhibidos.some(char =>
      mensaje.toLowerCase().includes(char)
    );

    if (tieneCaracteresProhibidos) {
      return {
        esValido: false,
        error: 'El mensaje contiene caracteres no permitidos'
      };
    }

    return {
      esValido: true,
      error: null
    };
  },

  /**
   * Obtener contexto del usuario para personalizar respuestas
   */
  obtenerContextoUsuario: function() {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const authToken = localStorage.getItem('authToken');

      return {
        esUsuarioAutenticado: !!authToken,
        nombreUsuario: userData.nombre || 'Usuario',
        rol: userData.rol || 'CONDUCTOR',
        empresa: userData.nombreEmpresa || 'TransSync',
        idEmpresa: userData.idEmpresa || 1,
        idUsuario: userData.idUsuario || null
      };
    } catch (error) {
      console.error('Error obteniendo contexto del usuario:', error);
      return {
        esUsuarioAutenticado: false,
        nombreUsuario: 'Usuario',
        rol: 'CONDUCTOR',
        empresa: 'TransSync',
        idEmpresa: 1,
        idUsuario: null
      };
    }
  }
};

export default chatbotAPI;