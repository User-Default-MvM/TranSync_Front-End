// src/pages/Drivers.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, Filter, Phone, Calendar } from "lucide-react";
import driversAPI from "../utilidades/driversAPI";
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ title, value, colorClass = 'text-white', theme }) => (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
        <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>{title}</p>
    </div>
);

const InputField = ({ label, theme, ...props }) => (
    <div>
        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-text-primary-light'}`}>{label}</label>
        <input {...props} className={`w-full p-2 rounded-md border focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-surface-light text-text-primary-light border-border-light'}`} />
    </div>
);

const SelectField = ({ label, options, theme, ...props }) => (
    <div>
        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-text-primary-light'}`}>{label}</label>
        <select {...props} className={`w-full p-2 rounded-md border focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-surface-light text-text-primary-light border-border-light'}`}>
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
        <form onSubmit={handleSubmit} className={`p-6 space-y-4 text-left ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className={`flex justify-end gap-3 pt-4 border-t mt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                <button type="button" onClick={onCancel} className={`px-4 py-2 border rounded-lg ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-border-light hover:bg-background-light text-text-primary-light'}`}>Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
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
        <div className={`p-4 md:p-8 min-h-full ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-surface-light text-text-primary-light'}`}>
            <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`} data-tutorial="drivers">{t('drivers.title')}</h1>

            {/* === BLOQUE DE TARJETAS AÑADIDO === */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-6">
                <StatCard title={t('drivers.stats.total')} value={stats.total} theme={theme} />
                <StatCard title={t('drivers.stats.active')} value={stats.activos} colorClass="text-green-400" theme={theme} />
                <StatCard title={t('drivers.stats.withVehicle')} value={stats.conVehiculo} colorClass="text-blue-400" theme={theme} />
                <StatCard title={t('drivers.stats.licenseExpiring')} value={stats.licenciaPorVencer} colorClass="text-yellow-400" theme={theme} />
                <StatCard title={t('drivers.stats.licenseExpired')} value={stats.licenciaVencida} colorClass="text-red-400" theme={theme} />
                <StatCard title={t('drivers.stats.inactive')} value={stats.inactivos} theme={theme} />
            </div>

            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-gray-400" size={16}/>
                        <input type="text" placeholder={t('drivers.search.placeholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full sm:w-72 pl-10 pr-4 py-2 rounded-lg border min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-surface-light border-border-light text-text-primary-light'}`}/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-lg flex items-center gap-2 min-h-[44px] ${showFilters ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-surface-light hover:bg-background-light text-text-primary-light'}`}>
                            <Filter size={16} /> {t('drivers.search.filters')}
                        </button>
                        <button onClick={() => setModal({ type: 'create', data: { nomUsuario: '', apeUsuario: '', email: '', numDocUsuario: '', telUsuario: '', tipLicConductor: 'B1', fecVenLicConductor: '' }})} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 min-h-[44px] text-white">
                            <Plus size={16} /> {t('drivers.search.newDriver')}
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                        <SelectField label="Estado" name="estConductor" value={filters.estConductor} onChange={handleFilterChange} options={['', 'ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES']} theme={theme} />
                        <SelectField label="Tipo de licencia" name="tipLicConductor" value={filters.tipLicConductor} onChange={handleFilterChange} options={['', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']} theme={theme} />
                        <SelectField label="Asignación de vehículo" name="conVehiculo" value={filters.conVehiculo} onChange={handleFilterChange} options={[{value:'', label:'Todos'}, {value:'true', label:'Con vehículo'}, {value:'false', label:'Sin vehículo'}]} theme={theme} />
                    </div>
                )}
            </div>

            {modal.type && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
                    <div className={`rounded-lg w-full max-w-2xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-background-light border-border-light'}`}>
                        <h2 className={`text-xl font-bold p-6 border-b ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-border-light text-text-primary-light'}`}>{modal.type === 'create' ? 'Crear' : 'Editar'} Conductor</h2>
                        <DriverForm initialData={modal.data} onSave={handleSave} onCancel={() => setModal({ type: null, data: null })} theme={theme}/>
                    </div>
                </div>
            )}

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4 mt-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Cargando conductores...</p>
                    </div>
                ) : filteredDrivers.length ? (
                    filteredDrivers.map(driver => (
                        <div key={driver.idConductor} className={`rounded-xl shadow-sm border p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-background-light border-border-light'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>
                                        {driver.nomUsuario} {driver.apeUsuario}
                                    </h3>
                                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>
                                        {driver.numDocUsuario}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0 ${getStatusStyles(driver.estConductor)}`}>
                                    {driver.estConductor.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Licencia:</span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{driver.tipLicConductor}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Vence:</span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{formatDate(driver.fecVenLicConductor)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Vehículo:</span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{driver.plaVehiculo || 'Sin asignar'}</span>
                                </div>
                                {driver.telUsuario && (
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Teléfono:</span>
                                        <a href={`tel:${driver.telUsuario}`} className="text-sm text-blue-400 hover:underline">
                                            {driver.telUsuario}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className={`flex justify-end gap-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-border-light'}`}>
                                <button
                                    onClick={() => setModal({ type: 'edit', data: { ...driver, fecVenLicConductor: driver.fecVenLicConductor.split('T')[0] } })}
                                    className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-background-light'}`}
                                    title="Editar conductor"
                                >
                                    <Edit size={16}/>
                                </button>
                                <button
                                    onClick={() => handleDelete(driver)}
                                    className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-background-light'}`}
                                    title="Eliminar conductor"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className={`text-4xl mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>👥</div>
                        <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>No se encontraron conductores</p>
                        {searchTerm && (
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-text-secondary-light'}`}>
                                Intenta con otros términos de búsqueda
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className={`hidden md:block overflow-x-auto rounded-lg mt-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background-light'}`}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-border-light text-text-primary-light'}`}>
                            <th className="p-4 font-semibold">Nombre</th>
                            <th className="p-4 font-semibold">Documento</th>
                            <th className="p-4 font-semibold">Licencia</th>
                            <th className="p-4 font-semibold">Contacto</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Vehículo</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="7" className={`text-center p-8 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>Cargando...</td></tr>}
                        {!loading && filteredDrivers.map(driver => (
                            <tr key={driver.idConductor} className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-border-light hover:bg-background-light'}`}>
                                <td className={`p-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{driver.nomUsuario} {driver.apeUsuario}</td>
                                <td className={`p-4 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>{driver.numDocUsuario}</td>
                                <td className="p-4">
                                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-text-primary-light'}`}>{driver.tipLicConductor}</div>
                                    <div className={`text-xs flex items-center gap-1 mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-text-secondary-light'}`}><Calendar size={12} /><span>Vence: {formatDate(driver.fecVenLicConductor)}</span></div>
                                </td>
                                <td className="p-4">
                                    <a href={`tel:${driver.telUsuario}`} className="flex items-center gap-2 text-blue-400 hover:underline"><Phone size={14} />{driver.telUsuario || 'N/A'}</a>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(driver.estConductor)}`}>
                                        {driver.estConductor.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className={`p-4 ${theme === 'dark' ? 'text-gray-400' : 'text-text-secondary-light'}`}>{driver.plaVehiculo || 'Sin asignar'}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => setModal({ type: 'edit', data: { ...driver, fecVenLicConductor: driver.fecVenLicConductor.split('T')[0] }})} className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-background-light'}`}><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(driver)} className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-background-light'}`}><Trash2 size={16}/></button>
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