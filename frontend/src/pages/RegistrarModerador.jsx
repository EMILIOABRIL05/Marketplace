import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RegistrarModerador = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
    genero: ''
  });
  const [loading, setLoading] = useState(false);
  
  const usuario = JSON.parse(localStorage.getItem('user'));
  const tipoUsuario = localStorage.getItem('tipoUsuario');

  // Verificar que sea administrador
  if (!usuario || usuario.tipoUsuario !== 'ADMINISTRADOR') {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const moderadorData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        direccion: formData.direccion,
        genero: formData.genero,
        tipoUsuario: 'MODERADOR',
        estado: 'ACTIVO',
        cuentaVerificada: true // Los moderadores se verifican automáticamente
      };

      await api.post('/auth/crear-moderador', moderadorData);
      
      alert('Moderador registrado exitosamente');
      navigate('/gestion-usuarios');
    } catch (error) {
      console.error('Error al registrar moderador:', error);
      if (error.response?.data) {
        alert(`Error: ${error.response.data}`);
      } else {
        alert('Error al registrar moderador. Verifique los datos e intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
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
              className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Registrar Moderador</h1>
          <p className="text-slate-500">Crea una cuenta de moderador para gestionar la plataforma</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Personal */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Información Personal</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Cédula *</label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Género *</label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white text-slate-700"
                  >
                    <option value="">Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Dirección *</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Información de Cuenta */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Información de Cuenta</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-medium mb-2 text-sm">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                    />
                    <p className="text-xs text-slate-500 mt-1">Mínimo 8 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Confirmar Contraseña *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Importante */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900 mb-3 text-sm">Información Importante</h3>
              <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                <li>El moderador podrá revisar y gestionar incidencias</li>
                <li>Podrá suspender y reactivar cuentas de usuarios</li>
                <li>Tendrá acceso al panel de administración</li>
                <li>La cuenta se activará automáticamente</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold shadow-sm shadow-blue-200"
              >
                {loading ? 'Registrando...' : 'Registrar Moderador'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/gestion-usuarios')}
                className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarModerador;
