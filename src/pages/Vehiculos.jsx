import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBus, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaUser, FaExclamationTriangle, FaCogs, FaRoad } from "react-icons/fa";
import vehiculosAPI from '../utilidades/vehiculosAPI';
import driversAPI from '../utilidades/driversAPI';
import { apiClient } from '../api/baseAPI';

const Vehiculos = () => {
  const { t } = useTranslation();
  const [vehiculos, setVehiculos] = useState([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState([]);
  const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estadisticas, setEstadisticas] = useState({});

  const [newVehiculo, setNewVehiculo] = useState({
    numVehiculo: '',
    plaVehiculo: '',
    marVehiculo: '',
    modVehiculo: '',
    anioVehiculo: new Date().getFullYear(),
    fecVenSOAT: '',
    fecVenTec: '',
    estVehiculo: 'DISPONIBLE',
    idConductorAsignado: ''
  });

  const [editVehiculo, setEditVehiculo] = useState({});

  // Estados de vehículos válidos según la base de datos
  const estadosVehiculo = [
    { value: 'DISPONIBLE', label: 'Disponible', color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'EN_RUTA', label: 'En Ruta', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'EN_MANTENIMIENTO', label: 'En Mantenimiento', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'FUERA_DE_SERVICIO', label: 'Fuera de Servicio', color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' }
  ];

  // Filtrar vehículos - usando useCallback para evitar recreación en cada render
  const filterVehiculos = useCallback(() => {
    let results = vehiculos;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(v =>
        v.plaVehiculo?.toLowerCase().includes(search) ||
        v.marVehiculo?.toLowerCase().includes(search) ||
        v.modVehiculo?.toLowerCase().includes(search) ||
        v.numVehiculo?.toLowerCase().includes(search) ||
        v.conductor?.nombre?.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== 'all') {
      results = results.filter(v => v.estVehiculo === filterStatus);
    }

    setFilteredVehiculos(results);
  }, [searchTerm, filterStatus, vehiculos]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtrar vehículos cuando cambien los filtros - ahora incluye filterVehiculos en las dependencias
  useEffect(() => {
    filterVehiculos();
  }, [filterVehiculos]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar vehículos y estadísticas
      const [vehiculosData, estadisticasData] = await Promise.all([
        vehiculosAPI.getAll({ limit: 100 }),
        vehiculosAPI.getStatistics()
      ]);

      setVehiculos(vehiculosData.vehiculos || []);
      setEstadisticas(estadisticasData.estadisticas || {});

      // Cargar conductores disponibles
      try {
        const conductoresData = await driversAPI.getAll();
        setConductoresDisponibles(Array.isArray(conductoresData) ? conductoresData : (conductoresData?.conductores ?? []));
      } catch (error) {
        console.error('Error al cargar conductores:', error);
        setConductoresDisponibles([]);
      }

      setError('');
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los vehículos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehiculo = async () => {
    try {
      setError('');

      // Validaciones básicas
      if (!newVehiculo.numVehiculo || !newVehiculo.plaVehiculo || !newVehiculo.marVehiculo ||
        !newVehiculo.modVehiculo || !newVehiculo.fecVenSOAT || !newVehiculo.fecVenTec) {
        setError('Por favor, completa todos los campos requeridos.');
        return;
      }

      const vehiculoData = {
        ...newVehiculo,
        idConductorAsignado: newVehiculo.idConductorAsignado || null
      };

      await vehiculosAPI.create(vehiculoData);

      // Recargar datos
      await loadInitialData();

      // Cerrar modal y resetear formulario
      setShowAddModal(false);
      resetNewVehiculo();

    } catch (error) {
      console.error('Error al crear vehículo:', error);
      setError(error.message || 'Error al crear el vehículo');
    }
  };

  const handleEditVehiculo = async () => {
    try {
      setError('');

      await vehiculosAPI.update(selectedVehiculo.idVehiculo, editVehiculo);

      // Recargar datos
      await loadInitialData();

      // Cerrar modal
      setShowEditModal(false);
      setSelectedVehiculo(null);
      setEditVehiculo({});

    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      setError(error.message || 'Error al actualizar el vehículo');
    }
  };

  const handleDeleteVehiculo = async (vehiculo) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el vehículo ${vehiculo.plaVehiculo}?`)) {
      return;
    }

    try {
      setError('');
      await vehiculosAPI.delete(vehiculo.idVehiculo);

      // Recargar datos
      await loadInitialData();

    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      setError(error.message || 'Error al eliminar el vehículo');
    }
  };

  // Función para cambiar estado - ahora se usa correctamente
  const handleChangeStatus = async (vehiculo, nuevoEstado) => {
    try {
      setError('');
      await vehiculosAPI.changeStatus(vehiculo.idVehiculo, nuevoEstado);

      // Recargar datos
      await loadInitialData();

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError(error.message || 'Error al cambiar el estado del vehículo');
    }
  };

  const openEditModal = (vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setEditVehiculo({
      numVehiculo: vehiculo.numVehiculo,
      plaVehiculo: vehiculo.plaVehiculo,
      marVehiculo: vehiculo.marVehiculo,
      modVehiculo: vehiculo.modVehiculo,
      anioVehiculo: vehiculo.anioVehiculo,
      fecVenSOAT: vehiculo.fecVenSOAT?.split('T')[0],
      fecVenTec: vehiculo.fecVenTec?.split('T')[0],
      estVehiculo: vehiculo.estVehiculo,
      idConductorAsignado: vehiculo.conductor?.idConductor || ''
    });
    setShowEditModal(true);
  };

  const resetNewVehiculo = () => {
    setNewVehiculo({
      numVehiculo: '',
      plaVehiculo: '',
      marVehiculo: '',
      modVehiculo: '',
      anioVehiculo: new Date().getFullYear(),
      fecVenSOAT: '',
      fecVenTec: '',
      estVehiculo: 'DISPONIBLE',
      idConductorAsignado: ''
    });
  };

  const getEstadoInfo = (estado) => {
    return estadosVehiculo.find(e => e.value === estado) ||
      { value: estado, label: estado, color: 'text-gray-600 bg-gray-50' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const isVencimientoProximo = (fechaVencimiento, diasLimite = 30) => {
    if (!fechaVencimiento) return false;
    const fecha = new Date(fechaVencimiento);
    const hoy = new Date();
    const diffTime = fecha - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= diasLimite && diffDays >= 0;
  };

  const isVencido = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const fecha = new Date(fechaVencimiento);
    const hoy = new Date();
    return fecha < hoy;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-surface-light dark:bg-background-dark min-h-screen text-text-primary-light dark:text-text-primary-dark">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Header con estadísticas */}
      <div className="mb-6 bg-background-light dark:bg-surface-dark p-4 md:p-5 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2 md:gap-3 m-0" data-tutorial="vehicles">
            <FaBus className="text-primary-500 text-2xl md:text-3xl" />
            <span>{t('vehicles.title')}</span>
          </h2>

          {/* Mobile Stats Grid */}
          <div className="grid grid-cols-2 lg:hidden gap-3 w-full lg:w-auto">
            <div key="stats-total" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 p-3 rounded-lg min-h-[60px] justify-center">
              <span className="text-lg md:text-2xl font-bold text-blue-500">{estadisticas.total || 0}</span>
              <span className="text-xs md:text-sm text-slate-500 dark:text-slate-300">{t('vehicles.filters.all')}</span>
            </div>
            <div key="stats-disponibles" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 p-3 rounded-lg min-h-[60px] justify-center">
              <span className="text-lg md:text-2xl font-bold text-green-500">{estadisticas.disponibles || 0}</span>
              <span className="text-xs md:text-sm text-slate-500 dark:text-slate-300">{t('vehicles.status.active')}</span>
            </div>
            <div key="stats-enRuta" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 p-3 rounded-lg min-h-[60px] justify-center">
              <span className="text-lg md:text-2xl font-bold text-blue-500">{estadisticas.enRuta || 0}</span>
              <span className="text-xs md:text-sm text-slate-500 dark:text-slate-300">{t('vehicles.status.maintenance')}</span>
            </div>
            <div key="stats-mantenimiento" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 p-3 rounded-lg min-h-[60px] justify-center">
              <span className="text-lg md:text-2xl font-bold text-orange-500">{estadisticas.enMantenimiento || 0}</span>
              <span className="text-xs md:text-sm text-slate-500 dark:text-slate-300">{t('vehicles.status.maintenance')}</span>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="hidden lg:flex gap-5">
            <div key="stats-total-desktop" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 py-2 px-5 rounded-lg min-w-24">
              <span className="text-2xl font-bold text-blue-500">{estadisticas.total || 0}</span>
              <span className="text-sm text-slate-500 dark:text-slate-300">Total</span>
            </div>
            <div key="stats-disponibles-desktop" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 py-2 px-5 rounded-lg min-w-24">
              <span className="text-2xl font-bold text-green-500">{estadisticas.disponibles || 0}</span>
              <span className="text-sm text-slate-500 dark:text-slate-300">Disponibles</span>
            </div>
            <div key="stats-enRuta-desktop" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 py-2 px-5 rounded-lg min-w-24">
              <span className="text-2xl font-bold text-blue-500">{estadisticas.enRuta || 0}</span>
              <span className="text-sm text-slate-500 dark:text-slate-300">En Ruta</span>
            </div>
            <div key="stats-mantenimiento-desktop" className="flex flex-col items-center bg-gray-50 dark:bg-slate-700 py-2 px-5 rounded-lg min-w-24">
              <span className="text-2xl font-bold text-orange-500">{estadisticas.enMantenimiento || 0}</span>
              <span className="text-sm text-slate-500 dark:text-slate-300">Mantenimiento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div key="filters-search" className="flex-1 relative min-w-0">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por placa, marca, modelo o conductor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-slate-600 text-base bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none min-h-[48px]"
          />
        </div>

        <div key="filters-select" className="flex-1 relative min-w-0 md:max-w-48">
          <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-slate-600 text-base bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none min-h-[48px]"
          >
            <option value="all">Todos los vehículos</option>
            {estadosVehiculo.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>
        </div>

        <button
          key="filters-add-button"
          className="bg-blue-500 text-white border-none rounded-lg px-4 md:px-6 py-3 text-base font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:bg-blue-600 hover:-translate-y-0.5 min-h-[48px] w-full md:w-auto"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> <span className="hidden sm:inline">Agregar Vehículo</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4 md:gap-5">
        {filteredVehiculos.map((vehiculo) => {
          const estadoInfo = getEstadoInfo(vehiculo.estVehiculo);
          const soatProximoVencer = isVencimientoProximo(vehiculo.fecVenSOAT);
          const tecnicaProximaVencer = isVencimientoProximo(vehiculo.fecVenTec);
          const soatVencido = isVencido(vehiculo.fecVenSOAT);
          const tecnicaVencida = isVencido(vehiculo.fecVenTec);

          return (
            <div key={vehiculo.idVehiculo} className="bg-background-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="m-0 text-lg text-slate-800 dark:text-slate-200 font-semibold">
                  {vehiculo.marVehiculo} {vehiculo.modVehiculo}
                </h3>
                <div className="flex items-center gap-2">
                  <span key={`status-${vehiculo.idVehiculo}`} className={`flex items-center gap-1 text-sm font-semibold py-1 px-3 rounded-full ${estadoInfo.color}`}>
                    {vehiculo.estVehiculo === 'DISPONIBLE' && <FaCheckCircle />}
                    {vehiculo.estVehiculo === 'EN_RUTA' && <FaRoad />}
                    {vehiculo.estVehiculo === 'EN_MANTENIMIENTO' && <FaCogs />}
                    {vehiculo.estVehiculo === 'FUERA_DE_SERVICIO' && <FaTimesCircle />}
                    {estadoInfo.label}
                  </span>
                  <select
                    key={`select-${vehiculo.idVehiculo}`}
                    value={vehiculo.estVehiculo}
                    onChange={(e) => handleChangeStatus(vehiculo, e.target.value)}
                    className="text-xs border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1"
                    title="Cambiar estado"
                  >
                    {estadosVehiculo.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4">
                {/* detalles */}
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Placa:</span>
                  <span className="text-slate-800 dark:text-slate-200 text-sm font-mono">{vehiculo.plaVehiculo}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Número interno:</span>
                  <span className="text-slate-800 dark:text-slate-200 text-sm">{vehiculo.numVehiculo}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Año:</span>
                  <span className="text-slate-800 dark:text-slate-200 text-sm">{vehiculo.anioVehiculo}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Conductor:</span>
                  <span className="text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1">
                    {vehiculo.conductor ? (
                      <>
                        <FaUser className="text-green-500" />
                        {vehiculo.conductor.nombre}
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">Sin asignar</span>
                    )}
                  </span>
                </div>

                {/* fechas */}
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-sm">SOAT:</span>
                  <span className={`text-sm flex items-center gap-1 ${soatVencido ? 'text-red-600 font-semibold' :
                    soatProximoVencer ? 'text-orange-600 font-semibold' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                    {(soatVencido || soatProximoVencer) && <FaExclamationTriangle />}
                    {formatDate(vehiculo.fecVenSOAT)}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Técnica:</span>
                  <span className={`text-sm flex items-center gap-1 ${tecnicaVencida ? 'text-red-600 font-semibold' :
                    tecnicaProximaVencer ? 'text-orange-600 font-semibold' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                    {(tecnicaVencida || tecnicaProximaVencer) && <FaExclamationTriangle />}
                    {formatDate(vehiculo.fecVenTec)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 p-4 bg-gray-50 dark:bg-slate-700">
                <button
                  onClick={() => openEditModal(vehiculo)}
                  className="flex-1 py-2 px-4 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-1"
                >
                  <FaEdit /> Editar
                </button>
                <button
                  onClick={() => handleDeleteVehiculo(vehiculo)}
                  className="flex-1 py-2 px-4 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 border-none bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-1"
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* vacío */}
      {filteredVehiculos.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaBus className="text-gray-400 dark:text-slate-600 text-6xl mb-4 mx-auto" />
          <p className="text-gray-500 dark:text-slate-400 text-lg">No se encontraron vehículos</p>
          {searchTerm && (
            <p className="text-gray-400 dark:text-slate-500 text-sm">
              Intenta con otros términos de búsqueda o cambia los filtros
            </p>
          )}
        </div>
      )}

      {/* Modal para agregar vehículo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-background-light dark:bg-surface-dark rounded-xl p-6 w-11/12 max-w-3xl max-h-screen overflow-y-auto text-text-primary-light dark:text-text-primary-dark">
            <h3 className="mt-0 text-xl font-semibold border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
              Agregar Nuevo Vehículo
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="form-numero-interno" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Número Interno *</label>
                <input
                  type="text"
                  value={newVehiculo.numVehiculo}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, numVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="Ej: V001"
                />
              </div>

              <div key="form-placa" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Placa *</label>
                <input
                  type="text"
                  value={newVehiculo.plaVehiculo}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, plaVehiculo: e.target.value.toUpperCase() })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono"
                  placeholder="ABC-123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="form-marca" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Marca *</label>
                <input
                  type="text"
                  value={newVehiculo.marVehiculo}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, marVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="Ej: Mercedes-Benz"
                />
              </div>

              <div key="form-modelo" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Modelo *</label>
                <input
                  type="text"
                  value={newVehiculo.modVehiculo}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, modVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="Ej: O500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="form-anio" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Año *</label>
                <input
                  type="number"
                  value={newVehiculo.anioVehiculo}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, anioVehiculo: parseInt(e.target.value) })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div key="form-estado" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Estado</label>
                <select
                  value={newVehiculo.estVehiculo}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, estVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {estadosVehiculo.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="form-soat" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Vencimiento SOAT *</label>
                <input
                  type="date"
                  value={newVehiculo.fecVenSOAT}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, fecVenSOAT: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div key="form-tecnica" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Vencimiento Técnica *</label>
                <input
                  type="date"
                  value={newVehiculo.fecVenTec}
                  onChange={(e) => setNewVehiculo({ ...newVehiculo, fecVenTec: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="flex flex-col mb-6">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Conductor Asignado</label>
              <select
                value={newVehiculo.idConductorAsignado}
                onChange={(e) => setNewVehiculo({ ...newVehiculo, idConductorAsignado: e.target.value })}
                className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="">Sin conductor asignado</option>
                {conductoresDisponibles.map(conductor => (
                  <option key={conductor.idConductor || conductor.id} value={conductor.idConductor || conductor.id}>
                    {(conductor.nomUsuario || conductor.nomConductor || conductor.nombre || "")} {(conductor.apeUsuario || conductor.apeConductor || conductor.apellido || "")} - {(conductor.numDocUsuario || conductor.numDocConductor || conductor.documento || "")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-none hover:bg-gray-300 dark:hover:bg-slate-600"
                onClick={() => {
                  setShowAddModal(false);
                  resetNewVehiculo();
                  setError('');
                }}
              >
                Cancelar
              </button>
              <button
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-blue-500 text-white border-none hover:bg-blue-600"
                onClick={handleAddVehiculo}
              >
                Guardar Vehículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar vehículo */}
      {showEditModal && selectedVehiculo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-background-light dark:bg-surface-dark rounded-xl p-6 w-11/12 max-w-3xl max-h-screen overflow-y-auto text-text-primary-light dark:text-text-primary-dark">
            <h3 className="mt-0 text-xl font-semibold border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
              Editar Vehículo - {selectedVehiculo.plaVehiculo}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="edit-form-numero-interno" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Número Interno *</label>
                <input
                  type="text"
                  value={editVehiculo.numVehiculo || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, numVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div key="edit-form-placa" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Placa *</label>
                <input
                  type="text"
                  value={editVehiculo.plaVehiculo || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, plaVehiculo: e.target.value.toUpperCase() })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="edit-form-marca" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Marca *</label>
                <input
                  type="text"
                  value={editVehiculo.marVehiculo || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, marVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div key="edit-form-modelo" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Modelo *</label>
                <input
                  type="text"
                  value={editVehiculo.modVehiculo || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, modVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="edit-form-anio" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Año *</label>
                <input
                  type="number"
                  value={editVehiculo.anioVehiculo || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, anioVehiculo: parseInt(e.target.value) })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div key="edit-form-estado" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Estado</label>
                <select
                  value={editVehiculo.estVehiculo || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, estVehiculo: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {estadosVehiculo.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div key="edit-form-soat" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Vencimiento SOAT *</label>
                <input
                  type="date"
                  value={editVehiculo.fecVenSOAT || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, fecVenSOAT: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div key="edit-form-tecnica" className="flex flex-col">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Vencimiento Técnica *</label>
                <input
                  type="date"
                  value={editVehiculo.fecVenTec || ''}
                  onChange={(e) => setEditVehiculo({ ...editVehiculo, fecVenTec: e.target.value })}
                  className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col mb-6">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Conductor Asignado</label>
              <select
                value={editVehiculo.idConductorAsignado || ''}
                onChange={(e) => setEditVehiculo({ ...editVehiculo, idConductorAsignado: e.target.value })}
                className="py-3 px-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-base transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="">Sin conductor asignado</option>
                {selectedVehiculo.conductor && (
                  <option value={selectedVehiculo.conductor.idConductor || selectedVehiculo.conductor.id}>
                    {(selectedVehiculo.conductor.nomUsuario || selectedVehiculo.conductor.nomConductor || selectedVehiculo.conductor.nombre)} {(selectedVehiculo.conductor.apeUsuario || selectedVehiculo.conductor.apeConductor || selectedVehiculo.conductor.apellido)} (Actual)
                  </option>
                )}
                {conductoresDisponibles
                  .filter(c => !selectedVehiculo.conductor || (c.idConductor || c.id) !== (selectedVehiculo.conductor.idConductor || selectedVehiculo.conductor.id))
                  .map(conductor => (
                    <option key={conductor.idConductor || conductor.id} value={conductor.idConductor || conductor.id}>
                      {(conductor.nomUsuario || conductor.nomConductor || conductor.nombre || "")} {(conductor.apeUsuario || conductor.apeConductor || conductor.apellido || "")} - {(conductor.numDocUsuario || conductor.numDocConductor || conductor.documento || "")}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-none hover:bg-gray-300 dark:hover:bg-slate-600"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVehiculo(null);
                  setEditVehiculo({});
                  setError('');
                }}
              >
                Cancelar
              </button>
              <button
                className="py-3 px-6 rounded-md text-base font-semibold cursor-pointer transition-all duration-300 bg-blue-500 text-white border-none hover:bg-blue-600"
                onClick={handleEditVehiculo}
              >
                Actualizar Vehículo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Vehiculos;