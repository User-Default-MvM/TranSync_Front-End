import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaUser,
  FaLock,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaShieldAlt,
  FaUsers,
  FaCogs,
  FaSpinner,
  FaWifi,
  FaServer,
  FaMoon,
  FaSun
} from "react-icons/fa";
import authAPI from '../utilidades/authAPI';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  // Usar el contexto de tema
  const { theme, toggleTheme } = useTheme();

  // Función para verificar conexión con el servidor usando authAPI
  const checkServerConnection = useCallback(async () => {
    try {
      const health = await authAPI.checkServerHealth();
      if (health.status === 'OK') {
        setServerStatus({ status: 'connected', message: health.message });
      } else {
        setServerStatus({ status: 'error', message: health.message });
      }
    } catch (error) {
      setServerStatus({
        status: 'disconnected',
        message: t('login.messages.serverConnectionError')
      });
    }
  }, [t]);

  // Verificar si hay credenciales guardadas al cargar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Verificar estado del servidor al cargar
    checkServerConnection();
  }, [checkServerConnection]);

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validación de email
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de contraseña (al menos 6 caracteres)
  const isPasswordValid = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormTouched(true);
    setError("");
    setSuccess("");
  };

  // Manejo de eventos de teclado para navegación mejorada
  const handleKeyDown = (e, nextFieldRef = null, isSubmit = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isSubmit) {
        handleLogin(e);
      } else if (nextFieldRef) {
        nextFieldRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      setError("");
      setSuccess("");
    }
  };

  // Referencias para navegación con teclado
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const rememberMeRef = useRef(null);
  const submitButtonRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormTouched(true);

    // Validaciones
    if (!isEmailValid(email)) {
      setError(t('login.messages.emailInvalid'));
      return;
    }

    if (!isPasswordValid(password)) {
      setError(t('login.messages.passwordInvalid'));
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Usar authAPI para el login
      const response = await authAPI.login(email, password);

      setSuccess(t('login.messages.success'));

      // Verificar que los datos del usuario se guardaron correctamente
      if (response.token) {
        // Buscar datos del usuario en diferentes ubicaciones
        const userData = response.user || response.userData || response.profile || response.data;

        if (userData && userData.id && userData.email) {
          // Forzar actualización del contexto de autenticación
          window.dispatchEvent(new CustomEvent('auth:login', {
            detail: { user: userData, token: response.token }
          }));
          console.log('✅ Login successful, user data verified:', userData);
        } else {
          console.error('❌ Login response missing user data:', {
            hasToken: !!response.token,
            hasUser: !!response.user,
            hasUserData: !!response.userData,
            hasProfile: !!response.profile,
            hasData: !!response.data,
            fullResponse: response
          });
          throw new Error('No user data received after login');
        }
      } else {
        console.error('❌ Login response missing token:', response);
        throw new Error('No authentication token received after login');
      }

      // Guardar estado de "recordarme"
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.setItem("rememberMe", "false");
      }

      // Redirigir después de un momento
      setTimeout(() => {
        const userRole = response.user?.role;
        const from = location.state?.from?.pathname;

        if (from && from !== '/login' && from !== '/register') {
          navigate(from, { replace: true });
        } else {
          if (userRole === "SUPERADMIN" || userRole === "ADMINISTRADOR") {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Error de login:", err);

      // authAPI ya maneja los errores específicos
      if (err.message.includes('Credenciales incorrectas')) {
        setError(t('login.messages.credentialsInvalid'));
      } else if (err.message.includes('no está activada')) {
        setError(t('login.messages.accountNotActivated'));
      } else if (err.message.includes('servidor')) {
        setError(err.message);
        setServerStatus({ status: 'disconnected', message: t('login.messages.serverError') });
      } else {
        setError(err.message || t('login.messages.authError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  // Auto-focus en el primer campo al cargar
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

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
                <span className="truncate">{t('login.brand.description')}</span>
              </p>
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex items-center text-blue-100 text-sm sm:text-base md:text-lg min-w-0">
                  <FaShieldAlt className="mr-2 sm:mr-3 md:mr-4 text-blue-300 text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <span className="truncate">{t('login.brand.features.security')}</span>
                </div>
                <div className="flex items-center text-blue-100 text-sm sm:text-base md:text-lg min-w-0">
                  <FaUsers className="mr-2 sm:mr-3 md:mr-4 text-blue-300 text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <span className="truncate">{t('login.brand.features.admin')}</span>
                </div>
                <div className="flex items-center text-blue-100 text-sm sm:text-base md:text-lg min-w-0">
                  <FaCogs className="mr-2 sm:mr-3 md:mr-4 text-blue-300 text-base sm:text-lg md:text-xl flex-shrink-0" />
                  <span className="truncate">{t('login.brand.features.dashboard')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="lg:w-3/5 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center animate-slide-in-right min-h-[600px] sm:min-h-[70vh] md:min-h-[80vh] xl:min-h-[85vh]">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2 sm:mb-3 min-w-0">
                <span className="truncate">{t('login.title')}</span>
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm sm:text-base md:text-lg min-w-0">
                <span className="truncate">{t('login.subtitle')}</span>
              </p>

              {serverStatus && (
                <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-xs sm:text-sm flex items-center justify-center min-h-[40px] sm:min-h-[44px] ${serverStatus.status === 'connected'
                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800'
                    : serverStatus.status === 'disconnected'
                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
                  }`}>
                  {serverStatus.status === 'connected' && <FaWifi className="mr-1 sm:mr-2 flex-shrink-0" />}
                  {serverStatus.status === 'disconnected' && <FaServer className="mr-1 sm:mr-2 flex-shrink-0" />}
                  {serverStatus.status === 'error' && <FaExclamationTriangle className="mr-1 sm:mr-2 flex-shrink-0" />}
                  <span className="truncate">{serverStatus.message}</span>
                </div>
              )}
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
                <div className="text-xs sm:text-sm md:text-base min-w-0 flex-1">
                  <span className="truncate">{error}</span>
                  {error.includes("servidor") && (
                    <div className="mt-1 sm:mt-2">
                      <button
                        onClick={checkServerConnection}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            checkServerConnection();
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400 underline font-medium transition-colors duration-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                        disabled={loading}
                      >
                        {t('login.messages.checkConnection')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-text-primary-light dark:text-slate-200 mb-2 sm:mb-3 min-w-0">
                  <span className="truncate">{t('login.form.email')} <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-500 text-base sm:text-lg flex-shrink-0" />
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder={t('login.form.emailPlaceholder')}
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                    disabled={loading}
                    className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 border rounded-xl bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-white focus:outline-none focus:bg-background-light dark:focus:bg-gray-600 transition-all duration-200 text-sm sm:text-base md:text-lg disabled:opacity-50 min-h-[44px] sm:min-h-[48px] focus:ring-4 focus:ring-blue-500/20 ${formTouched && !isEmailValid(email) && email
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-border-light dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    required
                    autoComplete="email"
                    aria-describedby={formTouched && !isEmailValid(email) && email ? "email-error" : undefined}
                    aria-invalid={formTouched && !isEmailValid(email) && email}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-semibold text-text-primary-light dark:text-slate-200 mb-2 sm:mb-3 min-w-0"
                >
                  <span className="truncate">{t('login.form.password')} <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-500 text-base sm:text-lg flex-shrink-0" />
                  <input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('login.form.passwordPlaceholder')}
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    onKeyDown={(e) => handleKeyDown(e, rememberMe ? rememberMeRef : submitButtonRef, !rememberMe)}
                    disabled={loading}
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-4 border rounded-xl bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-white focus:outline-none focus:bg-background-light dark:focus:bg-gray-600 transition-all duration-200 text-sm sm:text-base md:text-lg disabled:opacity-50 min-h-[44px] sm:min-h-[48px] focus:ring-4 focus:ring-blue-500/20 ${formTouched && !password
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-border-light dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                    required
                    autoComplete="current-password"
                    aria-describedby={formTouched && !password ? "password-error" : undefined}
                    aria-invalid={formTouched && !password}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-300 hover:text-text-primary-light dark:hover:text-slate-100 min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] flex items-center justify-center"
                    aria-label="Mostrar contraseña"
                  >
                    {showPassword ? <FaEyeSlash className="text-sm sm:text-base" /> : <FaEye className="text-sm sm:text-base" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm md:text-base min-w-0">
                <label className="flex items-center cursor-pointer text-text-primary-light dark:text-slate-200 min-w-0">
                  <input
                    ref={rememberMeRef}
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    onKeyDown={(e) => handleKeyDown(e, submitButtonRef, true)}
                    disabled={loading}
                    className="mr-2 sm:mr-3 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  />
                  <span className="font-medium truncate">{t('login.form.rememberMe')}</span>
                </label>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-400 font-semibold transition-colors duration-200 hover:underline disabled:opacity-50 min-w-0 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                  onClick={handleForgotPassword}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleForgotPassword(e);
                    }
                  }}
                  disabled={loading}
                >
                  <span className="truncate">{t('login.form.forgotPassword')}</span>
                </button>
              </div>

              {/* Submit */}
              <button
                ref={submitButtonRef}
                type="button"
                onClick={handleLogin}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin(e);
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 text-sm sm:text-base md:text-lg animate-scale-in focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 min-h-[48px] sm:min-h-[52px]"
                disabled={loading || serverStatus?.status === 'disconnected'}
                aria-describedby={loading ? "login-loading" : serverStatus?.status === 'disconnected' ? "server-status" : undefined}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 animate-spin flex-shrink-0" />
                    <span className="truncate">{t('login.form.verifying')}</span>
                  </div>
                ) : (
                  <span className="truncate">{t('login.form.loginButton')}</span>
                )}
              </button>

              {/* Register */}
              <div className="text-center pt-3 sm:pt-4 md:pt-6 border-t border-border-light dark:border-gray-700">
                <p className="text-text-secondary-light dark:text-slate-300 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4 min-w-0">
                  <span className="truncate">{t('login.form.noAccount')}</span>
                </p>
                <button
                  type="button"
                  className="w-full sm:w-auto bg-background-light dark:bg-gray-700 text-blue-600 dark:text-blue-300 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-8 rounded-xl transition-all duration-300 text-xs sm:text-sm md:text-base animate-scale-in hover:animate-bounce-gentle focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 min-h-[44px] sm:min-h-[48px] min-w-0"
                  onClick={handleNavigateToRegister}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigateToRegister();
                    }
                  }}
                  disabled={loading}
                  aria-label="Ir a la página de registro de cuenta"
                >
                  <span className="truncate">{t('login.form.createAccount')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;