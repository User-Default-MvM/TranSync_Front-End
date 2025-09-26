// clear-cache.js - Script para limpiar cache del navegador
// Ejecutar con: node clear-cache.js

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando cache del navegador...');

// Script de limpieza de cache para pegar en la consola del navegador
const cacheCleanerScript = `
// Limpiar service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service Worker eliminado');
    }
  });
}

// Limpiar cache storage
if ('caches' in window) {
  caches.keys().then(function(names) {
    for(let name of names) {
      caches.delete(name);
      console.log('✅ Cache eliminado:', name);
    }
  });
}

// Limpiar localStorage y sessionStorage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage limpiado');

// Limpiar cookies relacionadas con la aplicación
document.cookie.split(";").forEach(function(c) {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toLocaleDateString() + ";path=/");
});
console.log('✅ Cookies limpiadas');

// Recargar página
setTimeout(() => {
  window.location.reload(true);
  console.log('🔄 Página recargada');
}, 1000);

console.log('🚀 Cache limpiado completamente. La aplicación debería funcionar ahora.');
`;

console.log('📋 Copia y pega el siguiente código en la consola del navegador (F12):');
console.log('=' .repeat(80));
console.log(cacheCleanerScript);
console.log('=' .repeat(80));

console.log('\\n✅ Script generado. Pégalo en la consola del navegador para limpiar el cache.');
console.log('🔄 Después de ejecutar el script, la aplicación debería funcionar correctamente.');