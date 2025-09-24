import React, { useState } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };
    return positions[position] || positions.top;
  };

  const getArrowClasses = () => {
    const arrows = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-200',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-200',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800 dark:border-l-gray-200',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800 dark:border-r-gray-200'
    };
    return arrows[position] || arrows.top;
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && content && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm text-white
            bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800
            rounded-lg shadow-lg max-w-xs text-center
            transition-opacity duration-200 whitespace-nowrap
            ${getPositionClasses()}
          `}
          role="tooltip"
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-transparent
              ${getArrowClasses()}
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;