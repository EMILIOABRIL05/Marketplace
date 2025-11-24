// En src/pages/SelectorModo.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectorModo = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('user'));
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    const irAModoUsuario = () => {
        navigate('/catalogo');
    };

    const irAPanelAdministracion = () => {
        navigate('/dashboard-admin');
    };

    const cerrarSesion = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('tipoUsuario');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-4xl text-center border border-slate-100">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido, {usuario?.nombre} {usuario?.apellido}</h1>
                <p className="text-slate-500 mb-10 font-medium bg-slate-100 inline-block px-4 py-1 rounded-full text-sm">
                    Tipo de Usuario: <span className="text-blue-600 font-bold">{tipoUsuario}</span>
                </p>
                
                <h2 className="text-xl font-semibold text-slate-700 mb-8">Selecciona tu modo de acceso</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Opción 1: Modo Usuario Normal */}
                    <div 
                        className="bg-white border-2 border-slate-100 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-blue-200 group"
                        onClick={irAModoUsuario}
                    >
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🛍️</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">Modo Usuario</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">Acceder al catálogo y funciones normales de compra/venta</p>
                        <button className="w-full bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all group-hover:bg-blue-600 group-hover:text-white">
                            Ir al Catálogo
                        </button>
                    </div>

                    {/* Opción 2: Panel de Gestión */}
                    <div 
                        className="bg-white border-2 border-slate-100 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-blue-200 group"
                        onClick={irAPanelAdministracion}
                    >
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">⚙️</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">Panel de Gestión</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            {tipoUsuario === 'ADMINISTRADOR' 
                                ? 'Gestionar usuarios, contenido y configuraciones del sistema' 
                                : 'Moderar contenido y revisar reportes de la comunidad'
                            }
                        </p>
                        <button className="w-full bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all group-hover:bg-blue-600 group-hover:text-white">
                            {tipoUsuario === 'ADMINISTRADOR' ? 'Panel Admin' : 'Panel Moderador'}
                        </button>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                    <p className="text-slate-400 text-sm">Puedes cambiar de modo en cualquier momento desde tu perfil</p>
                    <button 
                        className="text-red-500 font-medium hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors" 
                        onClick={cerrarSesion}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectorModo;