import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const STORAGE_KEY = 'transsync_tutorial_completed';
const STORAGE_SKIP_KEY = 'transsync_tutorial_skipped';

export const useTutorial = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuthContext();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Definir los pasos del tutorial según el rol del usuario
  const tutorialSteps = useMemo(() => {
    const baseSteps = {
      welcome: {
        id: 'welcome',
        title: '¡Bienvenido a TransSync!',
        description: 'Te guiaremos por las funcionalidades específicas de tu rol. Comenzaremos explorando el menú lateral.',
        target: null,
        placement: 'center',
        page: null,
        isNavigation: false
      },
      sidebar: {
        id: 'sidebar-intro',
        title: 'Menú de Navegación',
        description: 'Este es el menú lateral donde encontrarás todas las secciones disponibles para tu rol. Cada ícono representa una funcionalidad diferente.',
        target: '#sidebar-navigation',
        placement: 'right',
        page: null,
        isNavigation: false
      },
      profile: {
        id: 'navigate-profile',
        title: 'Acceder a tu Perfil',
        description: 'Haz clic en tu avatar en la parte superior derecha para ver el menú de opciones.',
        target: '[data-tutorial="user-menu"]',
        placement: 'bottom',
        page: null,
        isNavigation: false
      },
      profileMenu: {
        id: 'show-profile-menu',
        title: 'Menú de Usuario',
        description: 'Aquí puedes acceder a tu perfil, cambiar configuraciones y cerrar sesión.',
        target: '[data-tutorial="profile-menu-item"]',
        placement: 'left',
        page: null,
        isNavigation: true,
        navigateTo: '/profile'
      },
      profileSettings: {
        id: 'explain-profile',
        title: 'Configuración de Perfil',
        description: 'Personaliza tu perfil, cambia contraseñas y configura tus preferencias del sistema.',
        target: '[data-tutorial="profile"]',
        placement: 'bottom',
        page: '/profile',
        isNavigation: false
      },
      final: {
        id: 'final-message',
        title: '¡Tutorial Completado!',
        description: 'Has explorado todas las funcionalidades disponibles para tu rol. Ahora puedes usar TransSync con confianza. Si necesitas ayuda, recuerda que tienes disponible el ChatBot inteligente.',
        target: null,
        placement: 'center',
        page: '/profile',
        isNavigation: false
      }
    };

    // Tutorial específico para SUPERADMIN
    if (userRole === 'SUPERADMIN') {
      return [
        baseSteps.welcome,
        baseSteps.sidebar,
        {
          id: 'navigate-admin-dashboard',
          title: 'Panel de Administración Completo',
          description: 'Como SuperAdministrador, tienes acceso total al sistema. Haz clic en "Administración" para gestionar todas las empresas, usuarios y configuraciones globales del sistema TransSync.',
          target: '[data-tutorial="admin-dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/admin-dashboard'
        },
        {
          id: 'explain-admin-dashboard',
          title: 'Control Total del Sistema',
          description: 'Desde aquí puedes crear y gestionar empresas, asignar roles a usuarios (SuperAdmin, Gestor, Conductor), configurar permisos, y supervisar todas las operaciones del sistema. Tienes control absoluto sobre la plataforma.',
          target: '[data-tutorial="admin-dashboard"]',
          placement: 'bottom',
          page: '/admin-dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-dashboard',
          title: 'Dashboard Global del Sistema',
          description: 'Accede al panel principal donde verás estadísticas consolidadas de todas las empresas, métricas de rendimiento global, y análisis completos del sistema TransSync.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: '/admin-dashboard',
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Vista Global de Rendimiento',
          description: 'Monitorea el estado general del sistema: número total de empresas activas, conductores registrados, vehículos en operación, rutas activas, y estadísticas de eficiencia de toda la plataforma.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        baseSteps.profile,
        baseSteps.profileMenu,
        baseSteps.profileSettings,
        baseSteps.final
      ];
    }

    // Tutorial específico para GESTOR
    if (userRole === 'GESTOR') {
      return [
        baseSteps.welcome,
        baseSteps.sidebar,
        {
          id: 'navigate-dashboard',
          title: 'Panel de Control Empresarial',
          description: 'Como Gestor de empresa, haz clic en "Dashboard" para acceder al centro de control de tu organización. Aquí verás todas las métricas clave de tu operación diaria.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Centro de Control Operativo',
          description: 'Monitorea el rendimiento de tu empresa: viajes completados, eficiencia de conductores, estado de vehículos, rutas activas y KPIs importantes para la toma de decisiones.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-drivers',
          title: 'Gestión del Personal Conductor',
          description: 'Haz clic en "Conductores" para administrar todo tu equipo de conductores. Esta es tu herramienta principal para el control del personal.',
          target: '[data-tutorial="drivers"]',
          placement: 'right',
          page: '/dashboard',
          isNavigation: true,
          navigateTo: '/drivers'
        },
        {
          id: 'explain-drivers',
          title: 'Administración Completa de Conductores',
          description: 'Registra nuevos conductores, actualiza licencias, asigna vehículos específicos, monitorea rendimiento individual, y gestiona la disponibilidad de tu equipo humano.',
          target: '[data-tutorial="drivers"]',
          placement: 'right',
          page: '/drivers',
          isNavigation: false
        },
        {
          id: 'navigate-vehicles',
          title: 'Control de la Flota Vehicular',
          description: 'Haz clic en "Vehículos" para gestionar toda tu flota de transporte. Mantén el control total sobre tus activos móviles.',
          target: '[data-tutorial="vehicles"]',
          placement: 'right',
          page: '/drivers',
          isNavigation: true,
          navigateTo: '/vehiculos'
        },
        {
          id: 'explain-vehicles',
          title: 'Gestión Integral de Vehículos',
          description: 'Registra nuevos vehículos, programa mantenimientos preventivos, asigna conductores, rastrea ubicación GPS, y monitorea el estado mecánico de toda tu flota.',
          target: '[data-tutorial="vehicles"]',
          placement: 'right',
          page: '/vehiculos',
          isNavigation: false
        },
        {
          id: 'navigate-routes',
          title: 'Planificación de Rutas Optimizadas',
          description: 'Haz clic en "Rutas" para diseñar y optimizar las rutas de transporte de tu empresa. Crea recorridos eficientes para maximizar la productividad.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/vehiculos',
          isNavigation: true,
          navigateTo: '/rutas'
        },
        {
          id: 'explain-routes',
          title: 'Sistema Avanzado de Rutas',
          description: 'Diseña rutas con múltiples paradas, calcula distancias y tiempos óptimos, define zonas de cobertura, y optimiza el uso de combustible y recursos.',
          target: '[data-tutorial="routes"]',
          placement: 'right',
          page: '/rutas',
          isNavigation: false
        },
        {
          id: 'navigate-schedules',
          title: 'Programación de Horarios Operativos',
          description: 'Haz clic en "Horarios" para organizar toda la operación logística de tu empresa. Coordina viajes, turnos y asignaciones de manera eficiente.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/rutas',
          isNavigation: true,
          navigateTo: '/horarios'
        },
        {
          id: 'explain-schedules',
          title: 'Centro de Programación Logística',
          description: 'Crea horarios de salida, asigna conductores a rutas específicas, programa viajes recurrentes, maneja excepciones y emergencias, y optimiza la capacidad operativa.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'navigate-reports',
          title: 'Análisis y Reportes Ejecutivos',
          description: 'Haz clic en "Informes" para acceder a análisis detallados y reportes estratégicos que te ayudarán a tomar mejores decisiones para tu empresa.',
          target: '[data-tutorial="reports"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: true,
          navigateTo: '/informes'
        },
        {
          id: 'explain-reports',
          title: 'Sistema de Inteligencia Empresarial',
          description: 'Genera reportes de rentabilidad, analiza tendencias de uso, mide eficiencia operativa, identifica oportunidades de mejora, y crea dashboards personalizados para stakeholders.',
          target: '[data-tutorial="reports"]',
          placement: 'right',
          page: '/informes',
          isNavigation: false
        },
        baseSteps.profile,
        baseSteps.profileMenu,
        baseSteps.profileSettings,
        baseSteps.final
      ];
    }

    // Tutorial específico para CONDUCTOR
    if (userRole === 'CONDUCTOR') {
      return [
        baseSteps.welcome,
        baseSteps.sidebar,
        {
          id: 'navigate-dashboard',
          title: 'Tu Panel de Control Personal',
          description: 'Como Conductor, haz clic en "Dashboard" para acceder a tu espacio personal donde verás toda la información relevante para tu trabajo diario.',
          target: '[data-tutorial="dashboard"]',
          placement: 'right',
          page: null,
          isNavigation: true,
          navigateTo: '/dashboard'
        },
        {
          id: 'explain-dashboard',
          title: 'Centro de Información del Conductor',
          description: 'Aquí encontrarás tus viajes asignados para hoy y los próximos días, tu rendimiento mensual, estadísticas de puntualidad, y notificaciones importantes sobre cambios en tus rutas.',
          target: '[data-tutorial="dashboard"]',
          placement: 'bottom',
          page: '/dashboard',
          isNavigation: false
        },
        {
          id: 'navigate-schedules',
          title: 'Tus Horarios y Rutas Asignadas',
          description: 'Haz clic en "Horarios" para ver en detalle todos tus viajes programados, rutas específicas, y horarios de trabajo asignados por tu gestor.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/dashboard',
          isNavigation: true,
          navigateTo: '/horarios'
        },
        {
          id: 'explain-schedules',
          title: 'Gestión Detallada de tus Viajes',
          description: 'Revisa cada viaje asignado con detalles completos: hora de salida, ruta exacta con paradas, vehículo asignado, instrucciones especiales, y estado de confirmación del viaje.',
          target: '[data-tutorial="schedules"]',
          placement: 'right',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'navigate-profile',
          title: 'Acceso a tu Perfil Profesional',
          description: 'Haz clic en tu avatar en la parte superior para acceder a tu perfil personal y configuraciones profesionales.',
          target: '[data-tutorial="user-menu"]',
          placement: 'bottom',
          page: '/horarios',
          isNavigation: false
        },
        {
          id: 'show-profile-menu',
          title: 'Tu Menú Personal de Conductor',
          description: 'Accede a tu información profesional, historial de viajes completados, calificaciones recibidas, y opciones para actualizar tus datos personales.',
          target: '[data-tutorial="profile-menu-item"]',
          placement: 'left',
          page: '/horarios',
          isNavigation: true,
          navigateTo: '/profile'
        },
        {
          id: 'explain-profile',
          title: 'Configuración de tu Perfil Profesional',
          description: 'Actualiza tu información de contacto, cambia tu contraseña de acceso, configura preferencias de notificaciones, y mantén al día tu licencia de conducir y documentos profesionales.',
          target: '[data-tutorial="profile"]',
          placement: 'bottom',
          page: '/profile',
          isNavigation: false
        },
        baseSteps.final
      ];
    }

    // Tutorial por defecto (para roles desconocidos)
    return [
      baseSteps.welcome,
      baseSteps.sidebar,
      baseSteps.profile,
      baseSteps.profileMenu,
      baseSteps.profileSettings,
      baseSteps.final
    ];
  }, [userRole]);

  // Función para verificar si un elemento existe en el DOM
  const elementExists = useCallback((selector) => {
    if (!selector) return true; // Para pasos sin target (como welcome)
    return document.querySelector(selector) !== null;
  }, []);

  // Función para obtener el siguiente paso disponible
  const getNextAvailableStep = useCallback((startIndex = 0) => {
    for (let i = startIndex; i < tutorialSteps.length; i++) {
      const step = tutorialSteps[i];
      // Si el paso no tiene página específica o coincide con la página actual
      if (!step.page || location.pathname === step.page) {
        // Verificar si el elemento existe
        if (elementExists(step.target)) {
          return i;
        }
      }
    }
    return -1; // No hay más pasos disponibles
  }, [tutorialSteps, location.pathname, elementExists]);

  // Verificar si el usuario ya completó o saltó el tutorial
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === 'true';
    const skipped = localStorage.getItem(STORAGE_SKIP_KEY) === 'true';

    setIsCompleted(completed);
    setIsSkipped(skipped);

    // Solo activar el tutorial automáticamente una vez cuando el usuario inicia sesión por primera vez
    // y está en una página protegida
    if (!completed && !skipped && !isActive && location.pathname !== '/home' && location.pathname !== '/login' && location.pathname !== '/register') {
      // Verificar si es la primera vez que se activa el tutorial para este usuario
      const tutorialStarted = localStorage.getItem('tutorial_started') === 'true';
      if (!tutorialStarted) {
        // Pequeño delay para que la UI se cargue completamente
        const timer = setTimeout(() => {
          const firstStep = getNextAvailableStep(0);
          if (firstStep !== -1) {
            localStorage.setItem('tutorial_started', 'true');
            setIsActive(true);
            setCurrentStep(firstStep);
          }
        }, 2000); // Más delay para mejor UX
        return () => clearTimeout(timer);
      }
    }
  }, [getNextAvailableStep, isActive, location.pathname]);

  // Efecto para manejar cambios de página durante el tutorial
  useEffect(() => {
    if (isActive && !isPaused) {
      const currentStepData = tutorialSteps[currentStep];

      // Si es un paso de navegación y acabamos de llegar a la página destino
      if (currentStepData?.isNavigation && currentStepData.navigateTo === location.pathname) {
        // Avanzar automáticamente al siguiente paso (explicación de la página)
        const nextStepIndex = currentStep + 1;
        if (nextStepIndex < tutorialSteps.length) {
          setCurrentStep(nextStepIndex);
        }
        return;
      }

      // Si el paso actual no es válido para la página actual
      if (currentStepData.page && location.pathname !== currentStepData.page) {
        // Buscar el siguiente paso disponible en esta página
        const nextAvailable = getNextAvailableStep(currentStep);
        if (nextAvailable !== -1 && nextAvailable !== currentStep) {
          setCurrentStep(nextAvailable);
        } else {
          // No hay pasos disponibles en esta página, pausar tutorial
          setIsPaused(true);
        }
      } else if (!elementExists(currentStepData.target)) {
        // El elemento no existe, intentar el siguiente paso
        const nextAvailable = getNextAvailableStep(currentStep + 1);
        if (nextAvailable !== -1) {
          setCurrentStep(nextAvailable);
        } else {
          setIsPaused(true);
        }
      }
    } else if (isPaused) {
      // Si está pausado, verificar si ahora hay pasos disponibles
      const nextAvailable = getNextAvailableStep(0);
      if (nextAvailable !== -1) {
        setIsPaused(false);
        setCurrentStep(nextAvailable);
      }
    }
  }, [location.pathname, isActive, isPaused, currentStep, tutorialSteps, getNextAvailableStep, elementExists]);

  // Función para iniciar el tutorial
  const startTutorial = useCallback(() => {
    console.log('Starting tutorial from button');
    // Reiniciar completamente el tutorial
    setIsActive(true);
    setIsCompleted(false);
    setIsSkipped(false);
    setIsPaused(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SKIP_KEY);
    localStorage.removeItem('tutorial_started');

    // Encontrar el primer paso disponible en la página actual
    const firstStep = getNextAvailableStep(0);
    if (firstStep !== -1) {
      setCurrentStep(firstStep);
      console.log('Tutorial started successfully at step:', firstStep);
    } else {
      // Si no hay pasos disponibles, ir al dashboard
      console.log('No steps available, navigating to dashboard');
      navigate('/dashboard');
      // El efecto de navegación se encargará de iniciar el tutorial
    }
  }, [getNextAvailableStep, navigate]);

  // Función para completar el tutorial
  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.removeItem('tutorial_started');
  }, []);

  // Función para ir al siguiente paso
  const nextStep = useCallback(() => {
    const currentStepData = tutorialSteps[currentStep];
    const nextStepIndex = getNextAvailableStep(currentStep + 1);

    // Si es un paso de navegación y tiene navigateTo, navegar automáticamente
    if (currentStepData?.isNavigation && currentStepData.navigateTo) {
      navigate(currentStepData.navigateTo);
      // El efecto de cambio de página se encargará de continuar
      return;
    }

    if (nextStepIndex !== -1) {
      setCurrentStep(nextStepIndex);
    } else {
      completeTutorial();
    }
  }, [currentStep, getNextAvailableStep, completeTutorial, tutorialSteps, navigate]);

  // Función para ir al paso anterior
  const previousStep = useCallback(() => {
    let prevIndex = currentStep - 1;
    while (prevIndex >= 0) {
      const step = tutorialSteps[prevIndex];
      if ((!step.page || location.pathname === step.page) && elementExists(step.target)) {
        setCurrentStep(prevIndex);
        return;
      }
      prevIndex--;
    }
    // Si no hay paso anterior disponible, mantener el actual
  }, [currentStep, tutorialSteps, location.pathname, elementExists]);

  // Función para saltar al paso específico
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < tutorialSteps.length) {
      setCurrentStep(stepIndex);
    }
  }, [tutorialSteps.length]);

  // Función para saltar el tutorial
  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setIsSkipped(true);
    localStorage.setItem(STORAGE_SKIP_KEY, 'true');
    localStorage.removeItem('tutorial_started');
  }, []);

  // Función para reiniciar el tutorial
  const restartTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSkipped(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SKIP_KEY);
    localStorage.removeItem('tutorial_started');
  }, []);

  // Función para verificar si un paso específico está activo
  const isStepActive = useCallback((stepId) => {
    const step = tutorialSteps.find(s => s.id === stepId);
    return step && currentStep === tutorialSteps.indexOf(step);
  }, [currentStep, tutorialSteps]);

  return {
    // Estado
    isActive,
    currentStep,
    isCompleted,
    isSkipped,
    isPaused,
    totalSteps: tutorialSteps.length,

    // Datos del tutorial
    tutorialSteps,
    currentStepData: tutorialSteps[currentStep],

    // Funciones de navegación
    startTutorial,
    nextStep,
    previousStep,
    goToStep,
    completeTutorial,
    skipTutorial,
    restartTutorial,

    // Funciones de utilidad
    isStepActive,

    // Textos traducidos
    texts: {
      next: t('tutorial.navigation.next'),
      previous: t('tutorial.navigation.previous'),
      finish: t('tutorial.navigation.finish'),
      skip: t('tutorial.navigation.skip'),
      step: t('tutorial.navigation.step'),
      start: t('tutorial.welcome.start'),
      skipTutorial: t('tutorial.welcome.skip'),
      clickToContinue: t('tutorial.tooltips.click_to_continue'),
      exploreFeature: t('tutorial.tooltips.explore_feature')
    }
  };
};

export default useTutorial;