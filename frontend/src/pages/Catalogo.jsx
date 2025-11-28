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

      // Normalizar productos (agregar campo tipoItem)
      const productosNormalizados = resProductos.data.map(p => ({
        ...p,
        tipoItem: "producto",
        categoria: p.tipo, // tipo del backend es la categoría
        titulo: p.nombre, // Para uniformidad
        ubicacion: p.ubicacion || p.ciudad || "Ubicación no especificada" // Para uniformidad
      }));

      // Normalizar servicios (agregar campo tipoItem)
      const serviciosNormalizados = resServicios.data.map(s => ({
        ...s,
        tipoItem: "servicio",
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
    const coincideTipo = tipoFiltro === "" || item.tipoItem === tipoFiltro;
    const coincideUbicacion = ubicacionFiltro === "" || item.ubicacion === ubicacionFiltro;
    const coincideEstado = estadoFiltro === "" || estadoFiltro === "Todos los estados" || item.estadoProducto === estadoFiltro;
    
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

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">⏳</div>
          <p className="text-lg text-slate-600 font-medium">Cargando catálogo...</p>
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
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm hover:shadow-md"
          >
            🏠 Catálogo
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
        
        {/* Header con búsqueda */}
        <div className="flex justify-between items-center mb-8 gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              🛍️ Catálogo
            </h1>
            <p className="text-slate-500 text-sm">
              Explora productos y servicios disponibles ({items.length} items)
            </p>
          </div>

          <div className="relative w-80">
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-8 flex-wrap items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          {/* Filtro Tipo */}
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:bg-slate-100 transition-all"
          >
            <option value="">📦 Todos</option>
            <option value="producto">📦 Productos</option>
            <option value="servicio">🛠️ Servicios</option>
          </select>

          {/* Filtro Categoría */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:bg-slate-100 transition-all"
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
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:bg-slate-100 transition-all"
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
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:bg-slate-100 transition-all"
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
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:bg-slate-100 transition-all"
          >
            <option value="">Ordenar por precio</option>
            <option value="asc">Precio: Menor a Mayor</option>
            <option value="desc">Precio: Mayor a Menor</option>
          </select>

          {/* Contador */}
          <div className="ml-auto text-sm text-slate-500">
            <strong className="text-slate-800">{itemsFiltrados.length}</strong> resultados
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
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-100 transition-all"
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Grid */}
        {itemsFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="text-6xl mb-4 opacity-20">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron resultados</h3>
            <p className="text-slate-500 mb-6">Intenta con otra búsqueda o categoría</p>
            <button
              onClick={cargarTodo}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-600/20"
            >
              🔄 Recargar catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {itemsOrdenados.map(item => {
              const primeraImagen = obtenerPrimeraImagen(item);
              const esServicio = item.tipoItem === "servicio";
              
              return (
                <div
                  key={`${item.tipoItem}-${item.id}`}
                  onClick={() => nav(esServicio ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Imagen */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {primeraImagen ? (
                      <img 
                        src={primeraImagen.startsWith('http') ? primeraImagen : `http://86.48.2.202:8080${primeraImagen}`}
                        alt={item.nombre || item.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl text-slate-300">${esServicio ? '🛠️' : '📦'}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                        {esServicio ? '🛠️' : '📦'}
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider text-white shadow-lg ${
                      esServicio ? "bg-orange-500" : "bg-emerald-500"
                    }`}>
                      {esServicio ? "🛠️ SERVICIO" : "📦 PRODUCTO"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors">
                      {item.nombre || item.titulo}
                    </h3>

                    <p className="text-sm text-slate-500 mb-3 flex items-center gap-1 truncate">
                      📍 {item.ubicacion}
                    </p>

                    {/* Estado del producto (solo para productos) */}
                    {!esServicio && item.estado && (
                      <p className="text-xs text-slate-400 mb-3 italic">
                        Estado: {item.estado}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                      <div className="text-xl font-bold text-slate-900">
                        {esServicio && item.tipoPrecio === "negociable" 
                          ? "A negociar" 
                          : esServicio && item.tipoPrecio === "desde"
                          ? `Desde $${(item.precio || 0).toFixed(2)}`
                          : `$${(item.precio || 0).toFixed(2)}`
                        }
                      </div>

                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200">
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