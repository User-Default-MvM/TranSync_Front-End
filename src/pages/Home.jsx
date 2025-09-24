import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bus, Clock, Shield, Map, BarChart, CalendarClock, Check, Award, TrendingUp, Users, Zap, Star, ArrowRight, Play, Globe, Target } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [, setDark] = useState(localStorage.getItem("theme") === "dark");

  const caracteristicas = [
    {
      icono: Bus,
      titulo: t('homePage.features.items.0.title'),
      descripcion: t('homePage.features.items.0.description'),
      beneficios: [
        t('homePage.features.items.0.benefits.0'),
        t('homePage.features.items.0.benefits.1'),
        t('homePage.features.items.0.benefits.2')
      ],
      color: "from-[#1a237e] to-[#3949ab]",
      stats: t('homePage.features.items.0.stats')
    },
    {
      icono: Clock,
      titulo: t('homePage.features.items.1.title'),
      descripcion: t('homePage.features.items.1.description'),
      beneficios: [
        t('homePage.features.items.1.benefits.0'),
        t('homePage.features.items.1.benefits.1'),
        t('homePage.features.items.1.benefits.2')
      ],
      color: "from-[#3949ab] to-[#5c6bc0]",
      stats: t('homePage.features.items.1.stats')
    },
    {
      icono: Shield,
      titulo: t('homePage.features.items.2.title'),
      descripcion: t('homePage.features.items.2.description'),
      beneficios: [
        t('homePage.features.items.2.benefits.0'),
        t('homePage.features.items.2.benefits.1'),
        t('homePage.features.items.2.benefits.2')
      ],
      color: "from-[#1a237e] to-[#283593]",
      stats: t('homePage.features.items.2.stats')
    },
    {
      icono: Map,
      titulo: t('homePage.features.items.3.title'),
      descripcion: t('homePage.features.items.3.description'),
      beneficios: [
        t('homePage.features.items.3.benefits.0'),
        t('homePage.features.items.3.benefits.1'),
        t('homePage.features.items.3.benefits.2')
      ],
      color: "from-[#283593] to-[#3949ab]",
      stats: t('homePage.features.items.3.stats')
    },
    {
      icono: BarChart,
      titulo: t('homePage.features.items.4.title'),
      descripcion: t('homePage.features.items.4.description'),
      beneficios: [
        t('homePage.features.items.4.benefits.0'),
        t('homePage.features.items.4.benefits.1'),
        t('homePage.features.items.4.benefits.2')
      ],
      color: "from-[#3949ab] to-[#5c6bc0]",
      stats: t('homePage.features.items.4.stats')
    },
    {
      icono: CalendarClock,
      titulo: t('homePage.features.items.5.title'),
      descripcion: t('homePage.features.items.5.description'),
      beneficios: [
        t('homePage.features.items.5.benefits.0'),
        t('homePage.features.items.5.benefits.1'),
        t('homePage.features.items.5.benefits.2')
      ],
      color: "from-[#1a237e] to-[#3949ab]",
      stats: t('homePage.features.items.5.stats')
    }
  ];

  const testimonios = [
    {
      id: 1,
      texto: "Como ciudad piloto, TranSync nos ha permitido probar tecnologías que antes parecían imposibles. Los resultados iniciales son prometedores y vemos un gran potencial para escalar.",
      autor: "Carlos Rodríguez",
      cargo: "Director de Operaciones",
      empresa: "TransUrbe Bogotá - Ciudad Piloto",
      rating: 5,
      beneficio: "Resultados prometedores",
      imagen: "/api/placeholder/80/80"
    },
    {
      id: 2,
      texto: "La implementación fue muy suave y el equipo de soporte nos acompañó en cada paso. Ya vemos mejoras en la eficiencia operativa y nuestros conductores están adaptándose rápidamente.",
      autor: "Ana Martínez",
      cargo: "Gerente de Flota",
      empresa: "Metroplús Medellín - Programa Piloto",
      rating: 5,
      beneficio: "Implementación exitosa",
      imagen: "/api/placeholder/80/80"
    },
    {
      id: 3,
      texto: "La plataforma nos da visibilidad en tiempo real de nuestra flota por primera vez. Es un cambio significativo en cómo operamos y estamos emocionados con las posibilidades futuras.",
      autor: "Luis Fernández",
      cargo: "Jefe de Operaciones",
      empresa: "MIO Cali - Proyecto Piloto",
      rating: 5,
      beneficio: "Visibilidad en tiempo real",
      imagen: "/api/placeholder/80/80"
    },
    {
      id: 4,
      texto: "Como empresa de transporte mediano, esta tecnología nos pone a la vanguardia. La interfaz es intuitiva y el potencial de crecimiento es evidente desde las primeras semanas.",
      autor: "María González",
      cargo: "Directora de Tecnología",
      empresa: "Transportes del Valle - Partner Inicial",
      rating: 5,
      beneficio: "Tecnología de vanguardia",
      imagen: "/api/placeholder/80/80"
    }
  ];

  const estadisticas = [
    { numero: "5+", etiqueta: t('homePage.hero.stats.cities'), icono: Globe },
    { numero: "150K+", etiqueta: t('homePage.hero.stats.passengers'), icono: Users },
    { numero: "95%", etiqueta: t('homePage.hero.stats.satisfaction'), icono: Clock },
    { numero: "25%", etiqueta: t('homePage.hero.stats.efficiency'), icono: TrendingUp }
  ];

  const premios = [
    { titulo: "Startup Innovadora 2024", año: "2024", organizacion: "TechHub Colombia", icono: Award },
    { titulo: "Mención Especial IA", año: "2024", organizacion: "Innovation Summit", icono: Star },
    { titulo: "Finalista Transporte Inteligente", año: "2024", organizacion: "Smart Mobility Awards", icono: Target },
    { titulo: "Certificación de Seguridad", año: "2024", organizacion: "CyberSecurity Standards", icono: Shield }
  ];

  const ciudades = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga",
    "Pereira", "Santa Marta", "Cúcuta", "Ibagué", "Manizales", "Pasto",
    "Villavicencio", "Sincelejo", "Yopal", "Popayán", "Armenia", "Neiva"
  ];

  const casosDeUso = [
    {
      titulo: t('homePage.useCases.items.0.title'),
      descripcion: t('homePage.useCases.items.0.description'),
      beneficios: [
        t('homePage.useCases.items.0.benefits.0'),
        t('homePage.useCases.items.0.benefits.1'),
        t('homePage.useCases.items.0.benefits.2')
      ],
      icono: Bus,
      color: "from-blue-500 to-purple-600"
    },
    {
      titulo: t('homePage.useCases.items.1.title'),
      descripcion: t('homePage.useCases.items.1.description'),
      beneficios: [
        t('homePage.useCases.items.1.benefits.0'),
        t('homePage.useCases.items.1.benefits.1'),
        t('homePage.useCases.items.1.benefits.2')
      ],
      icono: Zap,
      color: "from-green-500 to-teal-600"
    },
    {
      titulo: t('homePage.useCases.items.2.title'),
      descripcion: t('homePage.useCases.items.2.description'),
      beneficios: [
        t('homePage.useCases.items.2.benefits.0'),
        t('homePage.useCases.items.2.benefits.1'),
        t('homePage.useCases.items.2.benefits.2')
      ],
      icono: Map,
      color: "from-orange-500 to-red-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonios.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonios.length]);


  useEffect(() => {
    const observer = () => setDark(localStorage.getItem("theme") === "dark");
    window.addEventListener("storage", observer);
    return () => window.removeEventListener("storage", observer);
  }, [setDark]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="font-['Inter',system-ui] text-text-primary-light dark:text-gray-100 bg-background-light dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      {/* Hero Section Mejorado */}
      <header className="relative bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] text-white py-24 px-6 overflow-hidden dark:from-gray-800 dark:via-gray-900 dark:to-black">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="w-full max-w-7xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 mb-8 hover:bg-white/15 transition-all duration-300">
            <Award className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium">{t('homePage.hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className={`text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 dark:from-primary-300 dark:via-primary-100 dark:to-secondary-200 bg-clip-text text-transparent transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            TranSync
          </h1>

          <p className={`text-2xl max-w-4xl mx-auto mb-12 text-blue-100 dark:text-gray-300 leading-relaxed transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {t('homePage.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          </div>
        </div>
      </header>

      {/* Estadísticas Impactantes */}
      <section className="py-20 bg-gradient-to-r from-surface-light to-primary-50 dark:from-gray-900 dark:to-gray-800 border-b border-border-light dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
              {t('homePage.hero.title')}
            </h2>
            <p className="text-xl text-text-secondary-light dark:text-gray-300 max-w-3xl mx-auto">
              {t('homePage.hero.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {estadisticas.map((stat, index) => (
              <div key={index} className={`text-center p-6 rounded-2xl bg-background-light dark:bg-gray-800 shadow-lg border border-border-light dark:border-gray-700 transform transition-all duration-500 hover:scale-105 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${index * 100}ms` }}>
                <stat.icono className="w-12 h-12 text-[#3949ab] dark:text-primary-500 mx-auto mb-4" />
                <div className="text-4xl font-bold text-primary-800 dark:text-primary-500 mb-2">{stat.numero}</div>
                <div className="text-text-secondary-light dark:text-gray-300 font-medium">{stat.etiqueta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ciudades que Confían en Nosotros */}
      <section className="py-16 bg-background-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">{t('homePage.cities.title')}</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {ciudades.slice(0, 12).map((ciudad, i) => (
              <div key={i} className={`p-4 rounded-xl bg-gradient-to-br from-surface-light to-primary-50 dark:from-gray-800 dark:to-gray-700 border border-border-light dark:border-gray-600 transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="font-semibold text-text-primary-light dark:text-gray-200 text-sm">{ciudad}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <span className="text-text-secondary-light dark:text-gray-400">{t('homePage.cities.subtitle')}</span>
          </div>
        </div>
      </section>

      {/* Características Mejoradas */}
      <section className="py-24 bg-gradient-to-br from-surface-light via-primary-50 to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-border-light dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
              {t('homePage.features.title')}
            </h2>
            <p className="text-xl text-text-secondary-light dark:text-gray-300 max-w-3xl mx-auto">
              {t('homePage.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caracteristicas.map((caracteristica, i) => (
              <div key={i} className={`group bg-background-light dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-border-light dark:border-gray-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${caracteristica.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <caracteristica.icono className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {caracteristica.stats}
                  </div>
                </div>

                <h3 className="font-bold text-xl mb-3 text-text-primary-light dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-500 transition-colors">
                  {caracteristica.titulo}
                </h3>

                <p className="text-text-secondary-light dark:text-gray-300 mb-6 leading-relaxed">
                  {caracteristica.descripcion}
                </p>

                <ul className="space-y-3">
                  {caracteristica.beneficios.map((beneficio, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-text-primary-light dark:text-gray-200">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Casos de Uso Específicos */}
      <section className="py-24 bg-background-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
              {t('homePage.useCases.title')}
            </h2>
            <p className="text-xl text-text-secondary-light dark:text-gray-300 max-w-3xl mx-auto">
              {t('homePage.useCases.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {casosDeUso.map((caso, i) => (
              <div key={i} className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${caso.color} text-white p-8 hover:scale-105 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${i * 200}ms` }}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div className="relative z-10">
                  <caso.icono className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-bold text-2xl mb-3">{caso.titulo}</h3>
                  <p className="text-white/90 mb-6 leading-relaxed">{caso.descripcion}</p>
                  <ul className="space-y-2">
                    {caso.beneficios.map((beneficio, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-300" />
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios Mejorados */}
      <section className="py-24 bg-gradient-to-br from-surface-light to-primary-50 dark:from-gray-900 dark:to-gray-800 border-b border-border-light dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
              {t('homePage.testimonials.title')}
            </h2>
            <p className="text-xl text-text-secondary-light dark:text-gray-300">
              {t('homePage.testimonials.subtitle')}
            </p>
          </div>

          <div className="relative">
            <div className={`bg-background-light dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border border-border-light dark:border-gray-700 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3949ab] to-[#5c6bc0] flex items-center justify-center text-white font-bold text-xl">
                  {testimonios[currentTestimonial].autor.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(testimonios[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-primary-500 fill-current" />
                    ))}
                  </div>
                  <h4 className="font-bold text-xl text-text-primary-light dark:text-gray-100">
                    {testimonios[currentTestimonial].autor}
                  </h4>
                  <p className="text-text-secondary-light dark:text-gray-300">
                    {testimonios[currentTestimonial].cargo} en {testimonios[currentTestimonial].empresa}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full font-semibold text-sm">
                  {testimonios[currentTestimonial].beneficio}
                </div>
              </div>

              <blockquote className="text-lg italic text-text-primary-light dark:text-gray-200 leading-relaxed mb-8">
                "{testimonios[currentTestimonial].texto}"
              </blockquote>

              {/* Indicadores de Testimonios */}
              <div className="flex justify-center gap-2">
                {testimonios.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentTestimonial
                        ? 'bg-[#3949ab] dark:bg-primary-500 w-8'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premios y Reconocimientos */}
      <section className="py-24 bg-background-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
              {t('homePage.awards.title')}
            </h2>
            <p className="text-xl text-text-secondary-light dark:text-gray-300">
              {t('homePage.awards.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {premios.map((premio, i) => (
              <div key={i} className={`group bg-gradient-to-br from-surface-light to-primary-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-lg border border-border-light dark:border-gray-600 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <premio.icono className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{premio.titulo}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{premio.organizacion}</p>
                <p className="text-sm font-semibold text-[#3949ab] dark:text-primary-500">{premio.año}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Mejorado */}
      <section className="py-24 bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] dark:from-gray-800 dark:via-gray-900 dark:to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className={`text-5xl font-bold mb-6 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {t('homePage.cta.title')}
          </h2>
          <p className={`text-xl text-blue-100 dark:text-gray-300 mb-12 leading-relaxed transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {t('homePage.cta.subtitle')}
          </p>

          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button className="group bg-gradient-to-r from-primary-600 to-secondary-700 hover:from-primary-700 hover:to-secondary-800 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105 text-lg">
              <Play className="w-6 h-6" />
              {t('homePage.cta.buttons.demo')}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-5 px-10 rounded-2xl border border-white/40 transition-all duration-300 hover:scale-105 text-lg">
              {t('homePage.cta.buttons.expert')}
            </button>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-blue-100 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>{t('homePage.cta.features.0')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>{t('homePage.cta.features.1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>{t('homePage.cta.features.2')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;