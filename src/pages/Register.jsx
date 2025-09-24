import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaLock,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaUserTie,
  FaCheckCircle,
  FaShieldAlt,
  FaUsers,
  FaCogs,
  FaSpinner
} from "react-icons/fa";

// Importar el servicio de autenticación
import authAPI from '../utilidades/authAPI';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    numeroDocumento: "",
    telefono: "",
    password: "",
    confirmPassword: ""
  });

  const [ui, setUI] = useState({
    formErrors: {},
    loading: false,
    error: "",
    success: "",
    formTouched: false,
    showPassword: false,
    showConfirmPassword: false
  });

  const updateUI = (updates) => setUI((prev) => ({ ...prev, ...updates }));

  const clearMessages = () => updateUI({ error: "", success: "" });

  const validateField = (name, value) => {
    const validators = {
      email: (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? ""
          : t('register.validation.emailInvalid'),
      nombre: (val) => (val.trim() ? "" : t('register.validation.nameRequired')),
      apellido: (val) => (val.trim() ? "" : t('register.validation.lastnameRequired')),
      numeroDocumento: (val) =>
        val.trim().length >= 6 ? "" : t('register.validation.documentInvalid'),
      telefono: (val) =>
        val.trim().length >= 7 ? "" : t('register.validation.phoneInvalid'),
      password: (val) => {
        if (val.length < 6)
          return t('register.validation.passwordMinLength');
        if (!/(?=.*[a-z])/.test(val))
          return t('register.validation.passwordLowercase');
        if (!/(?=.*[A-Z])/.test(val))
          return t('register.validation.passwordUppercase');
        if (!/(?=.*\d)/.test(val)) return t('register.validation.passwordNumber');
        return "";
      },
      confirmPassword: (val) =>
        val !== formData.password ? t('register.validation.passwordMismatch') : ""
    };

    return validators[name]?.(value) || "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    updateUI({
      formTouched: true,
      formErrors: { ...ui.formErrors, [name]: error }
    });

    clearMessages();
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    for (const field in formData) {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }

    updateUI({ formErrors: errors });
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    updateUI({ formTouched: true });

    if (!validateForm()) return;

    clearMessages();
    updateUI({ loading: true });

    try {
      await authAPI.register({
        nomUsuario: formData.nombre.trim(),
        apeUsuario: formData.apellido.trim(),
        numDocUsuario: formData.numeroDocumento.trim(),
        telUsuario: formData.telefono.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.password
      });

      updateUI({
        success:
          "¡Registro exitoso! Por favor, verifica tu correo electrónico.",
        loading: false
      });

      setFormData({
        email: "",
        nombre: "",
        apellido: "",
        numeroDocumento: "",
        telefono: "",
        password: "",
        confirmPassword: ""
      });

      updateUI({ formTouched: false, formErrors: {} });

      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      updateUI({
        error:
          error?.response?.data?.message ||
          error.message ||
          "Error al registrar usuario.",
        loading: false
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    const key = field === "password" ? "showPassword" : "showConfirmPassword";
    updateUI({ [key]: !ui[key] });
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { score: 0, label: "", color: "" };

    const checks = [
      password.length >= 6,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password)
    ];

    const score = checks.filter(Boolean).length;

    if (score < 2) return { score, label: "Débil", color: "text-red-500" };
    if (score < 4) return { score, label: "Media", color: "text-yellow-500" };
    return { score, label: "Fuerte", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  // Componente para mostrar requisitos de contraseña
  const PasswordRequirement = ({ met, children }) => (
    <div className={`flex items-center text-sm ${met ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
      <FaCheckCircle className={`mr-3 ${met ? "text-green-500" : "text-slate-300 dark:text-slate-600"}`} />
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light via-primary-50 to-primary-100 dark:from-background-dark dark:via-surface-dark dark:to-background-dark flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl mx-auto bg-background-light dark:bg-surface-dark rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row min-h-[70vh] md:min-h-[80vh] xl:min-h-[85vh]">
          {/* Left side - Brand section */}
          <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative overflow-hidden animate-slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6">
                TransSync
              </h1>
              <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                Sistema de gestión empresarial para el transporte moderno
              </p>
              <div className="space-y-6">
                <div className="flex items-center text-blue-100 text-lg">
                  <FaShieldAlt className="mr-4 text-blue-300 text-xl" />
                  <span>Registro seguro y verificado</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaUsers className="mr-4 text-blue-300 text-xl" />
                  <span>Asignación de roles por administrador</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaCogs className="mr-4 text-blue-300 text-xl" />
                  <span>Acceso controlado al sistema</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="lg:w-3/5 p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center animate-slide-in-right">
            {/* Header */}
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3">Crear Cuenta</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-base md:text-lg">Regístrese para acceder al sistema</p>
              <div className="mt-4 p-3 md:p-4 bg-blue-50 dark:bg-surface-dark border border-blue-200 dark:border-gray-600 rounded-xl">
                <div className="flex items-center text-blue-700 dark:text-blue-300 text-sm">
                  <FaUserTie className="mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Su cuenta será revisada por un administrador antes de la activación</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            {ui.success && (
              <div className="flex items-center bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 p-3 md:p-4 rounded-xl mb-6 md:mb-8 border border-green-200 dark:border-green-800">
                <FaCheckCircle className="mr-3 flex-shrink-0 text-green-500 dark:text-green-300 text-base md:text-lg" />
                <span className="text-sm">{ui.success}</span>
              </div>
            )}

            {ui.error && (
              <div className="flex items-center bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-3 md:p-4 rounded-xl mb-6 md:mb-8 border border-red-200 dark:border-red-800">
                <FaExclamationTriangle className="mr-3 flex-shrink-0 text-red-500 dark:text-red-300 text-base md:text-lg" />
                <div className="text-sm">
                  <p>{ui.error}</p>
                  {ui.error.includes("configuración del sistema") && (
                    <p className="mt-2 text-red-600 dark:text-red-400 font-medium">
                      Sugerencia: Contacte al administrador del sistema para verificar la configuración de la base de datos.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-6 md:space-y-8">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Ingrese su correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={ui.loading}
                    className={`w-full pl-12 pr-4 py-3 md:py-4 border rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-base md:text-lg disabled:opacity-50 ${ui.formTouched && ui.formErrors.email
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                    required
                    autoComplete="email"
                    aria-describedby={ui.formTouched && ui.formErrors.email ? "email-error" : undefined}
                    aria-invalid={ui.formTouched && ui.formErrors.email}
                  />
                </div>
                {ui.formTouched && ui.formErrors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  placeholder="Ingrese su nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={ui.loading}
                  className={`w-full px-4 py-3 md:py-4 border rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-base md:text-lg disabled:opacity-50 ${ui.formTouched && ui.formErrors.nombre
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  required
                  autoComplete="name"
                  aria-describedby={ui.formTouched && ui.formErrors.nombre ? "nombre-error" : undefined}
                  aria-invalid={ui.formTouched && ui.formErrors.nombre}
                />
                {ui.formTouched && ui.formErrors.nombre && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.nombre}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  placeholder="Ingrese su apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  disabled={ui.loading}
                  className={`w-full px-4 py-3 md:py-4 border rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-base md:text-lg disabled:opacity-50 ${ui.formTouched && ui.formErrors.apellido
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  required
                  autoComplete="family-name"
                  aria-describedby={ui.formTouched && ui.formErrors.apellido ? "apellido-error" : undefined}
                  aria-invalid={ui.formTouched && ui.formErrors.apellido}
                />
                {ui.formTouched && ui.formErrors.apellido && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.apellido}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="numeroDocumento" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Número de Documento
                </label>
                <input
                  id="numeroDocumento"
                  name="numeroDocumento"
                  placeholder="Ingrese su número de documento"
                  value={formData.numeroDocumento}
                  onChange={handleChange}
                  disabled={ui.loading}
                  className={`w-full px-4 py-4 border rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-lg disabled:opacity-50 ${ui.formTouched && ui.formErrors.numeroDocumento
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  required
                  autoComplete="off"
                />
                {ui.formTouched && ui.formErrors.numeroDocumento && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.numeroDocumento}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  placeholder="Ingrese su número de teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={ui.loading}
                  className={`w-full px-4 py-4 border rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-lg disabled:opacity-50 ${ui.formTouched && ui.formErrors.telefono
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  required
                  autoComplete="tel"
                />
                {ui.formTouched && ui.formErrors.telefono && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.telefono}
                  </p>
                )}
              </div>
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
                  <input
                    id="password"
                    name="password"
                    type={ui.showPassword ? "text" : "password"}
                    placeholder="Cree una contraseña segura"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={ui.loading}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-lg disabled:opacity-50 ${ui.formTouched && ui.formErrors.password
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => togglePasswordVisibility('password')}
                    disabled={ui.loading}
                    tabIndex="-1"
                  >
                    {ui.showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Fortaleza:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-2">
                       <div
                         className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.score < 2 ? 'bg-red-500' :
                             passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                           }`}
                         style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                       />
                     </div>
                  </div>
                )}

                {ui.formTouched && ui.formErrors.password && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={ui.showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme su contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={ui.loading}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-lg disabled:opacity-50 ${ui.formTouched && ui.formErrors.confirmPassword
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    disabled={ui.loading}
                    tabIndex="-1"
                  >
                    {ui.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {ui.formTouched && ui.formErrors.confirmPassword && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password requirements */}
              <div className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-gray-600 rounded-xl p-4 md:p-6">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 md:mb-4">Requisitos de contraseña:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <PasswordRequirement met={formData.password.length >= 6}>
                     Mínimo 6 caracteres
                   </PasswordRequirement>
                   <PasswordRequirement met={/(?=.*[a-z])/.test(formData.password)}>
                     Una letra minúscula
                   </PasswordRequirement>
                   <PasswordRequirement met={/(?=.*[A-Z])/.test(formData.password)}>
                     Una letra mayúscula
                   </PasswordRequirement>
                   <PasswordRequirement met={/(?=.*\d)/.test(formData.password)}>
                     Al menos un número
                   </PasswordRequirement>
                 </div>
              </div>

              {/* Information about process */}
              <div className="bg-blue-50 dark:bg-surface-dark border border-blue-200 dark:border-gray-600 rounded-xl p-4 md:p-6">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                  <FaUserTie className="mr-2" />
                  Proceso de registro
                </h4>
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  {[
                    'Se creará su cuenta con estado "PENDIENTE"',
                    'Recibirá un correo de verificación',
                    'Un administrador revisará y asignará su rol final'
                  ].map((step, index) => (
                    <div key={index} className="flex items-start">
                      <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 md:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 text-base md:text-lg animate-scale-in focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                disabled={ui.loading}
                aria-describedby={ui.loading ? "register-loading" : undefined}
              >
                {ui.loading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="w-5 h-5 md:w-6 md:h-6 mr-3 animate-spin" />
                    Registrando...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </button>

              {/* Login link */}
              <div className="text-center pt-4 md:pt-6 border-t border-slate-200 dark:border-gray-600">
                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base mb-3 md:mb-4">¿Ya tienes una cuenta?</p>
                <button
                  type="button"
                  className="w-full sm:w-auto bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 font-semibold py-2.5 md:py-3 px-6 md:px-8 rounded-xl transition-all duration-300 text-sm md:text-base disabled:opacity-50 animate-scale-in hover:animate-bounce-gentle focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                  onClick={() => navigate("/login")}
                  disabled={ui.loading}
                  aria-label="Ir a la página de inicio de sesión"
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;