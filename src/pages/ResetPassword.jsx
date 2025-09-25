import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaLock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaShieldAlt,
  FaUsers,
  FaCogs,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun
} from "react-icons/fa";
import authAPI from '../utilidades/authAPI';
import { useTheme } from '../context/ThemeContext';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Usar el contexto de tema
  const { theme, toggleTheme } = useTheme();

  // Obtener token de la URL
  const token = searchParams.get('token');

  // Referencias para navegación con teclado
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Validación de contraseña
  const isPasswordValid = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormTouched(true);
    setError("");
    setSuccess("");
  };

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirm') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Manejo de eventos de teclado para navegación mejorada
  const handleKeyDown = (e, nextFieldRef = null, isSubmit = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isSubmit) {
        handleSubmit(e);
      } else if (nextFieldRef) {
        nextFieldRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      setError("");
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);

    // Validaciones
    if (!newPassword) {
      setError(t('resetPassword.messages.passwordRequired'));
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError(t('resetPassword.messages.passwordInvalid'));
      return;
    }

    if (!confirmPassword) {
      setError(t('resetPassword.messages.confirmPasswordRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.messages.passwordsNotMatch'));
      return;
    }

    if (!token) {
      setError(t('resetPassword.messages.tokenRequired'));
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authAPI.resetPassword(token, newPassword);
      setSuccess(t('resetPassword.messages.success'));

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Error en reset password:", err);
      setError(err.message || t('resetPassword.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // Auto-focus en el primer campo al cargar
  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  }, []);

  // Verificar si hay token en la URL
  useEffect(() => {
    if (!token) {
      setError(t('resetPassword.messages.tokenRequired'));
    }
  }, [token, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light via-primary-50 to-primary-100 dark:from-background-dark dark:via-surface-dark dark:to-background-dark flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 transition-all duration-500">
      {/* Theme toggle button - fixed position */}
      <button
        onClick={toggleTheme}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
          }
        }}
        className="fixed top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-10 p-2 sm:p-3 rounded-full bg-background-light dark:bg-surface-dark shadow-lg hover:shadow-xl transition-all duration-300 border border-border-light dark:border-gray-600 hover:border-border-light dark:hover:border-gray-500 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title={theme === 'dark' ? t('login.theme.activateLight') : t('login.theme.activateDark')}
        aria-label={theme === 'dark' ? t('login.theme.changeToLight') : t('login.theme.changeToDark')}
      >
        {theme === 'dark' ? (
          <FaSun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
        ) : (
          <FaMoon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
        )}
      </button>

      {/* Main container */}
      <div className="w-full max-w-7xl mx-auto bg-background-light dark:bg-surface-dark rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 animate-fade-in-up min-h-[600px] sm:min-h-[70vh] md:min-h-[80vh] xl:min-h-[85vh]">
        <div className="flex flex-col lg:flex-row min-h-[600px] sm:min-h-[70vh] md:min-h-[80vh] xl:min-h-[85vh]">
          {/* Left side - Brand section */}
          <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative overflow-hidden animate-slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full -translate-y-16 sm:-translate-y-24 md:-translate-y-32 translate-x-16 sm:translate-x-24 md:translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 min-w-0">
                <span className="truncate">TranSync</span>
              </h1>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg xl:text-xl mb-6 sm:mb-8 md:mb-10 leading-relaxed min-w-0">
                <span className="truncate">{t('resetPassword.brand.description')}</span>
              </p>
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex items-center text-blue-100 text-sm sm:text-base md:text-lg min-w-0">
                  <FaShieldAlt className="mr-2 sm:mr-3 md:mr-4 text-blue-300 text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <span className="truncate">{t('resetPassword.brand.features.security')}</span>
                </div>
                <div className="flex items-center text-blue-100 text-sm sm:text-base md:text-lg min-w-0">
                  <FaUsers className="mr-2 sm:mr-3 md:mr-4 text-blue-300 text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <span className="truncate">{t('resetPassword.brand.features.admin')}</span>
                </div>
                <div className="flex items-center text-blue-100 text-sm sm:text-base md:text-lg min-w-0">
                  <FaCogs className="mr-2 sm:mr-3 md:mr-4 text-blue-300 text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <span className="truncate">{t('resetPassword.brand.features.dashboard')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="lg:w-3/5 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center animate-slide-in-right min-h-[600px] sm:min-h-[70vh] md:min-h-[80vh] xl:min-h-[85vh]">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2 sm:mb-3 min-w-0">
                <span className="truncate">{t('resetPassword.title')}</span>
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm sm:text-base md:text-lg min-w-0">
                <span className="truncate">{t('resetPassword.subtitle')}</span>
              </p>
            </div>

            {/* Success */}
            {success && (
              <div className="flex items-center bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 p-2 sm:p-3 md:p-4 rounded-xl mb-4 sm:mb-6 md:mb-8 border border-green-200 dark:border-green-800 min-h-[48px] sm:min-h-[52px]">
                <FaCheckCircle className="mr-2 sm:mr-3 flex-shrink-0 text-green-500 dark:text-green-300 text-sm sm:text-base md:text-lg" />
                <span className="text-xs sm:text-sm md:text-base truncate">{success}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-2 sm:p-3 md:p-4 rounded-xl mb-4 sm:mb-6 md:mb-8 border border-red-200 dark:border-red-800 min-h-[48px] sm:min-h-[52px]">
                <FaExclamationTriangle className="mr-2 sm:mr-3 flex-shrink-0 text-red-500 dark:text-red-300 text-sm sm:text-base md:text-lg" />
                <span className="text-xs sm:text-sm md:text-base truncate">{error}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-xs sm:text-sm font-semibold text-text-primary-light dark:text-slate-200 mb-2 sm:mb-3 min-w-0">
                  <span className="truncate">{t('resetPassword.form.newPassword')} <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-500 text-base sm:text-lg flex-shrink-0" />
                  <input
                    ref={passwordRef}
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('resetPassword.form.newPasswordPlaceholder')}
                    value={newPassword}
                    onChange={handleInputChange(setNewPassword)}
                    onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
                    disabled={loading}
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-4 border rounded-xl bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-white focus:outline-none focus:bg-background-light dark:focus:bg-gray-600 transition-all duration-200 text-sm sm:text-base md:text-lg disabled:opacity-50 min-h-[44px] sm:min-h-[48px] focus:ring-4 focus:ring-blue-500/20 ${formTouched && !isPasswordValid(newPassword) && newPassword
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-border-light dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    required
                    autoComplete="new-password"
                    aria-describedby={formTouched && !isPasswordValid(newPassword) && newPassword ? "password-error" : undefined}
                    aria-invalid={formTouched && !isPasswordValid(newPassword) && newPassword}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-300 hover:text-text-primary-light dark:hover:text-slate-100 min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] flex items-center justify-center"
                    aria-label="Mostrar nueva contraseña"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm sm:text-base" /> : <FaEye className="text-sm sm:text-base" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-text-primary-light dark:text-slate-200 mb-2 sm:mb-3 min-w-0">
                  <span className="truncate">{t('resetPassword.form.confirmPassword')} <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-500 text-base sm:text-lg flex-shrink-0" />
                  <input
                    ref={confirmPasswordRef}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('resetPassword.form.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword)}
                    onKeyDown={(e) => handleKeyDown(e, submitButtonRef, true)}
                    disabled={loading}
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-4 border rounded-xl bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-white focus:outline-none focus:bg-background-light dark:focus:bg-gray-600 transition-all duration-200 text-sm sm:text-base md:text-lg disabled:opacity-50 min-h-[44px] sm:min-h-[48px] focus:ring-4 focus:ring-blue-500/20 ${formTouched && (!confirmPassword || newPassword !== confirmPassword)
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-border-light dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    required
                    autoComplete="new-password"
                    aria-describedby={formTouched && (!confirmPassword || newPassword !== confirmPassword) ? "confirm-password-error" : undefined}
                    aria-invalid={formTouched && (!confirmPassword || newPassword !== confirmPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-300 hover:text-text-primary-light dark:hover:text-slate-100 min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] flex items-center justify-center"
                    aria-label="Mostrar confirmación de contraseña"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-sm sm:text-base" /> : <FaEye className="text-sm sm:text-base" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                ref={submitButtonRef}
                type="button"
                onClick={handleSubmit}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 text-sm sm:text-base md:text-lg animate-scale-in focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 min-h-[48px] sm:min-h-[52px]"
                disabled={loading}
                aria-describedby={loading ? "reset-loading" : undefined}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 animate-spin flex-shrink-0" />
                    <span className="truncate">{t('resetPassword.form.resetting')}</span>
                  </div>
                ) : (
                  <span className="truncate">{t('resetPassword.form.submitButton')}</span>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center pt-3 sm:pt-4 md:pt-6 border-t border-border-light dark:border-gray-700">
                <p className="text-text-secondary-light dark:text-slate-300 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 min-w-0">
                  <span className="truncate">{t('resetPassword.form.rememberPassword')}</span>
                </p>
                <button
                  type="button"
                  className="w-full sm:w-auto bg-background-light dark:bg-gray-700 text-blue-600 dark:text-blue-300 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-8 rounded-xl transition-all duration-300 text-xs sm:text-sm md:text-base animate-scale-in hover:animate-bounce-gentle focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 min-h-[44px] sm:min-h-[48px] min-w-0"
                  onClick={handleBackToLogin}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBackToLogin();
                    }
                  }}
                  disabled={loading}
                  aria-label="Volver a la página de inicio de sesión"
                >
                  <span className="truncate">{t('resetPassword.form.backToLogin')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;