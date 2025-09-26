import React, { useEffect, useState } from 'react';
import { useTutorial } from '../hooks/useTutorial';
import { useAuthContext } from '../context/AuthContext';
import Button from './Button';

// Estilos CSS para el tutorial
const tutorialStyles = `
  .tutorial-highlight {
    position: relative;
    z-index: 10;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .tutorial-highlight:hover {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.3);
  }
  .tutorial-highlight:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  /* Feedback táctil para botones */
  .touch-feedback {
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s ease;
  }
  .touch-feedback:active {
    transform: scale(0.95);
    opacity: 0.8;
  }

  /* Mejorar scroll en móvil */
  .tutorial-overlay {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* Prevenir zoom en inputs en iOS */
  .tutorial-input {
    font-size: 16px;
  }

  /* Optimizaciones de rendimiento */
  .tutorial-overlay * {
    will-change: transform;
  }

  .tutorial-highlight {
    will-change: box-shadow, transform;
  }

  /* Reducir motion para usuarios que prefieren menos animaciones */
  @media (prefers-reduced-motion: reduce) {
    .tutorial-highlight,
    .touch-feedback,
    .animate-bounce,
    .animate-pulse {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = tutorialStyles;
  document.head.appendChild(styleSheet);
}

const Tutorial = () => {
  const { userRole } = useAuthContext();
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    previousStep,
    skipTutorial,
    isPaused,
    texts
  } = useTutorial();

  const [showWelcome, setShowWelcome] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [showArrow, setShowArrow] = useState(false);
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Función para obtener mensajes personalizados según el rol usando traducciones
  const getRoleSpecificContent = () => {
    const t = (key) => {
      // Por simplicidad, usaremos las traducciones directamente
      const translations = {
        'SUPERADMIN': {
          title: '¡Bienvenido SuperAdmin!',
          description: 'Como SuperAdministrador, tienes acceso completo al sistema. Te guiaremos por las funciones de gestión de usuarios, empresas y configuración global del sistema.'
        },
        'GESTOR': {
          title: '¡Bienvenido Gestor!',
          description: 'Como Gestor, tienes el control total de tu empresa. Te mostraremos cómo administrar conductores, vehículos, rutas y horarios de manera eficiente.'
        },
        'CONDUCTOR': {
          title: '¡Bienvenido Conductor!',
          description: 'Como Conductor, podrás ver tus horarios, rutas asignadas y gestionar tu perfil personal. Te guiaremos por las funciones específicas para tu rol.'
        }
      };

      return translations[userRole] || {
        title: '¡Bienvenido a TransSync!',
        description: 'Te guiaremos por las funcionalidades disponibles en tu cuenta. Comenzaremos explorando las opciones principales del sistema.'
      };
    };

    return {
      title: t(userRole).title,
      description: t(userRole).description
    };
  };

  // Funciones para manejar gestos de swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0]);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart.clientX - touchEnd.clientX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentStep < totalSteps) {
      nextStep();
    }
    if (isRightSwipe && currentStep > 1) {
      previousStep();
    }
  };

  useEffect(() => {
    // Mostrar pantalla de bienvenida en el primer paso
    setShowWelcome(currentStep === 0);
  }, [currentStep]);

  // Efecto para resaltar elementos del tutorial
  useEffect(() => {
    if (currentStepData?.target && !showWelcome && isActive && !isPaused) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        // Para el menú de usuario, abrirlo automáticamente si está cerrado
        if (currentStepData.target === '[data-tutorial="user-menu"]') {
          const userMenuButton = element;
          const isMenuOpen = document.querySelector('[data-tutorial="profile-menu-item"]') !== null;
          if (!isMenuOpen) {
            // Simular clic para abrir el menú
            userMenuButton.click();

            // Usar un enfoque más robusto para esperar que el menú se abra
            const waitForMenu = () => {
              const profileItem = document.querySelector('[data-tutorial="profile-menu-item"]');
              if (profileItem) {
                profileItem.classList.add('tutorial-highlight');
                setHighlightedElement(profileItem);
                setShowArrow(currentStepData.isNavigation || false);

                // Calcular posición de la flecha
                const rect = profileItem.getBoundingClientRect();
                const arrowTop = rect.top + rect.height / 2 - 16;
                const arrowLeft = rect.left - 40;
                setArrowPosition({ top: arrowTop, left: arrowLeft });

                // Función para manejar clics
                const handleElementClick = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextStep();
                };

                profileItem.addEventListener('click', handleElementClick);

                return () => {
                  profileItem.classList.remove('tutorial-highlight');
                  profileItem.removeEventListener('click', handleElementClick);
                  setHighlightedElement(null);
                  setShowArrow(false);
                };
              } else {
                // Si no se encontró, intentar de nuevo en un breve momento
                setTimeout(waitForMenu, 50);
              }
            };

            // Iniciar la espera
            setTimeout(waitForMenu, 50);
            return;
          }
        }

        // Verificar que el elemento sea visible y no esté oculto
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('Tutorial: Elemento objetivo no es visible', currentStepData.target);
          return;
        }

        // Añadir clase de resaltado
        element.classList.add('tutorial-highlight');
        setHighlightedElement(element);
        setShowArrow(currentStepData.isNavigation || false);

        // Calcular posición de la flecha
        const arrowTop = rect.top + rect.height / 2 - 16; // Centrar verticalmente
        const arrowLeft = rect.left - 40; // A la izquierda del elemento
        setArrowPosition({ top: arrowTop, left: arrowLeft });

        // Función para manejar clics en elementos resaltados
        const handleElementClick = (e) => {
          // Solo prevenir el comportamiento por defecto si es un enlace o botón
          if (element.tagName === 'A' || element.tagName === 'BUTTON' || element.onclick) {
            e.preventDefault();
            e.stopPropagation();
          }
          nextStep();
        };

        element.addEventListener('click', handleElementClick);

        return () => {
          if (element) {
            element.classList.remove('tutorial-highlight');
            element.removeEventListener('click', handleElementClick);
          }
          setHighlightedElement(null);
          setShowArrow(false);
        };
      }
     }
   }, [currentStepData, showWelcome, nextStep, isActive, isPaused]);

  // No renderizar si el tutorial no está activo o está pausado
  if (!isActive || isPaused) {
    return null;
  }

  // Pantalla de bienvenida
   if (showWelcome) {
     return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-3 md:p-4">
         <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl max-w-[95vw] sm:max-w-sm md:max-w-md lg:max-w-lg w-full mx-2 sm:mx-4 md:mx-6">
           <div className="p-4 sm:p-5 md:p-6 text-center">
             <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5">
               <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 sm:mb-4 leading-tight">
               {currentStep === 0 ? getRoleSpecificContent().title : currentStepData?.title}
             </h2>
             <p className="text-sm sm:text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark mb-4 sm:mb-5 md:mb-6 leading-relaxed px-2">
               {currentStep === 0 ? getRoleSpecificContent().description : currentStepData?.description}
             </p>
             <div className="flex flex-col gap-3 sm:gap-4">
               <Button
                 onClick={() => {
                   setShowWelcome(false);
                   nextStep();
                 }}
                 variant="primary"
                 size="large"
                 fullWidth
                 className="text-base sm:text-lg py-3 sm:py-4 min-h-[48px] touch-manipulation touch-feedback"
               >
                 {texts.start}
               </Button>
               <Button
                 onClick={skipTutorial}
                 variant="ghost"
                 size="medium"
                 fullWidth
                 className="text-sm sm:text-base py-2 sm:py-3 min-h-[44px] touch-manipulation touch-feedback"
               >
                 {texts.skipTutorial}
               </Button>
             </div>
           </div>
         </div>
       </div>
     );
   }

  // Overlay para los pasos del tutorial
  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none tutorial-overlay"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto" />

      {/* Tutorial Card */}
      <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto w-full px-3 sm:px-4">
        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl max-w-[95vw] sm:max-w-sm md:max-w-md lg:max-w-lg w-full mx-auto border border-border-light dark:border-border-dark">
          <div className="p-4 sm:p-5 md:p-6">
            {/* Header con progreso */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base font-medium">{currentStep}</span>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-text-secondary-light dark:text-text-secondary-dark">
                    {texts.step.replace('{{current}}', currentStep).replace('{{total}}', totalSteps)}
                  </p>
                </div>
              </div>
              <button
                onClick={skipTutorial}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark text-sm sm:text-base underline touch-manipulation touch-feedback min-h-[44px] px-2"
              >
                {texts.skip}
              </button>
            </div>

            {/* Contenido del paso */}
            <div className="mb-5 sm:mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 leading-tight">
                {currentStepData?.title}
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm sm:text-base leading-relaxed">
                {currentStepData?.description}
              </p>
            </div>

            {/* Botones de navegación */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
              <Button
                onClick={previousStep}
                variant="ghost"
                size="medium"
                disabled={currentStep === 1}
                className={`text-sm sm:text-base py-3 sm:py-2 min-h-[48px] touch-manipulation touch-feedback ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {texts.previous}
              </Button>

              <div className="flex justify-center space-x-2 sm:space-x-3 order-first sm:order-none">
                {/* Indicadores de pasos */}
                {Array.from({ length: Math.min(totalSteps, 8) }, (_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      index + 1 === currentStep
                        ? 'bg-primary-600'
                        : index + 1 < currentStep
                        ? 'bg-primary-300'
                        : 'bg-border-light dark:bg-border-dark'
                    }`}
                  />
                ))}
                {totalSteps > 8 && (
                  <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark ml-2 self-center">
                    +{totalSteps - 8}
                  </span>
                )}
              </div>

              <Button
                onClick={nextStep}
                variant="primary"
                size="medium"
                className="text-sm sm:text-base py-3 sm:py-2 min-h-[48px] touch-manipulation touch-feedback"
              >
                {currentStep === totalSteps ? texts.finish : texts.next}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip para elementos específicos */}
      {currentStepData?.target && highlightedElement && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[120] px-2 sm:px-0">
          <div className="bg-primary-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base shadow-lg animate-pulse max-w-[85vw] sm:max-w-xs md:max-w-sm text-center leading-relaxed">
            {texts.clickToContinue || 'Haz clic en el elemento resaltado para continuar'}
          </div>
        </div>
      )}

      {/* Flecha animada para navegación */}
      {showArrow && highlightedElement && (
        <div
          className="fixed pointer-events-none z-[150]"
          style={{ top: `${arrowPosition.top}px`, left: `${arrowPosition.left}px` }}
        >
          <div className="relative">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-primary-600 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            {/* Línea punteada hacia el elemento */}
            <div className="absolute top-3 sm:top-4 md:top-5 left-6 sm:left-8 md:left-10 w-8 sm:w-12 md:w-16 lg:w-20 h-0.5 bg-primary-600 opacity-50 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;