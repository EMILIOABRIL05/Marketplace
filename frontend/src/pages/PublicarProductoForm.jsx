import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function PublicarProductoForm({ onVolver }) {
  const nav = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    stock: "",
    estado: "",
    deunaNumero: ""
  });
  
  const [deunaQr, setDeunaQr] = useState(null);
  const [deunaQrPreview, setDeunaQrPreview] = useState(null);

  const categorias = [
    "Electrónica",
    "Ropa y Accesorios",
    "Hogar y Jardín",
    "Deportes",
    "Vehículos",
    "Libros y Música",
    "Juguetes",
    "Servicios",
    "Otros"
  ];

  const provincias = [
    "Azuay",
    "Bolívar",
    "Cañar",
    "Carchi",
    "Chimborazo",
    "Cotopaxi",
    "El Oro",
    "Esmeraldas",
    "Galápagos",
    "Guayas",
    "Imbabura",
    "Loja",
    "Los Ríos",
    "Manabí",
    "Morona Santiago",
    "Napo",
    "Orellana",
    "Pastaza",
    "Pichincha",
    "Santa Elena",
    "Santo Domingo de los Tsáchilas",
    "Sucumbíos",
    "Tungurahua",
    "Zamora Chinchipe"
  ];

  const estadosProducto = [
    "Nuevo",
    "Como Nuevo",
    "Usado - En buen estado",
    "Usado - Con detalles",
    "Reacondicionado / Refurbished",
    "Para repuestos / No funcional"
  ];

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handleImagenesChange(e) {
    const archivos = Array.from(e.target.files);
    
    if (imagenes.length + archivos.length > 5) {
      alert("Puedes subir máximo 5 imágenes");
      e.target.value = "";
      return;
    }

    const imagenesValidas = [];

    for (let archivo of archivos) {
      if (!archivo.type.startsWith('image/')) {
        alert(`${archivo.name} no es una imagen válida`);
        continue;
      }

      if (archivo.size > 5 * 1024 * 1024) {
        alert(`${archivo.name} supera los 5MB`);
        continue;
      }

      imagenesValidas.push(archivo);
    }

    imagenesValidas.forEach(archivo => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenes(prev => [...prev, {
          archivo: archivo,
          preview: reader.result,
          nombre: archivo.name,
          tamanio: archivo.size
        }]);
      };
      reader.readAsDataURL(archivo);
    });

    e.target.value = "";
  }

  function handleQrChange(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      alert("El archivo debe ser una imagen");
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      alert("La imagen supera los 5MB");
      return;
    }

    setDeunaQr(archivo);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setDeunaQrPreview(reader.result);
    };
    reader.readAsDataURL(archivo);
  }

  function eliminarQr() {
    setDeunaQr(null);
    setDeunaQrPreview(null);
  }

  function eliminarImagen(index) {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  }

  function establecerPrincipal(index) {
    setImagenes(prev => {
      const nuevasImagenes = [...prev];
      const [imagen] = nuevasImagenes.splice(index, 1);
      nuevasImagenes.unshift(imagen);
      return nuevasImagenes;
    });
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // ✅ VERIFICACIÓN MEJORADA DE AUTENTICACIÓN
    let user;
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("Debes iniciar sesión para publicar productos");
        nav("/login");
        return;
      }
      
      user = JSON.parse(userStr);
      
      if (!user.token) {
        alert("Token de autenticación no encontrado. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("user");
        nav("/login");
        return;
      }

      if (!user.id) {
        alert("Error: ID de usuario no disponible");
        return;
      }

      // Verificar cuenta verificada
      if (!user.cuentaVerificada) {
        alert("Debes verificar tu cuenta de email antes de publicar productos");
        nav("/verificar-email");
        return;
      }

    } catch (error) {
      console.error("Error verificando usuario:", error);
      alert("Error al verificar la sesión. Por favor, inicia sesión nuevamente.");
      localStorage.removeItem("user");
      nav("/login");
      return;
    }

    // Validaciones del formulario
    if (!formData.nombre || !formData.descripcion || !formData.precio || !formData.categoria || !formData.ubicacion || !formData.stock || !formData.estado) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.precio <= 0) {
      alert("El precio debe ser mayor a 0");
      return;
    }

    if (formData.stock <= 0) {
      alert("El stock debe ser mayor a 0");
      return;
    }

    if (imagenes.length === 0) {
      alert("Debes subir al menos 1 imagen del producto");
      return;
    }

    setGuardando(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("precio", formData.precio);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("ubicacion", formData.ubicacion);
      formDataToSend.append("cantidad", formData.stock); // ✅ CAMBIADO: "stock" → "cantidad"
      formDataToSend.append("estadoProducto", formData.estado); // ✅ AGREGADO: enviar estadoProducto
      formDataToSend.append("vendedorId", user.id);
      
      if (formData.deunaNumero) {
        formDataToSend.append("deunaNumero", formData.deunaNumero);
      }
      
      if (deunaQr) {
        formDataToSend.append("deunaQr", deunaQr);
      }

      imagenes.forEach((img, index) => {
        formDataToSend.append("imagenes", img.archivo);
      });

      // ✅ LOG MEJORADO
      console.log("🔐 Enviando producto con:", {
        userId: user.id,
        userEmail: user.email,
        tieneToken: !!user.token,
        datos: {
          nombre: formData.nombre,
          precio: formData.precio,
          cantidad: formData.stock,
          estadoProducto: formData.estado
        }
      });

      const response = await api.post("/productos", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000
      });

      console.log("✅ Producto publicado exitosamente:", response.status);
      alert("¡Producto publicado exitosamente!");
      nav("/perfil");
      
    } catch (err) {
      console.error("❌ Error publicando producto:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let mensaje = "Error al publicar el producto";
      if (err.response?.status === 403) {
        mensaje = "Acceso denegado. Tu sesión puede haber expirado. Por favor, inicia sesión nuevamente.";
        localStorage.removeItem("user");
        nav("/login");
      } else if (err.response?.data?.message) {
        mensaje = err.response.data.message;
      }
      
      alert(mensaje);
      setGuardando(false);
    }
  }

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
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-10 bg-slate-50 overflow-y-auto h-screen">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              📦 Publicar Producto
            </h1>
            <p className="text-slate-500 text-sm">
              Completa la información para publicar tu producto
            </p>
          </div>
          
          <button 
            onClick={onVolver}
            className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
          >
            ← Volver
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            
            {/* Nombre del Producto */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-bold text-slate-700">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: iPhone 13 Pro Max"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-bold text-slate-700">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe tu producto en detalle..."
                rows="5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y font-sans"
              />
            </div>

            {/* Precio, Categoría y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-slate-700">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-slate-700">
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-slate-700">
                  Stock (Cantidad) *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Ubicación y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-slate-700">
                  Provincia *
                </label>
                <select
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Selecciona una provincia</option>
                  {provincias.map(provincia => (
                    <option key={provincia} value={provincia}>{provincia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-slate-700">
                  Estado del Producto *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Selecciona el estado</option>
                  {estadosProducto.map(est => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sección de Pagos Deuna */}
            <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                💳 Datos de Pago (Deuna)
              </h3>
              <p className="text-sm text-emerald-600 mb-4">
                Agrega tu número de cuenta y código QR para facilitar el pago a tus compradores.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-emerald-700">
                    Número de Cuenta Deuna
                  </label>
                  <input
                    type="text"
                    name="deunaNumero"
                    value={formData.deunaNumero}
                    onChange={handleChange}
                    placeholder="Ej: 1234567890"
                    className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-emerald-700">
                    Código QR Deuna (Imagen)
                  </label>
                  
                  {!deunaQrPreview ? (
                    <div 
                      className="border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center bg-white hover:bg-emerald-50 cursor-pointer transition-all"
                      onClick={() => document.getElementById("qr-input").click()}
                    >
                      <div className="text-2xl mb-2">📱</div>
                      <p className="text-xs font-bold text-emerald-700">Subir QR</p>
                      <input
                        id="qr-input"
                        type="file"
                        accept="image/*"
                        onChange={handleQrChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative w-32 h-32 mx-auto bg-white rounded-xl overflow-hidden border border-emerald-200 shadow-sm">
                      <img 
                        src={deunaQrPreview} 
                        alt="QR Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={eliminarQr}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload de Imágenes */}
            <div className="mb-8">
              <label className="block mb-3 text-sm font-bold text-slate-700">
                Imágenes del Producto * (mínimo 1, máximo 5)
              </label>

              {/* Galería de imágenes */}
              {imagenes.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                  {imagenes.map((img, index) => (
                    <div key={index} className={`relative aspect-square rounded-xl overflow-hidden bg-slate-100 ${
                      index === 0 ? "ring-4 ring-blue-500" : "border border-slate-200"
                    }`}>
                      <img 
                        src={img.preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badge "Principal" */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                          ⭐ PRINCIPAL
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 flex justify-around p-2 backdrop-blur-sm">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => establecerPrincipal(index)}
                            className="text-white hover:text-yellow-300 transition-colors text-lg"
                            title="Establecer como principal"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarImagen(index)}
                          className="text-white hover:text-red-400 transition-colors text-lg"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para agregar más imágenes */}
              {imagenes.length < 5 && (
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-500 cursor-pointer transition-all group"
                  onClick={() => document.getElementById("imagenes-input").click()}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📸</div>
                  <p className="text-slate-700 font-bold mb-1">
                    {imagenes.length === 0 ? "Haz clic para agregar imágenes" : `Agregar más imágenes (${imagenes.length}/5)`}
                  </p>
                  <p className="text-xs text-slate-500">
                    JPG, PNG o GIF (máximo 5MB cada una)
                  </p>
                  <input
                    id="imagenes-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenesChange}
                    className="hidden"
                  />
                </div>
              )}

              {imagenes.length > 0 && (
                <p className="mt-3 text-xs text-slate-500 italic flex items-center gap-1">
                  💡 La primera imagen será la principal. Haz clic en ⭐ para cambiarla.
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onVolver}
                className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-600/20 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {guardando ? "Publicando..." : "📤 Publicar Producto"}
              </button>
            </div>

          </form>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl max-w-4xl mx-auto flex items-start gap-3">
          <div className="text-xl">💡</div>
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Consejo:</strong> Las imágenes de buena calidad ayudan a vender más rápido. Sube varias fotos desde diferentes ángulos para mostrar mejor tu producto.
          </p>
        </div>

      </div>
    </div>
  );
}