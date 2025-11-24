import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function EditarProducto() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    stock: "",
    estado: "", // ← CAMBIADO: de estadoProducto a estado
    deunaNumero: ""
  });

  const [deunaQr, setDeunaQr] = useState(null);
  const [deunaQrPreview, setDeunaQrPreview] = useState(null);
  const [deunaQrExistente, setDeunaQrExistente] = useState(null);

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
    "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro",
    "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos",
    "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza", "Pichincha",
    "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua", "Zamora Chinchipe"
  ];

  const estadosProducto = [
    "Nuevo",
    "Como Nuevo", 
    "Usado - En buen estado",
    "Usado - Con detalles",
    "Reacondicionado / Refurbished",
    "Para repuestos / No funcional"
  ];

  useEffect(() => {
    cargarProducto();
  }, [id]);

  async function cargarProducto() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      nav("/login");
      return;
    }

    try {
      const res = await api.get(`/productos/${id}`);
      const producto = res.data;

      // Verificar permisos
      if (producto.vendedor?.id !== user.id) {
        alert("No tienes permiso para editar este producto");
        nav("/perfil");
        return;
      }

      // Cargar datos del formulario
      setFormData({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || "",
        categoria: producto.tipo || "",
        ubicacion: producto.ubicacion || "",
        stock: producto.cantidad || "", // ← cantidad del backend a stock del frontend
        estado: producto.estadoProducto || "Nuevo", // ← valor por defecto
        deunaNumero: producto.deunaNumero || ""
      });

      if (producto.deunaQrUrl) {
        setDeunaQrExistente(producto.deunaQrUrl);
      }

      // Cargar imágenes existentes
      const imagenesExistentes = [];
      if (producto.imagenUrl1) imagenesExistentes.push({ tipo: 'existente', url: producto.imagenUrl1 });
      if (producto.imagenUrl2) imagenesExistentes.push({ tipo: 'existente', url: producto.imagenUrl2 });
      if (producto.imagenUrl3) imagenesExistentes.push({ tipo: 'existente', url: producto.imagenUrl3 });
      if (producto.imagenUrl4) imagenesExistentes.push({ tipo: 'existente', url: producto.imagenUrl4 });
      if (producto.imagenUrl5) imagenesExistentes.push({ tipo: 'existente', url: producto.imagenUrl5 });

      setImagenes(imagenesExistentes);
      setLoading(false);

    } catch (err) {
      console.error("Error cargando producto:", err);
      alert(err.response?.data || "Error al cargar el producto");
      nav("/perfil");
    }
  }

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImagenesChange(e) {
    const archivos = Array.from(e.target.files);
    
    if (imagenes.length + archivos.length > 5) {
      alert("Puedes tener máximo 5 imágenes");
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
          tipo: 'nueva',
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
    // Nota: No eliminamos el QR existente del backend aquí, solo la nueva selección
    // Si se quisiera eliminar el existente, necesitaríamos lógica adicional en el backend
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

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.nombre || !formData.descripcion || !formData.precio || 
        !formData.categoria || !formData.ubicacion || !formData.stock || !formData.estado) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (parseFloat(formData.precio) <= 0) {
      alert("El precio debe ser mayor a 0");
      return;
    }

    if (parseInt(formData.stock) <= 0) {
      alert("El stock debe ser mayor a 0");
      return;
    }

    if (imagenes.length === 0) {
      alert("Debes tener al menos 1 imagen del producto");
      return;
    }

    setGuardando(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      // Preparar datos para enviar
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        tipo: formData.categoria,
        ubicacion: formData.ubicacion,
        cantidad: parseInt(formData.stock), // ← CORREGIDO: stock → cantidad
        estado: formData.estado // ← CORREGIDO: estadoProducto → estado
      };

      // Si hay nuevas imágenes, usar FormData, sino JSON normal
      const tieneNuevasImagenes = imagenes.some(img => img.tipo === 'nueva');
      
      if (tieneNuevasImagenes) {
        const formDataToSend = new FormData();
        formDataToSend.append("nombre", formData.nombre);
        formDataToSend.append("descripcion", formData.descripcion);
        formDataToSend.append("precio", formData.precio);
        formDataToSend.append("categoria", formData.categoria);
        formDataToSend.append("ubicacion", formData.ubicacion);
        formDataToSend.append("cantidad", formData.stock); // ← CORREGIDO: agregar cantidad
        formDataToSend.append("estado", formData.estado); // ← CORREGIDO: agregar estado
        formDataToSend.append("vendedorId", user.id);
        
        if (formData.deunaNumero) {
          formDataToSend.append("deunaNumero", formData.deunaNumero);
        }
        
        if (deunaQr) {
          formDataToSend.append("deunaQr", deunaQr);
        }

        // Agregar solo las nuevas imágenes
        imagenes.forEach(img => {
          if (img.tipo === 'nueva') {
            formDataToSend.append("imagenes", img.archivo);
          }
        });

        await api.put(`/productos/${id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`
          }
        });
      } else {
        // Si no hay nuevas imágenes, actualizar solo los datos
        // Pero si hay QR nuevo, debemos usar FormData
        if (deunaQr) {
            const formDataToSend = new FormData();
            formDataToSend.append("nombre", formData.nombre);
            formDataToSend.append("descripcion", formData.descripcion);
            formDataToSend.append("precio", formData.precio);
            formDataToSend.append("categoria", formData.categoria);
            formDataToSend.append("ubicacion", formData.ubicacion);
            formDataToSend.append("cantidad", formData.stock);
            formDataToSend.append("estado", formData.estado);
            formDataToSend.append("vendedorId", user.id);
            
            if (formData.deunaNumero) {
                formDataToSend.append("deunaNumero", formData.deunaNumero);
            }
            
            formDataToSend.append("deunaQr", deunaQr);
            
            await api.put(`/productos/${id}`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${user.token}`
                }
            });
        } else {
            // Agregar deunaNumero al objeto JSON
            const dataWithDeuna = {
                ...dataToSend,
                deunaNumero: formData.deunaNumero
            };
            await api.put(`/productos/${id}`, dataWithDeuna);
        }
      }

      alert("✅ Producto actualizado correctamente");
      nav("/perfil");
    } catch (err) {
      console.error("Error actualizando producto:", err);
      const mensaje = err.response?.data?.message || err.response?.data || "Error al actualizar el producto";
      alert(mensaje);
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    );
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
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-slate-200 bg-white text-slate-800 font-semibold shadow-sm hover:shadow-md"
          >
            🏠 Catálogo
          </button>

          <button 
            onClick={() => nav("/publicar")}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent text-slate-600 font-medium hover:bg-white hover:border-slate-200 hover:text-slate-800 hover:shadow-sm"
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
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-10 bg-slate-50 overflow-y-auto h-screen">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              ✏️ Editar Producto
            </h1>
            <p className="text-slate-500 text-sm">
              Modifica la información de tu producto
            </p>
          </div>
          
          <button 
            onClick={() => nav("/perfil")}
            className="bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-xl cursor-pointer text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            ← Volver al Perfil
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-4xl">
          <form onSubmit={handleSubmit}>
            
            {/* Nombre del Producto */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe tu producto en detalle..."
                rows="5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Precio, Categoría y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                Actualiza tu número de cuenta y código QR.
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
                  
                  {!deunaQrPreview && !deunaQrExistente ? (
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
                    <div className="relative w-32 h-32 mx-auto bg-white rounded-xl overflow-hidden border border-emerald-200 shadow-sm group">
                      <img 
                        src={deunaQrPreview || `http://localhost:8080${deunaQrExistente}`} 
                        alt="QR Preview" 
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Badge tipo de imagen */}
                      <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold shadow-sm text-white ${
                        deunaQrPreview ? "bg-yellow-500" : "bg-green-500"
                      }`}>
                        {deunaQrPreview ? 'NUEVO' : 'ACTUAL'}
                      </div>

                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            type="button"
                            onClick={() => document.getElementById("qr-input").click()}
                            className="bg-white text-emerald-600 px-2 py-1 rounded text-xs font-bold mr-1"
                          >
                            Cambiar
                          </button>
                          {deunaQrPreview && (
                            <button
                                type="button"
                                onClick={eliminarQr}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
                            >
                                Cancelar
                            </button>
                          )}
                      </div>
                      <input
                        id="qr-input"
                        type="file"
                        accept="image/*"
                        onChange={handleQrChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gestión de Imágenes */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Imágenes del Producto * (mínimo 1, máximo 5)
              </label>

              {/* Galería de imágenes */}
              {imagenes.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {imagenes.map((img, index) => (
                    <div key={index} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                      index === 0 ? "border-blue-500" : "border-slate-200"
                    } bg-slate-50 group`}>
                      <img 
                        src={img.tipo === 'existente' ? `http://localhost:8080${img.url}` : img.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badge "Principal" */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                          ⭐ PRINCIPAL
                        </div>
                      )}

                      {/* Badge tipo de imagen */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm text-white ${
                        img.tipo === 'existente' ? "bg-green-500" : "bg-yellow-500"
                      }`}>
                        {img.tipo === 'existente' ? 'EXISTENTE' : 'NUEVA'}
                      </div>

                      {/* Botones de acción */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 flex justify-around opacity-0 group-hover:opacity-100 transition-opacity">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => establecerPrincipal(index)}
                            className="text-white hover:text-yellow-400 transition-colors text-lg"
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
                  className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-all group"
                  onClick={() => document.getElementById("imagenes-input").click()}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
                  <p className="text-sm font-bold text-slate-700 mb-1">
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
                <p className="mt-3 text-xs text-slate-500 italic">
                  💡 La primera imagen será la principal. Haz clic en ⭐ para cambiarla.
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => nav("/perfil")}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className={`px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/20 ${
                  guardando 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {guardando ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </div>

          </form>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl max-w-4xl">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Consejo:</strong> Puedes mantener las imágenes existentes o agregar nuevas. Las imágenes marcadas como "EXISTENTE" se conservarán, las "NUEVAS" reemplazarán a las anteriores.
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}