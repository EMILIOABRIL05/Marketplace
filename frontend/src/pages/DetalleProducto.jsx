import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function DetalleProducto() {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagenActual, setImagenActual] = useState(0);
  const [esFavorito, setEsFavorito] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState("");
  const [descripcionReporte, setDescripcionReporte] = useState("");
  const { id } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      await cargarProducto();
      await verificarFavorito();
      await registrarVista();
    };
    
    cargarDatos();
  }, [id]);

  async function cargarProducto() {
    try {
      // 🆕 CAMBIO: Usar endpoint público
      const res = await api.get(`/productos/public/${id}`);
      console.log("✅ Producto cargado (público):", res.data);
      console.log("🔍 Campos de imágenes:");
      console.log("  - imagenUrl1:", res.data.imagenUrl1);
      console.log("  - imagenUrl2:", res.data.imagenUrl2);
      console.log("  - imagenUrl3:", res.data.imagenUrl3);
      console.log("  - imagenUrl4:", res.data.imagenUrl4);
      console.log("  - imagenUrl5:", res.data.imagenUrl5);
      
      setProducto(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando producto:", err);
      setError("No se pudo cargar el producto");
      setLoading(false);
    }
  }

  async function verificarFavorito() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      console.log("👤 Usuario no autenticado - omitiendo verificación de favoritos");
      return;
    }

    try {
      const res = await api.get(`/favoritos/check?usuarioId=${user.id}&productoId=${id}`);
      setEsFavorito(res.data);
    } catch (err) {
      console.error("Error verificando favorito:", err);
    }
  }

  async function registrarVista() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      console.log("👤 Usuario no autenticado - omitiendo registro de vista");
      return;
    }

    try {
      await api.post(`/historial?usuarioId=${user.id}&productoId=${id}`);
    } catch (err) {
      console.error("Error registrando vista:", err);
    }
  }

  function obtenerImagenesProducto() {
    if (!producto) {
      console.log("❌ No hay producto aún");
      return [];
    }
    
    const imagenes = [
      producto.imagenUrl1,
      producto.imagenUrl2, 
      producto.imagenUrl3,
      producto.imagenUrl4,
      producto.imagenUrl5
    ].filter(url => url && url.trim() !== '');
    
    console.log("📸 Imágenes del producto:", imagenes);
    return imagenes;
  }

  async function toggleFavorito() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para agregar favoritos");
      nav("/login");
      return;
    }

    try {
      if (esFavorito) {
        await api.delete(`/favoritos?usuarioId=${user.id}&productoId=${id}`);
        setEsFavorito(false);
        alert("Eliminado de favoritos");
      } else {
        await api.post(`/favoritos?usuarioId=${user.id}&productoId=${id}`);
        setEsFavorito(true);
        alert("Agregado a favoritos");
      }
    } catch (err) {
      alert("Error al actualizar favoritos");
      console.error(err);
    }
  }

  async function enviarReporte(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para reportar");
      nav("/login");
      return;
    }

    if (!motivoReporte || !descripcionReporte) {
      alert("Completa todos los campos del reporte");
      return;
    }

    try {
      await api.post("/reportes", {
        usuarioId: user.id,
        productoId: id,
        motivo: motivoReporte,
        descripcion: descripcionReporte
      });
      
      alert("Reporte enviado correctamente");
      setMostrarReporte(false);
      setMotivoReporte("");
      setDescripcionReporte("");
    } catch (err) {
      alert("Error al enviar reporte");
      console.error(err);
    }
  }

  function enviarMensaje() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para contactar al vendedor");
      nav("/login");
      return;
    }
    
    alert("Funcionalidad de mensajería en desarrollo");
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontSize: "18px", color: "#c33" }}>{error || "Producto no encontrado"}</p>
        <button 
          onClick={() => nav("/catalogo")}
          style={{ background: "#00ccff", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const imagenes = obtenerImagenesProducto();

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
              ➕ Publicar Producto
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
        background: "white",
        overflowY: "auto"
      }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <button 
            onClick={() => nav("/catalogo")}
            style={{
              background: "#f8f9fa",
              color: "#333",
              border: "1px solid #ddd",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            ← Volver al Catálogo
          </button>
          
          <button 
            onClick={handleLogout}
            style={{
              background: "#ff4444",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>

        {/* Badge de Producto */}
        <div style={{
          display: "inline-block",
          background: "#4CAF50",
          color: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "20px"
        }}>
          📦 PRODUCTO
        </div>

        {/* Detalle del Producto */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          maxWidth: "1200px"
        }}>
          
          {/* Galería de Imágenes */}
          <div>
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              marginBottom: "20px",
              position: "relative"
            }}>
              {imagenes.length > 0 ? (
                <>
                  <img 
                    src={`http://localhost:8080${imagenes[imagenActual]}`}
                    alt={producto.nombre}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: "8px"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div style="text-align: center; color: #999;"><div style="font-size: 80px; margin-bottom: 20px;">📦</div><p>Imagen no disponible</p></div>';
                    }}
                  />
                  
                  {imagenes.length > 1 && (
                    <>
                      <button
                        onClick={() => setImagenActual((imagenActual - 1 + imagenes.length) % imagenes.length)}
                        style={{
                          position: "absolute",
                          left: "20px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          cursor: "pointer",
                          fontSize: "20px"
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setImagenActual((imagenActual + 1) % imagenes.length)}
                        style={{
                          position: "absolute",
                          right: "20px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          cursor: "pointer",
                          fontSize: "20px"
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#999" }}>
                  <div style={{ fontSize: "80px", marginBottom: "20px" }}>📦</div>
                  <p>Sin imágenes disponibles</p>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                overflowX: "auto"
              }}>
                {imagenes.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setImagenActual(index)}
                    style={{
                      minWidth: "80px",
                      height: "80px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: index === imagenActual ? "3px solid #00ccff" : "2px solid #e9ecef"
                    }}
                  >
                    <img 
                      src={`http://localhost:8080${img}`}
                      alt={`${producto.nombre} ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #e9ecef; color: #999; font-size: 24px;">❌</div>';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Botones Favorito y Reportar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={toggleFavorito}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: esFavorito ? "#ff4444" : "#ddd",
                  background: esFavorito ? "#ffe6e6" : "white",
                  color: esFavorito ? "#ff4444" : "#333",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  if (!esFavorito) {
                    e.target.style.background = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!esFavorito) {
                    e.target.style.background = "white";
                  }
                }}
              >
                {esFavorito ? "❤️ En Favoritos" : "🤍 Agregar a Favoritos"}
              </button>

              {/* Contactar Vendedor */}
              {producto.vendedor && (
                <button
                  onClick={() => nav(`/mensajes?vendedorId=${producto.vendedor.id}&productoId=${producto.id}`)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "2px solid #00ccff",
                    background: "#00ccff",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#00b8e6"}
                  onMouseLeave={(e) => e.target.style.background = "#00ccff"}
                >
                  💬 Contactar Vendedor
                </button>
              )}

              <button
                onClick={() => setMostrarReporte(true)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "2px solid #ddd",
                  background: "white",
                  color: "#333",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                onMouseLeave={(e) => e.target.style.background = "white"}
              >
                🚩 Reportar producto
              </button>
            </div>
          </div>

          {/* Información del Producto */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            
            {/* Título, Categoría y Precio */}
            <div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                {producto.tipo} › {producto.estadoProducto || "General"}
              </div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#333",
                margin: "0 0 16px 0"
              }}>
                {producto.nombre}
              </h1>
              <div style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#00ccff",
                marginBottom: "8px"
              }}>
                ${producto.precio?.toFixed(2)}
              </div>
            </div>

            {/* Botones de Compra */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                disabled={producto.cantidad <= 0}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  background: producto.cantidad > 0 ? "#ffc107" : "#ccc",
                  color: producto.cantidad > 0 ? "#000" : "#666",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: producto.cantidad > 0 ? "pointer" : "not-allowed"
                }}
              >
                {producto.cantidad > 0 ? "Agregar al carrito" : "Agotado"}
              </button>
              
              <button 
                disabled={producto.cantidad <= 0}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  background: producto.cantidad > 0 ? "#ff5722" : "#ccc",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: producto.cantidad > 0 ? "pointer" : "not-allowed"
                }}
              >
                {producto.cantidad > 0 ? "Comprar ahora" : "Sin stock"}
              </button>
            </div>

            {/* Información del Vendedor */}
            {producto.vendedor && (
              <div style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e9ecef"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#333",
                  margin: "0 0 12px 0"
                }}>
                  Información del Vendedor
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: "#666" }}>Vendedor:</span>
                    <span style={{ color: "#333", fontWeight: "600" }}>
                      {producto.vendedor.nombre} {producto.vendedor.apellido}
                    </span>
                  </div>
                  
                  <button
                    onClick={enviarMensaje}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#00ccff",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      marginTop: "8px"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#00b3e6"}
                    onMouseLeave={(e) => e.target.style.background = "#00ccff"}
                  >
                    💬 Enviar mensaje
                  </button>
                </div>
              </div>
            )}

            {/* Detalles del producto */}
            <div style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "12px",
              marginTop: "20px"
            }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                margin: "0 0 16px 0"
              }}>
                Detalles del producto
              </h3>
              
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Código:</span>
                  <span style={{ color: "#333" }}>{producto.codigo || "N/A"}</span>
                </div>
                <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Estado:</span>
                  <span style={{ color: "#333", fontWeight: "bold" }}>{producto.estadoProducto || "No especificado"}</span>
                </div>
                <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Categoría:</span>
                  <span style={{ color: "#333" }}>{producto.tipo}</span>
                </div>
                <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Ubicación:</span>
                  <span style={{ color: "#333" }}>📍 {producto.ubicacion}</span>
                </div>
                <div style={{ display: "flex", padding: "12px 0" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Stock:</span>
                  <span style={{ 
                    color: producto.cantidad > 0 ? "#28a745" : "#dc3545",
                    fontWeight: "bold"
                  }}>
                    {producto.cantidad > 0 ? `${producto.cantidad} unidades` : "Agotado"}
                  </span>
                </div>
              </div>

              {producto.descripcion && (
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                    Descripción:
                  </h4>
                  <p style={{
                    color: "#666",
                    lineHeight: "1.6",
                    margin: 0,
                    whiteSpace: "pre-line"
                  }}>
                    {producto.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Reporte */}
      {mostrarReporte && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
              Reportar producto
            </h2>
            
            <form onSubmit={enviarReporte} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                  Motivo del reporte *
                </label>
                <select
                  value={motivoReporte}
                  onChange={(e) => setMotivoReporte(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="SPAM">Spam o contenido repetitivo</option>
                  <option value="CONTENIDO_INAPROPIADO">Contenido inapropiado</option>
                  <option value="FRAUDE">Posible fraude o estafa</option>
                  <option value="PRECIO_INCORRECTO">Precio incorrecto</option>
                  <option value="OTRO">Otro motivo</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                  Descripción *
                </label>
                <textarea
                  value={descripcionReporte}
                  onChange={(e) => setDescripcionReporte(e.target.value)}
                  placeholder="Explica por qué reportas este producto..."
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "#ff4444",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Enviar reporte
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarReporte(false);
                    setMotivoReporte("");
                    setDescripcionReporte("");
                  }}
                  style={{
                    flex: 1,
                    background: "#6c757d",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}