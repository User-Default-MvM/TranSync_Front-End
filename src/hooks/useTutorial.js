import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'transsync_tutorial_completed';
const STORAGE_SKIP_KEY = 'transsync_tutorial_skipped';

export const useTutorial = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Definir los pasos del tutorial como tour completo guiado por sidebar
  const tutorialSteps = useMemo(() => [
    {
      id: 'welcome',
      title: '¡Bienvenido a TransSync!',
      description: 'Te guiaremos por las principales funcionalidades del sistema. Comenzaremos explorando el menú lateral.',
      target: null,
      placement: 'center',
      page: null,
      isNavigation: false
    },
    {
      id: 'sidebar-intro',
      title: 'Menú de Navegación',
      description: 'Este es el menú lateral donde encontrarás todas las secciones del sistema. Cada ícono representa una funcionalidad diferente.',
      target: '#sidebar-navigation',
      placement: 'right',
      page: null,
      isNavigation: false
    },
    {
      id: 'navigate-dashboard',
      title: 'Ve al Dashboard',
      description: 'Haz clic en "Dashboard" para ver el panel principal con estadísticas y métricas del sistema.',
      target: '[data-tutorial="dashboard"]',
      placement: 'right',
      page: null,
      isNavigation: true,
      navigateTo: '/dashboard'
    },
    {
      id: 'explain-dashboard',
      title: 'Panel de Control',
      description: 'Aquí puedes ver estadísticas generales, gráficos de rendimiento y el estado actual de tu flota.',
      target: '[data-tutorial="dashboard"]',
      placement: 'bottom',
      page: '/dashboard',
      isNavigation: false
    },
    {
      id: 'navigate-drivers',
      title: 'Gestiona tus Conductores',
      description: 'Haz clic en "Conductores" para administrar el personal que opera tus vehículos.',
      target: '[data-tutorial="drivers"]',
      placement: 'right',
      page: '/dashboard',
      isNavigation: true,
      navigateTo: '/drivers'
    },
    {
      id: 'explain-drivers',
      title: 'Gestión de Conductores',
      description: 'Administra conductores, asigna vehículos, verifica licencias y mantén el control de tu personal.',
      target: '[data-tutorial="drivers"]',
      placement: 'right',
      page: '/drivers',
      isNavigation: false
    },
    {
      id: 'navigate-routes',
      title: 'Configura tus Rutas',
      description: 'Haz clic en "Rutas" para definir y gestionar las rutas de transporte.',
      target: '[data-tutorial="routes"]',
      placement: 'right',
      page: '/drivers',
      isNavigation: true,
      navigateTo: '/rutas'
    },
    {
      id: 'explain-routes',
      title: 'Sistema de Rutas',
      description: 'Crea rutas optimizadas, define paradas y administra los recorridos de tu flota.',
      target: '[data-tutorial="routes"]',
      placement: 'right',
      page: '/rutas',
      isNavigation: false
    },
    {
      id: 'navigate-vehicles',
      title: 'Administra tu Flota',
      description: 'Haz clic en "Vehículos" para gestionar todos los buses y vehículos de tu empresa.',
      target: '[data-tutorial="vehicles"]',
      placement: 'right',
      page: '/rutas',
      isNavigation: true,
      navigateTo: '/vehiculos'
    },
    {
      id: 'explain-vehicles',
      title: 'Flota de Vehículos',
      description: 'Controla el estado de tus vehículos, programar mantenimientos y asignar conductores.',
      target: '[data-tutorial="vehicles"]',
      placement: 'right',
      page: '/vehiculos',
      isNavigation: false
    },
    {
      id: 'navigate-schedules',
      title: 'Programa Horarios',
      description: 'Haz clic en "Horarios" para organizar los turnos y horarios de operación.',
      target: '[data-tutorial="schedules"]',
      placement: 'right',
      page: '/vehiculos',
      isNavigation: true,
      navigateTo: '/horarios'
    },
    {
      id: 'explain-schedules',
      title: 'Gestión de Horarios',
      description: 'Crea horarios de salida, asigna rutas y optimiza la programación de tu servicio.',
      target: '[data-tutorial="schedules"]',
      placement: 'right',
      page: '/horarios',
      isNavigation: false
    },
    {
      id: 'navigate-reports',
      title: 'Revisa tus Reportes',
      description: 'Haz clic en "Informes" para ver análisis detallados y reportes del rendimiento.',
      target: '[data-tutorial="reports"]',
      placement: 'right',
      page: '/horarios',
      isNavigation: true,
      navigateTo: '/informes'
    },
    {
      id: 'explain-reports',
      title: 'Sistema de Reportes',
      description: 'Genera reportes de rendimiento, estadísticas de uso y análisis de eficiencia.',
      target: '[data-tutorial="reports"]',
      placement: 'right',
      page: '/informes',
      isNavigation: false
    },
    {
      id: 'navigate-profile',
      title: 'Acceder a tu Perfil',
      description: 'Haz clic en tu avatar en la parte superior derecha para ver el menú de opciones.',
      target: '[data-tutorial="user-menu"]',
      placement: 'bottom',
      page: '/informes',
      isNavigation: false
    },
    {
      id: 'show-profile-menu',
      title: 'Menú de Usuario',
      description: 'Aquí puedes acceder a tu perfil, cambiar configuraciones y cerrar sesión.',
      target: '[data-tutorial="profile-menu-item"]',
      placement: 'left',
      page: '/informes',
      isNavigation: true,
      navigateTo: '/profile'
    },
    {
      id: 'explain-profile',
      title: 'Configuración de Perfil',
      description: 'Personaliza tu perfil, cambia contraseñas y configura tus preferencias del sistema.',
      target: '[data-tutorial="profile"]',
      placement: 'bottom',
      page: '/profile',
      isNavigation: false
    },
    {
      id: 'final-message',
      title: '¡Tour Completado!',
      description: 'Has explorado todas las funcionalidades principales. Ahora puedes usar TransSync con confianza. Si necesitas ayuda, recuerda que tienes disponible el ChatBot inteligente.',
      target: null,
      placement: 'center',
      page: '/profile',
      isNavigation: false
    }
  ], []);

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