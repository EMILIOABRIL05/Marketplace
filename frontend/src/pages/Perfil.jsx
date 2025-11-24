import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [misProductos, setMisProductos] = useState([]);
  const [misServicios, setMisServicios] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    productosActivos: 0,
    serviciosActivos: 0,
    totalProductos: 0,
    totalServicios: 0,
    productosOcultos: 0,
    serviciosOcultos: 0,
    ventasTotales: 0
  });
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState("productos");
  const [mostrarModalApelacion, setMostrarModalApelacion] = useState(false);
  const [productoApelar, setProductoApelar] = useState(null);
  const [motivoApelacion, setMotivoApelacion] = useState("");
  const [descripcionApelacion, setDescripcionApelacion] = useState("");
  const [enviandoApelacion, setEnviandoApelacion] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      nav("/login");
      return;
    }

    try {
      setUsuario(user);
      console.log("Cargando perfil para usuario ID:", user.id);
      
      // Cargar productos del usuario
      let productosData = [];
      try {
        const resProductos = await api.get(`/productos/vendedor/${user.id}`);
        productosData = resProductos.data;
        console.log("Productos cargados:", productosData.length);
      } catch (productosError) {
        console.error("Error cargando productos:", productosError);
      }

      // Cargar servicios del usuario - USANDO EL NUEVO ENDPOINT
      let serviciosData = [];
      try {
        const resServicios = await api.get(`/servicios/usuario/${user.id}`);
        serviciosData = resServicios.data;
        console.log("Servicios cargados:", serviciosData.length);
      } catch (serviciosError) {
        console.error("Error cargando servicios:", serviciosError);
        // Fallback: cargar todos y filtrar
        try {
          const resTodos = await api.get("/servicios");
          serviciosData = resTodos.data.filter(s => 
            s.vendedor?.id === user.id || s.vendedorId === user.id
          );
          console.log("Servicios filtrados:", serviciosData.length);
        } catch (error) {
          console.error("Error cargando todos los servicios:", error);
        }
      }

      setMisProductos(productosData);
      setMisServicios(serviciosData);

      // Calcular estadísticas
      const productosActivos = productosData.filter(p => 
        p.estado === "ACTIVO" || p.activo === true
      ).length;
      const productosOcultos = productosData.filter(p => 
        p.estado === "OCULTO" || p.activo === false
      ).length;
      
      const serviciosActivos = serviciosData.filter(s => 
        (s.estado === "ACTIVO" || s.activo === true) && s.estado !== "OCULTO"
      ).length;
      const serviciosOcultos = serviciosData.filter(s => 
        s.estado === "OCULTO" || s.activo === false
      ).length;
      
      setEstadisticas({
        productosActivos,
        serviciosActivos,
        totalProductos: productosData.length,
        totalServicios: serviciosData.length,
        productosOcultos,
        serviciosOcultos,
        ventasTotales: 0
      });

      setLoading(false);
    } catch (err) {
      console.error("Error cargando perfil:", err);
      setLoading(false);
    }
  }

  // FUNCIÓN PARA INICIAR APELACIÓN
  function iniciarApelacion(producto) {
    setProductoApelar(producto);
    setMotivoApelacion("");
    setDescripcionApelacion("");
    setMostrarModalApelacion(true);
  }

  // FUNCIÓN PARA ENVIAR APELACIÓN
  async function enviarApelacion(e) {
    e.preventDefault();
    
    if (!motivoApelacion || !descripcionApelacion) {
      alert("Por favor completa todos los campos de la apelación");
      return;
    }

    setEnviandoApelacion(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      // Aquí enviarías la apelación al backend
      // Por ahora simulamos el envío
      await api.post("/apelaciones", {
        usuarioId: user.id,
        productoId: productoApelar.id,
        motivo: motivoApelacion,
        descripcion: descripcionApelacion,
        fechaApelacion: new Date().toISOString()
      });

      alert("✅ Apelación enviada correctamente. Revisaremos tu caso pronto.");
      setMostrarModalApelacion(false);
      setProductoApelar(null);
      setMotivoApelacion("");
      setDescripcionApelacion("");
      
    } catch (err) {
      console.error("Error enviando apelación:", err);
      alert("Error al enviar la apelación. Intenta nuevamente.");
    } finally {
      setEnviandoApelacion(false);
    }
  }

  async function cambiarEstadoProducto(productoId, nuevoEstado) {
    try {
      await api.put(`/productos/${productoId}/estado?nuevoEstado=${nuevoEstado}`);
      cargarPerfil();
      alert(`Producto ${nuevoEstado === "ACTIVO" ? "activado" : "ocultado"} correctamente`);
    } catch (err) {
      console.error("Error cambiando estado producto:", err);
      alert("Error al cambiar estado del producto");
    }
  }

  async function cambiarEstadoServicio(servicioId, nuevoEstado) {
    try {
      await api.put(`/servicios/${servicioId}/estado?nuevoEstado=${nuevoEstado}`);
      
      // ACTUALIZACIÓN INMEDIATA EN EL FRONTEND
      setMisServicios(prevServicios => {
        const serviciosActualizados = prevServicios.map(servicio => 
          servicio.id === servicioId 
            ? { ...servicio, estado: nuevoEstado }
            : servicio
        );

        // Calcular nuevas estadísticas
        const serviciosActivos = serviciosActualizados.filter(s => 
          (s.estado === "ACTIVO" || s.activo === true) && s.estado !== "OCULTO"
        ).length;
        const serviciosOcultos = serviciosActualizados.filter(s => 
          s.estado === "OCULTO" || s.activo === false
        ).length;

        // Actualizar estadísticas
        setEstadisticas(prevStats => ({
          ...prevStats,
          serviciosActivos,
          serviciosOcultos
        }));

        return serviciosActualizados;
      });
      
      alert(`Servicio ${nuevoEstado === "ACTIVO" ? "activado" : "ocultado"} correctamente`);
    } catch (err) {
      console.error("Error cambiando estado servicio:", err);
      alert("Error al cambiar estado del servicio");
    }
  }

  async function eliminarProducto(productoId, nombreProducto) {
    if (window.confirm(`¿Estás seguro que deseas eliminar "${nombreProducto}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/productos/${productoId}`);
        cargarPerfil();
        alert("Producto eliminado correctamente");
      } catch (err) {
        console.error("Error eliminando producto:", err);
        const mensaje = err.response?.data?.message || "Error al eliminar el producto";
        alert(mensaje);
      }
    }
  }

  async function eliminarServicio(servicioId, tituloServicio) {
    if (window.confirm(`¿Estás seguro que deseas eliminar "${tituloServicio}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/servicios/${servicioId}`);
        cargarPerfil();
        alert("Servicio eliminado correctamente");
      } catch (err) {
        console.error("Error eliminando servicio:", err);
        const mensaje = err.response?.data?.message || "Error al eliminar el servicio";
        alert(mensaje);
      }
    }
  }

  function editarProducto(productoId) {
    nav(`/editar-producto/${productoId}`);
  }

  function editarServicio(servicioId) {
    nav(`/editar-servicio/${servicioId}`);
  }

  function obtenerPrimeraImagen(item, esServicio) {
    if (esServicio) {
      if (item.imagenes) {
        try {
          const imagenesArray = JSON.parse(item.imagenes);
          if (imagenesArray && imagenesArray.length > 0) {
            return imagenesArray[0];
          }
        } catch (e) {
          return null;
        }
      }
      return null;
    } else {
      return item.imagenUrl1 || item.imagenUrl2 || item.imagenUrl3 || item.imagenUrl4 || item.imagenUrl5 || null;
    }
  }

  function determinarEstado(item) {
    // PRIORIDAD: usar el campo estado si existe y es válido
    if (item.estado && (item.estado === "ACTIVO" || item.estado === "OCULTO")) {
      return item.estado;
    }
    if (item.activo !== undefined) return item.activo ? "ACTIVO" : "OCULTO";
    return "ACTIVO";
  }

  // Función para verificar si un producto fue ocultado por administrador
  function fueOcultadoPorAdmin(producto) {
    // Aquí puedes agregar lógica para determinar si fue ocultado por admin
    // Por ejemplo, si tiene un campo 'ocultadoPorAdmin' o 'razonOcultamiento'
    return producto.estado === "OCULTO" && producto.razonOcultamiento;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "white", 
      display: "flex",
      fontFamily: "Arial, sans-serif"
    }}>
      
      {/* Sidebar Azul */}
      <div style={{
        width: "280px",
        background: "#00ccff",
        color: "white",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column"
      }}>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "50px",
          paddingBottom: "20px",
          borderBottom: "2px solid rgba(255,255,255,0.3)"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            backdropFilter: "blur(10px)"
          }}>
            🛒
          </div>
          <h1 style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1a237e"
          }}>
            VEYCOFLASH
          </h1>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}>
            <button 
              onClick={() => nav("/catalogo")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              🏠 Catálogo
            </button>

            <button 
              onClick={() => nav("/publicar")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              ➕ Publicar
            </button>

            <button 
              onClick={() => nav("/favoritos")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              ❤️ Favoritos
            </button>

            <button 
              onClick={() => nav("/historial")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              📊 Historial
            </button>

            <button 
              onClick={() => nav("/perfil")}
              style={{
                background: "rgba(255,255,255,0.4)",
                color: "#1a237e",
                border: "2px solid rgba(255,255,255,0.5)",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)"
              }}
            >
              👤 Mi Perfil
            </button>
          </div>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div style={{
        flex: 1,
        padding: "30px 40px",
        background: "#f8f9fa"
      }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              background: "#00ccff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white"
            }}>
              👤
            </div>
            <div>
              <h1 style={{
                color: "#333",
                fontSize: "28px",
                fontWeight: "bold",
                margin: "0 0 4px 0"
              }}>
                {usuario?.nombre} {usuario?.apellido}
              </h1>
              <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                {usuario?.email}
              </p>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={() => {/* Funcionalidad pendiente */}}
              style={{
                background: "#00ccff",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "background 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "#00b3e6"}
              onMouseLeave={(e) => e.target.style.background = "#00ccff"}
            >
              💬 Mensajes
            </button>
            
            <button 
              onClick={() => {
                localStorage.removeItem("user");
                nav("/");
              }}
              style={{
                background: "#ff4444",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "background 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "#cc0000"}
              onMouseLeave={(e) => e.target.style.background = "#ff4444"}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "16px",
          marginBottom: "30px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📦</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
              {estadisticas.productosActivos}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>PRODUCTOS ACTIVOS</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🛠️</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
              {estadisticas.serviciosActivos}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>SERVICIOS ACTIVOS</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(79, 172, 254, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
              {estadisticas.totalProductos}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>TOTAL PRODUCTOS</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            padding: "20px",
            borderRadius: "12px",
            color: "#333",
            boxShadow: "0 4px 12px rgba(168, 237, 234, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📈</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
              {estadisticas.totalServicios}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>TOTAL SERVICIOS</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(250, 217, 97, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
              {estadisticas.productosOcultos + estadisticas.serviciosOcultos}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>TOTAL OCULTOS</div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(255, 154, 158, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>💰</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
              ${estadisticas.ventasTotales}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>VENTAS TOTALES</div>
          </div>
        </div>

        {/* Mis Publicaciones */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: "16px"
          }}>
            <button
              onClick={() => setTabActiva("productos")}
              style={{
                background: tabActiva === "productos" ? "#00ccff" : "transparent",
                color: tabActiva === "productos" ? "white" : "#666",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                transition: "all 0.3s ease"
              }}
            >
              📦 Productos ({misProductos.length})
            </button>
            <button
              onClick={() => setTabActiva("servicios")}
              style={{
                background: tabActiva === "servicios" ? "#00ccff" : "transparent",
                color: tabActiva === "servicios" ? "white" : "#666",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                transition: "all 0.3s ease"
              }}
            >
              🛠️ Servicios ({misServicios.length})
            </button>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
              margin: 0
            }}>
              {tabActiva === "productos" ? "📋 MIS PRODUCTOS" : "🛠️ MIS SERVICIOS"}
            </h2>
            <button
              onClick={() => nav("/publicar")}
              style={{
                background: "#00ccff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              + NUEVA PUBLICACIÓN
            </button>
          </div>

          {tabActiva === "productos" ? (
            misProductos.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#999"
              }}>
                <div style={{ fontSize: "60px", marginBottom: "16px" }}>📦</div>
                <p>No tienes productos publicados aún</p>
                <button
                  onClick={() => nav("/publicar")}
                  style={{
                    background: "#00ccff",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginTop: "12px"
                  }}
                >
                  Publicar mi primer producto
                </button>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {misProductos.map(producto => {
                  const estado = determinarEstado(producto);
                  const ocultadoPorAdmin = fueOcultadoPorAdmin(producto);
                  
                  return (
                    <div 
                      key={producto.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef",
                        position: "relative"
                      }}
                    >
                      {/* Badge de Apelación si fue ocultado por admin */}
                      {ocultadoPorAdmin && (
                        <div style={{
                          position: "absolute",
                          top: "-8px",
                          left: "-8px",
                          background: "#ff6b6b",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          zIndex: 1
                        }}>
                          ⚠️ OCULTO POR ADMIN
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: 1 }}>
                        <div style={{
                          width: "60px",
                          height: "60px",
                          background: "#e9ecef",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0
                        }}>
                          {producto.imagenUrl1 ? (
                            <img 
                              src={`http://localhost:8080${producto.imagenUrl1}`} 
                              alt={producto.nombre}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: "24px" }}>📦</span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#333",
                            margin: "0 0 4px 0"
                          }}>
                            {producto.nombre}
                          </h3>
                          <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#666" }}>
                            <span>${producto.precio}</span>
                            <span>•</span>
                            <span>{producto.ubicacion || producto.ciudad}</span>
                            {producto.estado && (
                              <>
                                <span>•</span>
                                <span>Estado: {producto.estado}</span>
                              </>
                            )}
                          </div>
                          {ocultadoPorAdmin && producto.razonOcultamiento && (
                            <div style={{
                              marginTop: "8px",
                              padding: "8px",
                              background: "#fff3cd",
                              border: "1px solid #ffeaa7",
                              borderRadius: "4px",
                              fontSize: "12px",
                              color: "#856404"
                            }}>
                              <strong>Razón:</strong> {producto.razonOcultamiento}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: estado === "ACTIVO" ? "#d4edda" : "#f8d7da",
                          color: estado === "ACTIVO" ? "#155724" : "#721c24"
                        }}>
                          {estado === "ACTIVO" ? "Activo" : "Oculto"}
                        </span>
                        
                        <button
                          onClick={() => nav(`/producto/${producto.id}`)}
                          style={{
                            background: "#00ccff",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "background 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#00b3e6"}
                          onMouseLeave={(e) => e.target.style.background = "#00ccff"}
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => editarProducto(producto.id)}
                          style={{
                            background: "#17a2b8",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "background 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#138496"}
                          onMouseLeave={(e) => e.target.style.background = "#17a2b8"}
                        >
                          ✏️ Editar
                        </button>

                        {!ocultadoPorAdmin && (
                          <button
                            onClick={() => cambiarEstadoProducto(producto.id, estado === "ACTIVO" ? "OCULTO" : "ACTIVO")}
                            style={{
                              background: estado === "ACTIVO" ? "#ffc107" : "#28a745",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "background 0.3s ease"
                            }}
                            onMouseEnter={(e) => e.target.style.background = estado === "ACTIVO" ? "#e0a800" : "#218838"}
                            onMouseLeave={(e) => e.target.style.background = estado === "ACTIVO" ? "#ffc107" : "#28a745"}
                          >
                            {estado === "ACTIVO" ? "Ocultar" : "Activar"}
                          </button>
                        )}

                        {ocultadoPorAdmin && (
                          <button
                            onClick={() => iniciarApelacion(producto)}
                            style={{
                              background: "#ff6b6b",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "background 0.3s ease"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#ff5252"}
                            onMouseLeave={(e) => e.target.style.background = "#ff6b6b"}
                          >
                            🏛️ Apelar
                          </button>
                        )}

                        <button
                          onClick={() => eliminarProducto(producto.id, producto.nombre)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "background 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#c82333"}
                          onMouseLeave={(e) => e.target.style.background = "#dc3545"}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // ... (el código de servicios se mantiene igual)
            misServicios.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#999"
              }}>
                <div style={{ fontSize: "60px", marginBottom: "16px" }}>🛠️</div>
                <p>No tienes servicios publicados aún</p>
                <button
                  onClick={() => nav("/publicar")}
                  style={{
                    background: "#00ccff",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginTop: "12px"
                  }}
                >
                  Publicar mi primer servicio
                </button>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {misServicios.map(servicio => {
                  const estado = determinarEstado(servicio);
                  const primeraImagen = obtenerPrimeraImagen(servicio, true);
                  
                  return (
                    <div 
                      key={servicio.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef"
                      }}
                    >
                      <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: 1 }}>
                        <div style={{
                          width: "60px",
                          height: "60px",
                          background: "#e9ecef",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0
                        }}>
                          {primeraImagen ? (
                            <img 
                              src={`http://localhost:8080${primeraImagen}`} 
                              alt={servicio.titulo}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: "24px" }}>🛠️</span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#333",
                            margin: "0 0 4px 0"
                          }}>
                            {servicio.titulo}
                          </h3>
                          <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#666" }}>
                            <span>
                              {servicio.tipoPrecio === "negociable" 
                                ? "A negociar" 
                                : servicio.tipoPrecio === "desde"
                                ? `Desde $${servicio.precio}`
                                : `$${servicio.precio}`
                              }
                            </span>
                            <span>•</span>
                            <span>{servicio.ciudad}</span>
                            <span>•</span>
                            <span>{servicio.categoria}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: estado === "ACTIVO" ? "#d4edda" : "#f8d7da",
                          color: estado === "ACTIVO" ? "#155724" : "#721c24"
                        }}>
                          {estado === "ACTIVO" ? "Activo" : "Oculto"}
                        </span>
                        
                        <button
                          onClick={() => nav(`/servicio/${servicio.id}`)}
                          style={{
                            background: "#00ccff",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "background 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#00b3e6"}
                          onMouseLeave={(e) => e.target.style.background = "#00ccff"}
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => editarServicio(servicio.id)}
                          style={{
                            background: "#17a2b8",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "background 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#138496"}
                          onMouseLeave={(e) => e.target.style.background = "#17a2b8"}
                        >
                          ✏️ Editar
                        </button>

                        <button
                          onClick={() => cambiarEstadoServicio(servicio.id, estado === "ACTIVO" ? "OCULTO" : "ACTIVO")}
                          style={{
                            background: estado === "ACTIVO" ? "#ffc107" : "#28a745",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "background 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = estado === "ACTIVO" ? "#e0a800" : "#218838"}
                          onMouseLeave={(e) => e.target.style.background = estado === "ACTIVO" ? "#ffc107" : "#28a745"}
                        >
                          {estado === "ACTIVO" ? "Ocultar" : "Activar"}
                        </button>

                        <button
                          onClick={() => eliminarServicio(servicio.id, servicio.titulo)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "background 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#c82333"}
                          onMouseLeave={(e) => e.target.style.background = "#dc3545"}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal de Apelación */}
      {mostrarModalApelacion && productoApelar && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
              🏛️ Apelar Producto Ocultado
            </h2>
            
            <div style={{
              background: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 8px 0", color: "#856404" }}>
                Producto: {productoApelar.nombre}
              </h3>
              <p style={{ fontSize: "14px", margin: 0, color: "#856404" }}>
                Este producto fue ocultado por un administrador. Puedes apelar esta decisión explicando por qué consideras que debería ser visible nuevamente.
              </p>
            </div>
            
            <form onSubmit={enviarApelacion} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                  Motivo de la apelación *
                </label>
                <select
                  value={motivoApelacion}
                  onChange={(e) => setMotivoApelacion(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="CONTENIDO_CUMPLE_NORMAS">El contenido cumple con las normas de la plataforma</option>
                  <option value="ERROR_ADMINISTRADOR">Error del administrador al ocultar</option>
                  <option value="PRODUCTO_MODIFICADO">He modificado el producto según las indicaciones</option>
                  <option value="INFORMACION_INCORRECTA">La información del producto es correcta</option>
                  <option value="OTRO">Otro motivo</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                  Explicación detallada *
                </label>
                <textarea
                  value={descripcionApelacion}
                  onChange={(e) => setDescripcionApelacion(e.target.value)}
                  placeholder="Explica por qué consideras que este producto debería ser visible nuevamente..."
                  rows="6"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={enviandoApelacion}
                  style={{
                    flex: 1,
                    background: enviandoApelacion ? "#999" : "#ff6b6b",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: enviandoApelacion ? "not-allowed" : "pointer",
                    transition: "background 0.3s ease"
                  }}
                  onMouseEnter={(e) => !enviandoApelacion && (e.target.style.background = "#ff5252")}
                  onMouseLeave={(e) => !enviandoApelacion && (e.target.style.background = "#ff6b6b")}
                >
                  {enviandoApelacion ? "Enviando..." : "📤 Enviar Apelación"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalApelacion(false);
                    setProductoApelar(null);
                    setMotivoApelacion("");
                    setDescripcionApelacion("");
                  }}
                  style={{
                    flex: 1,
                    background: "#6c757d",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#5a6268"}
                  onMouseLeave={(e) => e.target.style.background = "#6c757d"}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}