import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Catalogo() {
  const [items, setItems] = useState([]); // Productos + Servicios combinados
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
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      setLoading(true);
      console.log("Cargando catálogo...");
      
      // Cargar productos y servicios en paralelo - USANDO RUTAS PÚBLICAS
      const [resProductos, resServicios] = await Promise.all([
        api.get("/productos/public").catch(err => {
          console.error("Error cargando productos:", err);
          return { data: [] };
        }),
        api.get("/servicios/public").catch(err => {
          console.error("Error cargando servicios:", err);
          return { data: [] };
        })
      ]);

      console.log("Productos cargados:", resProductos.data);
      console.log("Servicios cargados:", resServicios.data);

      // Normalizar productos (agregar campo tipo)
      const productosNormalizados = resProductos.data.map(p => ({
        ...p,
        tipo: "producto",
        titulo: p.nombre, // Para uniformidad
        ubicacion: p.ubicacion || p.ciudad || "Ubicación no especificada" // Para uniformidad
      }));

      // Normalizar servicios (agregar campo tipo)
      const serviciosNormalizados = resServicios.data.map(s => ({
        ...s,
        tipo: "servicio",
        nombre: s.titulo, // Para uniformidad con productos
        ubicacion: s.ciudad || "Ubicación no especificada" // Para uniformidad
      }));

      // Combinar ambos arrays
      const todosCombinados = [...productosNormalizados, ...serviciosNormalizados];
      
      console.log("Total de items combinados:", todosCombinados.length);
      setItems(todosCombinados);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  // Función para obtener la primera imagen
  function obtenerPrimeraImagen(item) {
    // Para productos
    if (item.imagenUrl1) return item.imagenUrl1;
    if (item.imagenUrl2) return item.imagenUrl2;
    if (item.imagenUrl3) return item.imagenUrl3;
    if (item.imagenUrl4) return item.imagenUrl4;
    if (item.imagenUrl5) return item.imagenUrl5;
    
    // Para servicios (imagenes es un JSON string)
    if (item.imagenes) {
      try {
        const imagenesArray = JSON.parse(item.imagenes);
        if (imagenesArray && imagenesArray.length > 0) {
          return imagenesArray[0];
        }
      } catch (e) {
        console.error("Error parseando imágenes de servicio:", e);
      }
    }
    
    return null;
  }

  const itemsFiltrados = items.filter(item => {
    const nombreBusqueda = (item.nombre || item.titulo || "").toLowerCase();
    const coincideNombre = nombreBusqueda.includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === "" || categoriaFiltro === "Todas" || item.categoria === categoriaFiltro;
    const coincideTipo = tipoFiltro === "" || item.tipo === tipoFiltro;
    const coincideUbicacion = ubicacionFiltro === "" || item.ubicacion === ubicacionFiltro;
    const coincideEstado = estadoFiltro === "" || estadoFiltro === "Todos los estados" || item.estado === estadoFiltro;
    
    return coincideNombre && coincideCategoria && coincideTipo && coincideUbicacion && coincideEstado;
  });

  // Ordenar por precio
  const itemsOrdenados = [...itemsFiltrados].sort((a, b) => {
    if (ordenPrecio === "asc") {
      return (a.precio || 0) - (b.precio || 0);
    } else if (ordenPrecio === "desc") {
      return (b.precio || 0) - (a.precio || 0);
    }
    return 0;
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <p style={{ fontSize: "18px", color: "#666" }}>Cargando catálogo...</p>
        </div>
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
              🛍️ Catálogo
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              Explora productos y servicios disponibles ({items.length} items)
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar..."
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
            <strong style={{ color: "#333" }}>{itemsFiltrados.length}</strong> resultados
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

        {/* Grid */}
        {itemsFiltrados.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ color: "#333", marginBottom: "8px" }}>No se encontraron resultados</h3>
            <p style={{ color: "#666" }}>Intenta con otra búsqueda o categoría</p>
            <button
              onClick={cargarTodo}
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                background: "#00ccff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              🔄 Recargar catálogo
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {itemsOrdenados.map(item => {
              const primeraImagen = obtenerPrimeraImagen(item);
              const esServicio = item.tipo === "servicio";
              
              return (
                <div
                  key={`${item.tipo}-${item.id}`}
                  onClick={() => nav(esServicio ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #e9ecef"
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
                  <div style={{
                    width: "100%",
                    height: "200px",
                    background: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    {primeraImagen ? (
                      <img 
                        src={`http://localhost:8080${primeraImagen}`}
                        alt={item.nombre || item.titulo}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                    
                    {/* Badge */}
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
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px" }}>
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
                        {item.categoria}
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