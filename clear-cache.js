// Script para limpiar cache del navegador
// Ejecutar con: node clear-cache.js

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando cache del navegador...');

// Función para limpiar service workers
function clearServiceWorkers() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('✅ Service Worker eliminado');
      }
    });
  }
}

// Función para limpiar cache storage
function clearCacheStorage() {
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for(let name of names) {
        caches.delete(name);
        console.log('✅ Cache eliminado:', name);
      }
    });
  }
}

// Función para limpiar localStorage
function clearLocalStorage() {
  localStorage.clear();
  console.log('✅ localStorage limpiado');
}

// Función para limpiar sessionStorage
function clearSessionStorage() {
  sessionStorage.clear();
  console.log('✅ sessionStorage limpiado');
}

// Función para limpiar indexedDB
function clearIndexedDB() {
  if ('indexedDB' in window) {
    indexedDB.databases().then(function(databases) {
      databases.forEach(function(db) {
        indexedDB.deleteDatabase(db.name);
        console.log('✅ IndexedDB eliminado:', db.name);
      });
    });
  }
}

// Función para recargar la página
function reloadPage() {
  window.location.reload(true);
  console.log('🔄 Página recargada');
}

// Ejecutar limpieza
console.log('🚀 Iniciando limpieza completa del cache...');

if (typeof window !== 'undefined') {
  // Ejecutar en navegador
  clearServiceWorkers();
  clearCacheStorage();
  clearLocalStorage();
  clearSessionStorage();
  clearIndexedDB();

  setTimeout(() => {
    reloadPage();
  }, 2000);
} else {
  console.log('⚠️  Este script debe ejecutarse en el navegador');
  console.log('💡 Copia y pega este código en la consola del navegador:');
  console.log(`
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

    // Limpiar localStorage
    localStorage.clear();
    console.log('✅ localStorage limpiado');

    // Limpiar sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage limpiado');

    // Recargar página
    setTimeout(() => {
      window.location.reload(true);
      console.log('🔄 Página recargada');
    }, 1000);
  `);
}

console.log('✅ Limpieza completada');
console.log('🔄 Recargando página en 2 segundos...');