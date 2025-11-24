import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicarProductoForm from "./PublicarProductoForm";
import PublicarServicioForm from "./PublicarServicioForm.jsx";

export default function PublicarProducto() {
  const nav = useNavigate();
  const [tipoPublicacion, setTipoPublicacion] = useState(null); // null, 'producto', 'servicio'

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  // Si no se ha seleccionado tipo, mostrar opciones
  if (!tipoPublicacion) {
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
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 flex flex-col gap-2">
          <button 
            onClick={() => nav("/catalogo")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            🏠 Catálogo
          </button>

          <button 
            onClick={() => nav("/mis-compras")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            🛍️ Mis Compras
          </button>

          <button 
            onClick={() => nav("/mis-ventas")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            💰 Mis Ventas
          </button>

          <button 
            onClick={() => nav("/publicar")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm"
          >
            ➕ Publicar
          </button>

          <button 
            onClick={() => nav("/favoritos")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            ❤️ Favoritos
          </button>

          <button 
            onClick={() => nav("/historial")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            📊 Historial
          </button>

          <button 
            onClick={() => nav("/mensajes")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            💬 Mensajes
          </button>

          <button 
            onClick={() => nav("/perfil")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
          >
            👤 Mi Perfil
          </button>
        </nav>

        {/* Footer con versión y botones */}
        <div className="p-6 border-t border-slate-200 bg-slate-100/50">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 font-medium text-sm"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>        {/* Contenido Principal - Selección de tipo */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 overflow-y-auto">
          
          <div className="max-w-4xl w-full text-center">
            
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              ¿Qué deseas publicar?
            </h1>
            
            <p className="text-slate-500 mb-12 text-lg">
              Selecciona el tipo de publicación que quieres crear
            </p>

            {/* Tarjetas de opciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              
              {/* Opción: Producto */}
              <div 
                onClick={() => setTipoPublicacion('producto')}
                className="group bg-white rounded-2xl p-10 cursor-pointer border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 transition-all duration-300"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  📦
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                  Producto
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  Publica artículos físicos como electrónica, ropa, muebles, vehículos y más
                </p>
              </div>

              {/* Opción: Servicio */}
              <div 
                onClick={() => setTipoPublicacion('servicio')}
                className="group bg-white rounded-2xl p-10 cursor-pointer border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 transition-all duration-300"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  🛠️
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                  Servicio
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  Ofrece servicios como limpieza, clases, reparaciones, diseño y más
                </p>
              </div>

            </div>

            <button 
              onClick={() => nav("/catalogo")}
              className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all font-bold text-sm"
            >
              ← Volver al Catálogo
            </button>

          </div>
        </div>
      </div>
    );
  }

  // Si se seleccionó un tipo, mostrar el formulario correspondiente
  if (tipoPublicacion === 'producto') {
    return <PublicarProductoForm onVolver={() => setTipoPublicacion(null)} />;
  }

  if (tipoPublicacion === 'servicio') {
    return <PublicarServicioForm onVolver={() => setTipoPublicacion(null)} />;
  }
}