import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function DetalleServicio() {
  const [servicio, setServicio] = useState(null);
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
      await cargarServicio();
      await verificarFavorito();
      await registrarVista();
    };
    
    cargarDatos();
  }, [id]);

  async function cargarServicio() {
    try {
      // 🆕 CAMBIO: Usar endpoint público
      const res = await api.get(`/servicios/public/${id}`);
      console.log("✅ Servicio cargado (público):", res.data);
      setServicio(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando servicio:", err);
      setError("No se pudo cargar el servicio");
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
      const res = await api.get(`/favoritos/check?usuarioId=${user.id}&servicioId=${id}`);
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
      await api.post(`/historial?usuarioId=${user.id}&servicioId=${id}`);
    } catch (err) {
      console.error("Error registrando vista:", err);
    }
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
        await api.delete(`/favoritos?usuarioId=${user.id}&servicioId=${id}`);
        setEsFavorito(false);
        alert("Eliminado de favoritos");
      } else {
        await api.post(`/favoritos?usuarioId=${user.id}&servicioId=${id}`);
        setEsFavorito(true);
        alert("Agregado a favoritos");
      }
    } catch (err) {
      alert("Error al actualizar favoritos");
      console.error(err);
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
        servicioId: id,
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

  function contactarVendedor() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para contactar al proveedor");
      nav("/login");
      return;
    }
    
    nav(`/mensajes?vendedorId=${servicio.vendedor.id}&servicioId=${servicio.id}`);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  function obtenerImagenes() {
    if (!servicio.imagenes) return [];
    try {
      return JSON.parse(servicio.imagenes);
    } catch (e) {
      return [];
    }
  }

  function obtenerDiasDisponibles() {
    if (!servicio.diasDisponibles) return [];
    try {
      return JSON.parse(servicio.diasDisponibles);
    } catch (e) {
      return [];
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Cargando servicio...</p>
      </div>
    );
  }

  if (error || !servicio) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-5">
        <p className="text-lg text-red-600">{error || "Servicio no encontrado"}</p>
        <button 
          onClick={() => nav("/catalogo")}
          className="bg-sky-400 text-white py-3 px-6 rounded-lg border-none cursor-pointer text-base font-bold hover:bg-sky-500 transition-colors"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const imagenes = obtenerImagenes();
  const diasDisponibles = obtenerDiasDisponibles();

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
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => nav("/catalogo")}
            className="bg-white text-slate-500 border border-slate-200 py-2.5 px-5 rounded-xl cursor-pointer text-sm font-semibold flex items-center gap-2 transition-all hover:border-slate-300 hover:text-slate-900 shadow-sm"
          >
            ← Volver al Catálogo
          </button>
        </div>

        {/* Badge de Servicio */}
        <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 py-1.5 px-3 rounded-full text-xs font-bold mb-6 border border-orange-100">
          <span>🛠️</span> SERVICIO
        </div>

        {/* Detalle del Servicio */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 max-w-6xl">
          
          {/* Galería de Imágenes */}
          <div>
            <div className="bg-white rounded-3xl p-10 flex items-center justify-center min-h-[500px] mb-5 relative shadow-sm border border-slate-200">
              {imagenes.length > 0 ? (
                <>
                  <img 
                    src={`http://localhost:8080${imagenes[imagenActual]}`}
                    alt={servicio.titulo}
                    className="max-w-full max-h-[450px] object-contain rounded-xl"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div class="text-center text-slate-400"><div class="text-8xl mb-5">🛠️</div><p>Sin imagen disponible</p></div>';
                    }}
                  />
                  
                  {imagenes.length > 1 && (
                    <>
                      <button
                        onClick={() => setImagenActual((imagenActual - 1 + imagenes.length) % imagenes.length)}
                        className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 border border-slate-200 rounded-full w-12 h-12 cursor-pointer text-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setImagenActual((imagenActual + 1) % imagenes.length)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 border border-slate-200 rounded-full w-12 h-12 cursor-pointer text-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-8xl mb-5">🛠️</div>
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
                    className={`min-w-[80px] h-20 bg-white rounded-xl overflow-hidden cursor-pointer transition-all ${
                      index === imagenActual 
                        ? "border-2 border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]" 
                        : "border border-slate-200"
                    }`}
                  >
                    <img 
                      src={`http://localhost:8080${img}`}
                      alt={`${servicio.titulo} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Botones: Favorito y Reportar */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={toggleFavorito}
                className={`w-full p-3.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm ${
                  esFavorito 
                    ? "border-red-200 bg-red-50 text-red-500" 
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {esFavorito ? "❤️ En Favoritos" : "🤍 Agregar a Favoritos"}
              </button>

              <button
                onClick={() => setMostrarReporte(true)}
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
              >
                🚩 Reportar
              </button>
            </div>
          </div>

          {/* Información del Servicio */}
          <div className="flex flex-col gap-8">
            
            {/* Título y Categoría */}
            <div>
              <div className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                <span className="bg-slate-100 py-1 px-2.5 rounded-full text-xs font-semibold">{servicio.categoria}</span>
                <span className="text-slate-300">•</span>
                <span>{servicio.modalidad}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 m-0 mb-4 leading-tight tracking-tight">
                {servicio.titulo}
              </h1>
              
              {/* Precio */}
              <div className="text-4xl font-extrabold text-blue-500 mb-2 tracking-tight">
                {servicio.tipoPrecio === "negociable" 
                  ? "A negociar" 
                  : servicio.tipoPrecio === "desde"
                  ? `Desde $${servicio.precio?.toFixed(2)}`
                  : `$${servicio.precio?.toFixed(2)}`
                }
              </div>
              
              {servicio.duracion && (
                <div className="text-sm text-slate-500 mt-2 font-medium">
                  {servicio.duracion === "hora" && "Por hora"}
                  {servicio.duracion === "dia" && "Por día"}
                  {servicio.duracion === "proyecto" && "Por proyecto"}
                  {servicio.duracion === "evento" && "Por evento"}
                  {servicio.duracion === "clase" && "Por clase"}
                </div>
              )}
            </div>

            {/* Información del Proveedor */}
            {servicio.vendedor && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 m-0 mb-4 flex items-center gap-2">
                  <span>👤</span> Información del Proveedor
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                      {servicio.vendedor.nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-900 font-semibold text-base">
                        {servicio.vendedor.nombre} {servicio.vendedor.apellido}
                      </div>
                      <div className="text-slate-500 text-xs">Proveedor verificado</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={contactarVendedor}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300"
                  >
                    💬 Contactar Proveedor
                  </button>
                </div>
              </div>
            )}

            {/* Detalles del servicio */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 m-0 mb-5">
                Detalles del servicio
              </h3>
              
              <div className="mb-6 flex flex-col gap-3">
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Categoría</span>
                  <span className="text-slate-900 font-medium text-sm">{servicio.categoria}</span>
                </div>
                
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Modalidad</span>
                  <span className="text-slate-900 font-medium text-sm">
                    {servicio.modalidad === "presencial" && "Presencial"}
                    {servicio.modalidad === "domicilio" && "A Domicilio"}
                    {servicio.modalidad === "local" && "En Local"}
                    {servicio.modalidad === "virtual" && "En Línea / Virtual"}
                  </span>
                </div>
                
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Ubicación</span>
                  <span className="text-slate-900 font-medium text-sm">
                    📍 {servicio.ciudad}{servicio.barrio && `, ${servicio.barrio}`}
                  </span>
                </div>
                
                {diasDisponibles.length > 0 && (
                  <div className="py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm block mb-2">
                      Días disponibles
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {diasDisponibles.map((dia, index) => (
                        <span key={index} className="py-1 px-3 bg-sky-50 text-sky-600 rounded-xl text-xs font-semibold border border-sky-100">
                          {dia}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {servicio.horario && (
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Horario</span>
                    <span className="text-slate-900 font-medium text-sm">🕐 {servicio.horario}</span>
                  </div>
                )}
              </div>

              {servicio.descripcion && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Descripción
                  </h4>
                  <p className="text-slate-600 leading-relaxed m-0 whitespace-pre-line text-sm">
                    {servicio.descripcion}
                  </p>
                </div>
              )}

              {servicio.condiciones && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Condiciones del servicio
                  </h4>
                  <p className="text-slate-600 leading-relaxed m-0 whitespace-pre-line text-sm">
                    {servicio.condiciones}
                  </p>
                </div>
              )}
            </div>

            {/* Información de Pago Deuna */}
            {(servicio.deunaNumero || servicio.deunaQrUrl) && (
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <h3 className="text-lg font-bold text-emerald-900 m-0 mb-4 flex items-center gap-2">
                  💳 Métodos de Pago
                </h3>
                
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {servicio.deunaQrUrl && (
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                      <img 
                        src={`http://localhost:8080${servicio.deunaQrUrl}`} 
                        alt="QR Deuna" 
                        className="w-32 h-32 object-contain"
                      />
                      <p className="text-center text-xs font-bold text-emerald-700 mt-2">Escanear para pagar</p>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    {servicio.deunaNumero && (
                      <div className="mb-3">
                        <p className="text-sm text-emerald-700 font-semibold mb-1">Número Deuna / Banco Pichincha</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-2 rounded-lg border border-emerald-200 text-emerald-900 font-mono text-lg font-bold">
                            {servicio.deunaNumero}
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(servicio.deunaNumero);
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
              Reportar servicio
            </h2>
            
            <form onSubmit={enviarReporte} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Motivo del reporte *
                </label>
                <select
                  value={motivoReporte}
                  onChange={(e) => setMotivoReporte(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="SPAM">Spam o contenido repetitivo</option>
                  <option value="CONTENIDO_INAPROPIADO">Contenido inapropiado</option>
                  <option value="FRAUDE">Posible fraude o estafa</option>
                  <option value="PRECIO_INCORRECTO">Precio incorrecto</option>
                  <option value="SERVICIO_NO_DISPONIBLE">Servicio no disponible</option>
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
                  placeholder="Explica por qué reportas este servicio..."
                  rows="4"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm resize-y box-border text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-500 text-white p-3 rounded-xl border-none text-sm font-semibold cursor-pointer transition-all hover:bg-red-600"
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
                  className="flex-1 bg-white text-slate-500 p-3 rounded-xl border border-slate-300 text-sm font-semibold cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-700"
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