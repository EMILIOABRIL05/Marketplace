// En src/pages/SelectorModo.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectorModo.css'; // Asegúrate de importar el CSS

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
        <div className="mode-selector-container">
            <div className="mode-selector">
                <h1>Bienvenido, {usuario?.nombre} {usuario?.apellido}</h1>
                <p className="user-role">Tipo de Usuario: {tipoUsuario}</p>
                <h2>Selecciona tu modo de acceso</h2>
                
                <div className="mode-options">
                    {/* Opción 1: Modo Usuario Normal */}
                    <div className="mode-card" onClick={irAModoUsuario}>
                        <div className="mode-icon">🛍️</div>
                        <h3>Modo Usuario</h3>
                        <p>Acceder al catálogo y funciones normales de compra/venta</p>
                        <button className="btn-mode">Ir al Catálogo</button>
                    </div>

                    {/* Opción 2: Panel de Gestión */}
                    <div className="mode-card" onClick={irAPanelAdministracion}>
                        <div className="mode-icon">⚙️</div>
                        <h3>Panel de Gestión</h3>
                        <p>
                            {tipoUsuario === 'ADMINISTRADOR' 
                                ? 'Gestionar usuarios, contenido y configuraciones del sistema' 
                                : 'Moderar contenido y revisar reportes de la comunidad'
                            }
                        </p>
                        <button className="btn-mode">
                            {tipoUsuario === 'ADMINISTRADOR' ? 'Panel Admin' : 'Panel Moderador'}
                        </button>
                    </div>
                </div>

                <div className="mode-footer">
                    <p>Puedes cambiar de modo en cualquier momento desde tu perfil</p>
                    <button className="btn-logout" onClick={cerrarSesion}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectorModo;