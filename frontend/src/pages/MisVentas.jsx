import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function MisVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    cargarVentas();
  }, []);

  async function cargarVentas() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      nav("/login");
      return;
    }

    try {
      const res = await api.get(`/pedidos/ventas/${user.id}`);
      setVentas(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando ventas:", err);
      setLoading(false);
    }
  }

  async function confirmarPago(pedidoId) {
    if (!window.confirm("¿Confirmar que has recibido el pago?")) return;

    try {
      await api.put(`/pedidos/${pedidoId}/confirmar`);
      alert("Pago confirmado exitosamente");
      cargarVentas();
    } catch (err) {
      console.error("Error confirmando pago:", err);
      alert("Error al confirmar el pago");
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Cargando ventas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Celeste (Reutilizado) */}
      <div className="w-[280px] bg-sky-50 text-slate-800 flex flex-col relative z-10 shadow-2xl">
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

        <nav className="flex-1 p-6 flex flex-col gap-2">
          <button onClick={() => nav("/catalogo")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
            🏠 Catálogo
          </button>
          <button onClick={() => nav("/mis-compras")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
            🛍️ Mis Compras
          </button>
          <button onClick={() => nav("/mis-ventas")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm">
            💰 Mis Ventas
          </button>
          <button onClick={() => nav("/perfil")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
            👤 Mi Perfil
          </button>
        </nav>

        <div className="p-6 border-t border-slate-200 bg-slate-100/50">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 font-medium text-sm">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-10 bg-slate-50 overflow-y-auto h-screen">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mis Ventas</h1>

        {ventas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No tienes ventas aún</h2>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {ventas.map((venta) => (
              <div key={venta.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-sm text-slate-500">Pedido #{venta.pedido.id}</span>
                    <p className="text-xs text-slate-400">Comprador: {venta.pedido.comprador.nombre} {venta.pedido.comprador.apellido}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    venta.pedido.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-700" :
                    venta.pedido.estado === "PAGADO_VERIFICANDO" ? "bg-blue-100 text-blue-700" :
                    venta.pedido.estado === "PAGADO" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                  }`}>
                    {venta.pedido.estado.replace("_", " ")}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                     <img src={venta.producto.imagenUrl1 ? `http://86.48.2.202:8080${venta.producto.imagenUrl1}` : ''} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{venta.producto.nombre}</p>
                    <p className="text-sm text-slate-500">Cantidad: {venta.cantidad} | Total: ${(venta.precioUnitario * venta.cantidad).toFixed(2)}</p>
                  </div>
                </div>

                {venta.pedido.comprobanteUrl && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm font-bold text-slate-700 mb-2">Comprobante de Pago:</p>
                    <a href={`http://86.48.2.202:8080${venta.pedido.comprobanteUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                      Ver Comprobante
                    </a>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  {venta.pedido.estado === "PAGADO_VERIFICANDO" && (
                    <button 
                      onClick={() => confirmarPago(venta.pedido.id)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                    >
                      ✅ Confirmar Pago
                    </button>
                  )}
                  {venta.pedido.estado === "PENDIENTE" && (
                    <span className="text-sm text-slate-500 italic">Esperando pago del comprador...</span>
                  )}
                  {venta.pedido.estado === "PAGADO" && (
                    <span className="text-sm text-green-600 font-bold flex items-center gap-1">
                      ✅ Pago Confirmado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
