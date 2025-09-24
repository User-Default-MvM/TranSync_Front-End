import { useState, useEffect, useCallback } from "react";
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setError(t('login.messages.emailRequired'));
      return;
    }

    if (!isEmailValid(email)) {
      setError(t('login.messages.emailInvalid'));
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(t('login.messages.forgotPasswordSuccess'));
    } catch (err) {
      console.error("Error en forgot password:", err);
      setError(err.message || t('login.messages.forgotPasswordError'));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light via-primary-50 to-primary-100 dark:from-background-dark dark:via-surface-dark dark:to-background-dark flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-500">
      {/* Theme toggle button - fixed position */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-10 p-3 rounded-full bg-background-light dark:bg-surface-dark shadow-lg hover:shadow-xl transition-all duration-300 border border-border-light dark:border-gray-600 hover:border-border-light dark:hover:border-gray-500"
        title={theme === 'dark' ? t('login.theme.activateLight') : t('login.theme.activateDark')}
        aria-label={theme === 'dark' ? t('login.theme.changeToLight') : t('login.theme.changeToDark')}
      >
        {theme === 'dark' ? (
          <FaSun className="w-5 h-5 text-yellow-400" />
        ) : (
          <FaMoon className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {/* Main container */}
      <div className="w-full max-w-7xl mx-auto bg-background-light dark:bg-surface-dark rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row min-h-[70vh] md:min-h-[80vh] xl:min-h-[85vh]">
          {/* Left side - Brand section */}
          <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative overflow-hidden animate-slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6">
                TranSync
              </h1>
              <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                {t('login.brand.description')}
              </p>
              <div className="space-y-6">
                <div className="flex items-center text-blue-100 text-lg">
                  <FaShieldAlt className="mr-4 text-blue-300 text-xl" />
                  <span>{t('login.brand.features.security')}</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaUsers className="mr-4 text-blue-300 text-xl" />
                  <span>{t('login.brand.features.admin')}</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaCogs className="mr-4 text-blue-300 text-xl" />
                  <span>{t('login.brand.features.dashboard')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="lg:w-3/5 p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center animate-slide-in-right">
            {/* Header */}
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3">{t('login.title')}</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-base md:text-lg">{t('login.subtitle')}</p>

              {serverStatus && (
                <div className={`mt-4 p-3 rounded-lg text-sm flex items-center justify-center ${serverStatus.status === 'connected'
                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800'
                    : serverStatus.status === 'disconnected'
                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
                  }`}>
                  {serverStatus.status === 'connected' && <FaWifi className="mr-2" />}
                  {serverStatus.status === 'disconnected' && <FaServer className="mr-2" />}
                  {serverStatus.status === 'error' && <FaExclamationTriangle className="mr-2" />}
                  <span>{serverStatus.message}</span>
                </div>
              )}
            </div>

            {/* Success */}
            {success && (
              <div className="flex items-center bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 p-3 md:p-4 rounded-xl mb-6 md:mb-8 border border-green-200 dark:border-green-800">
                <FaCheckCircle className="mr-3 flex-shrink-0 text-green-500 dark:text-green-300 text-base md:text-lg" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-3 md:p-4 rounded-xl mb-6 md:mb-8 border border-red-200 dark:border-red-800">
                <FaExclamationTriangle className="mr-3 flex-shrink-0 text-red-500 dark:text-red-300 text-base md:text-lg" />
                <div className="text-sm">
                  <span>{error}</span>
                  {error.includes("servidor") && (
                    <div className="mt-2">
                      <button
                        onClick={checkServerConnection}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400 underline font-medium transition-colors duration-200"
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
            <div className="space-y-6 md:space-y-8">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-primary-light dark:text-slate-200 mb-3">
                  {t('login.form.email')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-500 text-lg" />
                  <input
                    id="email"
                    type="email"
                    placeholder={t('login.form.emailPlaceholder')}
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    disabled={loading}
                    className={`w-full pl-12 pr-4 py-3 md:py-4 border rounded-xl bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-white focus:outline-none focus:bg-background-light dark:focus:bg-gray-600 transition-all duration-200 text-base md:text-lg disabled:opacity-50 ${formTouched && !isEmailValid(email) && email
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
                  className="block text-sm font-semibold text-text-primary-light dark:text-slate-200 mb-3"
                >
                  {t('login.form.password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-500 text-lg" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('login.form.passwordPlaceholder')}
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    disabled={loading}
                    className={`w-full pl-12 pr-12 py-3 md:py-4 border rounded-xl bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-white focus:outline-none focus:bg-background-light dark:focus:bg-gray-600 transition-all duration-200 text-base md:text-lg disabled:opacity-50 ${formTouched && !password
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-slate-300 hover:text-text-primary-light dark:hover:text-slate-100"
                    aria-label="Mostrar contraseña"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                <label className="flex items-center cursor-pointer text-text-primary-light dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    disabled={loading}
                    className="mr-2"
                  />
                  <span className="font-medium">{t('login.form.rememberMe')}</span>
                </label>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-400 font-semibold transition-colors duration-200 hover:underline disabled:opacity-50"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  {t('login.form.forgotPassword')}
                </button>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 md:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 text-base md:text-lg animate-scale-in focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                disabled={loading || serverStatus?.status === 'disconnected'}
                aria-describedby={loading ? "login-loading" : serverStatus?.status === 'disconnected' ? "server-status" : undefined}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="w-5 h-5 md:w-6 md:h-6 mr-3 animate-spin" />
                    {t('login.form.verifying')}
                  </div>
                ) : (
                  t('login.form.loginButton')
                )}
              </button>

              {/* Register */}
              <div className="text-center pt-4 md:pt-6 border-t border-border-light dark:border-gray-700">
                <p className="text-text-secondary-light dark:text-slate-300 text-sm md:text-base mb-3 md:mb-4">{t('login.form.noAccount')}</p>
                <button
                  type="button"
                  className="w-full sm:w-auto bg-background-light dark:bg-gray-700 text-blue-600 dark:text-blue-300 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 font-semibold py-2.5 md:py-3 px-6 md:px-8 rounded-xl transition-all duration-300 text-sm md:text-base animate-scale-in hover:animate-bounce-gentle focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                  onClick={handleNavigateToRegister}
                  disabled={loading}
                  aria-label="Ir a la página de registro de cuenta"
                >
                  {t('login.form.createAccount')}
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