import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ProcesoPago() {
  const { productoId } = useParams();
  const [searchParams] = useSearchParams();
  const cantidad = parseInt(searchParams.get('cantidad')) || 1;
  
  const [producto, setProducto] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState(null);
  const [paso, setPaso] = useState(1); // 1: Ver datos pago, 2: Subir comprobante, 3: Confirmación
  const [pedidoCreado, setPedidoCreado] = useState(null);
  
  const nav = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!usuario) {
      nav("/login");
      return;
    }
    cargarDatos();
  }, [productoId]);

  async function cargarDatos() {
    try {
      const resProducto = await api.get(`/productos/public/${productoId}`);
      setProducto(resProducto.data);
      setVendedor(resProducto.data.vendedor);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando datos:", err);
      alert("No se pudo cargar la información del producto");
      nav("/catalogo");
    }
  }

  function handleComprobanteChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      setComprobante(file);
      const reader = new FileReader();
      reader.onloadend = () => setPrevisualizacion(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function confirmarCompra() {
    if (!comprobante) {
      alert("Por favor sube el comprobante de pago");
      return;
    }

    setProcesando(true);
    try {
      // 1. Primero agregar al carrito
      await api.post(`/carrito/${usuario.id}/agregar`, null, {
        params: { productoId: productoId, cantidad: cantidad }
      });

      // 2. Crear el pedido
      const resPedido = await api.post(`/pedidos/${usuario.id}/crear`, null, {
        params: { metodoPago: "TRANSFERENCIA" }
      });

      const pedidoId = resPedido.data.id;

      // 3. Subir el comprobante
      const formData = new FormData();
      formData.append('comprobante', comprobante);

      await api.post(`/pedidos/${pedidoId}/comprobante`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPedidoCreado(resPedido.data);
      setPaso(3);

      // Notificar al vendedor (esto se puede hacer vía WebSocket o notificación)
      // El backend debería manejar esto automáticamente

    } catch (err) {
      console.error("Error procesando compra:", err);
      alert("Error al procesar la compra: " + (err.response?.data || "Intenta nuevamente"));
    } finally {
      setProcesando(false);
    }
  }

  function irAMensajes() {
    nav(`/mensajes?vendedorId=${vendedor.id}&productoId=${productoId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (!producto || !vendedor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Producto no disponible</h2>
          <p className="text-slate-500 mb-6">No se pudo cargar la información del producto o vendedor.</p>
          <button 
            onClick={() => nav("/catalogo")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  const total = producto.precio * cantidad;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">💳 Proceso de Pago</h1>
          <p className="text-slate-500">Completa tu compra de forma segura</p>
        </div>

        {/* Pasos */}
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map(p => (
            <div key={p} className={`flex items-center gap-2 ${paso >= p ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                paso >= p ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {paso > p ? '✓' : p}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {p === 1 ? 'Datos de Pago' : p === 2 ? 'Comprobante' : 'Confirmación'}
              </span>
            </div>
          ))}
        </div>

        {/* Resumen del producto */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            📦 Resumen de tu compra
          </h3>
          <div className="flex gap-4">
            {producto.imagenUrl1 && (
              <img 
                src={producto.imagenUrl1}
                alt={producto.nombre}
                className="w-24 h-24 object-cover rounded-xl"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">{producto.nombre}</h4>
              <p className="text-sm text-slate-500">Cantidad: {cantidad}</p>
              <p className="text-sm text-slate-500">Vendedor: {vendedor.nombre} {vendedor.apellido}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Paso 1: Datos de pago del vendedor */}
        {paso === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              🏦 Datos de Pago del Vendedor
            </h3>
            
            <div className="space-y-6">
              {/* QR de Deuna */}
              {(producto.deunaQrUrl || vendedor.deunaQrUrl) && (
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-sm font-semibold text-purple-600 mb-3">📱 Escanea el código QR con Deuna</p>
                  <img 
                    src={producto.deunaQrUrl || vendedor.deunaQrUrl}
                    alt="Código QR Deuna"
                    className="max-w-[200px] mx-auto rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* Número Deuna */}
              {(producto.deunaNumero || vendedor.deunaNumero) && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm font-semibold text-blue-600 mb-2">💳 Número Deuna</p>
                  <p className="text-2xl font-mono font-bold text-slate-800 select-all">
                    {producto.deunaNumero || vendedor.deunaNumero}
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(producto.deunaNumero || vendedor.deunaNumero);
                      alert("Número copiado");
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    📋 Copiar número
                  </button>
                </div>
              )}

              {/* Datos bancarios */}
              {vendedor.bancoNombre && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm font-semibold text-green-600 mb-2">🏦 Transferencia Bancaria</p>
                  <div className="space-y-1 text-slate-700">
                    <p><span className="font-medium">Banco:</span> {vendedor.bancoNombre}</p>
                    <p><span className="font-medium">Cuenta:</span> {vendedor.bancoNumeroCuenta}</p>
                    <p><span className="font-medium">Tipo:</span> {vendedor.bancoTipoCuenta}</p>
                    <p><span className="font-medium">Titular:</span> {vendedor.nombre} {vendedor.apellido}</p>
                    <p><span className="font-medium">Cédula:</span> {vendedor.cedula}</p>
                  </div>
                </div>
              )}

              {/* Si no hay datos de pago */}
              {!producto.deunaQrUrl && !vendedor.deunaQrUrl && !producto.deunaNumero && !vendedor.deunaNumero && !vendedor.bancoNombre && (
                <div className="p-6 bg-yellow-50 rounded-xl text-center">
                  <p className="text-yellow-700 font-medium mb-2">⚠️ El vendedor no ha configurado sus datos de pago</p>
                  <p className="text-sm text-yellow-600 mb-4">Por favor contacta al vendedor para coordinar el pago</p>
                  <button
                    onClick={irAMensajes}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all"
                  >
                    💬 Contactar Vendedor
                  </button>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500 mb-4">
                  💡 Realiza la transferencia por <strong>${total.toFixed(2)}</strong> y luego sube tu comprobante.
                </p>
                <button
                  onClick={() => setPaso(2)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Ya realicé el pago → Subir comprobante
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Subir comprobante */}
        {paso === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📸 Sube tu Comprobante de Pago
            </h3>
            
            <div className="space-y-4">
              {previsualizacion ? (
                <div className="relative">
                  <img 
                    src={previsualizacion} 
                    alt="Comprobante" 
                    className="w-full max-h-[300px] object-contain rounded-xl border-2 border-slate-200"
                  />
                  <button
                    onClick={() => { setComprobante(null); setPrevisualizacion(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <div className="text-4xl mb-2">📤</div>
                    <p className="text-slate-600 font-medium">Haz clic para subir tu comprobante</p>
                    <p className="text-sm text-slate-400">PNG, JPG hasta 5MB</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleComprobanteChange}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPaso(1)}
                  className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                >
                  ← Volver
                </button>
                <button
                  onClick={confirmarCompra}
                  disabled={!comprobante || procesando}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesando ? "Procesando..." : "✓ Confirmar Compra"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Confirmación */}
        {paso === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">¡Compra Registrada!</h2>
            <p className="text-slate-600 mb-6">
              Tu pedido #{pedidoCreado?.id} ha sido creado. El vendedor ha sido notificado 
              y revisará tu comprobante de pago.
            </p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                📌 El estado de tu pedido cambiará a <strong>"PAGADO"</strong> cuando el vendedor confirme tu pago.
                Puedes seguir el estado en "Mis Compras".
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => nav("/mis-compras")}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Ver Mis Compras
              </button>
              <button
                onClick={irAMensajes}
                className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
              >
                💬 Contactar Vendedor
              </button>
            </div>
          </div>
        )}

        {/* Link para ver perfil del vendedor */}
        <div className="text-center mt-6">
          <button
            onClick={() => nav(`/perfil/${vendedor.id}`)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            👤 Ver perfil completo del vendedor
          </button>
        </div>
      </div>
    </div>
  );
}
