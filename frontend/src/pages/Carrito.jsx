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
                      src={item.producto.imagenUrl1 ? `http://86.48.2.202:8080${item.producto.imagenUrl1}` : ''} 
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
                      ${item.precioUnitario.toFixed(2)}
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
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Finalizar Compra</h2>
              <button 
                onClick={() => setMostrarModalPago(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-8 overflow-y-auto">
              
              {/* Selector de Método */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setMetodoPago("TARJETA")}
                  className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                    metodoPago === "TARJETA"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-bold">Tarjeta de Crédito/Débito</div>
                  <div className="text-xs opacity-80">Pago inmediato y seguro</div>
                </button>

                <button
                  onClick={() => setMetodoPago("TRANSFERENCIA")}
                  className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                    metodoPago === "TRANSFERENCIA"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="text-2xl mb-2">🏦</div>
                  <div className="font-bold">Transferencia / Deuna</div>
                  <div className="text-xs opacity-80">Sube tu comprobante después</div>
                </button>
              </div>

              {/* Contenido según método */}
              {metodoPago === "TARJETA" ? (
                <div className="animate-fadeIn">
                  <h3 className="font-bold text-slate-800 mb-4">Datos de la Tarjeta</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número de Tarjeta</label>
                      <input
                        type="text"
                        name="numero"
                        value={datosTarjeta.numero}
                        onChange={handleTarjetaChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Titular</label>
                      <input
                        type="text"
                        name="nombre"
                        value={datosTarjeta.nombre}
                        onChange={handleTarjetaChange}
                        placeholder="Como aparece en la tarjeta"
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiración</label>
                        <input
                          type="text"
                          name="expiracion"
                          value={datosTarjeta.expiracion}
                          onChange={handleTarjetaChange}
                          placeholder="MM/AA"
                          maxLength="5"
                          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          name="cvv"
                          value={datosTarjeta.cvv}
                          onChange={handleTarjetaChange}
                          placeholder="123"
                          maxLength="4"
                          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                    <span className="text-blue-500 text-xl">ℹ️</span>
                    <p className="text-sm text-blue-700">
                      Esta es una simulación. No se realizará ningún cargo real a tu tarjeta.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">📱</div>
                      <h3 className="font-bold text-slate-800 mb-2">Datos de Pago por Vendedor</h3>
                      <p className="text-slate-600 text-sm">
                        Deberás realizar el pago a cada vendedor según los datos mostrados abajo.
                      </p>
                    </div>
                    
                    {/* Mostrar datos de pago de cada vendedor */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
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
                          vendedoresMap[vendedor.id].subtotal += item.precioUnitario * item.cantidad;
                        });
                        
                        return Object.values(vendedoresMap).map((grupo, index) => (
                          <div key={grupo.vendedor.id} className="bg-white p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                  {grupo.vendedor.nombre?.charAt(0) || 'V'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">{grupo.vendedor.nombre} {grupo.vendedor.apellido}</p>
                                  <p className="text-xs text-slate-500">{grupo.items.length} producto(s)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600">${grupo.subtotal.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            {/* QR de Deuna */}
                            {grupo.vendedor.deunaQrUrl && (
                              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl mb-3">
                                <p className="text-xs font-semibold text-purple-600 mb-2">📱 Escanea el QR con Deuna</p>
                                <img 
                                  src={`http://86.48.2.202:8080${grupo.vendedor.deunaQrUrl}`}
                                  alt="QR Deuna"
                                  className="max-w-[150px] mx-auto rounded-lg shadow-md"
                                />
                              </div>
                            )}
                            
                            {/* Número Deuna */}
                            {grupo.vendedor.deunaNumero && (
                              <div className="p-3 bg-blue-50 rounded-lg mb-3">
                                <p className="text-xs font-semibold text-blue-600 mb-1">💳 Número Deuna</p>
                                <p className="text-lg font-mono font-bold text-slate-800 select-all">
                                  {grupo.vendedor.deunaNumero}
                                </p>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(grupo.vendedor.deunaNumero);
                                    alert("Número copiado");
                                  }}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  📋 Copiar número
                                </button>
                              </div>
                            )}
                            
                            {/* Datos bancarios */}
                            {grupo.vendedor.bancoNombre && (
                              <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-xs font-semibold text-green-600 mb-1">🏦 Transferencia Bancaria</p>
                                <div className="space-y-0.5 text-xs text-slate-700">
                                  <p><span className="font-medium">Banco:</span> {grupo.vendedor.bancoNombre}</p>
                                  <p><span className="font-medium">Cuenta:</span> {grupo.vendedor.bancoNumeroCuenta}</p>
                                  <p><span className="font-medium">Tipo:</span> {grupo.vendedor.bancoTipoCuenta}</p>
                                  <p><span className="font-medium">Titular:</span> {grupo.vendedor.nombre} {grupo.vendedor.apellido}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Si no tiene datos de pago */}
                            {!grupo.vendedor.deunaQrUrl && !grupo.vendedor.deunaNumero && !grupo.vendedor.bancoNombre && (
                              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                                <p className="text-xs text-yellow-700">⚠️ Este vendedor no ha configurado datos de pago</p>
                                <button
                                  onClick={() => nav(`/mensajes?vendedorId=${grupo.vendedor.id}`)}
                                  className="mt-2 text-xs px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                >
                                  💬 Contactar
                                </button>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 inline-block">
                        El pedido quedará en estado <strong>PENDIENTE</strong> hasta que subas el comprobante.
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalPago(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={procesandoPago}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPago}
                disabled={procesandoPago}
                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                  procesandoPago 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-500/30"
                }`}
              >
                {procesandoPago ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    {metodoPago === "TARJETA" ? `Pagar $${(carrito?.total || 0).toFixed(2)}` : "Confirmar Pedido"}
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
