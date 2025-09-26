// src/pages/Horarios.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Loader,
  Filter,
  RefreshCw
} from "lucide-react";
import apiClient from "../api/baseAPI";
import driversAPI from "../utilidades/driversAPI";

const Horarios = () => {
  const { t } = useTranslation();
  // Estados principales
  const [filtroRuta, setFiltroRuta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("all");
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    idVehiculo: "",
    idConductor: "",
    idRuta: "",
    fecHorSalViaje: "",
    fecHorLleViaje: "",
    estViaje: "PROGRAMADO",
    obsViaje: "",
  });

  // Estados de error y éxito
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================
  // Helpers para manejo robusto de datos
  // ============================
  const getNested = (obj, path) => {
    try {
      return path.split(".").reduce((a, b) => a?.[b], obj);
    } catch (e) {
      return undefined;
    }
  };

  const getField = (obj, candidates = []) => {
    for (const c of candidates) {
      if (c.includes(".")) {
        const v = getNested(obj, c);
        if (v !== undefined && v !== null) return v;
      } else {
        if (obj?.[c] !== undefined && obj?.[c] !== null) return obj[c];
      }
    }
    return null;
  };

  const parseDateForDisplay = (s) => {
    if (!s && s !== 0) return "";
    try {
      let str = String(s);
      if (str.includes(" ") && !str.includes("T")) str = str.replace(" ", "T");
      const d = new Date(str);
      if (isNaN(d)) return String(s);
      return d.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return String(s);
    }
  };

  const formatForInput = (s) => {
    if (!s) return "";
    let str = String(s);
    if (str.includes(" ") && !str.includes("T")) str = str.replace(" ", "T");
    const d = new Date(str);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 16);
  };

  const formatForApi = (s) => {
    if (!s) return null;
    return s.replace("T", " ") + ":00";
  };

  // ============================
  // Funciones para obtener labels
  // ============================
  const getVehicleLabel = (viajeObj) => {
    const idVeh = getField(viajeObj, ["idVehiculo", "id_vehiculo", "vehiculoId"]);
    if (!idVeh) return "-";
    
    const placa = getField(viajeObj, ["plaVehiculo", "placaVehiculo"]);
    const marca = getField(viajeObj, ["marVehiculo"]);
    const modelo = getField(viajeObj, ["modVehiculo"]);
    const numero = getField(viajeObj, ["numVehiculo"]);
    
    if (placa || marca || modelo) {
      return `${placa || numero || "Veh"} ${marca && modelo ? `- ${marca} ${modelo}` : ""}`.trim();
    }
    
    const v = vehiculos.find(x => 
      Number(getField(x, ["idVehiculo", "id"])) === Number(idVeh)
    );
    
    if (!v) return `Veh#${idVeh}`;
    
    const vPlaca = getField(v, ["placaVehiculo", "plaVehiculo", "placa"]);
    const vModelo = getField(v, ["modeloVehiculo", "marVehiculo", "modVehiculo"]);
    const vNum = getField(v, ["numVehiculo", "numeroInterno"]);
    
    return `${vPlaca || vNum || "Veh"} ${vModelo ? `- ${vModelo}` : ""}`.trim();
  };

  const getConductorLabel = (viajeObj) => {
    const idCond = getField(viajeObj, ["idConductor", "id_conductor", "conductorId"]);
    if (!idCond) return "-";

    const nom = getField(viajeObj, ["nomConductor", "nombreConductor"]);
    const ape = getField(viajeObj, ["apeConductor", "apellidoConductor"]);

    if (nom || ape) {
      return `${nom || ""} ${ape || ""}`.trim() || `Cond#${idCond}`;
    }

    const c = conductores.find(x =>
      Number(getField(x, ["idConductor", "id"])) === Number(idCond)
    );

    if (!c) return `Cond#${idCond}`;

    const cNom = getField(c, ["nomUsuario", "nomConductor", "nom_conductor"]);
    const cApe = getField(c, ["apeUsuario", "apeConductor", "ape_conductor", "apellido"]);

    if (cNom && cApe) return `${cNom} ${cApe}`;
    if (cNom) return cNom;

    return getField(c, ["nombreCompleto", "nombre"]) || `Cond#${idCond}`;
  };

  const getRutaLabel = (viajeObj) => {
    const idRuta = getField(viajeObj, ["idRuta", "id_ruta", "rutaId"]);
    if (!idRuta) return "-";
    
    const nomRuta = getField(viajeObj, ["nomRuta", "nombreRuta"]);
    const origen = getField(viajeObj, ["oriRuta"]);
    const destino = getField(viajeObj, ["desRuta"]);
    
    if (nomRuta) {
      return origen && destino ? `${nomRuta} (${origen} → ${destino})` : nomRuta;
    }
    
    const r = rutas.find(x => 
      Number(getField(x, ["idRuta", "id"])) === Number(idRuta)
    );
    
    if (!r) return `Ruta#${idRuta}`;
    
    const rNom = getField(r, ["nomRuta", "nombreRuta", "nom_ruta"]);
    const rOri = getField(r, ["oriRuta"]);
    const rDes = getField(r, ["desRuta"]);
    
    if (rNom && rOri && rDes) return `${rNom} (${rOri} → ${rDes})`;
    return rNom || `Ruta#${idRuta}`;
  };

  // ============================
  // Funciones de carga de datos
  // ============================
  const showMessage = (message, type = "info") => {
    if (type === "error") {
      setError(message);
      setSuccess("");
    } else {
      setSuccess(message);
      setError("");
    }
    
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  };

  const fetchViajes = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/viajes");
      const data = Array.isArray(res.data) ? res.data : (res.data?.viajes ?? res.data);
      setViajes(data || []);
      return data || [];
    } catch (err) {
      console.error("Error cargando viajes", err);
      setViajes([]);
      throw err;
    }
  }, []);

  const fetchVehiculos = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/vehiculos");
      setVehiculos(Array.isArray(res.data) ? res.data : (res.data?.vehiculos ?? []));
    } catch (err) {
      console.error("Error cargando vehículos", err);
      setVehiculos([]);
      throw err;
    }
  }, []);

  const fetchConductores = useCallback(async () => {
    try {
      const data = await driversAPI.getAll();
      setConductores(Array.isArray(data) ? data : (data?.conductores ?? []));
    } catch (err) {
      console.error("Error cargando conductores", err);
      setConductores([]);
      throw err;
    }
  }, []);

  const fetchRutas = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/rutas/utils/select");
      setRutas(Array.isArray(res.data) ? res.data : (res.data?.rutas ?? []));
    } catch (err) {
      console.error("Error cargando rutas", err);
      setRutas([]);
      throw err;
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      await Promise.all([
        fetchViajes(),
        fetchVehiculos(),
        fetchConductores(),
        fetchRutas()
      ]);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showMessage("Error cargando los datos del sistema", "error");
    } finally {
      setLoading(false);
    }
  }, [fetchViajes, fetchVehiculos, fetchConductores, fetchRutas]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ============================
  // CRUD de viajes
  // ============================
  const onInput = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      idVehiculo: "",
      idConductor: "",
      idRuta: "",
      fecHorSalViaje: "",
      fecHorLleViaje: "",
      estViaje: "PROGRAMADO",
      obsViaje: "",
    });
  };

  const openCreate = () => {
    setEditId(null);
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditId(getField(v, ["idViaje", "id_viaje", "id"]));
    setFormData({
      idVehiculo: getField(v, ["idVehiculo", "id_vehiculo"]) || "",
      idConductor: getField(v, ["idConductor", "id_conductor"]) || "",
      idRuta: getField(v, ["idRuta", "id_ruta"]) || "",
      fecHorSalViaje: formatForInput(getField(v, ["fecHorSalViaje", "fec_hor_sal_viaje", "fechaSalida", "salida"])),
      fecHorLleViaje: formatForInput(getField(v, ["fecHorLleViaje", "fec_hor_lle_viaje", "fechaLlegada", "llegada"])),
      estViaje: getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO",
      obsViaje: getField(v, ["obsViaje", "observaciones"]) || "",
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este viaje?")) return;
    
    try {
      setLoading(true);
      await apiClient.delete(`/api/viajes/${id}`);
      await fetchViajes();
      showMessage("Viaje eliminado exitosamente", "success");
    } catch (err) {
      console.error("Error eliminando viaje", err);
      const message = err.response?.data?.message || "No se pudo eliminar el viaje";
      showMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.idVehiculo) errors.push("Selecciona un vehículo");
    if (!formData.idConductor) errors.push("Selecciona un conductor");
    if (!formData.idRuta) errors.push("Selecciona una ruta");
    if (!formData.fecHorSalViaje) errors.push("Ingresa la fecha y hora de salida");
    
    if (!editId && formData.fecHorSalViaje) {
      const now = new Date();
      const salida = new Date(formData.fecHorSalViaje);
      if (salida < now) {
        errors.push("La fecha de salida debe ser futura");
      }
    }
    
    if (formData.fecHorSalViaje && formData.fecHorLleViaje) {
      const salida = new Date(formData.fecHorSalViaje);
      const llegada = new Date(formData.fecHorLleViaje);
      if (llegada <= salida) {
        errors.push("La fecha de llegada debe ser posterior a la salida");
      }
    }
    
    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showMessage(validationErrors.join(". "), "error");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    const payload = {
      idVehiculo: parseInt(formData.idVehiculo),
      idConductor: parseInt(formData.idConductor),
      idRuta: parseInt(formData.idRuta),
      fecHorSalViaje: formatForApi(formData.fecHorSalViaje),
      fecHorLleViaje: formData.fecHorLleViaje ? formatForApi(formData.fecHorLleViaje) : null,
      estViaje: formData.estViaje,
      obsViaje: formData.obsViaje || null,
    };

    try {
      if (editId) {
        await apiClient.put(`/api/viajes/${editId}`, payload);
        showMessage("Viaje actualizado exitosamente", "success");
      } else {
        await apiClient.post("/api/viajes", payload);
        showMessage("Viaje creado exitosamente", "success");
      }
      
      setShowModal(false);
      resetForm();
      await fetchViajes();
    } catch (err) {
      console.error("Error guardando viaje", err);
      const message = err.response?.data?.message || "Error guardando el viaje";
      showMessage(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================
  // Filtrado y renderizado
  // ============================
  const filtered = viajes.filter((v) => {
    const rutaLabel = getRutaLabel(v).toLowerCase();
    const condLabel = getConductorLabel(v).toLowerCase();
    const vehLabel = getVehicleLabel(v).toLowerCase();
    const search = filtroRuta.toLowerCase();
    
    const matchesSearch = !search || 
      rutaLabel.includes(search) || 
      condLabel.includes(search) || 
      vehLabel.includes(search);
    
    const estado = getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO";
    const matchesEstado = filtroEstado === "all" || estado === filtroEstado;
    
    return matchesSearch && matchesEstado;
  });

  const getStatusClass = (s) => {
    switch (s) {
      case "PROGRAMADO":
        return "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700";
      case "EN_CURSO":
        return "bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-700";
      case "FINALIZADO":
        return "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700";
      case "CANCELADO":
        return "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200 dark:border-red-700";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case "PROGRAMADO":
        return <Clock className="w-3 h-3" />;
      case "EN_CURSO":
        return <Loader className="w-3 h-3 animate-spin" />;
      case "FINALIZADO":
        return <CheckCircle className="w-3 h-3" />;
      case "CANCELADO":
        return <X className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // ============================
  // JSX
  // ============================
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-surface-light dark:bg-gray-900 p-2 sm:p-4 md:p-6 text-text-primary-light dark:text-gray-100">
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16">
          <Loader className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mb-3 sm:mb-4 flex-shrink-0" />
          <span className="text-sm sm:text-base md:text-lg text-text-secondary-light dark:text-gray-400">{t('schedules.messages.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-light dark:bg-gray-900 p-2 sm:p-4 md:p-6 text-text-primary-light dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold flex items-center gap-2 sm:gap-3 text-text-primary-light dark:text-gray-100 min-w-0 flex-shrink-0" data-tutorial="schedules">
          <Clock className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
          <span className="truncate">{t('schedules.title')}</span>
          <span className="text-xs sm:text-sm md:text-base font-normal text-text-secondary-light dark:text-gray-400 ml-1 sm:ml-2 min-w-0 flex-shrink-0">
            ({filtered.length} viajes)
          </span>
        </h2>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto min-w-0 flex-shrink-0">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] text-sm sm:text-base flex-shrink-0"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline truncate">{t('schedules.form.save')}</span>
            <span className="sm:hidden truncate">Actualizar</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors min-h-[40px] sm:min-h-[44px] md:min-h-[48px] text-sm sm:text-base flex-shrink-0"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{t('schedules.form.create')}</span>
            <span className="sm:hidden truncate">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-surface-light dark:bg-red-900 border border-border-light dark:border-red-700 rounded-lg flex items-center gap-2 sm:gap-3 text-red-700 dark:text-red-200 min-w-0">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-surface-light dark:bg-green-900 border border-border-light dark:border-green-700 rounded-lg flex items-center gap-2 sm:gap-3 text-green-700 dark:text-green-200 min-w-0">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 min-w-0">
        <div className="flex items-center bg-surface-light dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex-grow min-h-[40px] sm:min-h-[44px] md:min-h-[48px]">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary-light dark:text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder={t('schedules.filters.route')}
            className="border-none bg-transparent w-full text-xs sm:text-sm md:text-base text-text-primary-light dark:text-gray-200 outline-none min-w-0"
            value={filtroRuta}
            onChange={(e) => setFiltroRuta(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] min-w-0">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary-light dark:text-gray-400 flex-shrink-0" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-border-light dark:border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 min-w-24 sm:min-w-32 md:min-w-36 cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="all">{t('schedules.filters.all')}</option>
            <option value="PROGRAMADO">{t('schedules.status.scheduled')}</option>
            <option value="EN_CURSO">{t('schedules.status.inProgress')}</option>
            <option value="FINALIZADO">{t('schedules.status.completed')}</option>
            <option value="CANCELADO">{t('schedules.status.cancelled')}</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3 sm:space-y-4 mb-4 sm:mb-6 min-w-0">
        {filtered.length ? (
          filtered.map((v, i) => {
            const id = getField(v, ["idViaje", "id_viaje", "id"]);
            const status = getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO";
            const salida = getField(v, ["fecHorSalViaje", "fec_hor_sal_viaje", "fecSal"]) || "";
            const llegada = getField(v, ["fecHorLleViaje", "fec_hor_lle_viaje", "fecLle"]) || "";

            return (
              <div key={id || i} className="bg-background-light dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-gray-700 p-3 sm:p-4 min-w-0">
                <div className="flex justify-between items-start mb-3 sm:mb-4 min-w-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary-light dark:text-gray-100 text-sm sm:text-base truncate min-w-0">
                      {getRutaLabel(v)}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-400 mt-1 truncate min-w-0">
                      {getConductorLabel(v)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(status)} ml-2 flex-shrink-0 min-w-0`}>
                    {getStatusIcon(status)}
                    <span className="truncate">{status}</span>
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 min-w-0">
                  <div className="flex justify-between items-center min-w-0">
                    <span className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-400 flex-shrink-0">Vehículo:</span>
                    <span className="text-xs sm:text-sm text-text-primary-light dark:text-gray-100 truncate ml-2 min-w-0">{getVehicleLabel(v)}</span>
                  </div>
                  <div className="flex justify-between items-center min-w-0">
                    <span className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-400 flex-shrink-0">Salida:</span>
                    <span className="text-xs sm:text-sm text-text-primary-light dark:text-gray-100 truncate ml-2 min-w-0">{parseDateForDisplay(salida)}</span>
                  </div>
                  {llegada && (
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-400 flex-shrink-0">Llegada:</span>
                      <span className="text-xs sm:text-sm text-text-primary-light dark:text-gray-100 truncate ml-2 min-w-0">{parseDateForDisplay(llegada)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-border-light dark:border-gray-700 min-w-0">
                  <button
                    onClick={() => openEdit(v)}
                    className="p-2 sm:p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center flex-shrink-0"
                    title="Editar viaje"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(id)}
                    className="p-2 sm:p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center flex-shrink-0"
                    title="Eliminar viaje"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 sm:py-10 md:py-12 min-w-0">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-text-secondary-light dark:text-gray-600 mx-auto mb-3 sm:mb-4 flex-shrink-0" />
            <p className="text-sm sm:text-base md:text-lg text-text-secondary-light dark:text-gray-400 mb-2 min-w-0">No hay viajes registrados</p>
            {filtroRuta || filtroEstado !== "all" ? (
              <button
                onClick={() => {
                  setFiltroRuta("");
                  setFiltroEstado("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs sm:text-sm underline"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border-light dark:border-gray-700 shadow-sm">
        <table className="w-full border-collapse text-xs sm:text-sm md:text-base min-w-0">
          <thead>
            <tr className="bg-surface-light dark:bg-gray-800">
              <th className="p-2 sm:p-3 md:p-4 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-24 sm:min-w-32">Ruta</th>
              <th className="p-2 sm:p-3 md:p-4 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-24 sm:min-w-32 hidden sm:table-cell">Conductor</th>
              <th className="p-2 sm:p-3 md:p-4 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-24 sm:min-w-32 hidden md:table-cell">Vehículo</th>
              <th className="p-2 sm:p-3 md:p-4 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-32 sm:min-w-40">Salida</th>
              <th className="p-2 sm:p-3 md:p-4 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-32 sm:min-w-40 hidden lg:table-cell">Llegada</th>
              <th className="p-2 sm:p-3 md:p-4 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-20 sm:min-w-28">Estado</th>
              <th className="p-2 sm:p-3 md:p-4 text-center font-medium text-text-primary-light dark:text-gray-300 w-20 sm:w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((v, i) => {
                const id = getField(v, ["idViaje", "id_viaje", "id"]);
                const status = getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO";
                const salida = getField(v, ["fecHorSalViaje", "fec_hor_sal_viaje", "fecSal"]) || "";
                const llegada = getField(v, ["fecHorLleViaje", "fec_hor_lle_viaje", "fecLle"]) || "";

                return (
                  <tr key={id || i} className={`border-b border-border-light dark:border-gray-700 ${i % 2 === 0 ? "bg-background-light dark:bg-slate-900 hover:bg-surface-light dark:hover:bg-gray-800" : "bg-surface-light dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                    <td className="p-2 sm:p-3 md:p-4 min-w-0">
                      <div className="font-medium text-text-primary-light dark:text-gray-100 truncate">{getRutaLabel(v)}</div>
                      <div className="sm:hidden text-xs text-text-secondary-light dark:text-gray-400 mt-1 truncate">
                        {getConductorLabel(v)} • {getVehicleLabel(v)}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 hidden sm:table-cell truncate">{getConductorLabel(v)}</td>
                    <td className="p-2 sm:p-3 md:p-4 hidden md:table-cell truncate">{getVehicleLabel(v)}</td>
                    <td className="p-2 sm:p-3 md:p-4 min-w-0">
                      <div className="text-text-primary-light dark:text-gray-100 truncate">{parseDateForDisplay(salida)}</div>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 hidden lg:table-cell min-w-0">
                      {llegada ? (
                        <div className="text-text-primary-light dark:text-gray-100 truncate">{parseDateForDisplay(llegada)}</div>
                      ) : (
                        <span className="text-text-secondary-light dark:text-gray-500 text-xs">No programada</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(status)} min-w-0`}>
                        {getStatusIcon(status)}
                        <span className="hidden sm:inline truncate">{status}</span>
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 min-w-0">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 sm:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[36px] sm:min-h-[40px] md:min-h-[44px] min-w-[36px] sm:min-w-[40px] md:min-w-[44px] flex items-center justify-center flex-shrink-0"
                          title="Editar viaje"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(id)}
                          className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[36px] sm:min-h-[40px] md:min-h-[44px] min-w-[36px] sm:min-w-[40px] md:min-w-[44px] flex items-center justify-center flex-shrink-0"
                          title="Eliminar viaje"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-6 sm:p-8 md:p-10 text-center text-text-secondary-light dark:text-gray-400 min-w-0">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary-light dark:text-gray-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base">No hay viajes registrados</span>
                    {filtroRuta || filtroEstado !== "all" ? (
                      <button
                        onClick={() => {
                          setFiltroRuta("");
                          setFiltroEstado("all");
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs sm:text-sm underline"
                      >
                        Limpiar filtros
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-background-light dark:bg-slate-900 p-4 sm:p-5 md:p-6 rounded-xl shadow-lg w-full max-w-2xl relative max-h-[90vh] sm:max-h-[95vh] overflow-y-auto text-text-primary-light dark:text-gray-100 min-w-0">
            <div className="flex justify-between items-center mb-4 sm:mb-6 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold truncate min-w-0">
                {editId ? t('schedules.form.edit') : t('schedules.form.create')}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-text-secondary-light dark:text-gray-400 hover:text-text-primary-light dark:hover:text-gray-300 p-1 sm:p-2 flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-surface-light dark:bg-red-900 border border-border-light dark:border-red-700 rounded-lg flex items-center gap-2 sm:gap-3 text-red-700 dark:text-red-200 min-w-0">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    {t('schedules.form.vehicle')} *
                  </label>
                  <select
                    name="idVehiculo"
                    value={formData.idVehiculo}
                    onChange={onInput}
                    className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                    required
                  >
                    <option value="">{t('schedules.form.selectVehicle')}</option>
                    {vehiculos.map((v) => (
                      <option key={getField(v, ["idVehiculo", "id"])} value={getField(v, ["idVehiculo", "id"])}>
                        {getField(v, ["placaVehiculo", "plaVehiculo", "placa"]) || getField(v, ["numVehiculo"])}
                        {getField(v, ["modeloVehiculo"]) ? ` - ${getField(v, ["modeloVehiculo"])}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    {t('schedules.form.driver')} *
                  </label>
                  <select
                    name="idConductor"
                    value={formData.idConductor}
                    onChange={onInput}
                    className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                    required
                  >
                    <option value="">{t('schedules.form.selectDriver')}</option>
                    {conductores.map((c) => (
                      <option key={getField(c, ["idConductor", "id"])} value={getField(c, ["idConductor", "id"])}>
                        {(getField(c, ["nomUsuario", "nomConductor", "nom"]) || "")} {(getField(c, ["apeUsuario", "apeConductor", "ape"]) || "")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                  {t('schedules.form.route')} *
                </label>
                <select
                  name="idRuta"
                  value={formData.idRuta}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                  required
                >
                  <option value="">{t('schedules.form.selectRoute')}</option>
                  {rutas.map((r) => (
                    <option key={getField(r, ["idRuta", "id"])} value={getField(r, ["idRuta", "id"])}>
                      {getField(r, ["nomRuta", "nombreRuta"])}
                      {getField(r, ["oriRuta"]) ? ` — ${getField(r, ["oriRuta"])} → ${getField(r, ["desRuta"])}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    {t('schedules.form.departureTime')} *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecHorSalViaje"
                    value={formData.fecHorSalViaje}
                    onChange={onInput}
                    className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                    {t('schedules.form.arrivalTime')}
                  </label>
                  <input
                    type="datetime-local"
                    name="fecHorLleViaje"
                    value={formData.fecHorLleViaje}
                    onChange={onInput}
                    className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                  {t('schedules.form.status')}
                </label>
                <select
                  name="estViaje"
                  value={formData.estViaje}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                >
                  <option value="PROGRAMADO">PROGRAMADO</option>
                  <option value="EN_CURSO">EN_CURSO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1 sm:mb-2">
                  {t('schedules.form.observations')}
                </label>
                <textarea
                  name="obsViaje"
                  value={formData.obsViaje}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Observaciones adicionales..."
                  rows="3"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-border-light dark:border-gray-700 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-medium text-text-primary-light dark:text-gray-200 bg-surface-light dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
                >
                  {t('schedules.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] text-xs sm:text-sm md:text-base font-medium"
                >
                  {submitting && <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
                  {editId ? t('schedules.form.save') : t('schedules.form.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Horarios;