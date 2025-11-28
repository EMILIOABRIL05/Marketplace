import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const PerfilPublico = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendedor, setVendedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [valoraciones, setValoraciones] = useState([]);
  const [resumenValoraciones, setResumenValoraciones] = useState({ promedio: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState('productos');
  const usuario = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    cargarDatosVendedor();
  }, [id]);

  const cargarDatosVendedor = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del vendedor
      const resVendedor = await api.get(`/usuarios/${id}`);
      setVendedor(resVendedor.data);

      // Cargar productos del vendedor
      try {
        const resProductos = await api.get(`/productos/vendedor/${id}`);
        // Filtrar solo productos activos
        const productosActivos = resProductos.data.filter(p => p.estado === 'ACTIVO' || p.activo === true);
        setProductos(productosActivos);
      } catch (error) {
        console.error('Error cargando productos:', error);
      }

      // Cargar servicios del vendedor
      try {
        const resServicios = await api.get(`/servicios/usuario/${id}`);
        const serviciosActivos = resServicios.data.filter(s => s.estado === 'ACTIVO' || s.activo === true);
        setServicios(serviciosActivos);
      } catch (error) {
        console.error('Error cargando servicios:', error);
      }

      // Cargar valoraciones
      try {
        const [resValoraciones, resResumen] = await Promise.all([
          api.get(`/valoraciones?vendedorId=${id}`),
          api.get(`/valoraciones/resumen?vendedorId=${id}`)
        ]);
        setValoraciones(resValoraciones.data);
        setResumenValoraciones(resResumen.data);
      } catch (error) {
        console.error('Error cargando valoraciones:', error);
      }

    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarConversacion = () => {
    navigate(`/mensajes?vendedorId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!vendedor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">Vendedor no encontrado</p>
          <button
            onClick={() => navigate('/catalogo')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            ← Volver
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
              {vendedor.nombre?.charAt(0)}{vendedor.apellido?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">
                {vendedor.nombre} {vendedor.apellido}
              </h1>
              <p className="text-white/80 mb-2">{vendedor.email}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <span className="text-yellow-300 text-xl">⭐</span>
                  <span className="font-bold text-lg">{resumenValoraciones.promedio?.toFixed(1) || '0.0'}</span>
                  <span className="text-white/80">/ 5</span>
                  <span className="text-white/60 ml-2">({resumenValoraciones.total} opiniones)</span>
                </div>
                
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  📦 {productos.length} productos
                </div>
                
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  🛠️ {servicios.length} servicios
                </div>
              </div>
            </div>
            
            {usuario && usuario.id !== parseInt(id) && (
              <button
                onClick={iniciarConversacion}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                💬 Enviar mensaje
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setTabActiva('productos')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              tabActiva === 'productos'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            📦 Productos ({productos.length})
          </button>
          <button
            onClick={() => setTabActiva('servicios')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              tabActiva === 'servicios'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            🛠️ Servicios ({servicios.length})
          </button>
          <button
            onClick={() => setTabActiva('valoraciones')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              tabActiva === 'valoraciones'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            ⭐ Valoraciones ({valoraciones.length})
          </button>
        </div>

        {/* Contenido de Tabs */}
        {tabActiva === 'productos' && (
          <div>
            {productos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-slate-500">Este vendedor no tiene productos publicados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.map(producto => (
                  <div
                    key={producto.id}
                    onClick={() => navigate(`/producto/${producto.id}`)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="h-48 bg-slate-100 relative">
                      {producto.imagenes && producto.imagenes.length > 0 ? (
                        <img
                          src={`http://86.48.2.202:8080${producto.imagenes[0]}`}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-1 truncate">{producto.nombre}</h3>
                      <p className="text-blue-600 font-bold text-lg">${producto.precio?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-2">{producto.categoria}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tabActiva === 'servicios' && (
          <div>
            {servicios.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-4xl mb-4">🛠️</p>
                <p className="text-slate-500">Este vendedor no tiene servicios publicados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicios.map(servicio => (
                  <div
                    key={servicio.id}
                    onClick={() => navigate(`/servicio/${servicio.id}`)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="h-48 bg-slate-100 relative">
                      {servicio.imagenes && servicio.imagenes.length > 0 ? (
                        <img
                          src={`http://86.48.2.202:8080${servicio.imagenes[0]}`}
                          alt={servicio.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                          🛠️
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-1 truncate">{servicio.titulo}</h3>
                      <p className="text-blue-600 font-bold text-lg">${servicio.precio?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-2">{servicio.categoria}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tabActiva === 'valoraciones' && (
          <div>
            {valoraciones.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-4xl mb-4">⭐</p>
                <p className="text-slate-500">Este vendedor aún no tiene valoraciones</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumen de valoraciones */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-yellow-500">{resumenValoraciones.promedio?.toFixed(1) || '0.0'}</div>
                      <div className="text-yellow-500 text-2xl mt-1">
                        {'★'.repeat(Math.round(resumenValoraciones.promedio || 0))}
                        {'☆'.repeat(5 - Math.round(resumenValoraciones.promedio || 0))}
                      </div>
                      <div className="text-slate-500 text-sm mt-1">{resumenValoraciones.total} opiniones</div>
                    </div>
                  </div>
                </div>

                {/* Lista de valoraciones */}
                {valoraciones.map((valoracion) => (
                  <div key={valoracion.id} className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {valoracion.compradorNombre} {valoracion.compradorApellido}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(valoracion.fechaCreacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-yellow-500 text-lg">
                        {'★'.repeat(valoracion.calificacion)}
                        {'☆'.repeat(5 - valoracion.calificacion)}
                      </div>
                    </div>
                    <p className="text-slate-600">{valoracion.comentario || 'Sin comentario'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilPublico;
