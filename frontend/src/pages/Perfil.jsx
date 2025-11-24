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
    const producto = misProductos.find(p => p.id === productoId);
    
    if (fueOcultadoPorAdmin(producto)) {
      alert("⛔ No puedes eliminar este producto porque ha sido detectado como peligroso o prohibido.\n\nEl producto ha desaparecido de la visualización pública, pero permanece en tu perfil para revisión. Si crees que es un error, utiliza la opción de 'Apelar'.");
      return;
    }

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
    const servicio = misServicios.find(s => s.id === servicioId);
    
    if (fueOcultadoPorAdmin(servicio)) {
      alert("⛔ No puedes eliminar este servicio porque ha sido detectado como peligroso o prohibido.\n\nEl servicio ha desaparecido de la visualización pública, pero permanece en tu perfil para revisión. Si crees que es un error, utiliza la opción de 'Apelar'.");
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 font-medium">Cargando perfil...</p>
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
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            📊 Historial
          </button>

          <button 
            onClick={() => nav("/perfil")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
          >
            👤 Mi Perfil
          </button>
        </nav>

        {/* Footer con versión y botones */}
        <div className="p-6 border-t border-slate-200 bg-slate-100/50">
          <button 
            onClick={() => {
              localStorage.removeItem("user");
              nav("/");
            }}
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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-3xl text-white shadow-lg shadow-blue-600/20">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">
                {usuario?.nombre} {usuario?.apellido}
              </h1>
              <p className="text-slate-500 text-sm">
                {usuario?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {estadisticas.productosActivos}
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider">PRODUCTOS ACTIVOS</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="text-3xl mb-2">🛠️</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {estadisticas.serviciosActivos}
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider">SERVICIOS ACTIVOS</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {estadisticas.totalProductos}
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider">TOTAL PRODUCTOS</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {estadisticas.totalServicios}
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider">TOTAL SERVICIOS</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {estadisticas.productosOcultos + estadisticas.serviciosOcultos}
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider">TOTAL OCULTOS</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              ${estadisticas.ventasTotales}
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider">VENTAS TOTALES</div>
          </div>
        </div>

        {/* Mis Publicaciones */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
            <button
              onClick={() => setTabActiva("productos")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tabActiva === "productos" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-transparent text-slate-500 hover:bg-slate-50"
              }`}
            >
              📦 Productos ({misProductos.length})
            </button>
            <button
              onClick={() => setTabActiva("servicios")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tabActiva === "servicios" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-transparent text-slate-500 hover:bg-slate-50"
              }`}
            >
              🛠️ Servicios ({misServicios.length})
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              {tabActiva === "productos" ? "📋 MIS PRODUCTOS" : "🛠️ MIS SERVICIOS"}
            </h2>
            <button
              onClick={() => nav("/publicar")}
              className="bg-blue-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
            >
              + NUEVA PUBLICACIÓN
            </button>
          </div>

          {tabActiva === "productos" ? (
            misProductos.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-6xl mb-4">📦</div>
                <p className="mb-4">No tienes productos publicados aún</p>
                <button
                  onClick={() => nav("/publicar")}
                  className="bg-blue-600 text-white border-none px-6 py-3 rounded-xl cursor-pointer text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Publicar mi primer producto
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {misProductos.map(producto => {
                  const estado = determinarEstado(producto);
                  const ocultadoPorAdmin = fueOcultadoPorAdmin(producto);
                  
                  return (
                    <div 
                      key={producto.id}
                      className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-xl border border-slate-100 relative shadow-sm hover:shadow-md transition-all gap-4"
                    >
                      {/* Badge de Apelación si fue ocultado por admin */}
                      {ocultadoPorAdmin && (
                        <div className="absolute -top-2 -left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold z-10 shadow-sm">
                          ⚠️ OCULTO POR ADMIN
                        </div>
                      )}

                      <div className="flex gap-4 items-center flex-1 w-full">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {producto.imagenUrl1 ? (
                            <img 
                              src={`${producto.imagenUrl1}`} 
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-800 mb-1 truncate">
                            {producto.nombre}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="font-semibold text-blue-600">${producto.precio}</span>
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
                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                              <strong>Razón:</strong> {producto.razonOcultamiento}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          estado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {estado === "ACTIVO" ? "Activo" : "Oculto"}
                        </span>
                        
                        <button
                          onClick={() => nav(`/producto/${producto.id}`)}
                          className="bg-blue-600 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-blue-700 transition-all"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => editarProducto(producto.id)}
                          className="bg-sky-500 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-sky-600 transition-all"
                        >
                          ✏️ Editar
                        </button>

                        {!ocultadoPorAdmin && (
                          <button
                            onClick={() => cambiarEstadoProducto(producto.id, estado === "ACTIVO" ? "OCULTO" : "ACTIVO")}
                            className={`text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all ${
                              estado === "ACTIVO" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {estado === "ACTIVO" ? "Ocultar" : "Activar"}
                          </button>
                        )}

                        {ocultadoPorAdmin && (
                          <button
                            onClick={() => iniciarApelacion(producto)}
                            className="bg-red-500 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-red-600 transition-all"
                          >
                            🏛️ Apelar
                          </button>
                        )}

                        <button
                          onClick={() => eliminarProducto(producto.id, producto.nombre)}
                          className="bg-red-500 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-red-600 transition-all"
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
              <div className="text-center py-12 text-slate-400">
                <div className="text-6xl mb-4">🛠️</div>
                <p className="mb-4">No tienes servicios publicados aún</p>
                <button
                  onClick={() => nav("/publicar")}
                  className="bg-blue-600 text-white border-none px-6 py-3 rounded-xl cursor-pointer text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Publicar mi primer servicio
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {misServicios.map(servicio => {
                  const estado = determinarEstado(servicio);
                  const primeraImagen = obtenerPrimeraImagen(servicio, true);
                  
                  return (
                    <div 
                      key={servicio.id}
                      className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all gap-4"
                    >
                      <div className="flex gap-4 items-center flex-1 w-full">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {primeraImagen ? (
                            <img 
                              src={`${primeraImagen}`} 
                              alt={servicio.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">🛠️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-800 mb-1 truncate">
                            {servicio.titulo}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="font-semibold text-blue-600">
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

                      <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          estado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {estado === "ACTIVO" ? "Activo" : "Oculto"}
                        </span>
                        
                        <button
                          onClick={() => nav(`/servicio/${servicio.id}`)}
                          className="bg-blue-600 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-blue-700 transition-all"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => editarServicio(servicio.id)}
                          className="bg-sky-500 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-sky-600 transition-all"
                        >
                          ✏️ Editar
                        </button>

                        <button
                          onClick={() => cambiarEstadoServicio(servicio.id, estado === "ACTIVO" ? "OCULTO" : "ACTIVO")}
                          className={`text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all ${
                            estado === "ACTIVO" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {estado === "ACTIVO" ? "Ocultar" : "Activar"}
                        </button>

                        <button
                          onClick={() => eliminarServicio(servicio.id, servicio.titulo)}
                          className="bg-red-500 text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold hover:bg-red-600 transition-all"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              🏛️ Apelar Producto Ocultado
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-bold mb-2 text-yellow-800">
                Producto: {productoApelar.nombre}
              </h3>
              <p className="text-xs text-yellow-700 leading-relaxed">
                Este producto fue ocultado por un administrador. Puedes apelar esta decisión explicando por qué consideras que debería ser visible nuevamente.
              </p>
            </div>
            
            <form onSubmit={enviarApelacion} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Motivo de la apelación *
                </label>
                <select
                  value={motivoApelacion}
                  onChange={(e) => setMotivoApelacion(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Explicación detallada *
                </label>
                <textarea
                  value={descripcionApelacion}
                  onChange={(e) => setDescripcionApelacion(e.target.value)}
                  placeholder="Explica por qué consideras que este producto debería ser visible nuevamente..."
                  rows="6"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={enviandoApelacion}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all ${
                    enviandoApelacion 
                      ? "bg-slate-400 cursor-not-allowed" 
                      : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                  }`}
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
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
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