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
  }
  .tutorial-highlight:hover {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.3);
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

  useEffect(() => {
    // Mostrar pantalla de bienvenida en el primer paso
    setShowWelcome(currentStep === 0);
  }, [currentStep]);

  // Efecto para resaltar elementos del tutorial
  useEffect(() => {
    if (currentStepData?.target && !showWelcome) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        // Para el menú de usuario, abrirlo automáticamente si está cerrado
        if (currentStepData.target === '[data-tutorial="user-menu"]') {
          const userMenuButton = element;
          const isMenuOpen = document.querySelector('[data-tutorial="profile-menu-item"]') !== null;
          if (!isMenuOpen) {
            // Simular clic para abrir el menú
            userMenuButton.click();
            // Esperar un poco para que se renderice el menú
            setTimeout(() => {
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
              }
            }, 100);
            return;
          }
        }

        // Añadir clase de resaltado
        element.classList.add('tutorial-highlight');
        setHighlightedElement(element);
        setShowArrow(currentStepData.isNavigation || false);

        // Calcular posición de la flecha
        const rect = element.getBoundingClientRect();
        const arrowTop = rect.top + rect.height / 2 - 16; // Centrar verticalmente
        const arrowLeft = rect.left - 40; // A la izquierda del elemento
        setArrowPosition({ top: arrowTop, left: arrowLeft });

        // Función para manejar clics en elementos resaltados
        const handleElementClick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          nextStep();
        };

        element.addEventListener('click', handleElementClick);

        return () => {
          element.classList.remove('tutorial-highlight');
          element.removeEventListener('click', handleElementClick);
          setHighlightedElement(null);
          setShowArrow(false);
        };
      }
    }
  }, [currentStepData, showWelcome, nextStep]);

  // No renderizar si el tutorial no está activo o está pausado
  if (!isActive || isPaused) {
    return null;
  }

  // Pantalla de bienvenida
   if (showWelcome) {
     return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4">
         <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full mx-1 sm:mx-2 md:mx-4">
           <div className="p-3 sm:p-4 md:p-6 text-center">
             <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
               <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <h2 className="text-base sm:text-lg md:text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2 sm:mb-3">
               {showWelcome && currentStep === 0 ? getRoleSpecificContent().title : currentStepData?.title}
             </h2>
             <p className="text-xs sm:text-sm md:text-base text-text-secondary-light dark:text-text-secondary-dark mb-3 sm:mb-4 md:mb-6 leading-relaxed px-1">
               {showWelcome && currentStep === 0 ? getRoleSpecificContent().description : currentStepData?.description}
             </p>
             <div className="flex flex-col gap-2 sm:gap-3">
               <Button
                 onClick={() => {
                   setShowWelcome(false);
                   nextStep();
                 }}
                 variant="primary"
                 size="large"
                 fullWidth
                 className="text-sm sm:text-base py-2 sm:py-3"
               >
                 {texts.start}
               </Button>
               <Button
                 onClick={skipTutorial}
                 variant="ghost"
                 size="medium"
                 fullWidth
                 className="text-xs sm:text-sm py-1 sm:py-2"
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
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto" />

      {/* Tutorial Card */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto w-full px-2 sm:px-4">
        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full mx-auto border border-border-light dark:border-border-dark">
          <div className="p-3 sm:p-4 md:p-6">
            {/* Header con progreso */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">{currentStep}</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {texts.step.replace('{{current}}', currentStep).replace('{{total}}', totalSteps)}
                  </p>
                </div>
              </div>
              <button
                onClick={skipTutorial}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark text-xs sm:text-sm underline"
              >
                {texts.skip}
              </button>
            </div>

            {/* Contenido del paso */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                {currentStepData?.title}
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs sm:text-sm leading-relaxed">
                {currentStepData?.description}
              </p>
            </div>

            {/* Botones de navegación */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
              <Button
                onClick={previousStep}
                variant="ghost"
                size="small"
                disabled={currentStep === 1}
                className={`text-xs sm:text-sm py-1 sm:py-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {texts.previous}
              </Button>

              <div className="flex space-x-1 sm:space-x-2 order-first sm:order-none">
                {/* Indicadores de pasos */}
                {Array.from({ length: Math.min(totalSteps, 8) }, (_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                      index + 1 === currentStep
                        ? 'bg-primary-600'
                        : index + 1 < currentStep
                        ? 'bg-primary-300'
                        : 'bg-border-light dark:bg-border-dark'
                    }`}
                  />
                ))}
                {totalSteps > 8 && (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark ml-1">
                    +{totalSteps - 8}
                  </span>
                )}
              </div>

              <Button
                onClick={nextStep}
                variant="primary"
                size="small"
                className="text-xs sm:text-sm py-1 sm:py-2"
              >
                {currentStep === totalSteps ? texts.finish : texts.next}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip para elementos específicos */}
      {currentStepData?.target && highlightedElement && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[120]">
          <div className="bg-primary-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm shadow-lg animate-pulse max-w-xs sm:max-w-sm text-center">
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
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            {/* Línea punteada hacia el elemento */}
            <div className="absolute top-3 sm:top-4 left-6 sm:left-8 w-8 sm:w-12 md:w-16 h-0.5 bg-primary-600 opacity-50 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;