import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Hero Section */}
      <div className="flex-[3] bg-gradient-to-br from-blue-600 to-blue-400 p-10 md:p-20 flex flex-col justify-center text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-900 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              🛒
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AppVentas</h1>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-sm">
            Gestiona tu negocio <br/>
            <span className="text-blue-100">sin complicaciones</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-50 mb-12 leading-relaxed max-w-2xl">
            La plataforma todo en uno para administrar productos, servicios y ventas. 
            Potencia tu crecimiento con herramientas diseñadas para el éxito.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-bold text-lg mb-1">Inventario</h3>
              <p className="text-blue-100 text-sm">Control total de tus productos y stock en tiempo real.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-3">🛠️</div>
              <h3 className="font-bold text-lg mb-1">Servicios</h3>
              <p className="text-blue-100 text-sm">Gestiona tus servicios y citas de manera eficiente.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-lg mb-1">Reportes</h3>
              <p className="text-blue-100 text-sm">Analíticas detalladas para tomar mejores decisiones.</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-10 md:left-20 text-blue-100 text-sm font-medium">
          © 2025 Sistema de Ventas Multiempresa. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side - Action Section */}
      <div className="flex-1 bg-white flex flex-col justify-center p-10 md:p-16 shadow-2xl z-20">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-800 mb-3">Bienvenido</h3>
            <p className="text-slate-500">Selecciona una opción para comenzar</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => nav("/login")}
              className="w-full group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
            >
              <span>Iniciar Sesión</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <button 
              onClick={() => nav("/catalogo")}
              className="w-full group relative flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300"
            >
              <span>Ver Catálogo Público</span>
              <span className="text-xl group-hover:scale-110 transition-transform">🛍️</span>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
              </div>
              <p>Únete a más de <span className="font-bold text-slate-600">1,000+</span> empresas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}