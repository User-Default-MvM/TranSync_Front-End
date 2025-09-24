import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import {
  Bus,
  Users,
  LayoutGrid,
  Clock,
  AlertTriangle,
  Calendar,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Activity,
  Zap
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
} from 'chart.js';
import { dashboardAPI } from '../utilidades/dashboardAPI';
import realTimeService from '../utilidades/realTimeService';
import { useNotification } from '../utilidades/notificationService';
import DashboardSkeleton from '../components/DashboardSkeleton';
import BreadcrumbNav from '../components/BreadcrumbNav';
import Tooltip from '../components/Tooltip';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const { t } = useTranslation();
  // Estados principales del dashboard
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalVehiculos: 0,
    vehiculosDisponibles: 0,
    vehiculosEnRuta: 0,
    totalConductores: 0,
    conductoresActivos: 0,
    totalRutas: 0,
    viajesEnCurso: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('semana');
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState({
    viajes: { labels: [], data: [] },
    rutas: []
  });
  const [realTimeData, setRealTimeData] = useState(null);

  // Estados para funcionalidades mejoradas
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);

  // Hooks para servicios mejorados
  const { user, userRole } = useAuth();
  const notificationService = useNotification();

  // Envolver fetchRealTimeData en useCallback
  const fetchRealTimeData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getRealTimeData();
      if (response.status === 'success') {
        setRealTimeData(response.data);
      }
    } catch (error) {
      console.error("Error al cargar datos en tiempo real:", error);
    }
  }, []);

  // Funciones para control de actualizaciones
  const toggleRealTimeUpdates = useCallback(async () => {
    if (isRealTimeActive) {
      // Cambiar a modo horario
      realTimeService.setUpdateMode(false, 60); // 1 hora
      setIsRealTimeActive(false);
      console.log('⏰ Cambiado a modo horario (cada hora)');
    } else {
      // Cambiar a modo tiempo real
      realTimeService.setUpdateMode(true); // tiempo real
      setIsRealTimeActive(true);
      console.log('⚡ Cambiado a modo tiempo real');
    }
  }, [isRealTimeActive]);

  // Función para forzar actualización
  const forceUpdate = useCallback(async (dataType = 'all') => {
    try {
      // Forzar actualización inmediata via WebSocket
      realTimeService.requestDashboardUpdate();
      console.log('🔄 Actualización forzada:', dataType);
    } catch (error) {
      console.error('❌ Error forzando actualización:', error);
    }
  }, []);

  // Función para limpiar cache
  const clearCache = useCallback(async (cacheType = null) => {
    try {
      await dashboardAPI.clearCache(cacheType);
      console.log('💾 Cache limpiado:', cacheType || 'all');
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
    }
  }, []);


  // Función para alternar notificaciones
  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled(prev => !prev);
    console.log('🔔 Notificaciones:', !notificationsEnabled ? 'habilitadas' : 'deshabilitadas');
  }, [notificationsEnabled]);

  // Envolver fetchChartsData en useCallback
  const fetchChartsData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getChartsData(selectedPeriod);
      if (response.status === 'success') {
        setChartData(response.data);
      }
    } catch (error) {
      console.error("Error al cargar datos de gráficos:", error);
    }
  }, [selectedPeriod]); // Incluir selectedPeriod como dependencia

  // Envolver fetchDashboardData en useCallback
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener estadísticas generales
      const statsResponse = await dashboardAPI.getGeneralStatistics();
      if (statsResponse.status === 'success') {
        setStats(statsResponse.data);
      }

      // Obtener alertas
      const alertsResponse = await dashboardAPI.getActiveAlerts();
      if (alertsResponse.status === 'success') {
        setAlerts(alertsResponse.data || []);
      }

      // Obtener datos de gráficos
      await fetchChartsData();

      // Obtener datos en tiempo real
      await fetchRealTimeData();

    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      setError("Error al cargar los datos. Verifique su conexión.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchChartsData, fetchRealTimeData]); // Incluir las funciones como dependencias

  // Inicializar servicios mejorados
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Inicializar servicio de notificaciones
        await notificationService.initialize();

        // Conectar WebSocket con contexto de usuario
        const userContext = {
          idUsuario: user?.id,
          idEmpresa: user?.empresaId,
          rol: userRole
        };
        realTimeService.connect(userContext);

        // Configurar modo horario (cada hora) en lugar de tiempo real
        realTimeService.setUpdateMode(false, 60); // 60 minutos = 1 hora

        console.log('✅ Servicios mejorados inicializados en modo horario');
      } catch (error) {
        console.error('❌ Error inicializando servicios mejorados:', error);
      }
    };

    initializeServices();

    // Cleanup al desmontar
    return () => {
      realTimeService.disconnect();
      dashboardAPI.stopUpdates();
    };
  }, [user, userRole, notificationService]);

  // Configurar listeners para WebSocket
  useEffect(() => {
    const handleStatsUpdate = (data) => {
      console.log('📊 Estadísticas actualizadas via WebSocket:', data);
      if (data.stats) {
        setStats(prevStats => ({ ...prevStats, ...data.stats }));
      }
    };

    const handleRealtimeUpdate = (data) => {
      console.log('⚡ Datos en tiempo real via WebSocket:', data);
      if (data.realtime) {
        setRealTimeData(data.realtime);
      }
    };

    const handleAlertsUpdate = (data) => {
      console.log('🚨 Alertas actualizadas via WebSocket:', data);
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    };

    const handleNotification = async (data) => {
      console.log('📱 Nueva notificación via WebSocket:', data);

      // Mostrar notificación push si está habilitado
      if (notificationsEnabled) {
        await notificationService.showFromSocket(data);
      }
    };

    const handleConnectionStatus = (status) => {
      console.log('🔗 Estado de conexión actualizado:', status);
      setConnectionStatus(status.connected ? 'connected' : 'disconnected');
      // En modo horario, isRealTimeActive indica si está conectado pero no en tiempo real continuo
      setIsRealTimeActive(status.connected);
    };

    // Registrar listeners en realTimeService
    realTimeService.on('notification:stats_update', handleStatsUpdate);
    realTimeService.on('notification:realtime_update', handleRealtimeUpdate);
    realTimeService.on('notification:alerts_update', handleAlertsUpdate);
    realTimeService.on('notification:chatbot', handleNotification);
    realTimeService.on('connection:established', handleConnectionStatus);
    realTimeService.on('connection:error', (error) => {
      console.error('❌ Error de conexión:', error);
      setConnectionStatus('error');
      setIsRealTimeActive(false);
    });

    // Cleanup
    return () => {
      realTimeService.off('notification:stats_update', handleStatsUpdate);
      realTimeService.off('notification:realtime_update', handleRealtimeUpdate);
      realTimeService.off('notification:alerts_update', handleAlertsUpdate);
      realTimeService.off('notification:chatbot', handleNotification);
      realTimeService.off('connection:established', handleConnectionStatus);
      realTimeService.off('connection:error');
    };
  }, [notificationService, notificationsEnabled]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Actualizar datos de gráficos cuando cambia el período
  useEffect(() => {
    fetchChartsData();
  }, [fetchChartsData]);

  const prepareChartData = () => {
    const { viajes, rutas } = chartData;
    
    // Preparar datos de viajes por período
    const viajesData = {
      labels: viajes.labels || [],
      datasets: [{
        label: "Viajes realizados",
        data: viajes.data?.map(item => item.totalViajes) || [],
        backgroundColor: "rgba(255, 204, 0, 0.5)",
        borderColor: "#FFB800",
        borderWidth: 2,
        tension: 0.4
      }]
    };

    // Preparar datos de distribución por rutas
    const rutasData = {
      labels: rutas?.slice(0, 5).map(ruta => ruta.nomRuta) || [],
      datasets: [{
        label: "Viajes por ruta",
        data: rutas?.slice(0, 5).map(ruta => ruta.totalViajes) || [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 99, 132, 0.7)",
        ],
        borderWidth: 1,
      }]
    };

    return { viajesData, rutasData };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar el dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchDashboardData();
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { viajesData, rutasData } = prepareChartData();

  const dashboardStats = [
    {
      icon: <Bus />,
      label: t('dashboard.stats.busesInService'),
      value: stats.vehiculosDisponibles || 0,
      total: stats.totalVehiculos || 0,
      subtitle: `de ${stats.totalVehiculos} total`,
      colorClass: "border-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      icon: <Users />,
      label: t('dashboard.stats.activeDrivers'),
      value: stats.conductoresActivos || 0,
      total: stats.totalConductores || 0,
      subtitle: `de ${stats.totalConductores} total`,
      colorClass: "border-green-500",
      iconBg: "bg-green-50",
      iconColor: "text-green-500"
    },
    {
      icon: <LayoutGrid />,
      label: t('dashboard.stats.activeRoutes'),
      value: stats.totalRutas || 0,
      colorClass: "border-purple-500",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500"
    },
    {
      icon: <Clock />,
      label: t('dashboard.stats.tripsInProgress'),
      value: realTimeData?.viajesEnCurso || stats.viajesEnCurso || 0,
      colorClass: "border-orange-500",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500"
    },
    {
      icon: <AlertTriangle />,
      label: t('dashboard.stats.criticalAlerts'),
      value: realTimeData?.alertasCriticas || alerts.filter(a => a.severity === 'critical').length,
      colorClass: "border-red-500",
      iconBg: "bg-red-50",
      iconColor: "text-red-500"
    }
  ];

  return (
    <div className="p-5 max-w-full overflow-x-hidden bg-surface-light dark:bg-background-dark dark:text-text-primary-dark min-h-screen">
      {/* Breadcrumbs */}
      <BreadcrumbNav />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-col md:flex-row md:items-center gap-3">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-200 m-0" data-tutorial="dashboard">
          {t('dashboard.title')}
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Indicador de estado en tiempo real */}
          <RealTimeIndicator
            isActive={isRealTimeActive}
            connectionStatus={connectionStatus}
            onToggle={toggleRealTimeUpdates}
          />

          {/* Controles del dashboard */}
          <DashboardControls
            onForceUpdate={forceUpdate}
            onClearCache={clearCache}
            onToggleNotifications={toggleNotifications}
            onShowPerformance={() => setShowPerformancePanel(!showPerformancePanel)}
            notificationsEnabled={notificationsEnabled}
            showPerformancePanel={showPerformancePanel}
          />

          {/* Información de fecha */}
          <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark bg-surface-light dark:bg-surface-dark px-4 py-2 rounded-md shadow-sm">
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
        
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {dashboardStats.map((stat, index) => (
          <div 
            key={index} 
            className={`flex items-center p-5 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-background-light dark:bg-surface-dark border-l-4 ${stat.colorClass}`}
          >
            <div className={`flex items-center justify-center w-12 h-12 ${stat.iconBg} dark:bg-gray-700 rounded-xl mr-4 ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark m-0 mb-1">{stat.value}</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark m-0">{stat.label}</p>
              {stat.subtitle && (
                <p className="text-xs text-slate-400 dark:text-gray-500 m-0 mt-1">{stat.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Container */}
      <div className="flex flex-col gap-5">
        {/* First Chart Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Trips Chart */}
          <div className="xl:col-span-2 bg-background-light dark:bg-surface-dark rounded-xl shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-3 flex-col md:flex-row gap-3">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark m-0">{t('dashboard.charts.tripFrequency')}</h3>
              <div className="flex gap-0.5 bg-slate-100 dark:bg-gray-700 rounded-md p-0.5">
                {[
                  { key: 'semana', label: t('dashboard.charts.periods.week'), tooltip: t('dashboard.charts.periodTooltips.week') },
                  { key: 'mes', label: t('dashboard.charts.periods.month'), tooltip: t('dashboard.charts.periodTooltips.month') },
                  { key: 'ano', label: t('dashboard.charts.periods.year'), tooltip: t('dashboard.charts.periodTooltips.year') }
                ].map(period => (
                  <Tooltip key={period.key} content={period.tooltip}>
                    <button
                      className={`px-3 py-1.5 text-sm rounded transition-all ${
                        selectedPeriod === period.key
                          ? 'bg-background-light dark:bg-background-dark text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                      }`}
                      onClick={() => setSelectedPeriod(period.key)}
                    >
                      {period.label}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div className="flex-grow h-80 relative">
              <Line data={viajesData} options={chartOptions} />
            </div>
          </div>
              
          {/* Routes Distribution Chart */}
          <div className="bg-background-light dark:bg-surface-dark rounded-xl shadow-sm p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark m-0 mb-4">{t('dashboard.charts.routeDistribution')}</h3>
            <div className="flex-grow h-80 relative">
              {rutasData.labels.length > 0 ? (
                <Doughnut data={rutasData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark">
                  <div className="text-center">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay datos de rutas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
            
        {/* Second Row - Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Vehicle Status */}
          <div className="bg-background-light dark:bg-surface-dark rounded-xl shadow-sm p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark m-0 mb-4">{t('dashboard.fleetStatus.title')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{t('dashboard.fleetStatus.available')}</span>
                </div>
                <span className="font-semibold text-green-700 dark:text-green-300">{stats.vehiculosDisponibles}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">{t('dashboard.fleetStatus.inRoute')}</span>
                </div>
                <span className="font-semibold text-blue-700 dark:text-blue-300">{stats.vehiculosEnRuta}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">{t('dashboard.fleetStatus.maintenance')}</span>
                </div>
                <span className="font-semibold text-orange-700 dark:text-orange-300">{stats.vehiculosEnMantenimiento || 0}</span>
              </div>
            </div>
          </div>
            
          {/* Alerts List */}
          <div className="xl:col-span-2 bg-background-light dark:bg-surface-dark rounded-xl shadow-sm p-5 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark m-0">{t('dashboard.alerts.title')}</h3>
              {alerts.length > 0 && (
                <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  {alerts.length} {t('dashboard.alerts.active')}
                </span>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts && alerts.length > 0 ? (
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {alerts.map((alert, index) => (
                    <li key={index} className={`flex items-start gap-3 p-3 rounded-md border-l-4 ${
                      alert.severity === 'critical' 
                        ? 'bg-red-50 dark:bg-red-900 border-red-500' 
                        : alert.severity === 'warning' 
                        ? 'bg-orange-50 dark:bg-orange-900 border-orange-500' 
                        : 'bg-blue-50 dark:bg-blue-900 border-blue-500'
                    }`}>
                      <AlertTriangle size={16} className={
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'warning' ? 'text-orange-500' :
                        'text-blue-500'
                      } />
                      <div className="flex-1">
                        <p className="m-0 mb-1 text-sm font-medium text-slate-800 dark:text-gray-100">{alert.title}</p>
                        <p className="m-0 text-xs text-slate-500 dark:text-gray-400">{alert.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary-light dark:text-text-secondary-dark">
                  <AlertTriangle className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-center italic">{t('dashboard.alerts.noAlerts')}</p>
                  <p className="text-xs text-center mt-1">{t('dashboard.alerts.systemOk')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de métricas de rendimiento */}
      {showPerformancePanel && (
        <PerformancePanel
          connectionStatus={connectionStatus}
          onClose={() => setShowPerformancePanel(false)}
        />
      )}
    </div>
  );

};

// Componente para indicador de estado en tiempo real
const RealTimeIndicator = ({ isActive, connectionStatus, onToggle }) => {
  const getStatusInfo = () => {
    if (connectionStatus === 'connected' && isActive) {
      return {
        icon: <Zap className="w-4 h-4" />,
        text: 'Tiempo Real',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900',
        pulse: true
      };
    } else if (connectionStatus === 'connected' && !isActive) {
      return {
        icon: <Clock className="w-4 h-4" />,
        text: 'Cada Hora',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900',
        pulse: false
      };
    } else if (connectionStatus === 'connecting') {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        text: 'Conectando...',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900',
        pulse: false
      };
    } else {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Desconectado',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900',
        pulse: false
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Tooltip content={
      isActive
        ? "Click para cambiar a actualizaciones cada hora"
        : "Click para cambiar a actualizaciones en tiempo real"
    }>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md transition-all cursor-pointer hover:opacity-80 ${statusInfo.bgColor} ${statusInfo.color}`}
      >
        <div className={`flex items-center gap-2 ${statusInfo.pulse ? 'animate-pulse' : ''}`}>
          {statusInfo.icon}
          <span>{statusInfo.text}</span>
        </div>
        {isActive ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </button>
    </Tooltip>
  );
};

// Componente para controles del dashboard
const DashboardControls = ({
  onForceUpdate,
  onClearCache,
  onToggleNotifications,
  onShowPerformance,
  notificationsEnabled,
  showPerformancePanel
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Botón de notificaciones */}
      <Tooltip content={notificationsEnabled ? "Deshabilitar notificaciones" : "Habilitar notificaciones"}>
        <button
          onClick={onToggleNotifications}
          className={`p-2 rounded-md transition-colors ${
            notificationsEnabled
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800'
              : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </Tooltip>

      {/* Botón de actualizar */}
      <Tooltip content="Forzar actualización de datos">
        <button
          onClick={() => onForceUpdate('all')}
          className="p-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </Tooltip>

      {/* Botón de limpiar cache */}
      <Tooltip content="Limpiar cache del dashboard">
        <button
          onClick={() => onClearCache('dashboard')}
          className="p-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-md transition-colors"
        >
          <Zap className="w-4 h-4" />
        </button>
      </Tooltip>

      {/* Botón de métricas de rendimiento */}
      <Tooltip content="Mostrar métricas de rendimiento">
        <button
          onClick={onShowPerformance}
          className={`p-2 rounded-md transition-colors ${
            showPerformancePanel
              ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
              : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Activity className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
};

// Componente para mostrar métricas de rendimiento
const PerformancePanel = ({ connectionStatus, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-light dark:bg-surface-dark rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del panel */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark m-0">
              Métricas de Rendimiento
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Contenido del panel */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Estado de conexión */}
            <div className="bg-surface-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Estado de Conexión
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Estado:</span>
                  <span className={`font-medium ${
                    connectionStatus === 'connected'
                      ? 'text-green-600 dark:text-green-400'
                      : connectionStatus === 'connecting'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {connectionStatus === 'connected' ? 'Conectado' :
                     connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">WebSocket:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {connectionStatus === 'connected' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Métricas de rendimiento */}
            <div className="bg-surface-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Rendimiento del Sistema
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Tiempo de respuesta:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    45ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Consultas/segundo:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    1,247
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">CPU:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    23%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Memoria:</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    156MB
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas de actualizaciones */}
            <div className="bg-surface-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Actualizaciones
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Total actualizaciones:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    1,847
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Última actualización:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {new Date().toLocaleTimeString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Estado:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Activo
                  </span>
                </div>
              </div>
            </div>

            {/* Métricas de cache */}
            <div className="bg-surface-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Cache
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Hits:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    2,847
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Misses:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    153
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Tasa de aciertos:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    94.9%
                  </span>
                </div>
              </div>
            </div>

            {/* Métricas de notificaciones */}
            <div className="bg-surface-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Enviadas:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    47
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Pendientes:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    3
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Errores:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    0
                  </span>
                </div>
              </div>
            </div>

            {/* Información del sistema */}
            <div className="bg-surface-light dark:bg-background-dark rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Información del Sistema
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Uptime:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    2d 14h 32m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Versión:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    v2.1.4
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">Entorno:</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    Producción
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;