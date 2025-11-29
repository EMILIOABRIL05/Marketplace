import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Carrito() {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para el Modal de Pago
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("TARJETA"); // TARJETA o TRANSFERENCIA
  const [procesandoPago, setProcesandoPago] = useState(false);
  
  // Datos simulados de tarjeta
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: "",
    nombre: "",
    expiracion: "",
    cvv: ""
  });

  const nav = useNavigate();

  useEffect(() => {
    cargarCarrito();
  }, []);

  async function cargarCarrito() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      nav("/login");
      return;
    }

    try {
      const res = await api.get(`/carrito/${user.id}`);
      console.log("Carrito recibido:", res.data);
      if (res.data.items && res.data.items[0]?.producto) {
        const prod = res.data.items[0].producto;
        console.log("Primer producto:", prod);
        console.log("Campos Deuna:", {
          deunaNumero: prod.deunaNumero,
          deuna_numero: prod.deuna_numero,
          deunaQrUrl: prod.deunaQrUrl,
          deuna_qr_url: prod.deuna_qr_url
        });
      }
      setCarrito(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando carrito:", err);
      setError("No se pudo cargar el carrito");
      setLoading(false);
    }
  }

  async function actualizarCantidad(productoId, nuevaCantidad) {
    if (nuevaCantidad < 1) return;
    
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      await api.put(`/carrito/${user.id}/actualizar`, null, {
        params: {
          productoId: productoId,
          cantidad: nuevaCantidad
        }
      });
      cargarCarrito();
    } catch (err) {
      console.error("Error actualizando cantidad:", err);
      alert("No se pudo actualizar la cantidad");
    }
  }

  async function eliminarItem(productoId) {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    const user = JSON.parse(localStorage.getItem("user"));
    try {
      await api.delete(`/carrito/${user.id}/eliminar/${productoId}`);
      cargarCarrito();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert("No se pudo eliminar el producto");
    }
  }

  async function vaciarCarrito() {
    if (!window.confirm("¿Estás seguro de vaciar todo el carrito?")) return;

    const user = JSON.parse(localStorage.getItem("user"));
    try {
      await api.delete(`/carrito/${user.id}/vaciar`);
      cargarCarrito();
    } catch (err) {
      console.error("Error vaciando carrito:", err);
      alert("No se pudo vaciar el carrito");
    }
  }

  function iniciarProcesoPago() {
    setMostrarModalPago(true);
  }

  async function confirmarPago() {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (metodoPago === "TARJETA") {
      if (!datosTarjeta.numero || !datosTarjeta.nombre || !datosTarjeta.expiracion || !datosTarjeta.cvv) {
        alert("Por favor completa todos los datos de la tarjeta");
        return;
      }
      // Simulación de validación básica
      if (datosTarjeta.numero.length < 16) {
        alert("Número de tarjeta inválido");
        return;
      }
    }

    setProcesandoPago(true);

    // Simular delay de procesamiento de tarjeta
    if (metodoPago === "TARJETA") {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      // Enviar metodoPago al backend
      await api.post(`/pedidos/${user.id}/crear`, null, {
        params: {
          metodoPago: metodoPago
        }
      });

      setProcesandoPago(false);
      setMostrarModalPago(false);

      if (metodoPago === "TARJETA") {
        alert("¡Pago procesado con éxito! Tu pedido ha sido confirmado.");
        nav("/mis-compras");
      } else {
        alert("¡Pedido creado! Por favor realiza la transferencia y sube tu comprobante en 'Mis Compras'.");
        nav("/mis-compras");
      }

    } catch (err) {
      console.error("Error creando pedido:", err);
      alert("Error al procesar la compra. Intenta nuevamente.");
      setProcesandoPago(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  function handleTarjetaChange(e) {
    setDatosTarjeta({
      ...datosTarjeta,
      [e.target.name]: e.target.value
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Celeste */}
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
          <button onClick={() => nav("/carrito")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm">
            🛒 Mi Carrito
          </button>
          <button onClick={() => nav("/publicar")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
            ➕ Publicar Producto
          </button>
          <button onClick={() => nav("/favoritos")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
            ❤️ Favoritos
          </button>
          <button onClick={() => nav("/historial")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
            📊 Historial
          </button>
          <button onClick={() => nav("/mensajes")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm">
            💬 Mensajes
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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mi Carrito de Compras</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
            {error}
          </div>
        )}

        {!carrito || !carrito.items || carrito.items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
            <p className="text-slate-500 mb-6">¡Explora nuestro catálogo y encuentra lo que buscas!</p>
            <button 
              onClick={() => nav("/catalogo")}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_350px] gap-8">
            {/* Lista de Items */}
            <div className="flex flex-col gap-4">
              {carrito.items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-6 items-center">
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                    <img 
                      src={item.producto.imagenUrl1 ? item.producto.imagenUrl1 : ''} 
                      alt={item.producto.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full text-2xl">📦</div>';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{item.producto.nombre}</h3>
                    <p className="text-sm text-slate-500 mb-2">Vendido por: {item.producto.vendedor.nombre}</p>
                    <div className="font-bold text-blue-600 text-xl">
                      ${(item.precioUnitario || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                      <button 
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:bg-slate-100 font-bold"
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </button>
                      <span className="font-semibold text-slate-900 w-6 text-center">{item.cantidad}</span>
                      <button 
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => eliminarItem(item.producto.id)}
                      className="text-red-500 text-sm font-medium hover:text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={vaciarCarrito}
                className="self-start text-red-500 font-medium hover:text-red-600 hover:underline mt-2"
              >
                Vaciar Carrito
              </button>
            </div>

            {/* Resumen de Compra */}
            <div className="h-fit">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Resumen de Compra</h2>
                
                <div className="flex justify-between mb-3 text-slate-600">
                  <span>Subtotal ({carrito.items ? carrito.items.length : 0} productos)</span>
                  <span>${(carrito.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-6 text-slate-600">
                  <span>Envío</span>
                  <span className="text-emerald-600 font-medium">Gratis</span>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mb-6 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-extrabold text-blue-600">${(carrito.total || 0).toFixed(2)}</span>
                </div>

                <button 
                  onClick={iniciarProcesoPago}
                  className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all transform hover:scale-[1.02]"
                >
                  Pagar Ahora
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <span>🔒</span> Pago 100% Seguro
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE PAGO */}
      {mostrarModalPago && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Finalizar Compra</h2>
              <button 
                onClick={() => setMostrarModalPago(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body Modal - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Selector de Método */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setMetodoPago("TARJETA")}
                  className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${
                    metodoPago === "TARJETA"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-xl mb-1">💳</div>
                  <div className="font-bold text-sm">Tarjeta</div>
                  <div className="text-xs opacity-80">Inmediato</div>
                </button>

                <button
                  onClick={() => setMetodoPago("TRANSFERENCIA")}
                  className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${
                    metodoPago === "TRANSFERENCIA"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-xl mb-1">🏦</div>
                  <div className="font-bold text-sm">Deuna</div>
                  <div className="text-xs opacity-80">Comprobante</div>
                </button>
              </div>

              {/* Contenido según método */}
              {metodoPago === "TARJETA" ? (
                <div className="animate-fadeIn">
                  <h3 className="font-bold text-slate-800 mb-3 text-sm">Datos de la Tarjeta</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-0.5">Número</label>
                      <input
                        type="text"
                        name="numero"
                        value={datosTarjeta.numero}
                        onChange={handleTarjetaChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-0.5">Titular</label>
                      <input
                        type="text"
                        name="nombre"
                        value={datosTarjeta.nombre}
                        onChange={handleTarjetaChange}
                        placeholder="Como aparece en la tarjeta"
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">Vencimiento</label>
                        <input
                          type="text"
                          name="expiracion"
                          value={datosTarjeta.expiracion}
                          onChange={handleTarjetaChange}
                          placeholder="MM/AA"
                          maxLength="5"
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-0.5">CVV</label>
                        <input
                          type="password"
                          name="cvv"
                          value={datosTarjeta.cvv}
                          onChange={handleTarjetaChange}
                          placeholder="123"
                          maxLength="4"
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-blue-50 p-2 rounded-lg flex items-start gap-2 text-xs">
                    <span>ℹ️</span>
                    <p className="text-blue-700">
                      Simulación: sin cargo real
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <h3 className="font-bold text-slate-800 mb-3 text-sm">📱 Datos de Pago por Vendedor</h3>
                  <p className="text-slate-600 text-xs mb-4">
                    Realiza el pago según los datos de cada vendedor:
                  </p>
                  
                  {/* Mostrar datos de pago de cada vendedor */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {carrito?.items && (() => {
                        // Agrupar items por vendedor
                        const vendedoresMap = {};
                        carrito.items.forEach(item => {
                          const vendedor = item.producto.vendedor;
                          if (!vendedoresMap[vendedor.id]) {
                            vendedoresMap[vendedor.id] = {
                              vendedor: vendedor,
                              items: [],
                              subtotal: 0
                            };
                          }
                          vendedoresMap[vendedor.id].items.push(item);
                          // Usar producto.precio en lugar de precioUnitario
                          vendedoresMap[vendedor.id].subtotal += (item.producto?.precio || 0) * item.cantidad;
                        });
                        
                        return Object.values(vendedoresMap).map((grupo, index) => {
                          // Obtener datos de Deuna del primer producto (probando ambos nombres de campo)
                          const primerProducto = grupo.items[0]?.producto;
                          const deunaNum = primerProducto?.deunaNumero || primerProducto?.deuna_numero;
                          const deunaQr = primerProducto?.deunaQrUrl || primerProducto?.deuna_qr_url;
                          
                          return (
                          <div key={grupo.vendedor.id} className="bg-slate-50 p-3 rounded-lg border border-slate-300">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                {grupo.vendedor.nombre?.charAt(0) || 'V'}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 text-xs">{grupo.vendedor.nombre} {grupo.vendedor.apellido}</p>
                                <p className="text-xs text-slate-500">{grupo.items.length} producto(s)</p>
                              </div>
                              <p className="font-bold text-slate-900">${grupo.subtotal.toFixed(2)}</p>
                            </div>
                            
                            {/* QR de Deuna */}
                            {deunaQr ? (
                              <div className="text-center p-2 bg-purple-50 rounded-lg mb-2">
                                <p className="text-xs font-semibold text-purple-700 mb-2">📱 QR Deuna</p>
                                <img 
                                  src={deunaQr.startsWith('http') ? deunaQr : `http://86.48.2.202${deunaQr}`}
                                  alt="QR Deuna"
                                  className="max-w-[120px] mx-auto rounded"
                                />
                              </div>
                            ) : null}
                            
                            {/* Número Deuna */}
                            {deunaNum ? (
                              <div className="p-2 bg-blue-50 rounded-lg mb-2">
                                <p className="text-xs font-semibold text-blue-700 mb-1">💳 Número Deuna</p>
                                <p className="text-sm font-mono font-bold text-slate-900 select-all bg-white p-1.5 rounded border border-blue-300">
                                  {deunaNum}
                                </p>
                              </div>
                            ) : null}
                            
                            {/* Datos bancarios */}
                            {grupo.vendedor.bancoNombre ? (
                              <div className="p-2 bg-green-50 rounded-lg mb-2 border border-green-200">
                                <p className="text-xs font-semibold text-green-700 mb-1">🏦 Transferencia Bancaria</p>
                                <div className="text-xs text-slate-800 bg-white p-2 rounded border border-green-300">
                                  <p><span className="font-bold">Banco:</span> {grupo.vendedor.bancoNombre}</p>
                                  <p><span className="font-bold">Cuenta:</span> {grupo.vendedor.bancoNumeroCuenta}</p>
                                </div>
                              </div>
                            ) : null}
                            
                            {/* Si no tiene datos de pago configurados */}
                            {!deunaQr && !deunaNum && !grupo.vendedor.bancoNombre && (
                              <div className="p-2 bg-yellow-50 rounded-lg text-center border border-yellow-300">
                                <p className="text-xs text-yellow-800 font-bold mb-1">⚠️ Sin datos de pago</p>
                                <p className="text-xs text-yellow-700">Contáctalo para coordinar</p>
                              </div>
                            )}
                          </div>
                          );
                        });
                      })()}
                    </div>
                    
                    <div className="mt-3 text-xs text-slate-500 bg-blue-50 p-2 rounded border border-blue-200">
                      Pedido: <strong>PENDIENTE</strong> hasta subir comprobante
                    </div>
                </div>
              )}

            </div>

            {/* Footer Modal - FIXED */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setMostrarModalPago(false)}
                className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-200 transition-colors text-sm"
                disabled={procesandoPago}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPago}
                disabled={procesandoPago}
                className={`px-6 py-2 rounded-lg font-semibold text-white shadow-lg transition-all flex items-center gap-2 text-sm ${
                  procesandoPago 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                }`}
              >
                {procesandoPago ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    {metodoPago === "TARJETA" ? `Pagar $${(carrito?.total || 0).toFixed(2)}` : "Confirmar"}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
