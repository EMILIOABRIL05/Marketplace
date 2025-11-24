import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Mensajes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActual, setConversacionActual] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  
  const usuario = JSON.parse(localStorage.getItem('usuario'));

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

    // Actualizar cada 10 segundos
    const interval = setInterval(() => {
      if (conversacionActual) {
        cargarMensajesConversacion(conversacionActual.conversacionId);
      }
      cargarMensajesNoLeidos();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const iniciarConversacionDirecta = async () => {
    try {
      // Cargar datos del vendedor
      const response = await axios.get(`http://localhost:8080/api/usuarios/${vendedorId}`);
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
      const response = await axios.get(`http://localhost:8080/api/mensajes/conversaciones/${usuario.id}`);
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
      const response = await axios.get(`http://localhost:8080/api/mensajes/no-leidos/count/${usuario.id}`);
      setMensajesNoLeidos(response.data.count);
    } catch (error) {
      console.error('Error al cargar mensajes no leídos:', error);
    }
  };

  const cargarMensajesConversacion = async (conversacionId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/mensajes/conversacion/${conversacionId}`);
      setMensajes(response.data);

      // Marcar como leídos
      await axios.put(`http://localhost:8080/api/mensajes/conversacion/${conversacionId}/leer?usuarioId=${usuario.id}`);
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

      await axios.post('http://localhost:8080/api/mensajes/enviar', mensajeData);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex h-screen">
        {/* Lista de Conversaciones */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-blue-600">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Mensajes</h2>
              {mensajesNoLeidos > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                  {mensajesNoLeidos}
                </span>
              )}
            </div>
          </div>

          {conversaciones.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No hay conversaciones</p>
            </div>
          ) : (
            <div>
              {conversaciones.map((conv) => (
                <div
                  key={conv.conversacionId}
                  onClick={() => seleccionarConversacion(conv)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition ${
                    conversacionActual?.conversacionId === conv.conversacionId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {conv.otroUsuario.nombre} {conv.otroUsuario.apellido}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{conv.ultimoMensaje}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(conv.fechaUltimoMensaje).toLocaleString()}
                      </p>
                    </div>
                    {conv.noLeido && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4">
            <button
              onClick={() => navigate('/catalogo')}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              ← Volver al Catálogo
            </button>
          </div>
        </div>

        {/* Chat Actual */}
        <div className="flex-1 flex flex-col">
          {conversacionActual ? (
            <>
              {/* Header del Chat */}
              <div className="p-4 bg-white border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  {conversacionActual.otroUsuario.nombre} {conversacionActual.otroUsuario.apellido}
                </h3>
                <p className="text-sm text-gray-600">{conversacionActual.otroUsuario.email}</p>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {mensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.remitente.id === usuario.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        msg.remitente.id === usuario.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p>{msg.contenido}</p>
                      <p className={`text-xs mt-1 ${
                        msg.remitente.id === usuario.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.fechaEnvio).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Mensaje */}
              <form onSubmit={enviarMensaje} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !nuevoMensaje.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500 text-lg">Selecciona una conversación para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mensajes;
