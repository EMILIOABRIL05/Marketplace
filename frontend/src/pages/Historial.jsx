import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState(""); // "", "producto", "servicio"
  const [ubicacionFiltro, setUbicacionFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(""); // Nuevo filtro de estado
  const [ordenPrecio, setOrdenPrecio] = useState(""); // "", "asc", "desc"
  const nav = useNavigate();

  const categorias = [
    "Todas",
    "Electrónica",
    "Ropa y Accesorios",
    "Hogar y Jardín",
    "Deportes",
    "Vehículos",
    "Libros y Música",
    "Juguetes",
    // Categorías de servicios
    "Mantenimiento",
    "Educación",
    "Belleza",
    "Tecnología",
    "Transporte",
    "Diseño / Creativo",
    "Salud y Bienestar",
    "Eventos",
    "Limpieza",
    "Reparaciones",
    "Consultoría",
    "Otros"
  ];

  const provincias = [
    "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi",
    "El Oro", "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja",
    "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza",
    "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas",
    "Sucumbíos", "Tungurahua", "Zamora Chinchipe"
  ];

  const estadosProducto = [
    "Nuevo",
    "Como Nuevo",
    "Usado - En buen estado",
    "Usado - Con detalles",
    "Reacondicionado / Refurbished",
    "Para repuestos / No funcional"
  ];

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      nav("/login");
      return;
    }

    try {
      const res = await api.get(`/historial/usuario/${user.id}`);
      setHistorial(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando historial:", err);
      setLoading(false);
    }
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

  function formatearFecha(fecha) {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora - date;
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 60) {
      return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else if (dias < 7) {
      return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  }

  // Filtrar historial
  const historialFiltrado = historial.filter(item => {
    const esServicio = item.servicio != null;
    const elemento = esServicio ? item.servicio : item.producto;
    
    const nombreBusqueda = (elemento.nombre || elemento.titulo || "").toLowerCase();
    const coincideNombre = nombreBusqueda.includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === "" || categoriaFiltro === "Todas" || elemento.categoria === categoriaFiltro;
    const coincideTipo = tipoFiltro === "" || (esServicio ? tipoFiltro === "servicio" : tipoFiltro === "producto");
    const ubicacion = elemento.ubicacion || elemento.ciudad;
    const coincideUbicacion = ubicacionFiltro === "" || ubicacion === ubicacionFiltro;
    
    // Filtro de estado (solo para productos)
    const coincideEstado = estadoFiltro === "" || 
                          (esServicio ? true : (elemento.estadoProducto === estadoFiltro || elemento.estado === estadoFiltro));
    
    return coincideNombre && coincideCategoria && coincideTipo && coincideUbicacion && coincideEstado;
  });

  // Ordenar por precio
  const historialOrdenado = [...historialFiltrado].sort((a, b) => {
    const esServicioA = a.servicio != null;
    const esServicioB = b.servicio != null;
    const itemA = esServicioA ? a.servicio : a.producto;
    const itemB = esServicioB ? b.servicio : b.producto;
    
    if (ordenPrecio === "asc") {
      return (itemA.precio || 0) - (itemB.precio || 0);
    } else if (ordenPrecio === "desc") {
      return (itemB.precio || 0) - (itemA.precio || 0);
    }
    return 0;
  });

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Cargando historial...</p>
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
              📊 Historial
            </button>

            <button 
              onClick={() => nav("/perfil")}
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
              👤 Mi Perfil
            </button>
          </div>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div style={{
        flex: 1,
        padding: "30px 40px",
        background: "#f8f9fa",
        overflowY: "auto"
      }}>
        
        {/* Header con búsqueda */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px"
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              color: "#333",
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0 0 8px 0"
            }}>
              📊 Historial de Visitas
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              Productos y servicios que has visitado
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar en historial..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: "12px 20px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
              width: "300px",
              outline: "none",
              transition: "border 0.3s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "#00ccff"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          />
        </div>

        {/* Filtros */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "30px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          {/* Filtro Tipo */}
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              background: "white",
              cursor: "pointer",
              outline: "none",
              minWidth: "150px"
            }}
          >
            <option value="">📦 Todos</option>
            <option value="producto">📦 Productos</option>
            <option value="servicio">🛠️ Servicios</option>
          </select>

          {/* Filtro Categoría */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              background: "white",
              cursor: "pointer",
              outline: "none",
              minWidth: "180px"
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.filter(c => c !== "Todas").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Filtro Ubicación */}
          <select
            value={ubicacionFiltro}
            onChange={(e) => setUbicacionFiltro(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              background: "white",
              cursor: "pointer",
              outline: "none",
              minWidth: "180px"
            }}
          >
            <option value="">Todas las provincias</option>
            {provincias.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>

          {/* Filtro Estado del Producto */}
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              background: "white",
              cursor: "pointer",
              outline: "none",
              minWidth: "180px"
            }}
          >
            <option value="">Todos los estados</option>
            {estadosProducto.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          {/* Ordenar por precio */}
          <select
            value={ordenPrecio}
            onChange={(e) => setOrdenPrecio(e.target.value)}
            style={{
              padding: "10px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              background: "white",
              cursor: "pointer",
              outline: "none",
              minWidth: "180px"
            }}
          >
            <option value="">Ordenar por precio</option>
            <option value="asc">Precio: Menor a Mayor</option>
            <option value="desc">Precio: Mayor a Menor</option>
          </select>

          {/* Contador */}
          <div style={{ fontSize: "14px", color: "#666", marginLeft: "auto" }}>
            <strong style={{ color: "#333" }}>{historialFiltrado.length}</strong> resultados
          </div>

          {/* Limpiar filtros */}
          {(categoriaFiltro || tipoFiltro || ubicacionFiltro || estadoFiltro || ordenPrecio || busqueda) && (
            <button
              onClick={() => {
                setCategoriaFiltro("");
                setTipoFiltro("");
                setUbicacionFiltro("");
                setEstadoFiltro("");
                setOrdenPrecio("");
                setBusqueda("");
              }}
              style={{
                padding: "10px 16px",
                background: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "8px",
                color: "#666",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Lista de Historial */}
        {historialOrdenado.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "80px", marginBottom: "20px" }}>📭</div>
            <h2 style={{ fontSize: "24px", color: "#666", marginBottom: "12px" }}>
              {historial.length === 0 ? "No tienes historial de visitas" : "No se encontraron resultados"}
            </h2>
            <p style={{ color: "#999", marginBottom: "24px" }}>
              {historial.length === 0 
                ? "Explora productos y servicios, tu historial se guardará aquí" 
                : "Intenta con otros filtros"}
            </p>
            <button
              onClick={() => nav("/catalogo")}
              style={{
                background: "#00ccff",
                color: "white",
                padding: "12px 32px",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            {historialOrdenado.map(item => {
              const esServicio = item.servicio != null;
              const elemento = esServicio ? item.servicio : item.producto;
              const primeraImagen = obtenerPrimeraImagen(elemento, esServicio);
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => nav(esServicio ? `/servicio/${elemento.id}` : `/producto/${elemento.id}`)}
                  style={{
                    display: "flex",
                    gap: "20px",
                    padding: "16px",
                    background: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Imagen */}
                  <div style={{
                    width: "120px",
                    height: "120px",
                    flexShrink: 0,
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    {primeraImagen ? (
                      <img 
                        src={`http://localhost:8080${primeraImagen}`}
                        alt={elemento.nombre || elemento.titulo}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `<span style="font-size: 40px; color: #ccc;">${esServicio ? '🛠️' : '📦'}</span>`;
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "40px", color: "#ccc" }}>
                        {esServicio ? '🛠️' : '📦'}
                      </span>
                    )}
                    
                    {/* Badge tipo */}
                    <div style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: esServicio ? "#ff5722" : "#4CAF50",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "bold"
                    }}>
                      {esServicio ? "🛠️" : "📦"}
                    </div>
                  </div>

                  {/* Información */}
                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start"
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#333",
                          margin: "0 0 4px 0"
                        }}>
                          {elemento.nombre || elemento.titulo}
                        </h3>
                        <p style={{
                          fontSize: "14px",
                          color: "#666",
                          margin: "0"
                        }}>
                          {elemento.descripcion?.substring(0, 150)}
                          {elemento.descripcion?.length > 150 ? "..." : ""}
                        </p>
                      </div>
                      <span style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#00ccff",
                        flexShrink: 0,
                        marginLeft: "20px"
                      }}>
                        {esServicio && elemento.tipoPrecio === "negociable" 
                          ? "A negociar" 
                          : esServicio && elemento.tipoPrecio === "desde"
                          ? `Desde $${(elemento.precio || 0).toFixed(2)}`
                          : `$${(elemento.precio || 0).toFixed(2)}`
                        }
                      </span>
                    </div>

                    <div style={{
                      display: "flex",
                      gap: "20px",
                      fontSize: "13px",
                      color: "#666",
                      marginTop: "auto"
                    }}>
                      <span>
                        📍 {elemento.ubicacion || elemento.ciudad}
                      </span>
                      <span>
                        🏷️ {elemento.categoria || elemento.tipo}
                      </span>
                      {!esServicio && (elemento.estadoProducto || elemento.estado) && (
                        <span>
                          ⭐ {elemento.estadoProducto || elemento.estado}
                        </span>
                      )}
                      <span style={{ marginLeft: "auto", color: "#999" }}>
                        🕒 {formatearFecha(item.fechaVisto)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}