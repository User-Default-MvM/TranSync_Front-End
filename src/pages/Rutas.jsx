import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bus,
  MapPin,
  Navigation,
  Route,
  X,
  Home,
  Play,
  Square,
  Wrench,
  Users,
  Zap,
  Clock,
  Activity,
  ZoomIn,
  ZoomOut,
  Locate,
  Map as MapIcon,
  Info,
  Target,
  AlertCircle,
  RefreshCw,
  Menu,
  ChevronLeft
} from 'lucide-react';
import rutasAPI from '../utilidades/rutasAPI';
import vehiculosAPI from '../utilidades/vehiculosAPI';
import dashboardAPI from '../utilidades/dashboardAPI';

// Iconos personalizados para diferentes tipos de marcadores
const createCustomIcon = (color, iconHtml) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">${iconHtml}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const stopIcon = createCustomIcon('#EF4444', '<svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>');

// API data will be loaded dynamically

// Componente para actualizar datos en tiempo real
const RealTimeUpdater = ({ onRefresh }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [onRefresh]);

  return null;
};

// Componente para manejar clics en el mapa
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

// Componente para controlar el mapa
const MapControl = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);

  return null;
};

const InteractiveMap = () => {
  const { t } = useTranslation();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [mapCenter, setMapCenter] = useState([4.6482, -74.0648]);
  const [mapZoom, setMapZoom] = useState(11);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [newMarkers, setNewMarkers] = useState([]);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Colombia bounds para restringir el mapa
  const colombiaBounds = [
    [-4.2276, -81.8317],
    [15.5138, -66.8694]
  ];

  // Función para cargar datos iniciales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar rutas activas
      const routesData = await rutasAPI.getActive();
      setRoutes(routesData.rutas || []);

      // Cargar vehículos
      const vehiclesData = await vehiculosAPI.getAll();
      setBuses(vehiclesData.vehiculos || []);

      // Cargar paradas para cada ruta
      const stopsPromises = routesData.rutas?.map(route => rutasAPI.getStops(route.idRuta)) || [];
      const stopsResults = await Promise.allSettled(stopsPromises);

      const allStops = [];
      stopsResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allStops.push(...(result.value.paradas || []));
        }
      });
      setStops(allStops);

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar datos en tiempo real
  const refreshRealTimeData = async () => {
    try {
      setRefreshing(true);

      // Actualizar datos de buses en tiempo real
      const realTimeData = await dashboardAPI.getRealTimeData();
      if (realTimeData && realTimeData.buses) {
        setBuses(prevBuses => {
          return prevBuses.map(bus => {
            const realTimeBus = realTimeData.buses.find(rtb => rtb.idVehiculo === bus.idVehiculo);
            return realTimeBus ? { ...bus, ...realTimeBus } : bus;
          });
        });
      }

    } catch (err) {
      console.error('Error refreshing real-time data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    // Verificar que las coordenadas sean válidas antes de usarlas
    if (bus.lat && bus.lng && !isNaN(bus.lat) && !isNaN(bus.lng)) {
      setMapCenter([bus.lat, bus.lng]);
      setMapZoom(15);
    } else {
      // Usar coordenadas por defecto si las del bus no son válidas
      setMapCenter([4.6482, -74.0648]);
      setMapZoom(12);
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    if (route) {
      // Para rutas de la API, podríamos necesitar coordenadas específicas
      // Por ahora, centrar en Bogotá
      setMapCenter([4.6482, -74.0648]);
      setMapZoom(12);
    }
  };

  const startTracking = (bus) => {
    setIsTracking(true);
    setSelectedBus(bus);

    const trackingInterval = setInterval(() => {
      setBuses(currentBuses => {
        const trackedBus = currentBuses.find(b => b.id === bus.id);
        if (trackedBus) {
          // Verificar que las coordenadas sean válidas antes de usarlas
          if (trackedBus.lat && trackedBus.lng && !isNaN(trackedBus.lat) && !isNaN(trackedBus.lng)) {
            setMapCenter([trackedBus.lat, trackedBus.lng]);
          } else {
            // Usar coordenadas por defecto si las del bus no son válidas
            setMapCenter([4.6482, -74.0648]);
          }
        }
        return currentBuses;
      });
    }, 2000);

    setTimeout(() => {
      setIsTracking(false);
      clearInterval(trackingInterval);
    }, 30000);
  };

  const handleMapClick = (latlng) => {
    if (isAddingStop) {
      const newStop = {
        id: `new-stop-${Date.now()}`,
        name: `Nueva Parada ${newMarkers.length + 1}`,
        lat: latlng.lat,
        lng: latlng.lng,
        routes: [],
        isNew: true
      };
      setNewMarkers([...newMarkers, newStop]);
      setIsAddingStop(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_RUTA': return '#10b981';
      case 'DISPONIBLE': return '#3b82f6';
      case 'EN_MANTENIMIENTO': return '#f59e0b';
      case 'FUERA_DE_SERVICIO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EN_RUTA': return 'En Ruta';
      case 'DISPONIBLE': return 'Disponible';
      case 'EN_MANTENIMIENTO': return 'Mantenimiento';
      case 'FUERA_DE_SERVICIO': return 'Fuera de Servicio';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EN_RUTA': return <Play className="w-3 h-3" />;
      case 'DISPONIBLE': return <Square className="w-3 h-3" />;
      case 'EN_MANTENIMIENTO': return <Wrench className="w-3 h-3" />;
      case 'FUERA_DE_SERVICIO': return <AlertCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('routes.messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {/* Header de Control */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 p-2 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('routes.title')}</h1>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
              <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>{refreshing ? 'Actualizando...' : 'En tiempo real'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Filtros de visualización - responsive */}
            <div className="flex flex-wrap items-center gap-1 md:gap-2">
              <label key="filter-buses" className="flex items-center gap-1 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showBuses}
                  onChange={(e) => setShowBuses(e.target.checked)}
                  className="rounded w-3 h-3 md:w-4 md:h-4"
                />
                <Bus className="w-3 h-3 md:w-4 md:h-4 text-gray-700 dark:text-gray-300" />
                <span className="hidden sm:inline">Buses</span>
              </label>
              <label key="filter-routes" className="flex items-center gap-1 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded w-3 h-3 md:w-4 md:h-4"
                />
                <Route className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Rutas</span>
              </label>
              <label key="filter-stops" className="flex items-center gap-1 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showStops}
                  onChange={(e) => setShowStops(e.target.checked)}
                  className="rounded w-3 h-3 md:w-4 md:h-4"
                />
                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Paradas</span>
              </label>
            </div>

            {/* Botones de acción */}
            <button
              onClick={refreshRealTimeData}
              disabled={refreshing}
              className="bg-green-500 text-white px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={() => {
                setMapCenter([4.6482, -74.0648]);
                setMapZoom(11);
                setSelectedRoute(null);
                setSelectedBus(null);
              }}
              className="bg-gray-500 text-white px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Vista General</span>
            </button>
          </div>
        </div>

        {isAddingStop && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs md:text-sm text-blue-700 flex items-center gap-2">
            <Info className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Haz clic en el mapa donde quieres agregar una nueva parada</span>
            <span className="sm:hidden">Toca el mapa para agregar parada</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel Lateral - Responsive */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 md:z-auto w-72 sm:w-80 md:w-80 lg:w-96 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto flex-shrink-0 h-full transition-transform duration-300 ease-in-out`}>
          {/* Botón para cerrar sidebar en móvil */}
          <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
              Cerrar panel
            </button>
          </div>

          {/* Información del bus seleccionado */}
          {selectedBus && (
            <div className="p-4 bg-blue-50 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Bus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">{selectedBus.route}</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span><strong>Conductor:</strong> {selectedBus.driver}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedBus.status)}
                  <span><strong>Estado:</strong></span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${selectedBus.status === 'en_ruta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {getStatusText(selectedBus.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span><strong>Velocidad:</strong> {selectedBus.speed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span><strong>Pasajeros:</strong> {selectedBus.passengers}/{selectedBus.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span><strong>Última actualización:</strong> {selectedBus.lastUpdate ? new Date(selectedBus.lastUpdate).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  key="track-bus"
                  onClick={() => startTracking(selectedBus)}
                  disabled={isTracking}
                  className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Target className="w-3 h-3" />
                  {isTracking ? 'Siguiendo...' : 'Seguir Bus'}
                </button>
                <button
                  key="close-bus-info"
                  onClick={() => setSelectedBus(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Buses */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Bus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 key="buses-title" className="font-bold text-gray-900 dark:text-gray-100">
                Buses Activos ({buses.length})
              </h3>
            </div>
            <div className="space-y-2">
              {buses.map(bus => (
                <div
                  key={bus.idVehiculo}
                  onClick={() => handleBusClick(bus)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedBus?.idVehiculo === bus.idVehiculo
                    ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100">
                        {bus.plaVehiculo || `Vehículo ${bus.numVehiculo}`}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        {bus.marVehiculo} {bus.modVehiculo}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div
                        className={`w-3 h-3 rounded-full ${bus.estVehiculo === 'EN_RUTA' ? 'bg-green-400' : 'bg-red-400'
                          }`}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {bus.anioVehiculo}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(bus.estVehiculo)}
                      {getStatusText(bus.estVehiculo)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Lista de Rutas */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Route className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Rutas Disponibles</h3>
            </div>
            <div className="space-y-2">
              {routes.map(route => (
                <div
                  key={route.idRuta}
                  onClick={() => handleRouteSelect(route)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedRoute?.idRuta === route.idRuta
                    ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: route.estRuta === 'ACTIVA' ? '#6366f1' : '#ef4444' }}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100">
                        {route.nomRuta}
                      </h4>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          {route.distanciaKm ? `${route.distanciaKm} km` : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          {route.tiempoEstimadoMin ? `${Math.floor(route.tiempoEstimadoMin / 60)}h ${route.tiempoEstimadoMin % 60}min` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${route.estRuta === 'ACTIVA' ? 'bg-green-400' : 'bg-gray-400 dark:bg-gray-500'
                        }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Estadísticas */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Estadísticas en Tiempo Real</h3>
            </div>
            <div className="space-y-3">
              <div key="stats-en-ruta" className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {buses.filter(b => b.estVehiculo === 'EN_RUTA').length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Buses en Ruta</div>
              </div>
              <div key="stats-total" className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {buses.length}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Vehículos Totales</div>
              </div>
              <div key="stats-activas" className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {routes.filter(r => r.estRuta === 'ACTIVA').length}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Rutas Activas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa Principal */}
        <div className="flex-1 relative">
          {/* Overlay para cerrar sidebar en móvil */}
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            maxBounds={colombiaBounds}
            maxBoundsViscosity={0.8}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapControl center={mapCenter} zoom={mapZoom} />
            <MapClickHandler onMapClick={handleMapClick} />
            <RealTimeUpdater onRefresh={refreshRealTimeData} />

            {/* Rutas */}
            {showRoutes && routes.map(route => {
              // Usar coordenadas reales de la base de datos o coordenadas por defecto si no hay
              const routePositions = route.coordenadasRuta ?
                JSON.parse(route.coordenadasRuta) :
                [[4.5981, -74.0758], [4.6280, -74.0631], [4.6601, -74.0547], [4.7110, -74.0721]];

              return (
                <Polyline
                  key={route.idRuta}
                  positions={routePositions}
                  color={route.estRuta === 'ACTIVA' ? '#6366f1' : '#ef4444'}
                  weight={selectedRoute?.idRuta === route.idRuta ? 6 : 4}
                  opacity={route.estRuta === 'ACTIVA' ? 0.8 : 0.4}
                  dashArray={route.estRuta === 'ACTIVA' ? null : "10, 10"}
                >
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold">{route.nomRuta}</h3>
                      <div className="flex items-center gap-2 justify-center text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <MapIcon className="w-3 h-3" />
                          {route.distanciaKm ? `${route.distanciaKm} km` : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {route.tiempoEstimadoMin ? `${Math.floor(route.tiempoEstimadoMin / 60)}h ${route.tiempoEstimadoMin % 60}min` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs mt-1 flex items-center gap-1 justify-center">
                        Estado: {route.estRuta === 'ACTIVA' ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Activa
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Inactiva
                          </span>
                        )}
                      </p>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

            {/* Paradas de Bus */}
            {showStops && stops.map(stop => (
              <Marker
                key={stop.idParada}
                position={[stop.latitud || 4.6482, stop.longitud || -74.0648]}
                icon={stopIcon}
              >
                <Popup>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold">{stop.nombreParada}</h3>
                    </div>
                    <p className="text-sm">Orden: {stop.orden}</p>
                    {stop.tiempoEstimado && (
                      <p className="text-xs text-gray-600">Tiempo estimado: {stop.tiempoEstimado} min</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Nuevas paradas agregadas */}
            {newMarkers.map(marker => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lng]}
                icon={createCustomIcon('#f59e0b', '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="m12 1 3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></svg>')}
              >
                <Popup>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <h3 className="font-bold">{marker.name}</h3>
                    </div>
                    <p className="text-sm">Nueva parada agregada</p>
                    <button
                      onClick={() => setNewMarkers(prev => prev.filter(m => m.id !== marker.id))}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2 hover:bg-red-600 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
{/* Buses */}
{showBuses && buses.map(bus => (
  <Marker
    key={bus.idVehiculo}
    position={[
      (bus.lat && !isNaN(bus.lat) && bus.lat !== 0) ? bus.lat : 4.6482,
      (bus.lng && !isNaN(bus.lng) && bus.lng !== 0) ? bus.lng : -74.0648
    ]} // Usar coordenadas por defecto si no hay GPS válidas
    icon={L.divIcon({
      html: `<div style="
        background-color: ${getStatusColor(bus.estVehiculo)};
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        ${isTracking && selectedBus?.idVehiculo === bus.idVehiculo ? 'animation: pulse 1s infinite;' : ''}
      "><svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M8 6v6h8V6l2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8l2-2Z"/><path d="M16 16v2a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2"/></svg></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>`,

      iconSize: [35, 35],
      iconAnchor: [17, 17]
    })}
    eventHandlers={{
      click: () => handleBusClick(bus)
    }}
  >
                <Popup>
                  <div className="min-w-[200px] text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-bold text-blue-900 dark:text-blue-300">
                        {bus.plaVehiculo || `Vehículo ${bus.numVehiculo}`}
                      </h3>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span>
                          <strong>Placa:</strong> {bus.plaVehiculo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(bus.estVehiculo)}
                        <span>
                          <strong>Estado:</strong>
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${bus.estVehiculo === "EN_RUTA"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                            }`}
                        >
                          {getStatusText(bus.estVehiculo)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          <strong>Modelo:</strong> {bus.marVehiculo} {bus.modVehiculo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          <strong>Año:</strong> {bus.anioVehiculo}
                        </span>
                      </div>
                      {bus.speed && (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span>
                            <strong>Velocidad:</strong> {bus.speed} km/h
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        <span>
                          <strong>Última actualización:</strong>{" "}
                          {bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        key="track-bus-popup"
                        onClick={() => startTracking(bus)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                      >
                        <Target className="w-3 h-3" />
                        Seguir
                      </button>
                      <button
                        key="details-bus-popup"
                        onClick={() => setSelectedBus(bus)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        Detalles
                      </button>
                    </div>
                  </div>
                </Popup>

              </Marker>
            ))}
          </MapContainer>

          {/* Indicador de tracking */}
          {isTracking && selectedBus && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-green-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-lg z-[1000]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <Target className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">
                  <span className="hidden sm:inline">Siguiendo: {selectedBus.route}</span>
                  <span className="sm:hidden">Siguiendo</span>
                </span>
              </div>
            </div>
          )}

          {/* Controles de zoom y ubicación - Responsive */}
          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex flex-col gap-1 md:gap-2 z-[1000]">
            <button
              key="zoom-in"
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
              className="bg-white shadow-lg rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              key="zoom-out"
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 3))}
              className="bg-white shadow-lg rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              key="locate"
              onClick={() => {
                navigator.geolocation?.getCurrentPosition(
                  (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setMapZoom(15);
                  },
                  () => {
                    setMapCenter([4.6482, -74.0648]);
                    setMapZoom(12);
                  }
                );
              }}
              className="bg-blue-500 text-white shadow-lg rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <Locate className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Leyenda del mapa - Responsive */}
          <div className="absolute bottom-16 left-2 md:bottom-4 md:left-4 bg-white rounded-lg shadow-lg p-2 md:p-3 z-[1000] max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <MapIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-700" />
              <h4 className="font-bold text-xs md:text-sm">Leyenda</h4>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div key="legend-en-ruta" className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Bus className="w-2 h-2 md:w-3 md:h-3" />
                </div>
                <span>En ruta</span>
              </div>
              <div key="legend-disponible" className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Bus className="w-2 h-2 md:w-3 md:h-3" />
                </div>
                <span>Disponible</span>
              </div>
              <div key="legend-parada" className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <MapPin className="w-2 h-2 md:w-3 md:h-3" />
                </div>
                <span>Parada</span>
              </div>
              <div key="legend-ruta-activa" className="flex items-center gap-2">
                <div className="w-3 h-1 md:w-4 md:h-1" style={{ backgroundColor: '#6366f1' }}></div>
                <span>Ruta activa</span>
              </div>
              <div key="legend-ruta-inactiva" className="flex items-center gap-2">
                <div className="w-3 h-1 md:w-4 md:h-1 border-b border-gray-400 border-dashed"></div>
                <span>Ruta inactiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 md:px-4 py-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div key="footer-time" className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            <span className="hidden sm:inline">Última actualización:</span>
            {new Date().toLocaleTimeString()}
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center sm:justify-end">
            <span key="footer-vehicles" className="flex items-center gap-1">
              <Bus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              <span className="hidden sm:inline">{buses.length} vehículos</span>
              <span className="sm:hidden">{buses.length}</span>
            </span>
            <span key="footer-routes" className="flex items-center gap-1">
              <Route className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              <span className="hidden sm:inline">{routes.filter(r => r.estRuta === 'ACTIVA').length} rutas</span>
              <span className="sm:hidden">{routes.filter(r => r.estRuta === 'ACTIVA').length}</span>
            </span>
            <span key="footer-stops" className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              <span className="hidden sm:inline">{stops.length + newMarkers.length} paradas</span>
              <span className="sm:hidden">{stops.length + newMarkers.length}</span>
            </span>
          </div>
          <div key="footer-status" className="flex items-center gap-1 justify-center sm:justify-end">
            <Activity className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            <span className="hidden sm:inline">Sistema en tiempo real</span>
            <span className="sm:hidden">En línea</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;