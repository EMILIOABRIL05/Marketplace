import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

const Mensajes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActual, setConversacionActual] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [contextoItem, setContextoItem] = useState(null);
  
  // Estados para valoración
  const [mostrarModalValoracion, setMostrarModalValoracion] = useState(false);
  const [rating, setRating] = useState(0);
  const [comentarioValoracion, setComentarioValoracion] = useState("");
  const [enviandoValoracion, setEnviandoValoracion] = useState(false);
  
  const usuario = JSON.parse(localStorage.getItem('user'));

  // Callback para mensajes WebSocket
  const handleWebSocketMessage = (mensaje) => {
    if (conversacionActual && 
        (mensaje.conversacion?.id === conversacionActual.conversacionId ||
         mensaje.remitente?.id === conversacionActual.destinatarioId ||
         mensaje.destinatario?.id === conversacionActual.destinatarioId)) {
      // Agregar mensaje a la conversación actual
      setMensajes(prev => [...prev, mensaje]);
      marcarComoLeido(conversacionActual.conversacionId);
    }
    // Recargar conversaciones para actualizar el último mensaje
    cargarConversaciones();
  };

  // Conectar WebSocket
  const { isConnected } = useWebSocket(usuario?.id, handleWebSocketMessage);

  // Parámetros para iniciar chat desde producto/servicio
  const vendedorId = searchParams.get('vendedorId');
  const productoId = searchParams.get('productoId');
  const servicioId = searchParams.get('servicioId');

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    cargarConversaciones();
    cargarMensajesNoLeidos();

    // Si viene de un producto/servicio, iniciar conversación
    if (vendedorId) {
      iniciarConversacionDirecta();
    }

    if (productoId) {
      cargarContextoProducto(productoId);
    } else if (servicioId) {
      cargarContextoServicio(servicioId);
    }

    // Actualizar cada 10 segundos solo si WebSocket no está conectado
    const interval = setInterval(() => {
      if (!isConnected && conversacionActual) {
        cargarMensajesConversacion(conversacionActual.conversacionId);
      }
      cargarMensajesNoLeidos();
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected, conversacionActual]);

  const cargarContextoProducto = async (id) => {
    try {
      const res = await api.get(`/productos/public/${id}`);
      setContextoItem({ tipo: 'producto', data: res.data });
    } catch (error) {
      console.error("Error cargando contexto producto:", error);
    }
  };

  const cargarContextoServicio = async (id) => {
    try {
      const res = await api.get(`/servicios/public/${id}`);
      setContextoItem({ tipo: 'servicio', data: res.data });
    } catch (error) {
      console.error("Error cargando contexto servicio:", error);
    }
  };

  const iniciarConversacionDirecta = async () => {
    try {
      // Cargar datos del vendedor
      const response = await api.get(`/usuarios/${vendedorId}`);
      const vendedor = response.data;

      // Crear conversación temporal
      const conversacionId = generarConversacionId(usuario.id, parseInt(vendedorId));
      setConversacionActual({
        conversacionId,
        otroUsuario: vendedor
      });

      cargarMensajesConversacion(conversacionId);
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
    }
  };

  const generarConversacionId = (userId1, userId2) => {
    const menor = Math.min(userId1, userId2);
    const mayor = Math.max(userId1, userId2);
    return `${menor}_${mayor}`;
  };

  const cargarConversaciones = async () => {
    try {
      const response = await api.get(`/mensajes/conversaciones/${usuario.id}`);
      const conversacionesData = response.data;

      // Procesar conversaciones para obtener el otro usuario
      const conversacionesProcesadas = conversacionesData.map(msg => {
        const otroUsuario = msg.remitente.id === usuario.id ? msg.destinatario : msg.remitente;
        return {
          conversacionId: msg.conversacionId,
          otroUsuario: otroUsuario,
          ultimoMensaje: msg.contenido,
          fechaUltimoMensaje: msg.fechaEnvio,
          noLeido: !msg.leido && msg.destinatario.id === usuario.id
        };
      });

      setConversaciones(conversacionesProcesadas);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    }
  };

  const cargarMensajesNoLeidos = async () => {
    try {
      const response = await api.get(`/mensajes/no-leidos/count/${usuario.id}`);
      setMensajesNoLeidos(response.data.count);
    } catch (error) {
      console.error('Error al cargar mensajes no leídos:', error);
    }
  };

  const cargarMensajesConversacion = async (conversacionId) => {
    try {
      const response = await api.get(`/mensajes/conversacion/${conversacionId}`);
      setMensajes(response.data);

      // Marcar como leídos
      await api.put(`/mensajes/conversacion/${conversacionId}/leer?usuarioId=${usuario.id}`);
      cargarMensajesNoLeidos();
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const seleccionarConversacion = (conversacion) => {
    setConversacionActual(conversacion);
    cargarMensajesConversacion(conversacion.conversacionId);
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();

    if (!nuevoMensaje.trim() || !conversacionActual) return;

    setLoading(true);
    try {
      const mensajeData = {
        remitenteId: usuario.id,
        destinatarioId: conversacionActual.otroUsuario.id,
        contenido: nuevoMensaje
      };

      if (productoId) {
        mensajeData.productoId = productoId;
      } else if (servicioId) {
        mensajeData.servicioId = servicioId;
      }

      await api.post('/mensajes/enviar', mensajeData);

      setNuevoMensaje('');
      cargarMensajesConversacion(conversacionActual.conversacionId);
      cargarConversaciones();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar mensaje');
    } finally {
      setLoading(false);
    }
  };

  const enviarValoracion = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Por favor selecciona una calificación");
      return;
    }

    setEnviandoValoracion(true);
    try {
      // Simulación de envío de valoración
      // await api.post(`/usuarios/${conversacionActual.otroUsuario.id}/valorar`, {
      //   calificacion: rating,
      //   comentario: comentarioValoracion,
      //   evaluadorId: usuario.id
      // });
      
      // Simulamos delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("✅ ¡Valoración enviada con éxito! Gracias por tu opinión.");
      setMostrarModalValoracion(false);
      setRating(0);
      setComentarioValoracion("");
    } catch (error) {
      console.error("Error enviando valoración:", error);
      alert("Error al enviar la valoración");
    } finally {
      setEnviandoValoracion(false);
    }
  };

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/");
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
            onClick={() => navigate("/catalogo")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            🏠 Catálogo
          </button>

          <button 
            onClick={() => navigate("/mis-compras")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            🛍️ Mis Compras
          </button>

          <button 
            onClick={() => navigate("/mis-ventas")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            💰 Mis Ventas
          </button>

          <button 
            onClick={() => navigate("/publicar")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            ➕ Publicar
          </button>

          <button 
            onClick={() => navigate("/favoritos")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            ❤️ Favoritos
          </button>

          <button 
            onClick={() => navigate("/historial")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            📊 Historial
          </button>

          <button 
            onClick={() => navigate("/mensajes")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
          >
            💬 Mensajes
          </button>

          <button 
            onClick={() => navigate("/perfil")}
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

      {/* Contenido Principal - Chat Layout */}
      <div className="flex-1 flex h-screen overflow-hidden">
        
        {/* Lista de Conversaciones */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 m-0">Mensajes</h2>
            {mensajesNoLeidos > 0 && (
              <span className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                {mensajesNoLeidos} nuevos mensajes
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversaciones.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No hay conversaciones</p>
              </div>
            ) : (
              <div>
                {conversaciones.map((conv) => (
                  <div
                    key={conv.conversacionId}
                    onClick={() => seleccionarConversacion(conv)}
                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                      conversacionActual?.conversacionId === conv.conversacionId ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        {conv.otroUsuario.nombre} {conv.otroUsuario.apellido}
                      </p>
                      {conv.noLeido && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1">{conv.ultimoMensaje}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(conv.fechaUltimoMensaje).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Actual */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {conversacionActual ? (
            <>
              {/* Header del Chat */}
              <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {conversacionActual.otroUsuario.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 m-0">
                      {conversacionActual.otroUsuario.nombre} {conversacionActual.otroUsuario.apellido}
                    </h3>
                    <p className="text-xs text-slate-500 m-0">{conversacionActual.otroUsuario.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setMostrarModalValoracion(true)}
                  className="px-4 py-2 bg-yellow-400/10 text-yellow-600 hover:bg-yellow-400/20 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-yellow-400/20"
                >
                  ⭐ Valorar Vendedor
                </button>
              </div>

              {/* Contexto del Producto/Servicio */}
              {contextoItem && (
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4">
                  <div className="text-xl">
                    {contextoItem.tipo === 'producto' ? '📦' : '🛠️'}
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider m-0">
                      Interesado en {contextoItem.tipo}
                    </p>
                    <p className="font-bold text-slate-800 text-sm m-0">
                      {contextoItem.tipo === 'producto' ? contextoItem.data.nombre : contextoItem.data.titulo}
                    </p>
                    <p className="text-xs text-slate-600 font-medium m-0">
                      ${contextoItem.data.precio?.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {mensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.remitente.id === usuario.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-5 py-3 rounded-2xl text-sm shadow-sm ${
                        msg.remitente.id === usuario.id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                      }`}
                    >
                      <p className="m-0 leading-relaxed">{msg.contenido}</p>
                      <p className={`text-[10px] mt-1 text-right ${
                        msg.remitente.id === usuario.id ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Mensaje */}
              <form onSubmit={enviarMensaje} className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading || !nuevoMensaje.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center gap-2"
                  >
                    <span>Enviar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <div className="text-6xl mb-4 opacity-20">💬</div>
              <p className="text-lg font-medium">Selecciona una conversación</p>
              <p className="text-sm opacity-60">para comenzar a chatear</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Valoración */}
      {mostrarModalValoracion && conversacionActual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-[400px] w-[90%] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-yellow-500">
                ⭐
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Valorar a {conversacionActual.otroUsuario.nombre}
              </h2>
              <p className="text-sm text-slate-500">
                ¿Cómo fue tu experiencia con este vendedor?
              </p>
            </div>

            <form onSubmit={enviarValoracion}>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-all hover:scale-110 focus:outline-none ${
                      star <= rating ? "text-yellow-400" : "text-slate-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <textarea
                  value={comentarioValoracion}
                  onChange={(e) => setComentarioValoracion(e.target.value)}
                  placeholder="Escribe un comentario sobre tu experiencia..."
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalValoracion(false);
                    setRating(0);
                    setComentarioValoracion("");
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoValoracion || rating === 0}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                >
                  {enviandoValoracion ? "Enviando..." : "Enviar Valoración"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mensajes;
