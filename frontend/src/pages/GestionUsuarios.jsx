import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GestionUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const usuario = JSON.parse(localStorage.getItem('usuario'));

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
      const response = await axios.get('http://localhost:8080/api/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoUsuario = async (usuarioId, nuevoEstado) => {
    try {
      await axios.put(`http://localhost:8080/api/usuarios/${usuarioId}/estado?nuevoEstado=${nuevoEstado}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra y modera cuentas de usuarios</p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Filtrar por Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="USUARIO">Usuarios/Compradores</option>
                <option value="VENDEDOR">Vendedores</option>
                <option value="MODERADOR">Moderadores</option>
                <option value="ADMINISTRADOR">Administradores</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, apellido o email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay usuarios que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verificado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {u.nombre} {u.apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.tipoUsuario === 'ADMINISTRADOR' ? 'bg-red-100 text-red-800' :
                          u.tipoUsuario === 'MODERADOR' ? 'bg-purple-100 text-purple-800' :
                          u.tipoUsuario === 'VENDEDOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {u.tipoUsuario}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' :
                          u.estado === 'SUSPENDIDO' ? 'bg-red-100 text-red-800' :
                          u.estado === 'INACTIVO' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {u.estado || 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.cuentaVerificada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {u.cuentaVerificada ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {u.tipoUsuario !== 'ADMINISTRADOR' && u.id !== usuario.id && (
                          <div className="flex gap-2">
                            {u.estado !== 'ACTIVO' ? (
                              <button
                                onClick={() => cambiarEstadoUsuario(u.id, 'ACTIVO')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Activar
                              </button>
                            ) : (
                              <button
                                onClick={() => cambiarEstadoUsuario(u.id, 'SUSPENDIDO')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Suspender
                              </button>
                            )}
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
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm">Total Usuarios</p>
            <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm">Activos</p>
            <p className="text-2xl font-bold text-green-600">
              {usuarios.filter(u => u.estado === 'ACTIVO').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm">Suspendidos</p>
            <p className="text-2xl font-bold text-red-600">
              {usuarios.filter(u => u.estado === 'SUSPENDIDO').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm">Verificados</p>
            <p className="text-2xl font-bold text-blue-600">
              {usuarios.filter(u => u.cuentaVerificada).length}
            </p>
          </div>
        </div>

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

export default GestionUsuarios;
