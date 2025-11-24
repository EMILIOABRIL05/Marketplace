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
    estado: ""
  });

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

  // ... (El resto del JSX permanece igual - sidebar y formulario visual)
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "white", 
      display: "flex",
      fontFamily: "Arial, sans-serif"
    }}>
      
      {/* Sidebar Azul */}
      <div style={{
        width: "280px",
        background: "#00ccff",
        color: "white",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column"
      }}>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "50px",
          paddingBottom: "20px",
          borderBottom: "2px solid rgba(255,255,255,0.3)"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            backdropFilter: "blur(10px)"
          }}>
            🛒
          </div>
          <h1 style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1a237e"
          }}>
            VEYCOFLASH
          </h1>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}>
            <button 
              onClick={() => nav("/catalogo")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              🏠 Catálogo
            </button>

            <button 
              onClick={() => nav("/publicar")}
              style={{
                background: "rgba(255,255,255,0.4)",
                color: "#1a237e",
                border: "2px solid rgba(255,255,255,0.5)",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)"
              }}
            >
              ➕ Publicar
            </button>

            <button 
              onClick={() => nav("/favoritos")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              ❤️ Favoritos
            </button>

            <button 
              onClick={() => nav("/historial")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              📊 Historial
            </button>

            <button 
              onClick={() => nav("/perfil")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#1a237e",
                border: "none",
                padding: "15px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            >
              👤 Mi Perfil
            </button>
          </div>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div style={{
        flex: 1,
        padding: "30px 40px",
        background: "#f8f9fa",
        overflowY: "auto"
      }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <div>
            <h1 style={{
              color: "#333",
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0 0 8px 0"
            }}>
              📦 Publicar Producto
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              Completa la información para publicar tu producto
            </p>
          </div>
          
          <button 
            onClick={onVolver}
            style={{
              background: "#6c757d",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "background 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.background = "#5a6268"}
            onMouseLeave={(e) => e.target.style.background = "#6c757d"}
          >
            ← Volver
          </button>
        </div>

        {/* Formulario */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          maxWidth: "800px"
        }}>
          <form onSubmit={handleSubmit}>
            
            {/* Nombre del Producto */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: iPhone 13 Pro Max"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe tu producto en detalle..."
                rows="5"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "Arial, sans-serif",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              />
            </div>

            {/* Precio, Categoría y Stock */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              marginBottom: "24px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
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
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Stock (Cantidad) *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>
            </div>

            {/* Ubicación y Estado */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "24px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Provincia *
                </label>
                <select
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="">Selecciona una provincia</option>
                  {provincias.map(provincia => (
                    <option key={provincia} value={provincia}>{provincia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Estado del Producto *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="">Selecciona el estado</option>
                  {estadosProducto.map(est => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload de Imágenes */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Imágenes del Producto * (mínimo 1, máximo 5)
              </label>

              {/* Galería de imágenes */}
              {imagenes.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px"
                }}>
                  {imagenes.map((img, index) => (
                    <div key={index} style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: index === 0 ? "3px solid #00ccff" : "2px solid #e9ecef",
                      background: "#f8f9fa"
                    }}>
                      <img 
                        src={img.preview} 
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      
                      {/* Badge "Principal" */}
                      {index === 0 && (
                        <div style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: "#00ccff",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}>
                          ⭐ PRINCIPAL
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        justifyContent: "space-around",
                        padding: "8px"
                      }}>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => establecerPrincipal(index)}
                            style={{
                              background: "transparent",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "18px",
                              padding: "4px"
                            }}
                            title="Establecer como principal"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarImagen(index)}
                          style={{
                            background: "transparent",
                            color: "#ff4444",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                            padding: "4px"
                          }}
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
                  style={{
                    border: "2px dashed #00ccff",
                    borderRadius: "8px",
                    padding: "30px",
                    textAlign: "center",
                    background: "#f8f9fa",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#e9ecef"}
                  onMouseLeave={(e) => e.target.style.background = "#f8f9fa"}
                  onClick={() => document.getElementById("imagenes-input").click()}
                >
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
                  <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#333" }}>
                    {imagenes.length === 0 ? "Haz clic para agregar imágenes" : `Agregar más imágenes (${imagenes.length}/5)`}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                    JPG, PNG o GIF (máximo 5MB cada una)
                  </p>
                  <input
                    id="imagenes-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenesChange}
                    style={{ display: "none" }}
                  />
                </div>
              )}

              {imagenes.length > 0 && (
                <p style={{ 
                  margin: "12px 0 0 0", 
                  fontSize: "13px", 
                  color: "#666",
                  fontStyle: "italic"
                }}>
                  💡 La primera imagen será la principal. Haz clic en ⭐ para cambiarla.
                </p>
              )}
            </div>

            {/* Botones */}
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              borderTop: "2px solid #e9ecef"
            }}>
              <button
                type="button"
                onClick={onVolver}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "background 0.3s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#5a6268"}
                onMouseLeave={(e) => e.target.style.background = "#6c757d"}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                style={{
                  background: guardando ? "#999" : "#00ccff",
                  color: "white",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  cursor: guardando ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "background 0.3s ease"
                }}
                onMouseEnter={(e) => !guardando && (e.target.style.background = "#00b3e6")}
                onMouseLeave={(e) => !guardando && (e.target.style.background = "#00ccff")}
              >
                {guardando ? "Publicando..." : "📤 Publicar Producto"}
              </button>
            </div>

          </form>
        </div>

        {/* Nota informativa */}
        <div style={{
          marginTop: "20px",
          padding: "16px",
          background: "#d1ecf1",
          border: "1px solid #bee5eb",
          borderRadius: "8px",
          maxWidth: "800px"
        }}>
          <p style={{
            margin: 0,
            fontSize: "14px",
            color: "#0c5460"
          }}>
            💡 <strong>Consejo:</strong> Las imágenes de buena calidad ayudan a vender más rápido. Sube varias fotos desde diferentes ángulos para mostrar mejor tu producto.
          </p>
        </div>

      </div>
    </div>
  );
}