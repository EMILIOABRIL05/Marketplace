import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState(""); // "", "producto", "servicio"
  const [ubicacionFiltro, setUbicacionFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
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

  // Estados del producto (como en el diseño)
  const estadosProducto = [
    "Todos los estados",
    "Nuevo",
    "Como Nuevo", 
    "Usado - En buen estado",
    "Usado - Con detalles",
    "Reacondicionado / Refurbished",
    "Para repuestos / No funcional"
  ];

  useEffect(() => {
    cargarFavoritos();
  }, []);

  async function cargarFavoritos() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      nav("/login");
      return;
    }

    try {
      const res = await api.get(`/favoritos/usuario/${user.id}`);
      setFavoritos(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando favoritos:", err);
      setLoading(false);
    }
  }

  async function eliminarFavorito(favoritoId, esServicio) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      if (esServicio) {
        await api.delete(`/favoritos?usuarioId=${user.id}&servicioId=${favoritoId}`);
      } else {
        await api.delete(`/favoritos?usuarioId=${user.id}&productoId=${favoritoId}`);
      }
      
      // Actualizar lista sin recargar
      setFavoritos(favoritos.filter(f => {
        const itemId = esServicio ? f.servicio?.id : f.producto?.id;
        return itemId !== favoritoId;
      }));
      
      alert("Eliminado de favoritos");
    } catch (err) {
      alert("Error al eliminar favorito");
      console.error(err);
    }
  }

  function obtenerPrimeraImagen(item, esServicio) {
    if (esServicio) {
      // Para servicios, las imágenes están en JSON
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
      // Para productos
      return item.imagenUrl1 || item.imagenUrl2 || item.imagenUrl3 || item.imagenUrl4 || item.imagenUrl5 || null;
    }
  }

  // Filtrar favoritos
  const favoritosFiltrados = favoritos.filter(favorito => {
    const esServicio = favorito.servicio != null;
    const item = esServicio ? favorito.servicio : favorito.producto;
    
    const nombreBusqueda = (item.nombre || item.titulo || "").toLowerCase();
    const coincideNombre = nombreBusqueda.includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === "" || categoriaFiltro === "Todas" || item.categoria === categoriaFiltro;
    const coincideTipo = tipoFiltro === "" || (tipoFiltro === "producto" && !esServicio) || (tipoFiltro === "servicio" && esServicio);
    const coincideUbicacion = ubicacionFiltro === "" || item.ubicacion === ubicacionFiltro;
    const coincideEstado = estadoFiltro === "" || estadoFiltro === "Todos los estados" || item.estado === estadoFiltro;
    
    return coincideNombre && coincideCategoria && coincideTipo && coincideUbicacion && coincideEstado;
  });

  // Ordenar por precio
  const favoritosOrdenados = [...favoritosFiltrados].sort((a, b) => {
    const itemA = a.servicio || a.producto;
    const itemB = b.servicio || b.producto;
    
    if (ordenPrecio === "asc") {
      return (itemA.precio || 0) - (itemB.precio || 0);
    } else if (ordenPrecio === "desc") {
      return (itemB.precio || 0) - (itemA.precio || 0);
    }
    return 0;
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Cargando favoritos...</p>
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
        
        {/* Header */}
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
              ❤️ Mis Favoritos
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              Productos y servicios que te gustan
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar en favoritos..."
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
              minWidth: "220px"
            }}
          >
            <option value="">Todos los estados</option>
            {estadosProducto.filter(estado => estado !== "Todos los estados").map(estado => (
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
            <strong style={{ color: "#333" }}>{favoritosFiltrados.length}</strong> resultados
          </div>

          {/* Limpiar filtros */}
          {(categoriaFiltro || tipoFiltro || ubicacionFiltro || estadoFiltro || ordenPrecio) && (
            <button
              onClick={() => {
                setCategoriaFiltro("");
                setTipoFiltro("");
                setUbicacionFiltro("");
                setEstadoFiltro("");
                setOrdenPrecio("");
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

        {/* Lista de Favoritos */}
        {favoritosOrdenados.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "80px", marginBottom: "20px" }}>💔</div>
            <h2 style={{ fontSize: "24px", color: "#666", marginBottom: "12px" }}>
              {favoritos.length === 0 ? "No tienes favoritos" : "No se encontraron resultados"}
            </h2>
            <p style={{ color: "#999", marginBottom: "24px" }}>
              {favoritos.length === 0 
                ? "Explora el catálogo y agrega productos o servicios que te gusten"
                : "Intenta con otros filtros de búsqueda"
              }
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {favoritosOrdenados.map(favorito => {
              const esServicio = favorito.servicio != null;
              const item = esServicio ? favorito.servicio : favorito.producto;
              const primeraImagen = obtenerPrimeraImagen(item, esServicio);
              
              return (
                <div key={favorito.id} style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #e9ecef",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                }}
                >
                  {/* Imagen */}
                  <div 
                    onClick={() => nav(esServicio ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                    style={{
                      width: "100%",
                      height: "200px",
                      background: "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      position: "relative"
                    }}
                  >
                    {primeraImagen ? (
                      <img 
                        src={`http://localhost:8080${primeraImagen}`}
                        alt={item.nombre || item.titulo}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `<div style="font-size: 48px; color: #ccc;">${esServicio ? '🛠️' : '📦'}</div>`;
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: "48px", color: "#ccc" }}>
                        {esServicio ? '🛠️' : '📦'}
                      </div>
                    )}
                    
                    {/* Badge tipo */}
                    <div style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: esServicio ? "#ff5722" : "#4CAF50",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "bold"
                    }}>
                      {esServicio ? "🛠️ SERVICIO" : "📦 PRODUCTO"}
                    </div>

                    {/* Botón eliminar favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarFavorito(item.id, esServicio);
                      }}
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        cursor: "pointer",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                      }}
                      title="Eliminar de favoritos"
                    >
                      ❤️
                    </button>
                  </div>

                  {/* Información */}
                  <div 
                    onClick={() => nav(esServicio ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                    style={{ padding: "16px" }}
                  >
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#333",
                      margin: "0 0 8px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {item.nombre || item.titulo}
                    </h3>

                    <p style={{
                      fontSize: "14px",
                      color: "#666",
                      margin: "0 0 8px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      📍 {item.ubicacion}
                    </p>

                    {/* Estado del producto (solo para productos) */}
                    {!esServicio && item.estado && (
                      <p style={{
                        fontSize: "12px",
                        color: "#888",
                        margin: "0 0 8px 0",
                        fontStyle: "italic"
                      }}>
                        Estado: {item.estado}
                      </p>
                    )}

                    <p style={{
                      fontSize: "14px",
                      color: "#666",
                      margin: "0 0 12px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {item.descripcion?.substring(0, 100)}...
                    </p>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#00ccff"
                      }}>
                        {esServicio && item.tipoPrecio === "negociable" 
                          ? "A negociar" 
                          : esServicio && item.tipoPrecio === "desde"
                          ? `Desde $${(item.precio || 0).toFixed(2)}`
                          : `$${(item.precio || 0).toFixed(2)}`
                        }
                      </div>

                      <span style={{
                        padding: "4px 12px",
                        background: "#e7f6ff",
                        color: "#00ccff",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {item.categoria || item.tipo}
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