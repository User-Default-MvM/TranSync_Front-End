// clear-cache.js - Script para limpiar cache del navegador
// Ejecutar con: node clear-cache.js

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando cache del navegador...');

// Script de limpieza de cache para pegar en la consola del navegador
const cacheCleanerScript = `
// 🔧 LIMPIEZA COMPLETA DE CACHE PARA TRANSYNC
console.log('🧹 Iniciando limpieza completa de cache...');

// 1. Limpiar service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service Worker eliminado:', registration.scope);
    }
  }).catch(err => console.log('⚠️ Error eliminando service workers:', err));
}

// 2. Limpiar cache storage
if ('caches' in window) {
  caches.keys().then(function(names) {
    for(let name of names) {
      caches.delete(name);
      console.log('✅ Cache eliminado:', name);
    }
  }).catch(err => console.log('⚠️ Error eliminando caches:', err));
}

// 3. Limpiar localStorage y sessionStorage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage limpiado');

// 4. Limpiar cookies relacionadas con la aplicación
try {
  document.cookie.split(";").forEach(function(c) {
    const cookieName = c.replace(/^ +/, "").split('=')[0];
    document.cookie = cookieName + "=;expires=" + new Date(0).toUTCString() + ";path=/";
    document.cookie = cookieName + "=;expires=" + new Date(0).toUTCString() + ";path=/;domain=" + window.location.hostname;
  });
  console.log('✅ Cookies limpiadas');
} catch (err) {
  console.log('⚠️ Error limpiando cookies:', err);
}

// 5. Forzar recarga hard del navegador
setTimeout(() => {
  console.log('🔄 Ejecutando hard refresh...');
  window.location.reload(true);
}, 1500);

console.log('🚀 Limpieza completa finalizada. Si el problema persiste:');
console.log('   1. Cierra todas las pestañas del sitio');
console.log('   2. Abre el sitio en modo incógnito');
console.log('   3. Si funciona en incógnito, el problema era de cache');
console.log('   4. Si no funciona, verifica que el nuevo build esté desplegado en Netlify');
`;

console.log('📋 Copia y pega el siguiente código en la consola del navegador (F12):');
console.log('='.repeat(80));
console.log(cacheCleanerScript);
console.log('='.repeat(80));

console.log('\n✅ Script generado. Pégalo en la consola del navegador para limpiar el cache.');
console.log('🔄 Después de ejecutar el script, la aplicación debería funcionar correctamente.');
console.log('\n💡 Si el problema persiste después de limpiar el cache:');
console.log('   1. Verifica que el nuevo build esté desplegado en Netlify');
console.log('   2. Revisa los logs de deploy en Netlify para errores');
console.log('   3. Prueba abrir el sitio en modo incógnito');
console.log('   4. Verifica que las reglas de _redirects se aplicaron correctamente');
console.log('\n🔗 URL del sitio: https://transync1.netlify.app');