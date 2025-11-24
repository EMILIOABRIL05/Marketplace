import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function DetalleProducto() {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagenActual, setImagenActual] = useState(0);
  const [esFavorito, setEsFavorito] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState("");
  const [descripcionReporte, setDescripcionReporte] = useState("");
  const { id } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      await cargarProducto();
      await verificarFavorito();
      await registrarVista();
    };
    
    cargarDatos();
  }, [id]);

  async function cargarProducto() {
    try {
      // 🆕 CAMBIO: Usar endpoint público
      const res = await api.get(`/productos/public/${id}`);
      console.log("✅ Producto cargado (público):", res.data);
      console.log("🔍 Campos de imágenes:");
      console.log("  - imagenUrl1:", res.data.imagenUrl1);
      console.log("  - imagenUrl2:", res.data.imagenUrl2);
      console.log("  - imagenUrl3:", res.data.imagenUrl3);
      console.log("  - imagenUrl4:", res.data.imagenUrl4);
      console.log("  - imagenUrl5:", res.data.imagenUrl5);
      
      setProducto(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando producto:", err);
      setError("No se pudo cargar el producto");
      setLoading(false);
    }
  }

  async function verificarFavorito() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      console.log("👤 Usuario no autenticado - omitiendo verificación de favoritos");
      return;
    }

    try {
      const res = await api.get(`/favoritos/check?usuarioId=${user.id}&productoId=${id}`);
      setEsFavorito(res.data);
    } catch (err) {
      console.error("Error verificando favorito:", err);
    }
  }

  async function registrarVista() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      console.log("👤 Usuario no autenticado - omitiendo registro de vista");
      return;
    }

    try {
      await api.post(`/historial?usuarioId=${user.id}&productoId=${id}`);
    } catch (err) {
      console.error("Error registrando vista:", err);
    }
  }

  function obtenerImagenesProducto() {
    if (!producto) {
      console.log("❌ No hay producto aún");
      return [];
    }
    
    const imagenes = [
      producto.imagenUrl1,
      producto.imagenUrl2, 
      producto.imagenUrl3,
      producto.imagenUrl4,
      producto.imagenUrl5
    ].filter(url => url && url.trim() !== '');
    
    console.log("📸 Imágenes del producto:", imagenes);
    return imagenes;
  }

  async function toggleFavorito() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para agregar favoritos");
      nav("/login");
      return;
    }

    try {
      if (esFavorito) {
        await api.delete(`/favoritos?usuarioId=${user.id}&productoId=${id}`);
        setEsFavorito(false);
        alert("Eliminado de favoritos");
      } else {
        await api.post(`/favoritos?usuarioId=${user.id}&productoId=${id}`);
        setEsFavorito(true);
        alert("Agregado a favoritos");
      }
    } catch (err) {
      alert("Error al actualizar favoritos");
      console.error(err);
    }
  }

  async function agregarAlCarrito() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para agregar al carrito");
      nav("/login");
      return;
    }

    try {
      await api.post(`/carrito/${user.id}/agregar`, null, {
        params: {
          productoId: id,
          cantidad: 1
        }
      });
      alert("Producto agregado al carrito exitosamente");
      // Opcional: redirigir al carrito o preguntar si quiere ir
      if(window.confirm("Producto agregado. ¿Deseas ir al carrito?")) {
        nav("/carrito");
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert("No se pudo agregar al carrito. " + (err.response?.data || "Intenta nuevamente."));
    }
  }

  async function enviarReporte(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para reportar");
      nav("/login");
      return;
    }

    if (!motivoReporte || !descripcionReporte) {
      alert("Completa todos los campos del reporte");
      return;
    }

    try {
      await api.post("/reportes", {
        usuarioId: user.id,
        productoId: id,
        motivo: motivoReporte,
        descripcion: descripcionReporte
      });
      
      alert("Reporte enviado correctamente");
      setMostrarReporte(false);
      setMotivoReporte("");
      setDescripcionReporte("");
    } catch (err) {
      alert("Error al enviar reporte");
      console.error(err);
    }
  }

  function enviarMensaje() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para contactar al vendedor");
      nav("/login");
      return;
    }
    
    nav(`/mensajes?vendedorId=${producto.vendedor.id}&productoId=${producto.id}`);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontSize: "18px", color: "#c33" }}>{error || "Producto no encontrado"}</p>
        <button 
          onClick={() => nav("/catalogo")}
          style={{ background: "#00ccff", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const imagenes = obtenerImagenesProducto();

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
            ➕ Publicar Producto
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
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => nav("/catalogo")}
            className="bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:border-slate-300 hover:text-slate-900"
          >
            ← Volver al Catálogo
          </button>
        </div>

        {/* Badge de Producto */}
        <div className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border border-cyan-100">
          <span>📦</span> PRODUCTO
        </div>

        {/* Detalle del Producto */}
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 max-w-7xl">
          
          {/* Galería de Imágenes */}
          <div>
            <div className="bg-white rounded-3xl p-10 flex items-center justify-center min-h-[500px] mb-5 relative shadow-sm border border-slate-200">
              {imagenes.length > 0 ? (
                <>
                  <img 
                    src={`http://localhost:8080${imagenes[imagenActual]}`}
                    alt={producto.nombre}
                    className="max-w-full max-h-[450px] object-contain rounded-xl"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div class="text-center text-slate-400"><div class="text-6xl mb-5">📦</div><p>Imagen no disponible</p></div>';
                    }}
                  />
                  
                  {imagenes.length > 1 && (
                    <>
                      <button
                        onClick={() => setImagenActual((imagenActual - 1 + imagenes.length) % imagenes.length)}
                        className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 border border-slate-200 rounded-full w-12 h-12 cursor-pointer text-2xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setImagenActual((imagenActual + 1) % imagenes.length)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 border border-slate-200 rounded-full w-12 h-12 cursor-pointer text-2xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-8xl mb-5">📦</div>
                  <p>Sin imágenes disponibles</p>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div className="flex gap-4 mb-8 overflow-x-auto p-1">
                {imagenes.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setImagenActual(index)}
                    className={`min-w-[80px] h-20 bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                      index === imagenActual 
                        ? "border-2 border-blue-500 ring-2 ring-blue-500/20" 
                        : "border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img 
                      src={`http://localhost:8080${img}`}
                      alt={`${producto.nombre} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400 text-xl">❌</div>';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Botones Favorito y Reportar */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={toggleFavorito}
                className={`w-full p-3.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  esFavorito 
                    ? "border-red-200 bg-red-50 text-red-500" 
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {esFavorito ? "❤️ En Favoritos" : "🤍 Agregar a Favoritos"}
              </button>

              <button
                onClick={() => setMostrarReporte(true)}
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
              >
                🚩 Reportar
              </button>
            </div>
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col gap-8">
            
            {/* Título, Categoría y Precio */}
            <div>
              <div className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                <span className="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold">{producto.tipo}</span>
                <span className="text-slate-300">•</span>
                <span>{producto.estadoProducto || "General"}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 m-0 mb-4 leading-tight tracking-tight">
                {producto.nombre}
              </h1>
              <div className="text-4xl font-extrabold text-blue-500 mb-2 tracking-tight">
                ${producto.precio?.toFixed(2)}
              </div>
            </div>

            {/* Botones de Compra */}
            <div className="flex flex-col gap-4">
              <button 
                disabled={producto.cantidad <= 0}
                className={`w-full p-4 rounded-xl border-none text-base font-semibold transition-all duration-200 ${
                  producto.cantidad > 0 
                    ? "bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-500/30 hover:bg-blue-600" 
                    : "bg-slate-200 text-white cursor-not-allowed"
                }`}
              >
                {producto.cantidad > 0 ? "Comprar ahora" : "Sin stock"}
              </button>
              
              <button 
                onClick={agregarAlCarrito}
                disabled={producto.cantidad <= 0}
                className={`w-full p-4 rounded-xl border text-base font-semibold transition-all duration-200 ${
                  producto.cantidad > 0 
                    ? "bg-white border-slate-200 text-slate-900 cursor-pointer hover:bg-slate-50 hover:border-slate-300" 
                    : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {producto.cantidad > 0 ? "Agregar al carrito" : "Agotado"}
              </button>
            </div>

            {/* Información del Vendedor */}
            {producto.vendedor && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 m-0 mb-4 flex items-center gap-2">
                  <span>👤</span> Información del Vendedor
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                      {producto.vendedor.nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-900 font-semibold text-base">
                        {producto.vendedor.nombre} {producto.vendedor.apellido}
                      </div>
                      <div className="text-slate-500 text-xs">Vendedor verificado</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={enviarMensaje}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300"
                  >
                    💬 Contactar Vendedor
                  </button>
                </div>
              </div>
            )}

            {/* Detalles del producto */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 m-0 mb-5">
                Detalles del producto
              </h3>
              
              <div className="mb-6 flex flex-col gap-3">
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Código</span>
                  <span className="text-slate-900 font-medium text-sm">{producto.codigo || "N/A"}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Estado</span>
                  <span className="text-slate-900 font-medium text-sm">{producto.estadoProducto || "No especificado"}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Categoría</span>
                  <span className="text-slate-900 font-medium text-sm">{producto.tipo}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Ubicación</span>
                  <span className="text-slate-900 font-medium text-sm">📍 {producto.ubicacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Stock</span>
                  <span className={`font-semibold text-sm ${producto.cantidad > 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {producto.cantidad > 0 ? `${producto.cantidad} unidades` : "Agotado"}
                  </span>
                </div>
              </div>

              {producto.descripcion && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Descripción
                  </h4>
                  <p className="text-slate-600 leading-relaxed m-0 whitespace-pre-line text-sm">
                    {producto.descripcion}
                  </p>
                </div>
              )}
            </div>

            {/* Información de Pago Deuna */}
            {(producto.deunaNumero || producto.deunaQrUrl) && (
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-900 m-0 mb-4 flex items-center gap-2">
                  💳 Métodos de Pago
                </h3>
                
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {producto.deunaQrUrl && (
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                      <img 
                        src={`http://localhost:8080${producto.deunaQrUrl}`} 
                        alt="QR Deuna" 
                        className="w-32 h-32 object-contain"
                      />
                      <p className="text-center text-xs font-bold text-emerald-700 mt-2">Escanear para pagar</p>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    {producto.deunaNumero && (
                      <div className="mb-3">
                        <p className="text-sm text-emerald-700 font-semibold mb-1">Número Deuna / Banco Pichincha</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-2 rounded-lg border border-emerald-200 text-emerald-900 font-mono text-lg font-bold">
                            {producto.deunaNumero}
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(producto.deunaNumero);
                              alert("Número copiado al portapapeles");
                            }}
                            className="p-2 bg-white text-emerald-600 rounded-lg border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors"
                            title="Copiar número"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-emerald-600 italic">
                      * Verifica los datos antes de realizar cualquier transferencia.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reporte */}
      {mostrarReporte && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-[90%] shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
              Reportar producto
            </h2>
            
            <form onSubmit={enviarReporte} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Motivo del reporte *
                </label>
                <select
                  value={motivoReporte}
                  onChange={(e) => setMotivoReporte(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="SPAM">Spam o contenido repetitivo</option>
                  <option value="CONTENIDO_INAPROPIADO">Contenido inapropiado</option>
                  <option value="FRAUDE">Posible fraude o estafa</option>
                  <option value="PRECIO_INCORRECTO">Precio incorrecto</option>
                  <option value="OTRO">Otro motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={descripcionReporte}
                  onChange={(e) => setDescripcionReporte(e.target.value)}
                  placeholder="Explica por qué reportas este producto..."
                  rows="4"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm resize-y text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-500 text-white p-3 rounded-xl border-none text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-red-600"
                >
                  Enviar reporte
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarReporte(false);
                    setMotivoReporte("");
                    setDescripcionReporte("");
                  }}
                  className="flex-1 bg-white text-slate-600 p-3 rounded-xl border border-slate-300 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
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