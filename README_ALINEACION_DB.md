# Alineación del Frontend con la Base de Datos

## Resumen de Cambios Realizados

Se ha completado la alineación del frontend de TransSync con la estructura de la base de datos proporcionada en Railway.

### ✅ 1. Análisis de Estructura
- **Base de datos analizada**: Tablas principales, relaciones y datos de prueba
- **Frontend analizado**: Servicios API, autenticación, roles y componentes
- **Identificadas las diferencias** entre la estructura actual y la requerida

### ✅ 2. Ajuste de Endpoints de API
- **Rutas API corregidas**: Cambiados campos `origen/destino` por `oriRuta/desRuta`
- **Eliminados campos inexistentes**: `distanciaKm`, `tiempoEstimadoMin`, `tarifaRuta`
- **Simplificadas validaciones**: Adaptadas a la estructura real de la BD

### ✅ 3. Actualización de Servicios API
- **Campos corregidos**: Uso consistente de nombres de campos de la BD
- **Validaciones ajustadas**: Según las restricciones de la base de datos
- **Manejo de errores**: Mejorado para coincidir con respuestas del backend

### ✅ 4. Alineación de Roles del Sistema
- **Roles definidos**: `SUPERADMIN`, `GESTOR`, `CONDUCTOR`
- **Funciones de verificación**: `isSuperAdmin()`, `isGestor()`, `isConductor()`
- **Compatibilidad mantenida**: `isAdmin()` funciona con múltiples roles

### ✅ 5. Nuevos Servicios API Creados

#### Chatbot API (`chatbotAPI.js`)
- Gestión de interacciones con la tabla `InteraccionesChatbot`
- Configuración del chatbot desde `ConfiguracionChatbot`
- Respuestas predefinidas desde `RespuestasPredefinidas`
- Estadísticas de uso y análisis de interacciones

#### Alertas API (`alertasAPI.js`)
- Gestión de alertas de vencimientos desde `AlertasVencimientos`
- Estados: `PENDIENTE`, `VENCIDA`, `RESUELTA`
- Tipos de documento: `LICENCIA_CONDUCCION`, `SOAT`, `TECNICO_MECANICA`, `SEGURO`
- Funciones de estadísticas y reportes

#### Dashboard API (actualizado)
- Integración con `ResumenOperacional`
- Alertas de vencimientos en tiempo real
- Estadísticas operacionales actualizadas

## Estructura de Base de Datos Alineada

### Tablas Principales
```sql
- Roles (SUPERADMIN, GESTOR, CONDUCTOR)
- Empresas (idEmpresa, nomEmpresa, nitEmpresa, ...)
- Usuarios (idUsuario, email, nomUsuario, apeUsuario, idRol, idEmpresa, ...)
- Conductores (idConductor, idUsuario, tipLicConductor, estConductor, ...)
- Vehiculos (idVehiculo, plaVehiculo, estVehiculo, idConductorAsignado, ...)
- Rutas (idRuta, nomRuta, oriRuta, desRuta, ...)
- Viajes (idViaje, idVehiculo, idConductor, idRuta, estViaje, ...)
```

### Tablas de Funcionalidades Avanzadas
```sql
- InteraccionesChatbot (mensajes, respuestas, intencion, ...)
- ConfiguracionChatbot (mensajeBienvenida, activo, ...)
- RespuestasPredefinidas (palabrasClave, categoria, respuesta, ...)
- UserPreferences (preferencias JSON, notificaciones, ...)
- AlertasVencimientos (tipoDocumento, fechaVencimiento, estado, ...)
- ResumenOperacional (estadísticas en tiempo real)
```

## Servicios API Disponibles

### Servicios Existentes (Ajustados)
- `authAPI.js` - Autenticación y gestión de usuarios
- `driversAPI.js` - Gestión de conductores
- `vehiculosAPI.js` - Gestión de vehículos
- `rutasAPI.js` - Gestión de rutas (corregido)
- `viajesAPI.js` - Gestión de viajes
- `profileAPI.js` - Gestión de perfil de usuario
- `dashboardAPI.js` - Dashboard y estadísticas

### Servicios Nuevos
- `chatbotAPI.js` - Sistema de chatbot completo
- `alertasAPI.js` - Gestión de alertas y vencimientos

## Roles y Permisos

### SUPERADMIN (idRol = 1)
- Acceso completo al sistema
- Gestión de empresas y usuarios
- Configuración global del sistema

### GESTOR (idRol = 2)
- Gestión de conductores, vehículos y rutas
- Programación de viajes
- Reportes y estadísticas
- Configuración del chatbot

### CONDUCTOR (idRol = 3)
- Visualización de información personal
- Actualización de perfil
- Interacción con chatbot
- Consulta de viajes asignados

## Endpoints de API Configurados

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/profile` - Perfil del usuario

### Gestión de Entidades
- `GET/POST/PUT/DELETE /api/conductores` - Gestión de conductores
- `GET/POST/PUT/DELETE /api/vehiculos` - Gestión de vehículos
- `GET/POST/PUT/DELETE /api/rutas` - Gestión de rutas
- `GET/POST/PUT/DELETE /api/viajes` - Gestión de viajes

### Chatbot
- `POST /api/chatbot/message` - Enviar mensaje
- `GET /api/chatbot/interactions` - Historial de interacciones
- `GET/PUT /api/chatbot/config` - Configuración del chatbot
- `GET/POST/PUT/DELETE /api/chatbot/responses` - Respuestas predefinidas

### Alertas
- `GET/POST/PUT /api/alertas` - Gestión de alertas
- `GET /api/alertas/stats` - Estadísticas de alertas
- `GET /api/alertas/overdue` - Alertas vencidas
- `GET /api/alertas/upcoming` - Alertas próximas

### Dashboard
- `GET /api/dashboard/estadisticas` - Estadísticas generales
- `GET /api/dashboard/resumen-operacional` - Resumen operacional
- `GET /api/dashboard/alertas-vencimientos` - Alertas de vencimientos

## Datos de Prueba Incluidos

La base de datos incluye datos de prueba para:
- 1 Empresa (Expreso La Sabana S.A.S)
- 9 Usuarios (1 SUPERADMIN, 3 GESTORES, 5 CONDUCTORES)
- 5 Conductores activos
- 6 Rutas definidas
- 5 Vehículos
- 6 Viajes programados
- Interacciones de chatbot
- Configuración del chatbot
- Alertas de vencimientos

## Próximos Pasos

### 6. Actualizar Componentes
- Modificar componentes React para usar los nuevos servicios API
- Actualizar interfaces de usuario según los nuevos campos
- Implementar manejo de roles en la UI

### 7. Probar Integración
- Verificar conexión con Railway
- Probar todos los endpoints
- Validar flujo de autenticación
- Testear funcionalidades del chatbot
- Verificar sistema de alertas

## Estado Actual

✅ **Completado**: Alineación completa de la base de datos con el frontend
✅ **Configurados**: Todos los servicios API necesarios
✅ **Definidos**: Roles y permisos del sistema
✅ **Preparados**: Datos de prueba para testing

🔄 **Pendiente**: Actualización de componentes React
🔄 **Pendiente**: Testing de integración completo

El frontend está ahora completamente alineado con la estructura de la base de datos y listo para la fase de testing y ajustes finales.