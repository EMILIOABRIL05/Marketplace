// En src/pages/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('user'));
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    
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
    const gestionarProductos = () => navigate('/catalogo');
    const gestionarTransacciones = () => alert('Gestionar Transacciones - Próximamente');
    const gestionarUsuarios = () => navigate('/gestion-usuarios');
    const revisarIncidentes = () => navigate('/gestion-incidencias');
    const revisionIncidentes = () => navigate('/gestion-incidencias');
    const gestionarModeradores = () => navigate('/registrar-moderador');

    if (loading) {
        return (
            <div style={{ 
                minHeight: "100vh", 
                background: "#f8f9fa", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontFamily: "Arial, sans-serif" 
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
                    <h2 style={{ color: "#1a202c" }}>Cargando Dashboard...</h2>
                    <p style={{ color: "#718096" }}>Obteniendo datos en tiempo real</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                minHeight: "100vh", 
                background: "#f8f9fa", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontFamily: "Arial, sans-serif" 
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
                    <h2 style={{ color: "#e53e3e" }}>Error</h2>
                    <p style={{ color: "#718096", marginBottom: "20px", maxWidth: "400px" }}>
                        {error}
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button 
                            onClick={cargarDashboard}
                            style={{
                                background: "#2d5bff",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "500"
                            }}
                        >
                            Reintentar
                        </button>
                        <button 
                            onClick={volverASelector}
                            style={{
                                background: "#e2e8f0",
                                color: "#4a5568",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "500"
                            }}
                        >
                            Volver al Selector
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", fontFamily: "Arial, sans-serif" }}>
            
            {/* Sidebar Azul */}
            <div style={{
                width: "235px",
                background: "#2d5bff",
                color: "white",
                padding: "0",
                display: "flex",
                flexDirection: "column",
                position: "relative"
            }}>
                
                {/* Logo Header */}
                <div style={{
                    padding: "25px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        <div style={{
                            width: "36px",
                            height: "36px",
                            background: "white",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px"
                        }}>
                            🛒
                        </div>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "white",
                                letterSpacing: "0.5px"
                            }}>
                                VEYCOFLASH
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav style={{ flex: 1, padding: "15px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button 
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                color: "white",
                                border: "none",
                                padding: "12px 20px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                transition: "all 0.2s ease"
                            }}
                        >
                            📊 Dashboard
                        </button>

                        <button 
                            onClick={gestionarProductos}
                            style={{
                                background: "transparent",
                                color: "rgba(255,255,255,0.85)",
                                border: "none",
                                padding: "12px 20px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "rgba(255,255,255,0.08)";
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "rgba(255,255,255,0.85)";
                            }}
                        >
                            📦 Productos
                        </button>

                        <button 
                            onClick={gestionarUsuarios}
                            style={{
                                background: "transparent",
                                color: "rgba(255,255,255,0.85)",
                                border: "none",
                                padding: "12px 20px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "rgba(255,255,255,0.08)";
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "rgba(255,255,255,0.85)";
                            }}
                        >
                            👥 Usuarios
                        </button>

                        <button 
                            onClick={revisarIncidentes}
                            style={{
                                background: "transparent",
                                color: "rgba(255,255,255,0.85)",
                                border: "none",
                                padding: "12px 20px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "rgba(255,255,255,0.08)";
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "rgba(255,255,255,0.85)";
                            }}
                        >
                            ⚠️ Incidentes y Reportes
                        </button>

                        <button 
                            onClick={revisionIncidentes}
                            style={{
                                background: "transparent",
                                color: "rgba(255,255,255,0.85)",
                                border: "none",
                                padding: "12px 20px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "rgba(255,255,255,0.08)";
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "rgba(255,255,255,0.85)";
                            }}
                        >
                            ✅ Revisión de Incidentes
                        </button>

                        {tipoUsuario === 'ADMINISTRADOR' && (
                            <button 
                                onClick={gestionarModeradores}
                                style={{
                                    background: "transparent",
                                    color: "rgba(255,255,255,0.85)",
                                    border: "none",
                                    padding: "12px 20px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "rgba(255,255,255,0.08)";
                                    e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "transparent";
                                    e.target.style.color = "rgba(255,255,255,0.85)";
                                }}
                            >
                                🛡️ Moderadores
                            </button>
                        )}
                    </div>
                </nav>

                {/* Footer con versión y botones */}
                <div style={{
                    padding: "20px",
                    borderTop: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <button 
                        onClick={volverASelector}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            textAlign: "left",
                            width: "100%",
                            marginBottom: "8px",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}
                        onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                    >
                        🔄 Cambiar Modo
                    </button>

                    <button 
                        onClick={irACatalogo}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            textAlign: "left",
                            width: "100%",
                            marginBottom: "8px",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}
                        onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                    >
                        🛍️ Ir al Catálogo
                    </button>

                    <button 
                        onClick={cerrarSesion}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            textAlign: "left",
                            width: "100%",
                            marginBottom: "15px",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.15)"}
                        onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                    >
                        🚪 Cerrar Sesión
                    </button>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 0"
                    }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "bold",
                            position: "relative"
                        }}>
                            A
                            <div style={{
                                position: "absolute",
                                bottom: "-2px",
                                right: "-2px",
                                width: "12px",
                                height: "12px",
                                background: "#fbbf24",
                                borderRadius: "50%",
                                border: "2px solid #2d5bff"
                            }}></div>
                        </div>
                    </div>

                    <p style={{
                        margin: "10px 0 0 0",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: "500"
                    }}>
                        VEYCOFLASH<br/>Versión 1.0
                    </p>
                </div>
            </div>

            {/* Contenido Principal */}
            <div style={{ flex: 1, padding: "30px 40px", background: "#f5f7fa", overflowY: "auto" }}>
                
                {/* Header */}
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ margin: "0 0 5px 0", fontSize: "32px", fontWeight: "bold", color: "#1a202c" }}>
                        Dashboard
                    </h1>
                    <p style={{ margin: 0, color: "#718096", fontSize: "15px" }}>
                        Resumen de la plataforma de compra y venta
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
                    
                    {/* Sección Izquierda - Actividades Recientes */}
                    <div>
                        {/* Grid de Métricas - ACTUALIZADO CON 5 COLUMNAS */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                            {/* Usuarios Activos */}
                            <div style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px",
                                position: "relative"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3 style={{ margin: 0, color: "#718096", fontSize: "13px", fontWeight: "600" }}>
                                        Usuarios Activos
                                    </h3>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "#3b82f6",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px"
                                    }}>👥</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c", marginBottom: "5px" }}>
                                        {estadisticas.usuariosActivos || 0}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#718096" }}>
                                        +{estadisticas.usuariosEsteMes || 0} este mes
                                    </div>
                                </div>
                            </div>

                            {/* Productos Publicados */}
                            <div style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3 style={{ margin: 0, color: "#718096", fontSize: "13px", fontWeight: "600" }}>
                                        Productos Publicados
                                    </h3>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "#06b6d4",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px"
                                    }}>📦</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c", marginBottom: "5px" }}>
                                        {estadisticas.productosPublicados || 0}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#718096" }}>
                                        +{estadisticas.productosEsteMes || 0} este mes
                                    </div>
                                </div>
                            </div>

                            {/* Servicios Publicados - NUEVO */}
                            <div style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3 style={{ margin: 0, color: "#718096", fontSize: "13px", fontWeight: "600" }}>
                                        Servicios Publicados
                                    </h3>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "#10b981",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px"
                                    }}>🔧</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c", marginBottom: "5px" }}>
                                        {estadisticas.serviciosPublicados || 0}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#718096" }}>
                                        +{estadisticas.serviciosEsteMes || 0} este mes
                                    </div>
                                </div>
                            </div>

                            {/* Transacciones */}
                            <div style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3 style={{ margin: 0, color: "#718096", fontSize: "13px", fontWeight: "600" }}>
                                        Transacciones
                                    </h3>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "#8b5cf6",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px"
                                    }}>🛒</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c", marginBottom: "5px" }}>
                                        {estadisticas.transaccionesTotales || 0}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#718096" }}>
                                        +{estadisticas.transaccionesEstaSemana || 0} esta semana
                                    </div>
                                </div>
                            </div>

                            {/* Tasa de Éxito */}
                            <div style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3 style={{ margin: 0, color: "#718096", fontSize: "13px", fontWeight: "600" }}>
                                        Tasa de Éxito
                                    </h3>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "#f59e0b",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px"
                                    }}>📈</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c", marginBottom: "5px" }}>
                                        {Math.round(estadisticas.tasaExito || 0)}%
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#718096" }}>
                                        +{Math.round(estadisticas.tasaExitoEsteMes || 0)}% este mes
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actividades Recientes */}
                        <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                            <h2 style={{ margin: "0 0 20px 0", color: "#1a202c", fontSize: "18px", fontWeight: "700" }}>
                                Actividades Recientes
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                {actividades.length > 0 ? (
                                    actividades.map((actividad, index) => (
                                        <div key={index} style={{ 
                                            display: "flex", 
                                            justifyContent: "space-between",
                                            alignItems: "flex-start", 
                                            padding: "15px 0", 
                                            borderBottom: index < actividades.length - 1 ? "1px solid #e2e8f0" : "none"
                                        }}>
                                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                                <div style={{ fontSize: "1.3rem", opacity: "0.7", marginTop: "2px" }}>
                                                    {actividad.tipo && actividad.tipo.includes('Producto') ? '📦' : 
                                                     actividad.tipo && actividad.tipo.includes('Servicio') ? '🔧' : '💰'}
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: "0 0 4px 0", color: "#1a202c", fontSize: "14px", fontWeight: "600" }}>
                                                        {actividad.tipo || "Actividad del sistema"}
                                                    </h4>
                                                    <p style={{ margin: 0, color: "#718096", fontSize: "13px" }}>
                                                        Por: {actividad.usuario || "Usuario desconocido"}
                                                    </p>
                                                </div>
                                            </div>
                                            <span style={{ 
                                                fontSize: "12px", 
                                                color: "#3b82f6",
                                                fontWeight: "500",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {actividad.fecha ? new Date(actividad.fecha).toLocaleDateString() : "Fecha no disponible"}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: "center", padding: "20px", color: "#718096" }}>
                                        No hay actividades recientes
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección Derecha - Estado de la Plataforma */}
                    <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", height: "fit-content" }}>
                        <h2 style={{ margin: "0 0 20px 0", color: "#1a202c", fontSize: "18px", fontWeight: "700" }}>
                            Estado de la Plataforma
                        </h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            {[
                                { label: "Estado del Servidor", value: estados.servidor || "Verificando...", color: "#10b981" },
                                { label: "Pasarela de Pago", value: estados.pago || "Verificando...", color: "#10b981" },
                                { label: "Sistema de Notificaciones", value: estados.notificaciones || "Verificando...", color: "#10b981" },
                                { label: "Tiempo de Respuesta", value: estados.respuesta || "Verificando...", color: "#f59e0b" }
                            ].map((item, index) => (
                                <div key={index} style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 0",
                                    borderBottom: index < 3 ? "1px solid #e2e8f0" : "none"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ 
                                            width: "8px", 
                                            height: "8px", 
                                            borderRadius: "50%", 
                                            background: item.color 
                                        }}></div>
                                        <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a202c" }}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <small style={{ 
                                        fontSize: "12px", 
                                        color: item.color,
                                        fontWeight: "600"
                                    }}>
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