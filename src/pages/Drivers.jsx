// src/pages/Drivers.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, Filter, Phone, Calendar } from "lucide-react";
import driversAPI from "../utilidades/driversAPI";
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ title, value, colorClass = 'text-white', theme }) => (
    <div className={`p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg min-h-[70px] sm:min-h-[80px] md:min-h-[90px] lg:min-h-[100px] flex flex-col justify-center min-w-0 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
        <h3 className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold ${colorClass} truncate min-w-0`}>{value}</h3>
        <p className={`text-xs sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-1 md:mt-2 truncate min-w-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>{title}</p>
    </div>
);

const InputField = ({ label, theme, ...props }) => (
    <div className="flex flex-col min-w-0">
        <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate ${theme === 'dark' ? 'text-gray-300' : 'text-text-primary-light'}`}>{label}</label>
        <input {...props} className={`w-full p-2 sm:p-3 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] sm:min-h-[44px] text-sm sm:text-base ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-surface-light text-text-primary-light border-border-light'}`} />
    </div>
);

const SelectField = ({ label, options, theme, ...props }) => (
    <div className="flex flex-col min-w-0 flex-shrink-0">
        <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 md:mb-2 truncate min-w-0 ${theme === 'dark' ? 'text-gray-300' : 'text-text-primary-light'}`}>{label}</label>
        <select {...props} className={`w-full p-2 sm:p-2.5 md:p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] text-sm sm:text-base cursor-pointer appearance-none ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-surface-light text-text-primary-light border-border-light'}`}>
            {options.map(opt =>
                typeof opt === 'object'
                ? <option key={opt.value} value={opt.value}>{opt.label}</option>
                : <option key={opt} value={opt}>{opt === '' ? 'Todos' : opt.replace(/_/g, ' ')}</option>
            )}
        </select>
    </div>
);

const DriverForm = ({ initialData, onSave, onCancel, theme }) => {
    const [formData, setFormData] = useState(initialData);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className={`p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 md:space-y-5 text-left min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 min-w-0">
                <InputField label="Nombre" name="nomUsuario" value={formData.nomUsuario} onChange={handleChange} required theme={theme} />
                <InputField label="Apellido" name="apeUsuario" value={formData.apeUsuario} onChange={handleChange} required theme={theme} />
                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required theme={theme} />
                <InputField label="Documento" name="numDocUsuario" value={formData.numDocUsuario} onChange={handleChange} required theme={theme} />
                <InputField label="Teléfono" name="telUsuario" value={formData.telUsuario} onChange={handleChange} theme={theme} />
                <InputField label="Vencimiento Licencia" name="fecVenLicConductor" value={formData.fecVenLicConductor} onChange={handleChange} type="date" required theme={theme} />
                <SelectField label="Tipo Licencia" name="tipLicConductor" value={formData.tipLicConductor} onChange={handleChange} options={['B1', 'B2', 'B3', 'C1', 'C2', 'C3']} theme={theme} />
                {initialData.idConductor && (
                    <SelectField label="Estado" name="estConductor" value={formData.estConductor} onChange={handleChange} options={['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES']} theme={theme} />
                )}
            </div>
            <div className={`flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 md:pt-5 border-t mt-3 sm:mt-4 min-w-0 flex-shrink-0 ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                <button type="button" onClick={onCancel} className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 border rounded-lg text-sm sm:text-base font-medium min-h-[44px] sm:min-h-[48px] md:min-h-[52px] min-w-0 flex-shrink-0 transition-all duration-200 ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-border-light hover:bg-background-light text-text-primary-light'}`}>Cancelar</button>
                <button type="submit" className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base font-medium min-h-[44px] sm:min-h-[48px] md:min-h-[52px] min-w-0 flex-shrink-0 transition-all duration-200">Guardar</button>
            </div>
        </form>
    );
};

