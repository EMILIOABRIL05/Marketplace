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

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 font-medium">Cargando favoritos...</p>
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
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 flex flex-col gap-2">
          <button 
            onClick={() => nav("/catalogo")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            🏠 Catálogo
          </button>

          <button 
            onClick={() => nav("/mis-compras")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            🛍️ Mis Compras
          </button>

          <button 
            onClick={() => nav("/mis-ventas")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            💰 Mis Ventas
          </button>

          <button 
            onClick={() => nav("/publicar")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            ➕ Publicar
          </button>

          <button 
            onClick={() => nav("/favoritos")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
          >
            ❤️ Favoritos
          </button>

          <button 
            onClick={() => nav("/historial")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            📊 Historial
          </button>

          <button 
            onClick={() => nav("/mensajes")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            💬 Mensajes
          </button>

          <button 
            onClick={() => nav("/perfil")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            👤 Mi Perfil
          </button>
        </nav>

        {/* Footer con versión y botones */}
        <div className="p-6 border-t border-slate-200 bg-slate-100/50">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 font-medium text-sm"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-10 bg-slate-50 overflow-y-auto h-screen">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              ❤️ Mis Favoritos
            </h1>
            <p className="text-slate-500 text-sm">
              Productos y servicios que te gustan
            </p>
          </div>

          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="🔍 Buscar en favoritos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full md:w-[300px] px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {/* Filtro Tipo */}
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm min-w-[140px]"
          >
            <option value="">📦 Todos</option>
            <option value="producto">📦 Productos</option>
            <option value="servicio">🛠️ Servicios</option>
          </select>

          {/* Filtro Categoría */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm min-w-[180px]"
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
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm min-w-[180px]"
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
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm min-w-[180px]"
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
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm min-w-[180px]"
          >
            <option value="">Ordenar por precio</option>
            <option value="asc">Precio: Menor a Mayor</option>
            <option value="desc">Precio: Mayor a Menor</option>
          </select>

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
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
            >
              ✕ Limpiar
            </button>
          )}

          {/* Contador */}
          <div className="ml-auto text-sm text-slate-500">
            <strong className="text-slate-800">{favoritosFiltrados.length}</strong> resultados
          </div>
        </div>

        {/* Lista de Favoritos */}
        {favoritosOrdenados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">
              {favoritos.length === 0 ? "No tienes favoritos" : "No se encontraron resultados"}
            </h2>
            <p className="text-slate-500 mb-6">
              {favoritos.length === 0 
                ? "Explora el catálogo y agrega productos o servicios que te gusten"
                : "Intenta con otros filtros de búsqueda"
              }
            </p>
            <button
              onClick={() => nav("/catalogo")}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-600/20"
            >
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritosOrdenados.map(favorito => {
              const esServicio = favorito.servicio != null;
              const item = esServicio ? favorito.servicio : favorito.producto;
              const primeraImagen = obtenerPrimeraImagen(item, esServicio);
              
              return (
                <div 
                  key={favorito.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                  {/* Imagen */}
                  <div 
                    onClick={() => nav(esServicio ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                    className="relative h-48 bg-slate-100 overflow-hidden"
                  >
                    {primeraImagen ? (
                      <img 
                        src={primeraImagen.startsWith('http') ? primeraImagen : `http://86.48.2.202:8080${primeraImagen}`}
                        alt={item.nombre || item.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.classList.add("flex", "items-center", "justify-center");
                          e.target.parentElement.innerHTML = `<div class="text-4xl text-slate-300">${esServicio ? '🛠️' : '📦'}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                        {esServicio ? '🛠️' : '📦'}
                      </div>
                    )}
                    
                    {/* Badge tipo */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm ${
                      esServicio ? "bg-orange-500" : "bg-green-500"
                    }`}>
                      {esServicio ? "🛠️ SERVICIO" : "📦 PRODUCTO"}
                    </div>

                    {/* Botón eliminar favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarFavorito(item.id, esServicio);
                      }}
                      className="absolute top-3 left-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-10"
                      title="Eliminar de favoritos"
                    >
                      ❤️
                    </button>
                  </div>

                  {/* Información */}
                  <div 
                    onClick={() => nav(esServicio ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                    className="p-5"
                  >
                    <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">
                      {item.nombre || item.titulo}
                    </h3>

                    <p className="text-sm text-slate-500 mb-2 flex items-center gap-1 truncate">
                      📍 {item.ubicacion}
                    </p>

                    {/* Estado del producto (solo para productos) */}
                    {!esServicio && item.estado && (
                      <p className="text-xs text-slate-400 mb-2 italic">
                        Estado: {item.estado}
                      </p>
                    )}

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 h-10 leading-relaxed">
                      {item.descripcion}
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                      <div className="text-xl font-bold text-blue-600">
                        {esServicio && item.tipoPrecio === "negociable" 
                          ? "A negociar" 
                          : esServicio && item.tipoPrecio === "desde"
                          ? `Desde $${(item.precio || 0).toFixed(2)}`
                          : `$${(item.precio || 0).toFixed(2)}`
                        }
                      </div>

                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
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