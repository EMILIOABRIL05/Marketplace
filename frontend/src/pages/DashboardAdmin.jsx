// En src/pages/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('user'));
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    const esAdmin = tipoUsuario === 'ADMINISTRADOR';
    
    const [estadisticas, setEstadisticas] = useState({});
    const [actividades, setActividades] = useState([]);
    const [estados, setEstados] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Iniciando carga del dashboard...');
            
            const [estadisticasRes, actividadesRes, estadosRes] = await Promise.all([
                dashboardAPI.getEstadisticas().catch(err => {
                    console.error('Error en estadísticas:', err);
                    throw new Error(`Estadísticas: ${err.message}`);
                }),
                dashboardAPI.getActividadesRecientes().catch(err => {
                    console.error('Error en actividades:', err);
                    throw new Error(`Actividades: ${err.message}`);
                }),
                dashboardAPI.getEstadoPlataforma().catch(err => {
                    console.error('Error en estados:', err);
                    throw new Error(`Estados: ${err.message}`);
                })
            ]);

            console.log('Datos recibidos del backend:');
            console.log('Estadísticas:', estadisticasRes);
            console.log('Actividades:', actividadesRes);
            console.log('Estados:', estadosRes);
            
            setEstadisticas(estadisticasRes);
            setActividades(actividadesRes);
            setEstados(estadosRes);
            
        } catch (error) {
            console.error('Error completo cargando dashboard:', error);
            
            let errorMessage = 'Error al cargar los datos del dashboard';
            
            if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
                errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8080';
            } else if (error.message.includes('401')) {
                errorMessage = 'No autorizado. Verifica que estés autenticado correctamente.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Acceso denegado. No tienes permisos para ver el dashboard.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Endpoint no encontrado. Verifica que las rutas del dashboard estén correctas.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }
            
            setError(errorMessage);
            
            // Establecer datos por defecto para que al menos se vea algo
            setEstadisticas({
                usuariosActivos: 1248,
                usuariosEsteMes: 128,
                productosPublicados: 2456,
                productosEsteMes: 124,
                serviciosPublicados: 1000,
                serviciosEsteMes: 100,
                transaccionesTotales: 892,
                transaccionesEstaSemana: 97,
                tasaExito: 94.0,
                tasaExitoEsteMes: 5.0
            });
            
            setActividades([
                { tipo: "Nueva venta realizada", usuario: "María González", fecha: new Date() },
                { tipo: "Producto publicado", usuario: "Carlos Rodríguez", fecha: new Date() },
                { tipo: "Servicio contratado", usuario: "Ana López", fecha: new Date() },
                { tipo: "Usuario registrado", usuario: "Luis Martínez", fecha: new Date() },
                { tipo: "Valoración recibida", usuario: "Isabel Fernández", fecha: new Date() }
            ]);
            
            setEstados({
                servidor: "En funcionamiento",
                pago: "Activa", 
                notificaciones: "Operativo",
                respuesta: "Óptimo"
            });
        } finally {
            setLoading(false);
        }
    };

    const volverASelector = () => {
        navigate('/selector-modo');
    };

    const irACatalogo = () => {
        navigate('/catalogo');
    };

    const cerrarSesion = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('tipoUsuario');
        navigate('/login');
    };

    // Funciones para los botones
    const gestionarProductos = () => navigate('/gestion-productos');
    const gestionarTransacciones = () => alert('Gestionar Transacciones - Próximamente');
    const gestionarUsuarios = () => navigate('/gestion-usuarios');
    const revisarIncidentes = () => navigate('/gestion-incidencias');
    const revisionIncidentes = () => navigate('/gestion-incidencias');
    const gestionarModeradores = () => navigate('/registrar-moderador');

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="text-center">
                    <div className="text-5xl mb-5 animate-bounce">⏳</div>
                    <h2 className="text-slate-800 text-2xl font-bold mb-2">Cargando Dashboard...</h2>
                    <p className="text-slate-500">Obteniendo datos en tiempo real</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="text-center">
                    <div className="text-5xl mb-5">⚠️</div>
                    <h2 className="text-red-600 text-2xl font-bold mb-2">Error</h2>
                    <p className="text-slate-500 mb-5 max-w-md mx-auto">
                        {error}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={cargarDashboard}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Reintentar
                        </button>
                        <button 
                            onClick={volverASelector}
                            className="bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                        >
                            Volver al Selector
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            
            {/* Sidebar Celeste */}
            <div className="w-[280px] bg-sky-50 text-slate-800 flex flex-col relative z-10 shadow-2xl">
                
                {/* Logo Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-xl text-white shadow-lg shadow-blue-500/30">
                            🛒
                        </div>
                        <div>
                            <h1 className="m-0 text-lg font-bold text-slate-800 tracking-wide">
                                VEYCOFLASH
                            </h1>
                            <span className="text-xs text-slate-500">
                                Panel de {esAdmin ? 'Administración' : 'Moderación'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-6 flex flex-col gap-2">
                    <button 
                        className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm hover:shadow-md"
                    >
                        📊 Dashboard
                    </button>

                    <button 
                        onClick={gestionarProductos}
                        className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
                    >
                        📦 Productos
                    </button>

                    <button 
                        onClick={gestionarUsuarios}
                        className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
                    >
                        👥 Usuarios
                    </button>

                    <button 
                        onClick={revisarIncidentes}
                        className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
                    >
                        ⚠️ Incidentes y Reportes
                    </button>



                    {tipoUsuario === 'ADMINISTRADOR' && (
                        <button 
                            onClick={gestionarModeradores}
                            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
                        >
                            🛡️ Moderadores
                        </button>
                    )}
                </nav>

                {/* Footer con versión y botones */}
                <div className="p-6 border-t border-slate-200 bg-slate-100/50">
                    <button 
                        onClick={volverASelector}
                        className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-white text-slate-600 border border-slate-200 font-medium text-xs mb-2 hover:bg-slate-50 hover:text-slate-800"
                    >
                        🔄 Cambiar Modo
                    </button>

                    <button 
                        onClick={irACatalogo}
                        className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-white text-slate-600 border border-slate-200 font-medium text-xs mb-2 hover:bg-slate-50 hover:text-slate-800"
                    >
                        🛍️ Ir al Catálogo
                    </button>

                    <button 
                        onClick={cerrarSesion}
                        className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 font-medium text-xs mb-4"
                    >
                        🚪 Cerrar Sesión
                    </button>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold relative shadow-lg shadow-blue-600/30">
                            {esAdmin ? 'A' : 'M'}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-800">
                                {esAdmin ? 'Administrador' : 'Moderador'}
                            </div>
                            <div className="text-[10px] text-slate-500">En línea</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="flex-1 p-10 bg-slate-50 overflow-y-auto h-screen">
                
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 text-base">
                        Resumen general y métricas de la plataforma
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Sección Izquierda - Actividades Recientes */}
                    <div className="lg:col-span-2">
                        {/* Grid de Métricas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                            {/* Usuarios Activos */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 relative">
                                <div className="flex justify-between items-start">
                                    <h3 className="m-0 text-slate-500 text-sm font-semibold">
                                        Usuarios Activos
                                    </h3>
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl">
                                        👥
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">
                                        {estadisticas.usuariosActivos || 0}
                                    </div>
                                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                        <span>↑</span> {estadisticas.usuariosEsteMes || 0} este mes
                                    </div>
                                </div>
                            </div>

                            {/* Productos Publicados */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="m-0 text-slate-500 text-sm font-semibold">
                                        Productos
                                    </h3>
                                    <div className="w-10 h-10 bg-cyan-50 text-cyan-500 rounded-xl flex items-center justify-center text-xl">
                                        📦
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">
                                        {estadisticas.productosPublicados || 0}
                                    </div>
                                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                        <span>↑</span> {estadisticas.productosEsteMes || 0} este mes
                                    </div>
                                </div>
                            </div>

                            {/* Servicios Publicados */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="m-0 text-slate-500 text-sm font-semibold">
                                        Servicios
                                    </h3>
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-xl">
                                        🔧
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">
                                        {estadisticas.serviciosPublicados || 0}
                                    </div>
                                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                        <span>↑</span> {estadisticas.serviciosEsteMes || 0} este mes
                                    </div>
                                </div>
                            </div>

                            {/* Transacciones */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="m-0 text-slate-500 text-sm font-semibold">
                                        Transacciones
                                    </h3>
                                    <div className="w-10 h-10 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center text-xl">
                                        🛒
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">
                                        {estadisticas.transaccionesTotales || 0}
                                    </div>
                                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                        <span>↑</span> {estadisticas.transaccionesEstaSemana || 0} esta semana
                                    </div>
                                </div>
                            </div>

                            {/* Tasa de Éxito */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="m-0 text-slate-500 text-sm font-semibold">
                                        Tasa de Éxito
                                    </h3>
                                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xl">
                                        📈
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">
                                        {Math.round(estadisticas.tasaExito || 0)}%
                                    </div>
                                    <div className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                        <span>↑</span> {Math.round(estadisticas.tasaExitoEsteMes || 0)}% este mes
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actividades Recientes */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="m-0 mb-6 text-slate-900 text-lg font-bold">
                                Actividades Recientes
                            </h2>
                            <div className="flex flex-col">
                                {actividades.length > 0 ? (
                                    actividades.map((actividad, index) => (
                                        <div key={index} className={`flex justify-between items-center py-4 ${
                                            index < actividades.length - 1 ? "border-b border-slate-50" : ""
                                        }`}>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg">
                                                    {actividad.tipo && actividad.tipo.includes('Producto') ? '📦' : 
                                                     actividad.tipo && actividad.tipo.includes('Servicio') ? '🔧' : '💰'}
                                                </div>
                                                <div>
                                                    <h4 className="m-0 mb-1 text-slate-900 text-sm font-semibold">
                                                        {actividad.tipo || "Actividad del sistema"}
                                                    </h4>
                                                    <p className="m-0 text-slate-500 text-xs">
                                                        Por: <span className="font-medium text-slate-700">{actividad.usuario || "Usuario desconocido"}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-full">
                                                {actividad.fecha ? new Date(actividad.fecha).toLocaleDateString() : "Fecha no disponible"}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        No hay actividades recientes
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección Derecha - Estado de la Plataforma */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                        <h2 className="m-0 mb-6 text-slate-900 text-lg font-bold">
                            Estado de la Plataforma
                        </h2>
                        
                        <div className="flex flex-col gap-4">
                            {[
                                { label: "Estado del Servidor", value: estados.servidor || "Verificando...", color: "text-emerald-500", bg: "bg-emerald-500", ring: "ring-emerald-100" },
                                { label: "Pasarela de Pago", value: estados.pago || "Verificando...", color: "text-emerald-500", bg: "bg-emerald-500", ring: "ring-emerald-100" },
                                { label: "Sistema de Notificaciones", value: estados.notificaciones || "Verificando...", color: "text-emerald-500", bg: "bg-emerald-500", ring: "ring-emerald-100" },
                                { label: "Tiempo de Respuesta", value: estados.respuesta || "Verificando...", color: "text-amber-500", bg: "bg-amber-500", ring: "ring-amber-100" }
                            ].map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.bg} ring-4 ${item.ring}`}></div>
                                        <span className="text-sm font-semibold text-slate-700">
                                            {item.label}
                                        </span>
                                    </div>
                                    <small className={`text-xs ${item.color} font-bold bg-white px-2 py-1 rounded-md shadow-sm`}>
                                        {item.value}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;