const getStatusStyles = (status) => {
    const styles = {
        ACTIVO: 'bg-green-800 text-green-300',
        INACTIVO: 'bg-red-800 text-red-300',
        DIA_DESCANSO: 'bg-blue-800 text-blue-300',
        INCAPACITADO: 'bg-yellow-800 text-yellow-300',
        DE_VACACIONES: 'bg-purple-800 text-purple-300',
    };
    return styles[status] || 'bg-gray-700 text-gray-300';
};


// --- COMPONENTE PRINCIPAL ---
const Drivers = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState({ type: null, data: null });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ estConductor: '', tipLicConductor: '', conVehiculo: '' });

    const loadDrivers = useCallback(async () => {
        setLoading(true);
        try {
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
            const data = await driversAPI.getAll(activeFilters);
            console.log('Drivers data received:', data);
            console.log('Drivers data length:', data?.length);
            setDrivers(data || []);
        } catch (err) {
            console.error('Error loading drivers:', err);
            toast.error("Error al cargar los conductores.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { loadDrivers(); }, [loadDrivers]);

    const stats = useMemo(() => {
        const total = drivers.length;
        const activos = drivers.filter(c => c.estConductor === 'ACTIVO').length;
        const conVehiculo = drivers.filter(c => c.plaVehiculo).length;
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        
        const licenciaPorVencer = drivers.filter(c => {
            const vencimiento = new Date(c.fecVenLicConductor);
            return vencimiento > today && vencimiento <= next30Days;
        }).length;

        const licenciaVencida = drivers.filter(c => new Date(c.fecVenLicConductor) < today).length;
        const inactivos = drivers.filter(c => c.estConductor === 'INACTIVO').length;

        return { total, activos, conVehiculo, licenciaPorVencer, licenciaVencida, inactivos };
    }, [drivers]);

    const filteredDrivers = useMemo(() => drivers.filter(driver =>
        `${driver.nomUsuario} ${driver.apeUsuario}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.numDocUsuario?.includes(searchTerm)
    ), [drivers, searchTerm]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const handleSave = (formData) => {
        const isCreating = modal.type === 'create';
        const apiCall = isCreating ? driversAPI.create(formData) : driversAPI.update(modal.data.idConductor, formData);
        
        const promise = apiCall.then(() => {
            setModal({ type: null, data: null });
            loadDrivers();
        }).catch(error => {
            console.error("Error al guardar:", error);
            throw error;
        });

        toast.promise(promise, {
            loading: `${isCreating ? 'Creando' : 'Actualizando'} conductor...`,
            success: `Conductor ${isCreating ? 'creado' : 'actualizado'}.`,
            error: (err) => `Error: ${err.message || 'No se pudo completar la operación.'}`,
        });
    };

    const handleDelete = (driver) => {
        toast((t) => (
            <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <p>¿Eliminar a <strong>{driver.nomUsuario}</strong>?</p>
                <div className="flex gap-2 mt-2">
                    <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => {
                        toast.dismiss(t.id);
                        const promise = driversAPI.delete(driver.idConductor).then(() => loadDrivers());
                        toast.promise(promise, { loading: 'Eliminando...', success: 'Conductor eliminado.', error: 'No se pudo eliminar.' });
                    }}>Eliminar</button>
                    <button className={`${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'} px-3 py-1 rounded`} onClick={() => toast.dismiss(t.id)}>Cancelar</button>
                </div>
            </div>
        ));
    };

    if (loading) return <div className={`p-8 min-h-full text-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-surface-light text-text-primary-light'}`}>Cargando...</div>;

    return (
        <div className={`p-3 sm:p-4 md:p-6 lg:p-8 min-h-full ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-surface-light text-text-primary-light'}`}>
            <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'} min-w-0 flex-shrink-0`} data-tutorial="drivers">
                <span className="truncate">{t('drivers.title')}</span>
            </h1>

            {/* === BLOQUE DE TARJETAS AÑADIDO === */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 my-4 sm:my-5 md:my-6 min-w-0">
                <StatCard title={t('drivers.stats.total')} value={stats.total} theme={theme} />
                <StatCard title={t('drivers.stats.active')} value={stats.activos} colorClass="text-green-400" theme={theme} />
                <StatCard title={t('drivers.stats.withVehicle')} value={stats.conVehiculo} colorClass="text-blue-400" theme={theme} />
                <StatCard title={t('drivers.stats.licenseExpiring')} value={stats.licenciaPorVencer} colorClass="text-yellow-400" theme={theme} />
                <StatCard title={t('drivers.stats.licenseExpired')} value={stats.licenciaVencida} colorClass="text-red-400" theme={theme} />
                <StatCard title={t('drivers.stats.inactive')} value={stats.inactivos} theme={theme} />
            </div>

            <div className={`p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg min-w-0 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <div className="relative w-full sm:w-auto sm:flex-1 min-w-0">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-gray-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"/>
                        <input type="text" placeholder={t('drivers.search.placeholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg border min-h-[44px] sm:min-h-[48px] md:min-h-[52px] text-sm sm:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-surface-light border-border-light text-text-primary-light'}`}/>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0 flex-shrink-0">
                        <button onClick={() => setShowFilters(!showFilters)} className={`px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-lg flex items-center gap-2 min-h-[44px] sm:min-h-[48px] md:min-h-[52px] text-sm sm:text-base font-medium transition-all duration-200 min-w-0 flex-shrink-0 ${showFilters ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-surface-light hover:bg-background-light text-text-primary-light'}`}>
                            <Filter size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" /> <span className="truncate">{t('drivers.search.filters')}</span>
                        </button>
                        <button onClick={() => setModal({ type: 'create', data: { nomUsuario: '', apeUsuario: '', email: '', numDocUsuario: '', telUsuario: '', tipLicConductor: 'B1', fecVenLicConductor: '' }})} className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-lg flex items-center gap-2 min-h-[44px] sm:min-h-[48px] md:min-h-[52px] text-white text-sm sm:text-base font-medium transition-all duration-200 min-w-0 flex-shrink-0">
                            <Plus size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" /> <span className="truncate">{t('drivers.search.newDriver')}</span>
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t min-w-0 flex-shrink-0 ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                        <SelectField label="Estado" name="estConductor" value={filters.estConductor} onChange={handleFilterChange} options={['', 'ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES']} theme={theme} />
                        <SelectField label="Tipo de licencia" name="tipLicConductor" value={filters.tipLicConductor} onChange={handleFilterChange} options={['', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']} theme={theme} />
                        <SelectField label="Asignación de vehículo" name="conVehiculo" value={filters.conVehiculo} onChange={handleFilterChange} options={[{value:'', label:'Todos'}, {value:'true', label:'Con vehículo'}, {value:'false', label:'Sin vehículo'}]} theme={theme} />
                    </div>
                )}
            </div>

            {modal.type && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-2 sm:p-4 md:p-6">
                    <div className={`rounded-lg w-full max-w-2xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto border min-w-0 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-background-light border-border-light'}`}>
                        <h2 className={`text-lg sm:text-xl font-bold p-4 sm:p-5 md:p-6 border-b min-w-0 flex-shrink-0 ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-border-light text-text-primary-light'}`}>{modal.type === 'create' ? 'Crear' : 'Editar'} Conductor</h2>
                        <DriverForm initialData={modal.data} onSave={handleSave} onCancel={() => setModal({ type: null, data: null })} theme={theme}/>
                    </div>
                </div>
            )}

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3 sm:space-y-4 mt-4 sm:mt-5 md:mt-6 min-w-0 flex-shrink-0">
                {loading ? (
                    <div className="text-center py-8 sm:py-10 md:py-12 min-w-0 flex-shrink-0">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4 flex-shrink-0"></div>
                        <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Cargando conductores...</p>
                    </div>
                ) : filteredDrivers.length ? (
                    filteredDrivers.map(driver => (
                        <div key={driver.idConductor} className={`rounded-xl shadow-sm border p-3 sm:p-4 md:p-5 min-w-0 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-background-light border-border-light'}`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-2 sm:gap-3 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm sm:text-base truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>
                                        {driver.nomUsuario} {driver.apeUsuario}
                                    </h3>
                                    <p className={`text-xs sm:text-sm mt-1 truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>
                                        {driver.numDocUsuario}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ml-0 sm:ml-2 flex-shrink-0 min-w-0 ${getStatusStyles(driver.estConductor)}`}>
                                    <span className="truncate">{driver.estConductor.replace('_', ' ')}</span>
                                </span>
                            </div>

                            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 min-w-0">
                                <div className="flex justify-between items-center min-w-0">
                                    <span className={`text-xs sm:text-sm min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Licencia:</span>
                                    <span className={`text-xs sm:text-sm truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{driver.tipLicConductor}</span>
                                </div>
                                <div className="flex justify-between items-center min-w-0">
                                    <span className={`text-xs sm:text-sm min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Vence:</span>
                                    <span className={`text-xs sm:text-sm truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{formatDate(driver.fecVenLicConductor)}</span>
                                </div>
                                <div className="flex justify-between items-center min-w-0">
                                    <span className={`text-xs sm:text-sm min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Vehículo:</span>
                                    <span className={`text-xs sm:text-sm truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{driver.plaVehiculo || 'Sin asignar'}</span>
                                </div>
                                {driver.telUsuario && (
                                    <div className="flex justify-between items-center min-w-0">
                                        <span className={`text-xs sm:text-sm min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Teléfono:</span>
                                        <a href={`tel:${driver.telUsuario}`} className="text-xs sm:text-sm text-blue-400 hover:underline truncate min-w-0 flex-shrink-0">
                                            {driver.telUsuario}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className={`flex justify-end gap-2 sm:gap-3 pt-2 sm:pt-3 border-t min-w-0 flex-shrink-0 ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                                <button
                                    onClick={() => setModal({ type: 'edit', data: { ...driver, fecVenLicConductor: driver.fecVenLicConductor.split('T')[0] } })}
                                    className={`p-2 sm:p-2.5 md:p-3 rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] md:min-h-[48px] min-w-[40px] sm:min-w-[44px] md:min-w-[48px] flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-background-light'}`}
                                    title="Editar conductor"
                                >
                                    <Edit size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"/>
                                </button>
                                <button
                                    onClick={() => handleDelete(driver)}
                                    className={`p-2 sm:p-2.5 md:p-3 rounded-lg transition-colors min-h-[40px] sm:min-h-[44px] md:min-h-[48px] min-w-[40px] sm:min-w-[44px] md:min-w-[48px] flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-background-light'}`}
                                    title="Eliminar conductor"
                                >
                                    <Trash2 size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"/>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 sm:py-10 md:py-12 min-w-0 flex-shrink-0">
                        <div className={`text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>👥</div>
                        <p className={`mb-2 text-sm sm:text-base md:text-lg min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>No se encontraron conductores</p>
                        {searchTerm && (
                            <p className={`text-xs sm:text-sm md:text-base min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-text-secondary-light'}`}>
                                Intenta con otros términos de búsqueda
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className={`hidden md:block overflow-x-auto rounded-lg mt-4 sm:mt-5 md:mt-6 min-w-0 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
                <table className="w-full text-left text-xs sm:text-sm md:text-base min-w-0">
                    <thead>
                        <tr className={`border-b min-w-0 flex-shrink-0 ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-border-light text-text-primary-light'}`}>
                            <th className="p-3 sm:p-4 md:p-5 font-semibold min-w-0 flex-shrink-0">Nombre</th>
                            <th className="p-3 sm:p-4 md:p-5 font-semibold min-w-0 flex-shrink-0 hidden sm:table-cell">Documento</th>
                            <th className="p-3 sm:p-4 md:p-5 font-semibold min-w-0 flex-shrink-0 hidden md:table-cell">Licencia</th>
                            <th className="p-3 sm:p-4 md:p-5 font-semibold min-w-0 flex-shrink-0 hidden lg:table-cell">Contacto</th>
                            <th className="p-3 sm:p-4 md:p-5 font-semibold min-w-0 flex-shrink-0">Estado</th>
                            <th className="p-3 sm:p-4 md:p-5 font-semibold min-w-0 flex-shrink-0 hidden xl:table-cell">Vehículo</th>
                            <th className="p-3 sm:p-4 md:p-5 font-semibold text-center min-w-0 flex-shrink-0">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="7" className={`text-center p-6 sm:p-8 md:p-10 min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Cargando...</td></tr>}
                        {!loading && filteredDrivers.map(driver => (
                            <tr key={driver.idConductor} className={`border-b min-w-0 flex-shrink-0 ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-border-light hover:bg-background-light'}`}>
                                <td className={`p-3 sm:p-4 md:p-5 min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>
                                    <div className="font-medium truncate min-w-0 flex-shrink-0">{driver.nomUsuario} {driver.apeUsuario}</div>
                                    <div className="sm:hidden text-xs truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}">
                                        {driver.numDocUsuario + ' • ' + driver.tipLicConductor}
                                    </div>
                                </td>
                                <td className={`p-3 sm:p-4 md:p-5 min-w-0 flex-shrink-0 hidden sm:table-cell ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>
                                    <span className="truncate min-w-0 flex-shrink-0">{driver.numDocUsuario}</span>
                                </td>
                                <td className="p-3 sm:p-4 md:p-5 min-w-0 flex-shrink-0 hidden md:table-cell">
                                    <div className={`font-medium truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{driver.tipLicConductor}</div>
                                    <div className={`text-xs flex items-center gap-1 mt-1 truncate min-w-0 flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-text-secondary-light'}`}>
                                        <Calendar size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span className="truncate">Vence: {formatDate(driver.fecVenLicConductor)}</span>
                                    </div>
                                </td>
                                <td className="p-3 sm:p-4 md:p-5 min-w-0 flex-shrink-0 hidden lg:table-cell">
                                    <a href={`tel:${driver.telUsuario}`} className="flex items-center gap-2 text-blue-400 hover:underline truncate min-w-0 flex-shrink-0">
                                        <Phone size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span className="truncate">{driver.telUsuario || 'N/A'}</span>
                                    </a>
                                </td>
                                <td className="p-3 sm:p-4 md:p-5 min-w-0 flex-shrink-0">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold truncate min-w-0 flex-shrink-0 ${getStatusStyles(driver.estConductor)}`}>
                                        <span className="truncate">{driver.estConductor.replace('_', ' ')}</span>
                                    </span>
                                </td>
                                <td className={`p-3 sm:p-4 md:p-5 min-w-0 flex-shrink-0 hidden xl:table-cell ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>
                                    <span className="truncate min-w-0 flex-shrink-0">{driver.plaVehiculo || 'Sin asignar'}</span>
                                </td>
                                <td className="p-3 sm:p-4 md:p-5 text-center min-w-0 flex-shrink-0">
                                    <div className="flex justify-center gap-1 sm:gap-2 min-w-0 flex-shrink-0">
                                        <button
                                            onClick={() => setModal({ type: 'edit', data: { ...driver, fecVenLicConductor: driver.fecVenLicConductor.split('T')[0] } })}
                                            className={`p-2 sm:p-2.5 md:p-3 rounded-lg min-h-[36px] sm:min-h-[40px] md:min-h-[44px] min-w-[36px] sm:min-w-[40px] md:min-w-[44px] flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-background-light'}`}
                                            title="Editar conductor"
                                        >
                                            <Edit size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"/>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(driver)}
                                            className={`p-2 sm:p-2.5 md:p-3 rounded-lg min-h-[36px] sm:min-h-[40px] md:min-h-[44px] min-w-[36px] sm:min-w-[40px] md:min-w-[44px] flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-background-light'}`}
                                            title="Eliminar conductor"
                                        >
                                            <Trash2 size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Drivers;