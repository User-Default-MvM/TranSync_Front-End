import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const BreadcrumbNav = ({ items = [], className = "" }) => {
  const location = useLocation();

  // Si no se pasan items, generar automáticamente basados en la ruta actual
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);

    const breadcrumbItems = [
      { label: 'Inicio', href: '/home', icon: <FaHome size={14} /> }
    ];

    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;

      // Mapear rutas conocidas a nombres amigables
      const routeNames = {
        'dashboard': 'Panel de Control',
        'admin': 'Administración',
        'drivers': 'Conductores',
        'rutas': 'Rutas',
        'vehiculos': 'Vehículos',
        'horarios': 'Horarios',
        'informes': 'Informes',
        'emergency': 'Emergencias',
        'login': 'Iniciar Sesión',
        'register': 'Registrarse'
      };

      const label = routeNames[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);

      breadcrumbItems.push({
        label,
        href: currentPath,
        isLast: index === pathnames.length - 1
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6 ${className}`}
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <FaChevronRight
              size={12}
              className="text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          )}

          {item.isLast || index === breadcrumbItems.length - 1 ? (
            <span
              className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2"
              aria-current="page"
            >
              {item.icon && <span className="text-blue-600 dark:text-blue-400">{item.icon}</span>}
              {item.label}
            </span>
          ) : (
            <Link
              to={item.href}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1 py-0.5"
              aria-label={`Ir a ${item.label}`}
            >
              {item.icon && <span className="text-blue-600 dark:text-blue-400">{item.icon}</span>}
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;