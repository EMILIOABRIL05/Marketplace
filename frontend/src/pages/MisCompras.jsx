import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function MisCompras() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      nav("/login");
      return;
    }

    try {
      const res = await api.get(`/pedidos/compras/${user.id}`);
      setPedidos(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setLoading(false);
    }
  }

  async function subirComprobante(pedidoId, archivo) {
    if (!archivo) return;

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      await api.post(`/pedidos/${pedidoId}/comprobante`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Comprobante subido exitosamente");
      cargarPedidos();
    } catch (err) {
      console.error("Error subiendo comprobante:", err);
      alert("Error al subir el comprobante");
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Cargando compras...</p>
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
          <button onClick={() => nav("/mis-compras")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm">
            🛍️ Mis Compras
          </button>
          <button onClick={() => nav("/mis-ventas")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mis Compras</h1>

        {pedidos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No has realizado compras aún</h2>
            <button onClick={() => nav("/catalogo")} className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-sm text-slate-500">Pedido #{pedido.id}</span>
                    <p className="text-xs text-slate-400">{new Date(pedido.fecha).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pedido.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-700" :
                    pedido.estado === "PAGADO_VERIFICANDO" ? "bg-blue-100 text-blue-700" :
                    pedido.estado === "PAGADO" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                  }`}>
                    {pedido.estado.replace("_", " ")}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  {pedido.detalles.map((detalle) => (
                    <div key={detalle.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                           <img src={`http://localhost:8080${detalle.producto.imagenUrl1}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{detalle.producto.nombre}</p>
                          <p className="text-xs text-slate-500">x{detalle.cantidad}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-700">${(detalle.precioUnitario * detalle.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900">Total: ${pedido.total.toFixed(2)}</span>
                  
                  {pedido.estado === "PENDIENTE" && (
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors">
                        📤 Subir Comprobante
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => subirComprobante(pedido.id, e.target.files[0])}
                        />
                      </label>
                    </div>
                  )}
                  
                  {pedido.estado === "PAGADO_VERIFICANDO" && (
                    <span className="text-sm text-blue-600 font-medium">Esperando verificación del vendedor...</span>
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
