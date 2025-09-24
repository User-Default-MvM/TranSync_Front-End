# 🚀 TransSync - Plataforma Inteligente de Gestión de Transporte Público

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7.svg)](https://www.netlify.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/pwa/)

> **Sistema integral de gestión y optimización del transporte público moderno con IA integrada**

TransSync es una plataforma integral diseñada para empresas de transporte que combina gestión operativa avanzada con un **chatbot inteligente** impulsado por IA, proporcionando una experiencia de usuario excepcional y eficiencia operativa máxima.

## 📋 Tabla de Contenidos

- [🚀 TransSync - Plataforma Inteligente de Gestión de Transporte Público](#-transsync---plataforma-inteligente-de-gestión-de-transporte-público)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [✨ Características Principales](#-características-principales)
  - [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
  - [📦 Instalación](#-instalación)
  - [🚀 Despliegue](#-despliegue)
    - [Despliegue en Netlify (Recomendado)](#despliegue-en-netlify-recomendado)
    - [Despliegue Local](#despliegue-local)
    - [Variables de Entorno](#variables-de-entorno)
  - [📁 Estructura del Proyecto](#-estructura-del-proyecto)
  - [🔧 Configuración](#-configuración)
    - [Configuración de Netlify](#configuración-de-netlify)
    - [SEO y PWA](#seo-y-pwa)
    - [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
  - [🌐 Internacionalización](#-internacionalización)
  - [📱 Características PWA](#-características-pwa)
  - [🔍 SEO Optimizado](#-seo-optimizado)
  - [🧪 Testing](#-testing)
  - [🤝 Contribuir](#-contribuir)
  - [📄 Licencia](#-licencia)
  - [👥 Equipo de Desarrollo](#-equipo-de-desarrollo)
  - [📞 Contacto](#-contacto)
  - [🙏 Agradecimientos](#-agradecimientos)

## ✨ Características Principales

### 🤖 **Inteligencia Artificial**
- **Chatbot Inteligente** - Procesamiento de lenguaje natural avanzado
- **Memoria Conversacional** - Recuerda contexto y preferencias del usuario
- **Respuestas Inteligentes** - Genera consultas SQL automáticamente
- **Sistema de Cache** - Optimización automática de rendimiento
- **Analytics Avanzados** - Métricas detalladas de uso y rendimiento

### 📊 **Dashboard Ejecutivo**
- **Métricas en Tiempo Real** - KPIs actualizados constantemente
- **Reportes Interactivos** - Análisis detallado con gráficos dinámicos
- **Visualización Avanzada** - Mapas y gráficos interactivos
- **Alertas Inteligentes** - Notificaciones proactivas del sistema

### 🚛 **Gestión de Flota**
- **Control de Vehículos** - Seguimiento GPS en tiempo real
- **Gestión de Conductores** - Administración completa de personal
- **Programación de Rutas** - Optimización automática de recorridos
- **Mantenimiento Preventivo** - Alertas automáticas de vencimientos

### 🗺️ **Sistema de Rutas**
- **Optimización Automática** - Algoritmos inteligentes de rutas
- **Gestión de Horarios** - Control preciso de tiempos
- **Monitoreo en Tiempo Real** - Seguimiento de cumplimiento
- **Replanificación Dinámica** - Ajustes automáticos por incidencias

### 📱 **Aplicación Móvil (PWA)**
- **Instalación Nativa** - Funciona como app móvil
- **Funcionalidad Offline** - Operación sin conexión
- **Notificaciones Push** - Alertas en tiempo real
- **Interfaz Responsiva** - Optimizada para todos los dispositivos

### 🎓 **Tutorial Interactivo**
- **Detección Automática** - Solo para usuarios nuevos
- **Guía Paso a Paso** - Recorrido completo por funciones
- **Multi-idioma** - Soporte para español e inglés
- **Responsive** - Compatible con móviles y desktop

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- ⚛️ **React 18.2.0** - Biblioteca principal
- 🎨 **Tailwind CSS** - Framework de estilos
- 🔄 **React Router DOM** - Enrutamiento SPA
- 🌍 **React i18next** - Internacionalización
- 📊 **Chart.js & Recharts** - Visualización de datos
- 🗺️ **Leaflet** - Mapas interactivos

### **Funcionalidades Avanzadas**
- 📡 **Socket.IO** - Comunicación en tiempo real
- 🔐 **JWT Authentication** - Seguridad avanzada
- 💾 **Local Storage** - Persistencia de datos
- 📱 **Service Workers** - PWA
- 🔄 **Axios** - Cliente HTTP

### **Desarrollo y Testing**
- ⚡ **React Scripts** - Build tool
- 🧪 **Jest & Testing Library** - Testing
- 📏 **ESLint** - Linting de código
- 💅 **Prettier** - Formateo de código

### **Despliegue**
- 🌐 **Netlify** - Plataforma de despliegue
- 📦 **Webpack** - Bundling optimizado
- 🔍 **SEO optimizado** - Meta tags y sitemap
- 📱 **PWA Ready** - App móvil nativa

## 📦 Instalación

### Prerrequisitos
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/transsync.git
   cd transsync
   ```

2. **Instalar dependencias**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar desarrollo**
   ```bash
   npm start
   ```

5. **Abrir en navegador**
   ```
   http://localhost:3000
   ```
## 🚀 Despliegue

### Despliegue en Netlify (Recomendado)

#### Configuración Automática

1. **Conectar repositorio**
   - Ir a [Netlify](https://app.netlify.com/)
   - Hacer clic en "New site from Git"
   - Conectar con tu repositorio (GitHub, GitLab, Bitbucket)

2. **Configuración automática**
   - **Branch**: `main` o `master`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

3. **Variables de entorno**
   ```env
   REACT_APP_API_URL=https://api.transsync.com
   REACT_APP_WS_URL=wss://api.transsync.com
   REACT_APP_NAME=TransSync
   REACT_APP_VERSION=1.1.0
   REACT_APP_DEBUG_MODE=false
   ```

#### Configuración Manual

El proyecto incluye archivos de configuración optimizados:

- `netlify.toml` - Configuración completa de Netlify
- `public/_redirects` - Reglas de redirección SPA
- `public/robots.txt` - Instrucciones para motores de búsqueda
- `public/sitemap.xml` - Mapa del sitio completo
- `public/manifest.json` - Configuración PWA

### Despliegue Local

Para desarrollo y testing:

```bash
# Desarrollo
npm start

# Producción local
npm run build
npx serve -s build
```

### Variables de Entorno

#### Desarrollo
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000
REACT_APP_DEBUG_MODE=true
```

#### Producción
```env
REACT_APP_API_URL=https://api.transsync.com
REACT_APP_WS_URL=wss://api.transsync.com
REACT_APP_DEBUG_MODE=false
```

## 📁 Estructura del Proyecto

```
transsync/
├── public/                 # Archivos estáticos
│   ├── assets/            # Imágenes y recursos
│   ├── _redirects         # Reglas de redirección Netlify
│   ├── manifest.json      # Configuración PWA
│   ├── robots.txt         # SEO - Instrucciones bots
│   └── sitemap.xml        # SEO - Mapa del sitio
├── src/
│   ├── api/               # Configuración de APIs
│   ├── assets/            # Recursos de componentes
│   ├── components/        # Componentes React
│   ├── context/           # Context API
│   ├── hooks/             # Custom hooks
│   ├── locales/           # Archivos de traducción
│   ├── pages/             # Páginas de la aplicación
│   ├── routes/            # Configuración de rutas
│   └── utilidades/        # Utilidades y servicios
├── .env.example           # Variables de entorno ejemplo
├── .env.production        # Variables de producción
├── netlify.toml           # Configuración Netlify
├── package.json           # Dependencias y scripts
└── tailwind.config.js     # Configuración Tailwind
```

## 🌐 Internacionalización

El proyecto soporta múltiples idiomas:

- 🇪🇸 **Español** (idioma principal)
- 🇺🇸 **English** (inglés)
- 🔄 Fácil adición de nuevos idiomas

### Agregar nuevo idioma

1. Crear archivo de traducción:
   ```bash
   src/locales/nuevo-idioma/translation.json
   ```

2. Actualizar configuración i18n:
   ```javascript
   // src/i18n.js
   resources: {
     'nuevo-idioma': { translation: require('./locales/nuevo-idioma/translation.json') }
   }
   ```

## 📱 Características PWA

### Instalación Offline
- ✅ Service Worker registrado automáticamente
- ✅ Caching de recursos críticos
- ✅ Funcionalidad sin conexión a internet
- ✅ Sincronización en background

### Notificaciones Push
- 📱 Suscripciones push configurables
- 🔔 Notificaciones personalizadas
- ⚙️ Gestión de permisos de usuario

### Instalación Nativa
- 📲 Prompt de instalación automático
- 🎨 Iconos adaptativos para todos los dispositivos
- 🔄 Actualizaciones automáticas
- 🖥️ Pantalla completa sin navegador

## 🔍 SEO Optimizado

### Meta Tags Avanzados
- 🏷️ Títulos y descripciones optimizados
- 🔑 Keywords específicas por página
- 📱 Meta tags para redes sociales (Open Graph, Twitter Cards)
- 🔗 Canonical URLs para evitar contenido duplicado

### Estructura de Datos
- 📊 Schema.org markup completo
- 🧭 Breadcrumbs estructurados
- 🏢 Datos de organización y contacto
- ⭐ Reviews y ratings estructurados

### Rendimiento SEO
- ⚡ Core Web Vitals optimizados
- 📱 Mobile-first approach
- 🔍 Sitemap XML completo
- 🤖 Robots.txt optimizado
- 🚀 Performance budget controlado

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests E2E (si aplica)
npm run test:e2e
```

### Linting
```bash
# Verificar código
npm run lint:check

# Corregir automáticamente
npm run lint
```

## 🤝 Contribuir

¡Agradecemos las contribuciones!

### Proceso de Contribución

1. **Fork** el proyecto
2. **Crear** rama para feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add AmazingFeature'`)
4. **Push** rama (`git push origin feature/AmazingFeature`)
5. **Abrir** Pull Request

### Estándares de Código

- Usar **ESLint** y **Prettier**
- Commits convencionales
- Documentación actualizada
- Tests para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo de Desarrollo

- **Product Owner**: [Nombre] - [email@ejemplo.com]
- **Tech Lead**: [Nombre] - [email@ejemplo.com]
- **Frontend Developers**: [Nombre] - [email@ejemplo.com]
- **DevOps Engineer**: [Nombre] - [email@ejemplo.com]

## 📞 Contacto

- **Sitio Web**: [https://transsync.com](https://transsync.com)
- **Email**: info@transsync.com
- **LinkedIn**: [TransSync Company](https://linkedin.com/company/transsync)
- **GitHub**: [transsync](https://github.com/transsync)

## 🙏 Agradecimientos

- **React Team** por el increíble framework
- **Netlify** por la plataforma de despliegue
- **Tailwind CSS** por el sistema de diseño
- **Comunidad Open Source** por las herramientas y bibliotecas

---

<div align="center">

**TransSync** - Revolucionando el transporte público con tecnología

[🌐 Sitio Web](https://transsync.com) • [📚 Documentación](https://docs.transsync.com) • [💬 Soporte](https://support.transsync.com)

</div>