import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GestionIncidencias = () => {
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [filtro, setFiltro] = useState('todas'); // todas, pendientes, en_revision, resueltas
  const [loading, setLoading] = useState(false);
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);
  const [decision, setDecision] = useState('');
  const [comentario, setComentario] = useState('');
  
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    // Verificar que sea moderador o admin
    if (!usuario || (usuario.tipoUsuario !== 'MODERADOR' && usuario.tipoUsuario !== 'ADMINISTRADOR')) {
      navigate('/login');
      return;
    }
    cargarIncidencias();
  }, [filtro]);

  const cargarIncidencias = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8080/api/incidencias';
      
      if (filtro === 'pendientes') {
        url = 'http://localhost:8080/api/incidencias/pendientes';
      } else if (filtro === 'sin_asignar') {
        url = 'http://localhost:8080/api/incidencias/sin-asignar';
      } else if (filtro === 'mis_incidencias') {
        url = `http://localhost:8080/api/incidencias/moderador/${usuario.id}`;
      }
      
      const response = await axios.get(url);
      setIncidencias(response.data);
    } catch (error) {
      console.error('Error al cargar incidencias:', error);
      alert('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  const asignarIncidencia = async (incidenciaId) => {
    try {
      await axios.put(`http://localhost:8080/api/incidencias/${incidenciaId}/asignar`, {
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
      await axios.put(`http://localhost:8080/api/incidencias/${selectedIncidencia.id}/resolver`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Incidencias</h1>
          <p className="text-gray-600">Revisa y gestiona reportes y detecciones automáticas</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === 'todas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro('sin_asignar')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === 'sin_asignar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sin Asignar
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === 'pendientes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltro('mis_incidencias')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === 'mis_incidencias'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mis Incidencias
            </button>
          </div>
        </div>

        {/* Lista de Incidencias */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando incidencias...</p>
          </div>
        ) : incidencias.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay incidencias para mostrar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incidencias.map((incidencia) => (
              <div
                key={incidencia.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        incidencia.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        incidencia.estado === 'EN_REVISION' ? 'bg-blue-100 text-blue-800' :
                        incidencia.estado === 'RESUELTO' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {incidencia.estado}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                        {incidencia.tipo?.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {obtenerTipoItem(incidencia)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {obtenerNombreItem(incidencia)}
                    </h3>
                    
                    <p className="text-gray-600 mb-3">{incidencia.descripcion}</p>
                    
                    {incidencia.motivoDeteccion && (
                      <p className="text-sm text-red-600 mb-2">
                        <strong>Motivo:</strong> {incidencia.motivoDeteccion}
                      </p>
                    )}
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p><strong>Vendedor:</strong> {incidencia.vendedor?.nombre} {incidencia.vendedor?.apellido}</p>
                      {incidencia.reportador && (
                        <p><strong>Reportado por:</strong> {incidencia.reportador.nombre} {incidencia.reportador.apellido}</p>
                      )}
                      {incidencia.moderadorEncargado && (
                        <p><strong>Moderador:</strong> {incidencia.moderadorEncargado.nombre} {incidencia.moderadorEncargado.apellido}</p>
                      )}
                      <p><strong>Fecha:</strong> {new Date(incidencia.fechaIncidencia).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {incidencia.estado === 'PENDIENTE' && !incidencia.moderadorEncargado && (
                      <button
                        onClick={() => asignarIncidencia(incidencia.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Tomar Caso
                      </button>
                    )}
                    
                    {(incidencia.estado === 'EN_REVISION' || (incidencia.estado === 'PENDIENTE' && incidencia.moderadorEncargado)) && 
                     incidencia.moderadorEncargado?.id === usuario.id && (
                      <button
                        onClick={() => setSelectedIncidencia(incidencia)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Resolver
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Resolver Incidencia</h2>
              
              <div className="mb-4">
                <p className="text-gray-700"><strong>Item:</strong> {obtenerNombreItem(selectedIncidencia)}</p>
                <p className="text-gray-700"><strong>Descripción:</strong> {selectedIncidencia.descripcion}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Decisión</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione una decisión</option>
                  <option value="PRODUCTO_PERMITIDO">Permitir Publicación</option>
                  <option value="PRODUCTO_PROHIBIDO">Prohibir Publicación</option>
                  <option value="REQUIERE_REVISION">Requiere Más Revisión</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Comentario</label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explicación de la decisión tomada..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={resolverIncidencia}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Confirmar Resolución
                </button>
                <button
                  onClick={() => {
                    setSelectedIncidencia(null);
                    setDecision('');
                    setComentario('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón Volver */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard-admin')}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionIncidencias;
