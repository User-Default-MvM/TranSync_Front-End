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
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm m-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
          <span className="text-lg text-gray-600 dark:text-gray-300">{t('schedules.messages.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-light dark:bg-gray-900 p-4 lg:p-6 text-text-primary-light dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl lg:text-2xl font-semibold flex items-center gap-2 text-text-primary-light dark:text-gray-100">
          <Clock className="text-indigo-600 w-6 h-6 lg:w-7 lg:h-7" />
          {t('schedules.title')}
          <span className="text-sm lg:text-base font-normal text-text-secondary-light dark:text-gray-400 ml-2">
            ({filtered.length} viajes)
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-surface-light dark:bg-gray-700 text-text-primary-light dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('schedules.form.save')}</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('schedules.form.create')}</span>
            <span className="sm:hidden">{t('schedules.form.create')}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-surface-light dark:bg-red-900 border border-border-light dark:border-red-700 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-surface-light dark:bg-green-900 border border-border-light dark:border-green-700 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-200">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex items-center bg-surface-light dark:bg-gray-800 border border-border-light dark:border-gray-700 rounded-lg px-3 py-2 flex-grow min-h-[44px]">
          <Search className="w-5 h-5 text-text-secondary-light dark:text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder={t('schedules.filters.route')}
            className="border-none bg-transparent w-full text-sm text-text-primary-light dark:text-gray-200 outline-none"
            value={filtroRuta}
            onChange={(e) => setFiltroRuta(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-h-[44px]">
          <Filter className="w-5 h-5 text-text-secondary-light dark:text-gray-400" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-border-light dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 min-w-32 min-h-[44px]"
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
      <div className="block md:hidden space-y-4 mb-6">
        {filtered.length ? (
          filtered.map((v, i) => {
            const id = getField(v, ["idViaje", "id_viaje", "id"]);
            const status = getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO";
            const salida = getField(v, ["fecHorSalViaje", "fec_hor_sal_viaje", "fecSal"]) || "";
            const llegada = getField(v, ["fecHorLleViaje", "fec_hor_lle_viaje", "fecLle"]) || "";

            return (
              <div key={id || i} className="bg-background-light dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-gray-700 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary-light dark:text-gray-100 text-sm truncate">
                      {getRutaLabel(v)}
                    </h3>
                    <p className="text-xs text-text-secondary-light dark:text-gray-400 mt-1">
                      {getConductorLabel(v)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(status)} ml-2 flex-shrink-0`}>
                    {getStatusIcon(status)}
                    <span>{status}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary-light dark:text-gray-400">Vehículo:</span>
                    <span className="text-sm text-text-primary-light dark:text-gray-100">{getVehicleLabel(v)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary-light dark:text-gray-400">Salida:</span>
                    <span className="text-sm text-text-primary-light dark:text-gray-100">{parseDateForDisplay(salida)}</span>
                  </div>
                  {llegada && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary-light dark:text-gray-400">Llegada:</span>
                      <span className="text-sm text-text-primary-light dark:text-gray-100">{parseDateForDisplay(llegada)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border-light dark:border-gray-700">
                  <button
                    onClick={() => openEdit(v)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Editar viaje"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Eliminar viaje"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-text-secondary-light dark:text-gray-600 mx-auto mb-4" />
            <p className="text-text-secondary-light dark:text-gray-400 mb-2">No hay viajes registrados</p>
            {filtroRuta || filtroEstado !== "all" ? (
              <button
                onClick={() => {
                  setFiltroRuta("");
                  setFiltroEstado("all");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm underline"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border-light dark:border-gray-700 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-light dark:bg-gray-800">
              <th className="p-3 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-32">Ruta</th>
              <th className="p-3 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-32 hidden sm:table-cell">Conductor</th>
              <th className="p-3 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-32 hidden md:table-cell">Vehículo</th>
              <th className="p-3 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-40">Salida</th>
              <th className="p-3 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-40 hidden lg:table-cell">Llegada</th>
              <th className="p-3 text-left font-medium text-text-primary-light dark:text-gray-300 min-w-28">Estado</th>
              <th className="p-3 text-center font-medium text-text-primary-light dark:text-gray-300 w-24">Acciones</th>
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
                  <tr key={id || i} className={i % 2 === 0 ? "bg-background-light dark:bg-slate-900 hover:bg-surface-light dark:hover:bg-gray-800" : "bg-surface-light dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-gray-700"}>
                    <td className="p-3">
                      <div className="font-medium text-text-primary-light dark:text-gray-100">{getRutaLabel(v)}</div>
                      <div className="sm:hidden text-xs text-text-secondary-light dark:text-gray-400 mt-1">
                        {getConductorLabel(v)} • {getVehicleLabel(v)}
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">{getConductorLabel(v)}</td>
                    <td className="p-3 hidden md:table-cell">{getVehicleLabel(v)}</td>
                    <td className="p-3">
                      <div className="text-text-primary-light dark:text-gray-100">{parseDateForDisplay(salida)}</div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {llegada ? (
                        <div className="text-text-primary-light dark:text-gray-100">{parseDateForDisplay(llegada)}</div>
                      ) : (
                        <span className="text-text-secondary-light dark:text-gray-500 text-xs">No programada</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(status)}`}>
                        {getStatusIcon(status)}
                        <span className="hidden sm:inline">{status}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Editar viaje"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Eliminar viaje"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-text-secondary-light dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-text-secondary-light dark:text-gray-600" />
                    <span>No hay viajes registrados</span>
                    {filtroRuta || filtroEstado !== "all" ? (
                      <button
                        onClick={() => {
                          setFiltroRuta("");
                          setFiltroEstado("all");
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-light dark:bg-slate-900 p-6 rounded-xl shadow-lg w-full max-w-lg relative max-h-full overflow-y-auto text-text-primary-light dark:text-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editId ? t('schedules.form.edit') : t('schedules.form.create')}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-text-secondary-light dark:text-gray-400 hover:text-text-primary-light dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-surface-light dark:bg-red-900 border border-border-light dark:border-red-700 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1">
                  {t('schedules.form.vehicle')} *
                </label>
                <select
                  name="idVehiculo"
                  value={formData.idVehiculo}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1">
                  {t('schedules.form.driver')} *
                </label>
                <select
                  name="idConductor"
                  value={formData.idConductor}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1">
                  {t('schedules.form.route')} *
                </label>
                <select
                  name="idRuta"
                  value={formData.idRuta}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1">
                    {t('schedules.form.departureTime')} *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecHorSalViaje"
                    value={formData.fecHorSalViaje}
                    onChange={onInput}
                    className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1">
                    {t('schedules.form.arrivalTime')}
                  </label>
                  <input
                    type="datetime-local"
                    name="fecHorLleViaje"
                    value={formData.fecHorLleViaje}
                    onChange={onInput}
                    className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1">
                  {t('schedules.form.status')}
                </label>
                <select
                  name="estViaje"
                  value={formData.estViaje}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PROGRAMADO">PROGRAMADO</option>
                  <option value="EN_CURSO">EN_CURSO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-gray-300 mb-1">
                  {t('schedules.form.observations')}
                </label>
                <textarea
                  name="obsViaje"
                  value={formData.obsViaje}
                  onChange={onInput}
                  className="w-full border border-border-light dark:border-gray-700 rounded-lg p-2 text-sm bg-surface-light dark:bg-gray-800 text-text-primary-light dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Observaciones adicionales..."
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-text-primary-light dark:text-gray-200 bg-surface-light dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('schedules.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
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