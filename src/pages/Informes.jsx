import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Calendar, BarChart2, Download, Filter, Printer, Clock, FileText, ChevronDown } from "lucide-react";

const Informes = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [reports] = useState([]);
  
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Implementar la llamada a la API real para generar el informe
      // const response = await api.generateReport(params);
      // Si la generación es exitosa, actualizar la lista de informes
      // await fetchReports();
      
      // Para propósitos de demostración (remover en producción)
      setTimeout(() => {
        setLoading(false);
        alert("Informe generado con éxito");
      }, 300);
    } catch (error) {
      console.error("Error al generar el informe:", error);
      alert("Error al generar el informe");
    } finally {
      // setLoading(false); // Descomentar cuando se implemente la API real
    }
  };
  
  const filteredReports = reports.filter(report => {
    if (activeTab === "general") return true;
    return report.type === activeTab;
  });

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto text-text-primary-light min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 text-text-primary-light min-w-0" data-tutorial="reports">
          <FileText className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
          <span className="leading-tight truncate">{t('reports.title')}</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-text-secondary-light mt-0 leading-relaxed min-w-0">
          <span className="truncate">{t('reports.subtitle')}</span>
        </p>
      </div>

      {/* Mobile Tabs */}
      <div className="block md:hidden mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "general", label: "General" },
            { id: "rutas", label: "Rutas" },
            { id: "vehiculos", label: "Vehículos" },
            { id: "horarios", label: "Horarios" },
            { id: "conductores", label: "Conductores" }
          ].map(tab => (
            <button
              key={tab.id}
              className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 min-h-[44px] flex-1 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-surface-light text-text-secondary-light hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex border-b border-border-light mb-6 gap-1">
        {[
          { id: "general", label: "General" },
          { id: "rutas", label: "Rutas" },
          { id: "vehiculos", label: "Vehículos" },
          { id: "horarios", label: "Horarios" },
          { id: "conductores", label: "Conductores" }
        ].map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-3 bg-transparent border-none border-b-2 text-sm font-medium cursor-pointer transition-all duration-200 ${
              activeTab === tab.id
                ? "text-blue-600 border-blue-600 font-semibold"
                : "text-text-secondary-light border-transparent hover:text-blue-600 hover:bg-surface-light"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel Container */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* Generate Report Panel */}
        <div className="bg-background-light dark:bg-surface-dark rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-surface-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700 flex justify-between items-center min-h-[60px] sm:min-h-[70px]">
            <h2 className="text-sm sm:text-base md:text-lg m-0 font-semibold text-text-primary-light dark:text-gray-100 min-w-0 truncate">Generar nuevo informe</h2>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            <div className="mb-3 sm:mb-4 md:mb-5">
              <label className="block mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm text-text-secondary-light dark:text-gray-300">Tipo de informe</label>
              <div className="relative">
                <select className="w-full py-2.5 sm:py-3 px-3 pr-8 sm:pr-9 border border-border-light dark:border-gray-600 rounded-md text-xs sm:text-sm md:text-base transition-all duration-200 text-text-primary-light dark:text-gray-100 appearance-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(49,130,206,0.15)] focus:outline-none min-h-[44px] sm:min-h-[48px] bg-surface-light dark:bg-gray-700">
                  <option>Ocupación por ruta</option>
                  <option>Puntualidad de servicios</option>
                  <option>Estado de la flota</option>
                  <option>Incidencias reportadas</option>
                  <option>Ganancias por ruta</option>
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-gray-400 pointer-events-none w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-5">
              <div>
                <label className="block mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm text-text-secondary-light dark:text-gray-300">Fecha inicial</label>
                <div className="relative">
                  <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-gray-400 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <input
                    type="date"
                    className="w-full py-2.5 sm:py-3 pl-8 sm:pl-10 pr-3 border border-border-light dark:border-gray-600 rounded-md text-xs sm:text-sm md:text-base transition-all duration-200 text-text-primary-light dark:text-gray-100 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(49,130,206,0.15)] focus:outline-none min-h-[44px] sm:min-h-[48px] bg-surface-light dark:bg-gray-700"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm text-text-secondary-light dark:text-gray-300">Fecha final</label>
                <div className="relative">
                  <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-gray-400 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <input
                    type="date"
                    className="w-full py-2.5 sm:py-3 pl-8 sm:pl-10 pr-3 border border-border-light dark:border-gray-600 rounded-md text-xs sm:text-sm md:text-base transition-all duration-200 text-text-primary-light dark:text-gray-100 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(49,130,206,0.15)] focus:outline-none min-h-[44px] sm:min-h-[48px] bg-surface-light dark:bg-gray-700"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3 sm:mb-4 md:mb-5">
              <label className="block mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm text-text-secondary-light dark:text-gray-300">Formato</label>
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-1.5 sm:mt-2">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[48px]">
                  <input type="radio" name="format" value="pdf" defaultChecked className="m-0 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm text-text-primary-light dark:text-gray-100">PDF</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[48px]">
                  <input type="radio" name="format" value="excel" className="m-0 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm text-text-primary-light dark:text-gray-100">Excel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-[48px]">
                  <input type="radio" name="format" value="csv" className="m-0 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm text-text-primary-light dark:text-gray-100">CSV</span>
                </label>
              </div>
            </div>

            <button
              className={`flex items-center justify-center gap-2 text-white border-none py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 rounded-md font-semibold text-xs sm:text-sm md:text-base cursor-pointer transition-all duration-200 ease-in-out w-full mt-3 sm:mt-4 min-h-[48px] sm:min-h-[52px] ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                  <span className="truncate">Generando...</span>
                </>
              ) : (
                <>
                  <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Generar informe</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Recent Reports Panel */}
        <div className="bg-background-light dark:bg-surface-dark rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-surface-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 min-h-[60px] sm:min-h-[70px]">
            <h2 className="text-sm sm:text-base md:text-lg m-0 font-semibold text-text-primary-light dark:text-gray-100 min-w-0 truncate">Informes recientes</h2>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <button className="flex items-center gap-1.5 sm:gap-2 bg-surface-light dark:bg-gray-700 text-text-secondary-light dark:text-gray-300 border-none py-2 sm:py-2.5 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 min-h-[36px] sm:min-h-[40px]">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Filtrar</span>
              </button>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            {filteredReports.length > 0 ? (
              <div className="divide-y divide-border-light dark:divide-gray-700">
                {filteredReports.map(report => (
                  <div key={report.id} className="p-3 sm:p-4 hover:bg-surface-light dark:hover:bg-gray-800 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h3 className="font-medium text-text-primary-light dark:text-gray-100 text-xs sm:text-sm flex-1 min-w-0">
                        <span className="truncate block">{report.name}</span>
                      </h3>
                      <span className="text-xs text-text-secondary-light dark:text-gray-400 bg-surface-light dark:bg-gray-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                        {report.downloads} descargas
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-gray-400 mb-2 sm:mb-3 truncate">{report.date}</p>
                    <div className="flex gap-2 sm:gap-3">
                      <button className="flex items-center justify-center bg-transparent border border-border-light dark:border-gray-600 rounded p-2 cursor-pointer text-text-secondary-light dark:text-gray-400 transition-all duration-200 hover:bg-surface-light dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300 dark:hover:border-gray-500 min-h-[44px] min-w-[44px] flex-1" title="Descargar">
                        <Download size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="ml-1 text-xs truncate">Descargar</span>
                      </button>
                      <button className="flex items-center justify-center bg-transparent border border-border-light dark:border-gray-600 rounded p-2 cursor-pointer text-text-secondary-light dark:text-gray-400 transition-all duration-200 hover:bg-surface-light dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300 dark:hover:border-gray-500 min-h-[44px] min-w-[44px] flex-1" title="Imprimir">
                        <Printer size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="ml-1 text-xs truncate">Imprimir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 md:py-10 text-text-secondary-light dark:text-gray-400">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-text-secondary-light dark:text-gray-600 mx-auto mb-3 flex-shrink-0" />
                <p className="text-xs sm:text-sm italic">No hay informes disponibles</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm md:text-base min-w-0">
              <thead>
                <tr className="bg-surface-light dark:bg-gray-800">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 bg-surface-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700 text-text-secondary-light dark:text-gray-300 font-semibold min-w-0">Nombre</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 bg-surface-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700 text-text-secondary-light dark:text-gray-300 font-semibold min-w-0">Fecha</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 bg-surface-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700 text-text-secondary-light dark:text-gray-300 font-semibold min-w-0">Descargas</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 bg-surface-light dark:bg-gray-800 border-b border-border-light dark:border-gray-700 text-text-secondary-light dark:text-gray-300 font-semibold min-w-0">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-surface-light dark:hover:bg-gray-800 transition-colors duration-200">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 border-b border-border-light dark:border-gray-700 text-text-primary-light dark:text-gray-100 min-w-0">
                        <span className="truncate block">{report.name}</span>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 border-b border-border-light dark:border-gray-700 text-text-primary-light dark:text-gray-100 min-w-0 truncate">{report.date}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 border-b border-border-light dark:border-gray-700 text-text-primary-light dark:text-gray-100 min-w-0">{report.downloads}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 border-b border-border-light dark:border-gray-700 text-text-primary-light dark:text-gray-100 min-w-0">
                        <div className="flex gap-1 sm:gap-2">
                          <button className="flex items-center justify-center bg-transparent border border-border-light dark:border-gray-600 rounded w-7 h-7 sm:w-8 sm:h-8 cursor-pointer text-text-secondary-light dark:text-gray-400 transition-all duration-200 hover:bg-surface-light dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300 dark:hover:border-gray-500 min-w-[32px] sm:min-w-[36px]" title="Descargar">
                            <Download size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                          </button>
                          <button className="flex items-center justify-center bg-transparent border border-border-light dark:border-gray-600 rounded w-7 h-7 sm:w-8 sm:h-8 cursor-pointer text-text-secondary-light dark:text-gray-400 transition-all duration-200 hover:bg-surface-light dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-300 dark:hover:border-gray-500 min-w-[32px] sm:min-w-[36px]" title="Imprimir">
                            <Printer size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 sm:py-6 md:py-8 text-text-secondary-light dark:text-gray-400 italic text-xs sm:text-sm">
                      No hay informes disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-background-light dark:bg-surface-dark rounded-lg shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5">
            <h3 className="text-sm sm:text-base font-semibold mt-0 mb-3 sm:mb-4 text-text-primary-light dark:text-gray-100 min-w-0">Estadísticas rápidas</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-border-light dark:border-gray-700 min-h-[40px] sm:min-h-[44px]">
                <span className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-300 truncate">Informes generados este mes:</span>
                <span className="font-semibold text-text-primary-light dark:text-gray-100 text-xs sm:text-sm">0</span>
              </div>
              <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-border-light dark:border-gray-700 min-h-[40px] sm:min-h-[44px]">
                <span className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-300 truncate">Ruta más analizada:</span>
                <span className="font-semibold text-text-primary-light dark:text-gray-100 text-xs sm:text-sm truncate">-</span>
              </div>
              <div className="flex justify-between items-center py-1.5 sm:py-2 min-h-[40px] sm:min-h-[44px]">
                <span className="text-xs sm:text-sm text-text-secondary-light dark:text-gray-300 truncate">Descargas totales:</span>
                <span className="font-semibold text-text-primary-light dark:text-gray-100 text-xs sm:text-sm">0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background-light dark:bg-surface-dark rounded-lg shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5">
            <h3 className="text-sm sm:text-base font-semibold mt-0 mb-3 sm:mb-4 text-text-primary-light dark:text-gray-100 min-w-0 truncate">Programar informes</h3>
            <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-text-secondary-light dark:text-gray-300 leading-relaxed min-w-0">Configura informes automáticos periódicos enviados directamente a tu correo.</p>
            <button className="bg-surface-light dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-none py-2.5 sm:py-3 px-3 sm:px-4 rounded font-medium cursor-pointer transition-all duration-200 w-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-700 dark:hover:text-blue-300 min-h-[44px] sm:min-h-[48px] text-xs sm:text-sm">Configurar</button>
          </div>
        </div>

        <div className="bg-background-light dark:bg-surface-dark rounded-lg shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5">
            <h3 className="text-sm sm:text-base font-semibold mt-0 mb-3 sm:mb-4 text-text-primary-light dark:text-gray-100 min-w-0 truncate">Personalizar informes</h3>
            <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-text-secondary-light dark:text-gray-300 leading-relaxed min-w-0">Crea plantillas personalizadas para tus necesidades específicas.</p>
            <button className="bg-surface-light dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-none py-2.5 sm:py-3 px-3 sm:px-4 rounded font-medium cursor-pointer transition-all duration-200 w-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-700 dark:hover:text-blue-300 min-h-[44px] sm:min-h-[48px] text-xs sm:text-sm">Crear plantilla</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informes;