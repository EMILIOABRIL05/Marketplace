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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 font-medium">Cargando historial...</p>
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
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            ❤️ Favoritos
          </button>

          <button 
            onClick={() => nav("/historial")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
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
        
        {/* Header con búsqueda */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              📊 Historial de Visitas
            </h1>
            <p className="text-slate-500 text-sm">
              Productos y servicios que has visitado
            </p>
          </div>

          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="🔍 Buscar en historial..."
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
            {estadosProducto.map(estado => (
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
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
            >
              ✕ Limpiar
            </button>
          )}

          {/* Contador */}
          <div className="ml-auto text-sm text-slate-500">
            <strong className="text-slate-800">{historialFiltrado.length}</strong> resultados
          </div>
        </div>

        {/* Lista de Historial */}
        {historialOrdenado.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">
              {historial.length === 0 ? "No tienes historial de visitas" : "No se encontraron resultados"}
            </h2>
            <p className="text-slate-500 mb-6">
              {historial.length === 0 
                ? "Explora productos y servicios, tu historial se guardará aquí" 
                : "Intenta con otros filtros"}
            </p>
            <button
              onClick={() => nav("/catalogo")}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-600/20"
            >
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {historialOrdenado.map(item => {
              const esServicio = item.servicio != null;
              const elemento = esServicio ? item.servicio : item.producto;
              const primeraImagen = obtenerPrimeraImagen(elemento, esServicio);
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => nav(esServicio ? `/servicio/${elemento.id}` : `/producto/${elemento.id}`)}
                  className="flex gap-5 p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  {/* Imagen */}
                  <div className="w-32 h-32 flex-shrink-0 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                    {primeraImagen ? (
                      <img 
                        src={`${primeraImagen}`}
                        alt={elemento.nombre || elemento.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `<span class="text-4xl text-slate-300">${esServicio ? '🛠️' : '📦'}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-4xl text-slate-300">
                        {esServicio ? '🛠️' : '📦'}
                      </span>
                    )}
                    
                    {/* Badge tipo */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold text-white shadow-sm ${
                      esServicio ? "bg-orange-500" : "bg-green-500"
                    }`}>
                      {esServicio ? "🛠️" : "📦"}
                    </div>
                  </div>

                  {/* Información */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {elemento.nombre || elemento.titulo}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {elemento.descripcion}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-blue-600 flex-shrink-0 ml-5">
                        {esServicio && elemento.tipoPrecio === "negociable" 
                          ? "A negociar" 
                          : esServicio && elemento.tipoPrecio === "desde"
                          ? `Desde $${(elemento.precio || 0).toFixed(2)}`
                          : `$${(elemento.precio || 0).toFixed(2)}`
                        }
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-500 mt-auto pt-2 border-t border-slate-50">
                      <span className="flex items-center gap-1">
                        📍 {elemento.ubicacion || elemento.ciudad}
                      </span>
                      <span className="flex items-center gap-1">
                        🏷️ {elemento.categoria || elemento.tipo}
                      </span>
                      {!esServicio && (elemento.estadoProducto || elemento.estado) && (
                        <span className="flex items-center gap-1">
                          ⭐ {elemento.estadoProducto || elemento.estado}
                        </span>
                      )}
                      <span className="ml-auto text-slate-400 font-medium">
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