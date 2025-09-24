import React from 'react';

const Button = ({ 
  children, 
  variant = "primary", 
  size = "medium", 
  icon = null,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  onClick = () => {},
  className = "",
  type = "button"
}) => {
  const baseClasses = `
    font-medium rounded-lg transition-all duration-300 ease-in-out 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    relative overflow-hidden cursor-pointer tracking-wide 
    shadow-[0_1px_3px_rgba(0,0,0,0.1)] 
    flex items-center justify-center
    active:transform active:translate-y-0
    before:content-[''] before:absolute before:top-1/2 before:left-1/2 
    before:w-[5px] before:h-[5px] before:bg-white before:bg-opacity-50 
    before:opacity-0 before:rounded-full before:transform before:scale-100 before:translate-x-[-50%] before:translate-y-[-50%]
    focus:not(:active):before:animate-[ripple_0.6s_ease-out]
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-primary-800 to-primary-700 text-white border border-primary-700
      hover:from-primary-900 hover:to-primary-800 hover:border-primary-800 hover:-translate-y-0.5
      hover:shadow-[0_4px_12px_rgba(26,35,126,0.3)]
      focus:ring-primary-700 focus:ring-opacity-50
    `,
    secondary: `
      bg-gradient-to-r from-primary-700 to-primary-600 text-white border border-primary-600
      hover:from-primary-800 hover:to-primary-700 hover:border-primary-800 hover:-translate-y-0.5
      hover:shadow-[0_4px_12px_rgba(40,53,147,0.3)]
      focus:ring-primary-700 focus:ring-opacity-50
    `,
    outline: `
      bg-transparent text-primary-800 border border-primary-800
      hover:bg-gradient-to-r hover:from-primary-800 hover:to-primary-700 hover:text-white hover:border-primary-700
      hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(26,35,126,0.15)]
      focus:ring-primary-800 focus:ring-opacity-50
    `,
    danger: `
      bg-gradient-to-r from-error-600 to-error-500 text-white border border-error-500
      hover:from-error-700 hover:to-error-600 hover:border-error-700 hover:-translate-y-0.5
      hover:shadow-[0_4px_12px_rgba(198,40,40,0.3)]
      focus:ring-error-600 focus:ring-opacity-50
    `,
    success: `
      bg-gradient-to-r from-success-600 to-success-500 text-white border border-success-500
      hover:from-success-700 hover:to-success-600 hover:border-success-700 hover:-translate-y-0.5
      hover:shadow-[0_4px_12px_rgba(46,125,50,0.3)]
      focus:ring-success-600 focus:ring-opacity-50
    `,
    white: `
      bg-background-light text-primary-800 border border-border-light
      hover:bg-gradient-to-r hover:from-surface-light hover:to-surface-light hover:border-primary-700 hover:-translate-y-0.5
      hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
      focus:ring-primary-800 focus:ring-opacity-50
    `,
    ghost: `
      bg-transparent text-primary-700 border border-transparent
      hover:bg-gradient-to-r hover:from-primary-800/5 hover:to-primary-700/5 hover:text-primary-800
      focus:ring-primary-700 focus:ring-opacity-50
    `
  };
  
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-5 py-2.5 text-[0.95rem]",
    large: "px-6 py-3 text-base"
  };
  
  const disabledClasses = "opacity-65 pointer-events-none cursor-not-allowed";
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    disabled ? disabledClasses : "",
    className
  ].join(" ").replace(/\s+/g, ' ').trim();
  
  return (
    <>
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          100% {
            transform: scale(20, 20);
            opacity: 0;
          }
        }
      `}</style>
      <button
        type={type}
        className={classes}
        onClick={onClick}
        disabled={disabled}
        aria-label={icon ? `${children} ${iconPosition === "left" ? "con icono a la izquierda" : "con icono a la derecha"}` : children}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
          }
        }}
      >
        {icon && iconPosition === "left" && (
          <span className="flex items-center justify-center mr-2" aria-hidden="true">{icon}</span>
        )}

        <span>{children}</span>

        {icon && iconPosition === "right" && (
          <span className="flex items-center justify-center ml-2" aria-hidden="true">{icon}</span>
        )}
      </button>
    </>
  );
};

// Exportar el componente principal
export default Button;

// Exportar variantes predefinidas para facilitar su uso
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WhiteButton = (props) => <Button variant="white" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;