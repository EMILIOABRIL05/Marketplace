import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GestionIncidencias = () => {
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [filtro, setFiltro] = useState('todas'); // todas, pendientes, en_revision, resueltas
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);
  const [decision, setDecision] = useState('');
  const [comentario, setComentario] = useState('');
  
  const usuario = JSON.parse(localStorage.getItem('user'));
  const tipoUsuario = localStorage.getItem('tipoUsuario');
  const esAdmin = tipoUsuario === 'ADMINISTRADOR';

  const PALABRAS_CLAVE_BANEO = ['droga', 'marihuana', 'cocaina', 'heroina', 'fentanilo', 'sustancia ilicita', 'estupefaciente'];

  useEffect(() => {
    // Verificar que sea moderador o admin
    if (!usuario || (usuario.tipoUsuario !== 'MODERADOR' && usuario.tipoUsuario !== 'ADMINISTRADOR')) {
      navigate('/login');
      return;
    }
    cargarIncidencias(true);
  }, [filtro, fechaFiltro]);

  const cargarIncidencias = async (verificarAutomaticos = false) => {
    setLoading(true);
    try {
      let url = '/incidencias';
      
      if (filtro === 'pendientes') {
        url = '/incidencias/pendientes';
      } else if (filtro === 'sin_asignar') {
        url = '/incidencias/sin-asignar';
      } else if (filtro === 'mis_incidencias') {
        url = `/incidencias/moderador/${usuario.id}`;
      }
      
      const response = await api.get(url);
      
      let datos = response.data;
      
      // Filtrar por fecha si existe
      if (fechaFiltro) {
        datos = datos.filter(inc => {
          const fechaInc = new Date(inc.fechaIncidencia).toISOString().split('T')[0];
          return fechaInc === fechaFiltro;
        });
      }
      
      setIncidencias(datos);

      if (verificarAutomaticos) {
        verificarBaneosAutomaticos(datos);
      }
    } catch (error) {
      console.error('Error al cargar incidencias:', error);
      alert('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  const verificarBaneosAutomaticos = async (listaIncidencias) => {
    const paraBanear = listaIncidencias.filter(inc => 
      inc.estado === 'PENDIENTE' && 
      (PALABRAS_CLAVE_BANEO.some(palabra => inc.descripcion?.toLowerCase().includes(palabra)) ||
       PALABRAS_CLAVE_BANEO.some(palabra => inc.motivoDeteccion?.toLowerCase().includes(palabra)) ||
       PALABRAS_CLAVE_BANEO.some(palabra => obtenerNombreItem(inc)?.toLowerCase().includes(palabra)))
    );

    if (paraBanear.length > 0) {
      console.log(`🛡️ Detectados ${paraBanear.length} items para baneo automático.`);
      let baneadosCount = 0;

      for (const inc of paraBanear) {
        try {
          await api.put(`/incidencias/${inc.id}/resolver`, {
            decision: 'PRODUCTO_PROHIBIDO',
            comentario: '⛔ SISTEMA: Baneo automático por detección de contenido ilegal (Drogas/Sustancias).'
          });
          baneadosCount++;
        } catch (err) {
          console.error(`Error auto-baneando incidencia ${inc.id}`, err);
        }
      }

      if (baneadosCount > 0) {
        // Notificar y recargar sin verificar de nuevo para evitar bucles
        alert(`🛡️ SISTEMA DE SEGURIDAD ACTIVADO\n\nSe han baneado automáticamente ${baneadosCount} publicaciones detectadas como contenido ilegal (Drogas/Sustancias).`);
        cargarIncidencias(false);
      }
    }
  };

  const darDeBajaPublicacion = async (incidencia) => {
    const nombreItem = obtenerNombreItem(incidencia) || 'publicación';
    if (!window.confirm(`¿Dar de baja la ${nombreItem}? Se marcará como prohibida y la incidencia se cerrará.`)) {
      return;
    }

    try {
      if (incidencia.producto?.id) {
        await api.put(`/productos/${incidencia.producto.id}/estado?nuevoEstado=PROHIBIDO`);
      } else if (incidencia.servicio?.id) {
        await api.put(`/servicios/${incidencia.servicio.id}/estado?nuevoEstado=PROHIBIDO`);
      }

      await api.put(`/incidencias/${incidencia.id}/resolver`, {
        decision: 'PRODUCTO_PROHIBIDO',
        comentario: 'Solicitud de moderación: publicación dada de baja directamente desde el panel.'
      });

      alert('Publicación dada de baja y incidencia resuelta.');
      cargarIncidencias(false);
    } catch (error) {
      console.error('Error al dar de baja la publicación:', error);
      alert('No se pudo dar de baja la publicación.');
    }
  };

  const asignarIncidencia = async (incidenciaId) => {
    try {
      await api.put(`/incidencias/${incidenciaId}/asignar`, {
        moderadorId: usuario.id
      });
      alert('Incidencia asignada exitosamente');
      cargarIncidencias();
    } catch (error) {
      console.error('Error al asignar incidencia:', error);
      alert('Error al asignar incidencia');
    }
  };

  const resolverIncidencia = async () => {
    if (!decision || !comentario) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      await api.put(`/incidencias/${selectedIncidencia.id}/resolver`, {
        decision,
        comentario
      });
      alert('Incidencia resuelta exitosamente');
      setSelectedIncidencia(null);
      setDecision('');
      setComentario('');
      cargarIncidencias();
    } catch (error) {
      console.error('Error al resolver incidencia:', error);
      alert('Error al resolver incidencia');
    }
  };

  const obtenerNombreItem = (incidencia) => {
    if (incidencia.producto) {
      return incidencia.producto.nombre;
    } else if (incidencia.servicio) {
      return incidencia.servicio.titulo;
    }
    return 'N/A';
  };

  const obtenerTipoItem = (incidencia) => {
    return incidencia.producto ? 'Producto' : 'Servicio';
  };

  // Funciones de navegación del sidebar
  const gestionarProductos = () => navigate('/gestion-productos');
  const gestionarUsuarios = () => navigate('/gestion-usuarios');
  const revisarIncidentes = () => navigate('/gestion-incidencias');
  const revisionIncidentes = () => navigate('/gestion-incidencias');
  const gestionarModeradores = () => navigate('/registrar-moderador');
  const volverASelector = () => navigate('/selector-modo');
  const irACatalogo = () => navigate('/catalogo');
  const cerrarSesion = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('tipoUsuario');
      navigate('/login');
  };

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
              <span className="text-xs text-slate-500">
                Panel de {esAdmin ? 'Administración' : 'Moderación'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 flex flex-col gap-2">
          <button 
            onClick={() => navigate('/dashboard-admin')}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            📊 Dashboard
          </button>

          <button 
            onClick={gestionarProductos}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            📦 Productos
          </button>

          <button 
            onClick={gestionarUsuarios}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            👥 Usuarios
          </button>

          <button 
            onClick={revisarIncidentes}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
          >
            ⚠️ Incidentes y Reportes
          </button>

          {tipoUsuario === 'ADMINISTRADOR' && (
            <button 
              onClick={gestionarModeradores}
              className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
            >
              🛡️ Moderadores
            </button>
          )}
        </nav>

        {/* Footer con versión y botones */}
        <div className="p-6 border-t border-slate-200 bg-slate-100/50">
          <button 
            onClick={volverASelector}
            className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-white text-slate-600 border border-slate-200 font-medium text-xs mb-2 hover:bg-slate-50 hover:text-slate-800"
          >
            🔄 Cambiar Modo
          </button>

          <button 
            onClick={irACatalogo}
            className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-white text-slate-600 border border-slate-200 font-medium text-xs mb-2 hover:bg-slate-50 hover:text-slate-800"
          >
            🛍️ Ir al Catálogo
          </button>

          <button 
            onClick={cerrarSesion}
            className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 font-medium text-xs mb-4"
          >
            🚪 Cerrar Sesión
          </button>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold relative shadow-lg shadow-blue-600/30">
              {esAdmin ? 'A' : 'M'}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {esAdmin ? 'Administrador' : 'Moderador'}
              </div>
              <div className="text-[10px] text-slate-500">En línea</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-10 bg-slate-50 overflow-y-auto h-screen">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Incidencias</h1>
          <p className="text-slate-500">Revisa y gestiona reportes y detecciones automáticas</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                filtro === 'todas'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro('sin_asignar')}
              className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                filtro === 'sin_asignar'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sin Asignar
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                filtro === 'pendientes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltro('mis_incidencias')}
              className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                filtro === 'mis_incidencias'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mis Incidencias
            </button>
            
            <div className="flex items-center gap-2 ml-auto border-l border-slate-200 pl-4">
              <span className="text-sm font-semibold text-slate-600">📅 Filtrar por fecha:</span>
              <input 
                type="date" 
                value={fechaFiltro}
                onChange={(e) => {
                  setFechaFiltro(e.target.value);
                  // Forzar recarga o filtrado local
                  // Como el useEffect depende de 'filtro', no se recarga solo al cambiar fecha
                  // Así que llamamos a cargarIncidencias manualmente o añadimos fechaFiltro a dependencias
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {fechaFiltro && (
                <button 
                  onClick={() => setFechaFiltro('')}
                  className="text-xs text-red-500 font-bold hover:text-red-700"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Incidencias */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando incidencias...</p>
          </div>
        ) : incidencias.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">No hay incidencias para mostrar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incidencias.map((incidencia) => (
              <div
                key={incidencia.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        incidencia.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' :
                        incidencia.estado === 'EN_REVISION' ? 'bg-blue-100 text-blue-800' :
                        incidencia.estado === 'RESUELTO' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {incidencia.estado}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">
                        {incidencia.tipo?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                        {obtenerTipoItem(incidencia)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {obtenerNombreItem(incidencia)}
                    </h3>
                    
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{incidencia.descripcion}</p>
                    
                    {incidencia.motivoDeteccion && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-700">
                          <strong className="font-semibold">Motivo:</strong> {incidencia.motivoDeteccion}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-sm text-slate-500 space-y-1 border-t border-slate-100 pt-3 mt-3">
                      <p><strong className="font-medium text-slate-700">Vendedor:</strong> {incidencia.vendedor?.nombre} {incidencia.vendedor?.apellido}</p>
                      {incidencia.reportador && (
                        <p><strong className="font-medium text-slate-700">Reportado por:</strong> {incidencia.reportador.nombre} {incidencia.reportador.apellido}</p>
                      )}
                      {incidencia.moderadorEncargado && (
                        <p><strong className="font-medium text-slate-700">Moderador:</strong> {incidencia.moderadorEncargado.nombre} {incidencia.moderadorEncargado.apellido}</p>
                      )}
                      <p><strong className="font-medium text-slate-700">Fecha:</strong> {new Date(incidencia.fechaIncidencia).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-6">
                    {/* Botón Tomar Caso / Reasignar */}
                    {((incidencia.estado === 'PENDIENTE' && !incidencia.moderadorEncargado) || 
                      ((tipoUsuario === 'ADMINISTRADOR' || tipoUsuario === 'MODERADOR') && incidencia.estado !== 'RESUELTO' && incidencia.moderadorEncargado?.id !== usuario.id)) && (
                      <button
                        onClick={() => asignarIncidencia(incidencia.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm shadow-blue-200"
                      >
                        {incidencia.moderadorEncargado ? 'Reasignar a mí' : 'Tomar Caso'}
                      </button>
                    )}
                    
                    {/* Botón Resolver */}
                    {(incidencia.estado === 'EN_REVISION' || (incidencia.estado === 'PENDIENTE' && incidencia.moderadorEncargado)) && 
                     (incidencia.moderadorEncargado?.id === usuario.id || tipoUsuario === 'ADMINISTRADOR' || tipoUsuario === 'MODERADOR') && (
                      <button
                        onClick={() => setSelectedIncidencia(incidencia)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium shadow-sm shadow-emerald-200"
                      >
                        Resolver
                      </button>
                    )}

                    {(tipoUsuario === 'ADMINISTRADOR' || tipoUsuario === 'MODERADOR') && incidencia.estado !== 'RESUELTO' && (incidencia.producto || incidencia.servicio) && (
                      <button
                        onClick={() => darDeBajaPublicacion(incidencia)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm shadow-red-200"
                      >
                        Dar de baja
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Resolución */}
        {selectedIncidencia && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Resolver Incidencia</h2>
              
              <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-slate-700 mb-2"><strong className="font-semibold">Item:</strong> {obtenerNombreItem(selectedIncidencia)}</p>
                <p className="text-slate-700"><strong className="font-semibold">Descripción:</strong> {selectedIncidencia.descripcion}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2 text-sm">Decisión</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                >
                  <option value="">Seleccione una decisión</option>
                  <option value="PRODUCTO_PERMITIDO">Permitir Publicación</option>
                  <option value="PRODUCTO_PROHIBIDO">Prohibir Publicación</option>
                  <option value="REQUIERE_REVISION">Requiere Más Revisión</option>
                </select>
              </div>
              
              <div className="mb-8">
                <label className="block text-slate-700 font-semibold mb-2 text-sm">Comentario</label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                  placeholder="Explicación de la decisión tomada..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={resolverIncidencia}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm"
                >
                  Confirmar Resolución
                </button>
                <button
                  onClick={() => {
                    setSelectedIncidencia(null);
                    setDecision('');
                    setComentario('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionIncidencias;
