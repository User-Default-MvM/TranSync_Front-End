import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import chatbotAPI from '../utilidades/chatbotAPI';
import conversationMemory from '../utilidades/conversationMemory';
import realTimeService from '../utilidades/realTimeService';
import { useTheme } from '../context/ThemeContext'; // 👈 Importar useTheme

// Componente Button con paleta uniforme y modo oscuro
const Button = ({
children,
onClick,
variant = "primary",
size = "medium",
className = "",
disabled = false,
dark = false,
...props
}) => {
const { theme: appTheme } = useTheme();
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: appTheme === "dark"
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md"
      : "bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white hover:from-[#0d1642] hover:to-[#283593] focus:ring-[#3949ab] focus:ring-opacity-50 shadow-sm hover:shadow-md",
    secondary: appTheme === "dark"
      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500 focus:ring-opacity-50 shadow-sm hover:shadow-md"
      : "bg-gradient-to-r from-[#283593] to-[#3949ab] text-white hover:from-[#1a237e] hover:to-[#283593] focus:ring-[#283593] focus:ring-opacity-50 shadow-sm hover:shadow-md",
    outline: appTheme === "dark"
      ? "bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white focus:ring-blue-500 focus:ring-opacity-50"
      : "bg-transparent border-2 border-[#1a237e] text-[#1a237e] hover:bg-gradient-to-r hover:from-[#1a237e] hover:to-[#3949ab] hover:text-white focus:ring-[#1a237e] focus:ring-opacity-50"
  };
  
  const sizes = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2.5 text-base",
    large: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const ChatBot = ({
  title = "Asistente TransSync",
  initialMessage = "Hola! Soy el asistente virtual de TransSync. Puedo ayudarte con información actual sobre conductores, vehículos, rutas y mucho más. ¿En qué puedo ayudarte hoy?",
  position = "bottom-right",
  theme = "professional",
  agentAvatar = "🤖",
  userAvatar = "👤"
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [userContext, setUserContext] = useState(null);
  const { theme: appTheme } = useTheme();
  const [realTimeNotifications, setRealTimeNotifications] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [quietMode, setQuietMode] = useState(() => {
    // Recuperar preferencia del localStorage
    const saved = localStorage.getItem('chatbotQuietMode');
    return saved ? JSON.parse(saved) : false;
  });
  const messagesEndRef = useRef(null);
  
  
  useEffect(() => {
    // Obtener contexto del usuario al inicializar
    const context = chatbotAPI.obtenerContextoUsuario();
    setUserContext(context);

    // Mensaje inicial personalizado
    if (messages.length === 0) {
      const mensajeInicial = context.esUsuarioAutenticado
        ? `Hola ${context.nombreUsuario}! Soy el asistente de ${context.empresa}. Tengo acceso a datos actuales del sistema y puedo ayudarte con información sobre conductores, vehículos, rutas, horarios y más. ¿Qué necesitas consultar?`
        : t('chatbot.initialMessage');

      setMessages([
        {
          id: Date.now(),
          text: mensajeInicial,
          sender: 'bot',
          timestamp: new Date(),
          formatted: true
        }
      ]);
    }

    // Verificar estado del servicio al abrir
    if (isOpen && connectionStatus === 'unknown') {
      verificarConexion();
    }
  }, [isOpen, connectionStatus, messages.length, initialMessage, t]);

  // Manejar notificaciones en tiempo real
  const handleRealTimeNotification = useCallback((notification) => {
    // Si está en modo quiet, solo almacenar notificaciones sin mostrarlas
    if (quietMode) {
      setRealTimeNotifications(prev => [notification, ...prev.slice(0, 9)]);
      return;
    }

    // Agregar notificación al estado
    setRealTimeNotifications(prev => [notification, ...prev.slice(0, 9)]); // Mantener máximo 10

    // Crear mensaje del bot con la notificación
    const botMessage = {
      id: Date.now() + Math.random(),
      text: `🔔 **${t('chatbot.realTimeNotification')}**\n\n${notification.title}\n${notification.message}`,
      sender: 'bot',
      timestamp: new Date(),
      intencion: 'realtime_notification',
      notification: notification,
      formatted: true,
      isRealTime: true
    };

    setMessages(prev => [...prev, botMessage]);

    // Auto-scroll al final
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [quietMode, t]);

  // Configurar WebSocket para notificaciones en tiempo real
  useEffect(() => {
    if (userContext && isOpen) {
      // Conectar al servicio WebSocket
      realTimeService.connect(userContext);
      setWsConnected(true);

      // Configurar listeners para notificaciones
      const setupRealTimeListeners = () => {
        // Nuevo conductor
        realTimeService.on('notification:new_conductor', (notification) => {
          handleRealTimeNotification(notification);
        });

        // Nuevo vehículo
        realTimeService.on('notification:new_vehicle', (notification) => {
          handleRealTimeNotification(notification);
        });

        // Nuevo viaje
        realTimeService.on('notification:new_trip', (notification) => {
          handleRealTimeNotification(notification);
        });

        // Alertas de vencimiento
        realTimeService.on('notification:expiration_alert', (notification) => {
          handleRealTimeNotification(notification);
        });

        // Conexión WebSocket
        realTimeService.on('connection:established', (data) => {
          console.log('🔗 WebSocket conectado para notificaciones en tiempo real');
          setWsConnected(true);
        });

        // Desconexión WebSocket
        realTimeService.on('connection:error', (error) => {
          console.log('🔌 WebSocket desconectado:', error);
          setWsConnected(false);
        });
      };

      setupRealTimeListeners();

      // Solicitar permisos para notificaciones del navegador
      realTimeService.requestNotificationPermission();

      // Cleanup function
      return () => {
        realTimeService.disconnect();
        setWsConnected(false);
      };
    }
  }, [userContext, isOpen, handleRealTimeNotification]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar conexión con el servicio de chatbot
  const verificarConexion = async () => {
    try {
      const resultado = await chatbotAPI.verificarEstado();
      setConnectionStatus(resultado.success ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  // Animaciones CSS mejoradas con modo oscuro
  useEffect(() => {
    const styleId = 'chatbot-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes typing {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideOutDown {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(26, 35, 126, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(26, 35, 126, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(26, 35, 126, 0);
          }
        }
        
        @keyframes pulseDark {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        .typing-dot {
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        .chat-window-enter {
          animation: slideInUp 0.3s ease-out forwards;
        }
        
        .chat-window-exit {
          animation: slideOutDown 0.3s ease-in forwards;
        }
        
        .chat-button-bounce {
          animation: bounce 2s infinite;
        }
        
        .chat-button-pulse {
          animation: pulse 2s infinite;
        }
        
        .chat-button-pulse-dark {
          animation: pulseDark 2s infinite;
        }
        
        .message-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Scrollbar personalizada para modo oscuro */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${appTheme === "dark" ? 'rgba(156, 163, 175, 0.3)' : 'rgba(26, 35, 126, 0.3)'};
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${appTheme === "dark" ? 'rgba(156, 163, 175, 0.6)' : 'rgba(26, 35, 126, 0.6)'};
        }
        
        /* Estilos para mensajes formateados */
        .formatted-message {
          line-height: 1.6;
        }
        
        .formatted-message strong {
          font-weight: 600;
          color: ${appTheme === "dark" ? '#60a5fa' : '#1a237e'};
        }
        
        .formatted-message em {
          font-style: italic;
          opacity: 0.9;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [appTheme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      verificarConexion();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleQuietMode = () => {
    const newQuietMode = !quietMode;
    setQuietMode(newQuietMode);
    localStorage.setItem('chatbotQuietMode', JSON.stringify(newQuietMode));

    // Limpiar notificaciones si se activa el modo quiet
    if (newQuietMode) {
      setRealTimeNotifications([]);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isTyping) return;

    // Validar mensaje
    const validacion = chatbotAPI.validarMensaje(inputText);
    if (!validacion.esValido) {
      // Mostrar error de validación
      const errorMessage = {
        id: Date.now(),
        text: `${t('chatbot.error')}: ${validacion.error}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const mensajeUsuario = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Usar procesamiento inteligente avanzado
      const respuesta = await chatbotAPI.procesarConsultaInteligente(mensajeUsuario, {
        incluirMetadata: true,
        contextoUsuario: userContext
      });

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: respuesta.respuesta,
          sender: 'bot',
          timestamp: new Date(),
          intencion: respuesta.intencion,
          confianza: respuesta.confianza,
          entidades: respuesta.entidades,
          tiempoProcesamiento: respuesta.tiempoProcesamiento,
          sugerencias: respuesta.sugerencias,
          success: respuesta.success,
          formatted: true,
          metadata: respuesta.metadata
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

        // Actualizar sugerencias dinámicas basadas en la respuesta
        if (respuesta.sugerencias && respuesta.sugerencias.length > 0) {
          setTimeout(() => {
            // Las sugerencias se mostrarán automáticamente en el componente
          }, 1000);
        }

      }, Math.max(500, respuesta.tiempoProcesamiento || 0));

    } catch (error) {
      console.error('Error procesando mensaje inteligente:', error);

      let errorText = t('chatbot.processingError');

      // Mensaje más específico para error 404 del chatbot
      if (error.message && error.message.includes('404')) {
        errorText = '🤖 **Chatbot temporalmente no disponible**\n\nEl servicio de chatbot está siendo actualizado. Mientras tanto, puedo ayudarte con:\n\n• Información sobre conductores\n• Estado de vehículos\n• Rutas disponibles\n• Horarios de viaje\n\n¿En qué puedo ayudarte?';
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);

      // No marcar como desconectado para errores 404 del chatbot
      if (!error.message || !error.message.includes('404')) {
        setConnectionStatus('disconnected');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (sugerencia) => {
    if (isTyping) return;
    setInputText(sugerencia.texto);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Limpiar todas las notificaciones
  const clearNotifications = () => {
    setRealTimeNotifications([]);
  };

  // Ver todas las notificaciones
  const viewAllNotifications = () => {
    if (realTimeNotifications.length === 0) return;

    const notificationsText = realTimeNotifications
      .map((notif, index) => `${index + 1}. ${notif.title}: ${notif.message}`)
      .join('\n\n');

    const botMessage = {
      id: Date.now() + Math.random(),
      text: `📋 **${t('chatbot.allNotifications')} (${realTimeNotifications.length})**\n\n${notificationsText}`,
      sender: 'bot',
      timestamp: new Date(),
      intencion: 'view_notifications',
      formatted: true
    };

    setMessages(prev => [...prev, botMessage]);
    setTimeout(() => scrollToBottom(), 100);
  };

  // Clases de posición responsivas
  const getPositionClasses = () => {
    const positions = {
      'bottom-right': {
        desktop: 'bottom-6 right-6',
        mobile: 'bottom-4 right-4'
      },
      'bottom-left': {
        desktop: 'bottom-6 left-6',
        mobile: 'bottom-4 left-4'
      },
      'top-right': {
        desktop: 'top-6 right-6',
        mobile: 'top-4 right-4'
      },
      'top-left': {
        desktop: 'top-6 left-6',
        mobile: 'top-4 left-4'
      }
    };
    
    const pos = positions[position] || positions['bottom-right'];
    return `${pos.desktop} max-md:${pos.mobile}`;
  };

  // Temas mejorados con modo oscuro
  const themeClasses = {
    light: {
      window: 'bg-white text-gray-800 border border-gray-200',
      header: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white',
      botBubble: 'bg-gray-50 text-gray-800 border border-gray-100 shadow-sm',
      userBubble: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white shadow-sm',
      input: 'bg-white border-gray-200 text-gray-800 focus:border-[#3949ab]',
      inputArea: 'border-gray-100 bg-gray-50',
      timestamp: 'text-gray-500'
    },
    dark: {
      window: 'bg-gray-900 text-gray-100 border border-gray-700',
      header: 'bg-gradient-to-r from-gray-800 to-gray-700 text-white',
      botBubble: 'bg-gray-800 text-gray-100 border border-gray-700 shadow-sm',
      userBubble: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm',
      input: 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500',
      inputArea: 'border-gray-700 bg-gray-800',
      timestamp: 'text-gray-400'
    },
    professional: {
      window: appTheme === "dark"
        ? 'bg-gray-900 text-gray-100 border border-gray-700 shadow-2xl'
        : 'bg-white text-slate-800 border border-slate-200 shadow-2xl',
      header: appTheme === "dark"
        ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white'
        : 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white',
      botBubble: appTheme === "dark"
        ? 'bg-gray-800 text-gray-100 border border-gray-700 shadow-sm'
        : 'bg-slate-50 text-slate-800 border border-slate-100 shadow-sm',
      userBubble: appTheme === "dark"
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
        : 'bg-gradient-to-r from-[#283593] to-[#3949ab] text-white shadow-sm',
      input: appTheme === "dark"
        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500'
        : 'bg-white border-slate-200 text-slate-800 focus:border-[#3949ab]',
      inputArea: appTheme === "dark"
        ? 'border-gray-700 bg-gray-800'
        : 'border-slate-100 bg-slate-50',
      timestamp: appTheme === "dark" ? 'text-gray-400' : 'text-slate-500'
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.professional;

  // Determinar tamaño de ventana responsivo
  const getWindowSize = () => {
    return {
      responsive: 'w-[400px] h-[600px] max-xs:w-[calc(100vw-0.5rem)] max-xs:h-[calc(100vh-1rem)] max-xs:max-h-[500px] max-xs:max-w-[calc(100vw-0.5rem)] max-sm:w-[calc(100vw-1rem)] max-sm:h-[calc(100vh-2rem)] max-sm:max-h-[600px] max-sm:max-w-[400px] max-md:w-[380px] max-md:h-[520px] max-lg:w-[360px] max-lg:h-[500px]'
    };
  };

  // Obtener sugerencias inteligentes
  const obtenerSugerenciasInteligentes = () => {
    if (!userContext?.idUsuario) {
      return chatbotAPI.obtenerSugerencias().slice(0, 4);
    }

    try {
      // Usar sugerencias del sistema de memoria de conversación
      const sugerenciasInteligentes = conversationMemory.getSuggestions(
        userContext.idUsuario,
        userContext.idEmpresa
      );

      if (sugerenciasInteligentes && sugerenciasInteligentes.length > 0) {
        return sugerenciasInteligentes.slice(0, 4);
      }
    } catch (error) {
      console.error('Error obteniendo sugerencias inteligentes:', error);
    }

    // Fallback a sugerencias estáticas
    return chatbotAPI.obtenerSugerencias().slice(0, 4);
  };

  const sugerencias = obtenerSugerenciasInteligentes();

  return (
    <div className={`fixed z-[9999] ${getPositionClasses()}`}>
      {!isOpen ? (
        <button
          className={`
            relative group
            ${appTheme === "dark"
              ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500'
              : 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] hover:from-[#0d1642] hover:to-[#283593]'
            }
            text-white border-none rounded-full
            w-14 h-14 xs:w-12 xs:h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer
            shadow-lg hover:shadow-xl
            transition-all duration-300 ease-out
            hover:scale-110
            focus:outline-none focus:ring-4 ${appTheme === "dark" ? 'focus:ring-blue-500' : 'focus:ring-[#3949ab]'} focus:ring-opacity-50
            ${appTheme === "dark" ? 'chat-button-pulse-dark' : 'chat-button-pulse'}
          `}
          onClick={toggleChat}
          aria-label="Abrir chat de asistencia"
        >
          <span className="text-2xl sm:text-xl filter drop-shadow-sm">💬</span>

          {/* Indicadores reorganizados para evitar superposición */}
          <div className="absolute -top-2 -left-2 flex flex-col gap-0.5">
            {/* Indicador de notificaciones en tiempo real */}
            {realTimeNotifications.length > 0 && !quietMode && (
              <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center font-bold animate-pulse">
                {realTimeNotifications.length > 9 ? '9+' : realTimeNotifications.length}
              </div>
            )}

            {/* Indicador de modo quiet */}
            {quietMode && (
              <div className="bg-yellow-500 text-white text-xs rounded-full w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center font-bold">
                <span className="text-xs">🔕</span>
              </div>
            )}
          </div>

          {/* Indicadores del lado derecho */}
          <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
            {/* Indicador de conexión */}
            <div className={`w-3 h-3 xs:w-4 xs:h-4 rounded-full flex items-center justify-center ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
              <span className="text-white text-xs font-bold">
                {connectionStatus === 'connected' ? '✓' : connectionStatus === 'disconnected' ? '✗' : '?'}
              </span>
            </div>

            {/* Indicador WebSocket */}
            <div className={`w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full ${
              wsConnected ? 'bg-blue-500' : 'bg-gray-400'
            } border-1 xs:border-2 border-white`}></div>
          </div>
          
          {/* Tooltip simplificado */}
          <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 ${
            appTheme === "dark" ? 'bg-gray-800 border border-gray-600' : 'bg-[#1a237e] border border-white/20'
          } text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
            <div className="text-center">
              <div className="font-semibold">🤖 Asistente TransSync</div>
              <div className="text-xs opacity-90 mt-1">
                {connectionStatus === 'connected' && wsConnected
                  ? '✅ Conectado'
                  : connectionStatus === 'connected'
                  ? '✅ API conectado'
                  : '⏳ Verificando...'}
              </div>
              {realTimeNotifications.length > 0 && (
                <div className="text-xs mt-1 text-yellow-300">
                  🔔 {realTimeNotifications.length} pendiente{realTimeNotifications.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
              appTheme === "dark" ? 'border-t-gray-800' : 'border-t-[#1a237e]'
            }`}></div>
          </div>
        </button>
      ) : (
        <div className={`
          ${getWindowSize().responsive}
          rounded-2xl overflow-hidden 
          flex flex-col 
          backdrop-blur-sm
          chat-window-enter
          ${currentTheme.window}
        `}>
          {/* Header mejorado */}
          <div className={`p-2 xs:p-3 sm:p-4 flex justify-between items-center ${currentTheme.header} shadow-sm`}>
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3">
              <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm">🤖</span>
              </div>
              <div>
                <div className="font-semibold text-xs xs:text-sm sm:text-base leading-tight">{title}</div>
                <div className="text-xs opacity-90 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-300' :
                    connectionStatus === 'disconnected' ? 'bg-red-300' : 'bg-yellow-300'
                  }`}></span>
                  <span className="hidden xs:inline">
                    {isTyping ? 'Escribiendo...' :
                     connectionStatus === 'connected' ? 'Conectado' :
                     connectionStatus === 'disconnected' ? 'Sin conexión' : 'Verificando...'}
                  </span>
                  <span className="xs:hidden">
                    {isTyping ? '...' :
                     connectionStatus === 'connected' ? '✓' :
                     connectionStatus === 'disconnected' ? '✗' : '...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 xs:space-x-1 sm:space-x-2">
              {/* Botón de modo quiet */}
              <button
                className={`rounded-lg p-1.5 sm:p-2 transition-colors duration-200 ${
                  quietMode
                    ? 'bg-yellow-500 bg-opacity-30 hover:bg-opacity-40 text-yellow-200'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
                }`}
                onClick={toggleQuietMode}
                aria-label={quietMode ? "Desactivar modo silencioso" : "Activar modo silencioso"}
                title={quietMode ? "Modo silencioso activado" : "Activar modo silencioso"}
              >
                <span className="text-xs sm:text-sm">
                  {quietMode ? '🔕' : '🔔'}
                </span>
              </button>

              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-1.5 sm:p-2 transition-colors duration-200"
                onClick={toggleMinimize}
                aria-label={isMinimized ? "Expandir" : "Minimizar"}
              >
                <span className="text-xs sm:text-sm">
                  {isMinimized ? '🔼' : '🔽'}
                </span>
              </button>
              <button
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-1.5 sm:p-2 transition-colors duration-200"
                onClick={toggleChat}
                aria-label="Cerrar chat"
              >
                <span className="text-xs sm:text-sm">✕</span>
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Contenedor de mensajes con scroll personalizado */}
              <div className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end space-x-2 message-fade-in ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-sm ${
                        msg.isError ? 'bg-red-500' : appTheme === "dark"
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                          : 'bg-gradient-to-br from-[#1a237e] to-[#3949ab]'
                      }`}>
                        {typeof agentAvatar === 'string' && agentAvatar.startsWith('http') ? (
                          <img src={agentAvatar} alt="Bot" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{msg.isError ? '⚠️' : agentAvatar}</span>
                        )}
                      </div>
                    )}

                    <div className={`
                      px-3 sm:px-4 py-2 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[80%] break-words relative
                      ${msg.sender === 'bot'
                        ? `${msg.isError ? (appTheme === "dark" ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800') : currentTheme.botBubble} rounded-bl-md`
                        : `${currentTheme.userBubble} rounded-br-md`
                      }
                    `}>
                      <div className={`leading-relaxed text-sm whitespace-pre-line ${
                        msg.formatted ? 'formatted-message' : ''
                      }`}>
                        {msg.formatted ? (
                          <div dangerouslySetInnerHTML={{
                            __html: chatbotAPI.formatearMensaje(msg.text)
                          }} />
                        ) : (
                          msg.text
                        )}
                      </div>
                      <div className={`
                        text-xs opacity-75 text-right mt-1 sm:mt-2 flex items-center justify-end gap-1 flex-wrap
                        ${currentTheme.timestamp}
                      `}>
                        {formatTimestamp(msg.timestamp)}
                        {msg.intencion && (
                          <span className={`text-xs px-1 rounded ${
                            appTheme === "dark" ? 'bg-white bg-opacity-20' : 'bg-black bg-opacity-10'
                          }`}>
                            {msg.intencion}
                          </span>
                        )}
                        {msg.confianza && (
                          <span className={`text-xs px-1 rounded ${
                            msg.confianza > 0.8 ? 'bg-green-500 bg-opacity-20 text-green-700' :
                            msg.confianza > 0.6 ? 'bg-yellow-500 bg-opacity-20 text-yellow-700' :
                            'bg-red-500 bg-opacity-20 text-red-700'
                          }`}>
                            {Math.round(msg.confianza * 100)}%
                          </span>
                        )}
                        {msg.tiempoProcesamiento && (
                          <span className={`text-xs px-1 rounded ${
                            appTheme === "dark" ? 'bg-blue-500 bg-opacity-20 text-blue-300' : 'bg-blue-500 bg-opacity-20 text-blue-700'
                          }`}>
                            {msg.tiempoProcesamiento}ms
                          </span>
                        )}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-sm ${
                        appTheme === "dark"
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                          : 'bg-gradient-to-br from-[#283593] to-[#3949ab]'
                      }`}>
                        {typeof userAvatar === 'string' && userAvatar.startsWith('http') ? (
                          <img src={userAvatar} alt="Usuario" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{userAvatar}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-end space-x-2 message-fade-in">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm shadow-sm ${
                      appTheme === "dark"
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                        : 'bg-gradient-to-br from-[#1a237e] to-[#3949ab]'
                    }`}>
                      <span>{agentAvatar}</span>
                    </div>
                    <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md ${currentTheme.botBubble}`}>
                      <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block typing-dot ${
                          appTheme === "dark" ? 'bg-blue-500' : 'bg-[#3949ab]'
                        }`}></span>
                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block typing-dot ${
                          appTheme === "dark" ? 'bg-blue-500' : 'bg-[#3949ab]'
                        }`}></span>
                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block typing-dot ${
                          appTheme === "dark" ? 'bg-blue-500' : 'bg-[#3949ab]'
                        }`}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
              
              {/* Área de input mejorada */}
              <div className={`p-2 xs:p-3 sm:p-4 border-t ${currentTheme.inputArea}`}>
                <div className="flex items-end space-x-2 xs:space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      className={`
                        w-full px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 border rounded-xl text-sm outline-none resize-none
                        transition-all duration-200 ease-in-out
                        focus:ring-2 ${appTheme === "dark" ? 'focus:ring-blue-500' : 'focus:ring-[#3949ab]'} focus:ring-opacity-50
                        ${appTheme === "dark" ? 'placeholder-gray-500' : 'placeholder-gray-400'}
                        ${currentTheme.input}
                      `}
                      placeholder={t('chatbot.placeholder')}
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      rows={inputText.split('\n').length || 1}
                      style={{ maxHeight: '120px' }}
                      disabled={isTyping || connectionStatus === 'disconnected'}
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping || connectionStatus === 'disconnected'}
                    className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] xs:min-h-[44px] sm:min-h-[44px]"
                    dark={appTheme === "dark"}
                  >
                    <span className="max-xs:hidden">{t('chatbot.send')}</span>
                    <span className="xs:hidden">📤</span>
                  </Button>
                </div>
                
                {/* Sugerencias dinámicas */}
                {!isTyping && messages.length > 1 && (
                  <div className="flex flex-wrap gap-1 xs:gap-2 mt-2 xs:mt-3">
                    {sugerencias.map((sugerencia, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(sugerencia)}
                        disabled={connectionStatus === 'disconnected'}
                        className={`px-2 xs:px-3 py-1 text-xs rounded-full transition-colors duration-200 border disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                          appTheme === "dark"
                            ? 'bg-gradient-to-r from-blue-600/10 to-blue-700/10 text-blue-400 hover:from-blue-600/20 hover:to-blue-700/20 border-blue-500/30'
                            : 'bg-gradient-to-r from-[#1a237e]/10 to-[#3949ab]/10 text-[#1a237e] hover:from-[#1a237e]/20 hover:to-[#3949ab]/20 border-[#3949ab]/30'
                        }`}
                      >
                        <span>{sugerencia.icono}</span>
                        <span className="truncate max-w-[80px] xs:max-w-[120px]">{sugerencia.texto.split('?')[0]}?</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Indicador de estado de conexión */}
                {connectionStatus === 'disconnected' && (
                  <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 ${
                    appTheme === "dark"
                      ? 'bg-red-900/50 border border-red-700/50'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <span className="text-red-500">⚠️</span>
                    <span className={`text-xs ${appTheme === "dark" ? 'text-red-300' : 'text-red-700'}`}>
                      {t('chatbot.connectionError')}
                    </span>
                    <button
                      onClick={verificarConexion}
                      className={`text-xs underline transition-colors ${
                        appTheme === "dark"
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      {t('chatbot.retry')}
                    </button>
                  </div>
                )}

                {/* Controles de notificaciones en tiempo real */}
                {realTimeNotifications.length > 0 && (
                  <div className={`mt-3 p-2 rounded-lg ${
                    appTheme === "dark" ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        appTheme === "dark" ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        🔔 {realTimeNotifications.length} {t('chatbot.notifications')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={viewAllNotifications}
                          className={`text-xs px-2 py-1 rounded ${
                            appTheme === "dark" ? 'bg-blue-700 hover:bg-blue-600 text-blue-100' : 'bg-blue-600 hover:bg-blue-700 text-white'
                          } transition-colors`}
                        >
                          {t('chatbot.viewAll')}
                        </button>
                        <button
                          onClick={clearNotifications}
                          className={`text-xs px-2 py-1 rounded ${
                            appTheme === "dark" ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-600 hover:bg-gray-700 text-white'
                          } transition-colors`}
                        >
                          {t('chatbot.clear')}
                        </button>
                      </div>
                    </div>
                    <div className={`text-xs ${appTheme === "dark" ? 'text-blue-200' : 'text-blue-600'}`}>
                      {t('chatbot.lastNotification')} {realTimeNotifications[0]?.title}
                    </div>
                  </div>
                )}

                {/* Información del usuario (opcional) */}
                {userContext && userContext.esUsuarioAutenticado && (
                  <div className={`mt-2 text-xs text-center ${
                    appTheme === "dark" ? 'text-gray-400' : 'text-gray-600'
                  } opacity-70`}>
                    {t('chatbot.connectedAs')} {userContext.nombreUsuario} • {userContext.empresa}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;