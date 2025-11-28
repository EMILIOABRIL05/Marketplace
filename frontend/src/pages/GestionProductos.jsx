import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GestionProductos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const usuario = JSON.parse(localStorage.getItem('user'));
  const tipoUsuario = localStorage.getItem('tipoUsuario');

  useEffect(() => {
    // Verificar que sea moderador o admin
    if (!usuario || (usuario.tipoUsuario !== 'MODERADOR' && usuario.tipoUsuario !== 'ADMINISTRADOR')) {
      navigate('/login');
      return;
    }
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      // Solicitamos modo admin para ver todos los productos (incluidos ocultos)
      const response = await api.get('/productos?adminMode=true');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoProducto = async (productoId, nuevoEstado) => {
    try {
      await api.put(`/productos/${productoId}/estado?nuevoEstado=${nuevoEstado}`);
      let mensaje = 'Producto actualizado exitosamente';
      if (nuevoEstado === 'ACTIVO') mensaje = 'Producto activado exitosamente';
      if (nuevoEstado === 'OCULTO') mensaje = 'Producto oculto exitosamente';
      if (nuevoEstado === 'PROHIBIDO') mensaje = 'Producto prohibido exitosamente';
      
      alert(mensaje);
      cargarProductos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado del producto');
    }
  };

  const eliminarProducto = async (productoId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto definitivamente?')) return;
    
    try {
      await api.delete(`/productos/${productoId}`);
      alert('Producto eliminado exitosamente');
      cargarProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto');
    }
  };

  const productosFiltrados = productos.filter(p => {
    return searchTerm === '' || 
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
              <span className="text-xs text-slate-500">Panel de Administración</span>
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
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
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
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
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
              A
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Administrador</div>
              <div className="text-[10px] text-slate-500">En línea</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-10 bg-slate-50 overflow-y-auto h-screen">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Productos</h1>
          <p className="text-slate-500">Administra los productos de la plataforma</p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o descripción..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
            />
          </div>
        </div>

        {/* Tabla de Productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">No hay productos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {productosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {p.imagenUrl1 ? (
                            <img className="h-10 w-10 rounded-lg mr-3 object-cover border border-slate-200" src={p.imagenUrl1.startsWith('http') ? p.imagenUrl1 : `http://86.48.2.202:8080${p.imagenUrl1}`} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg mr-3 bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                              📷
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {p.nombre}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {p.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">${p.precio}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {p.vendedor ? `${p.vendedor.nombre} ${p.vendedor.apellido}` : 'Desconocido'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          p.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {/* Botón Activar (si está oculto o prohibido) */}
                          {(p.estado === 'OCULTO' || p.estado === 'PROHIBIDO') && (
                            <button
                              onClick={() => cambiarEstadoProducto(p.id, 'ACTIVO')}
                              className="text-emerald-600 hover:text-emerald-900 font-medium transition-colors"
                            >
                              Activar
                            </button>
                          )}

                          {/* Botón Ocultar (si está activo) */}
                          {p.estado === 'ACTIVO' && (
                            <button
                              onClick={() => cambiarEstadoProducto(p.id, 'OCULTO')}
                              className="text-amber-600 hover:text-amber-900 font-medium transition-colors"
                            >
                              Ocultar
                            </button>
                          )}

                          {/* Botón Prohibir (si está activo u oculto) */}
                          {(p.estado === 'ACTIVO' || p.estado === 'OCULTO') && (
                            <button
                              onClick={() => cambiarEstadoProducto(p.id, 'PROHIBIDO')}
                              className="text-purple-600 hover:text-purple-900 font-medium transition-colors"
                            >
                              Prohibir
                            </button>
                          )}

                          <button
                            onClick={() => eliminarProducto(p.id)}
                            className="text-red-600 hover:text-red-900 font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Botón Volver */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/dashboard-admin')}
            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition font-medium shadow-sm"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionProductos;
