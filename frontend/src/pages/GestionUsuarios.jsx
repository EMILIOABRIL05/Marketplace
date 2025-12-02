import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GestionUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const usuario = JSON.parse(localStorage.getItem('user'));
  const tipoUsuario = localStorage.getItem('tipoUsuario');

  useEffect(() => {
    // Verificar que sea moderador o admin
    if (!usuario || (usuario.tipoUsuario !== 'MODERADOR' && usuario.tipoUsuario !== 'ADMINISTRADOR')) {
      navigate('/login');
      return;
    }
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cambiarTipoUsuario = async (usuarioId, nuevoTipo) => {
    try {
      await api.put(`/usuarios/${usuarioId}/tipo?nuevoTipo=${nuevoTipo}`);
      alert('Tipo de usuario actualizado correctamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar tipo de usuario:', error);
      alert('Error al cambiar el tipo de usuario');
    }
  };

  const cambiarEstadoUsuario = async (usuarioId, nuevoEstado) => {
    try {
      await api.put(`/usuarios/${usuarioId}/estado?nuevoEstado=${nuevoEstado}`);
      alert(`Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'suspendido'} exitosamente`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado del usuario');
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const cumpleTipo = filtroTipo === 'todos' || u.tipoUsuario === filtroTipo;
    const cumpleBusqueda = searchTerm === '' || 
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return cumpleTipo && cumpleBusqueda;
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
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            📦 Productos
          </button>

          <button 
            onClick={gestionarUsuarios}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Usuarios</h1>
          <p className="text-slate-500">Administra y modera cuentas de usuarios</p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">Filtrar por Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="todos">Todos</option>
                <option value="USUARIO">Usuarios</option>
                <option value="MODERADOR">Moderadores</option>
                <option value="ADMINISTRADOR">Administradores</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, apellido o email..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">No hay usuarios que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Verificado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {u.nombre} {u.apellido}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.tipoUsuario === 'ADMINISTRADOR' ? 'bg-red-100 text-red-800' :
                          u.tipoUsuario === 'MODERADOR' ? 'bg-purple-100 text-purple-800' :
                          u.tipoUsuario === 'VENDEDOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {u.tipoUsuario}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' :
                          u.estado === 'SUSPENDIDO' ? 'bg-red-100 text-red-800' :
                          u.estado === 'INACTIVO' ? 'bg-slate-100 text-slate-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {u.estado || 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.cuentaVerificada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.cuentaVerificada ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {u.tipoUsuario !== 'ADMINISTRADOR' && u.id !== usuario.id && (
                          <div className="flex items-center gap-4">
                            {u.estado !== 'ACTIVO' ? (
                              <button
                                onClick={() => cambiarEstadoUsuario(u.id, 'ACTIVO')}
                                className="text-emerald-600 hover:text-emerald-900 font-semibold transition-colors"
                              >
                                Activar
                              </button>
                            ) : (
                              <button
                                onClick={() => cambiarEstadoUsuario(u.id, 'SUSPENDIDO')}
                                className="text-red-600 hover:text-red-900 font-semibold transition-colors"
                              >
                                Suspender
                              </button>
                            )}

                            <div className="flex items-center gap-2">
                              <select
                                defaultValue={u.tipoUsuario}
                                onChange={(e) => cambiarTipoUsuario(u.id, e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded-md text-xs bg-white text-slate-700"
                              >
                                <option value="USUARIO">USUARIO</option>
                                <option value="MODERADOR">MODERADOR</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-500 text-sm font-medium mb-1">Total Usuarios</p>
            <p className="text-3xl font-bold text-slate-900">{usuarios.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-500 text-sm font-medium mb-1">Activos</p>
            <p className="text-3xl font-bold text-emerald-600">
              {usuarios.filter(u => u.estado === 'ACTIVO').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-500 text-sm font-medium mb-1">Suspendidos</p>
            <p className="text-3xl font-bold text-red-600">
              {usuarios.filter(u => u.estado === 'SUSPENDIDO').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-500 text-sm font-medium mb-1">Verificados</p>
            <p className="text-3xl font-bold text-blue-600">
              {usuarios.filter(u => u.cuentaVerificada).length}
            </p>
          </div>
        </div>

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

export default GestionUsuarios;
