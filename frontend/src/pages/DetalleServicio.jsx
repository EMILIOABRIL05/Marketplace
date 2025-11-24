import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function DetalleServicio() {
  const [servicio, setServicio] = useState(null);
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
      await cargarServicio();
      await verificarFavorito();
      await registrarVista();
    };
    
    cargarDatos();
  }, [id]);

  async function cargarServicio() {
    try {
      // 🆕 CAMBIO: Usar endpoint público
      const res = await api.get(`/servicios/public/${id}`);
      console.log("✅ Servicio cargado (público):", res.data);
      setServicio(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando servicio:", err);
      setError("No se pudo cargar el servicio");
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
      const res = await api.get(`/favoritos/check?usuarioId=${user.id}&servicioId=${id}`);
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
      await api.post(`/historial?usuarioId=${user.id}&servicioId=${id}`);
    } catch (err) {
      console.error("Error registrando vista:", err);
    }
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
        await api.delete(`/favoritos?usuarioId=${user.id}&servicioId=${id}`);
        setEsFavorito(false);
        alert("Eliminado de favoritos");
      } else {
        await api.post(`/favoritos?usuarioId=${user.id}&servicioId=${id}`);
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
        servicioId: id,
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

  function contactarVendedor() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión para contactar al proveedor");
      nav("/login");
      return;
    }
    
    alert("Funcionalidad de mensajería en desarrollo");
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  function obtenerImagenes() {
    if (!servicio.imagenes) return [];
    try {
      return JSON.parse(servicio.imagenes);
    } catch (e) {
      return [];
    }
  }

  function obtenerDiasDisponibles() {
    if (!servicio.diasDisponibles) return [];
    try {
      return JSON.parse(servicio.diasDisponibles);
    } catch (e) {
      return [];
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Cargando servicio...</p>
      </div>
    );
  }

  if (error || !servicio) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontSize: "18px", color: "#c33" }}>{error || "Servicio no encontrado"}</p>
        <button 
          onClick={() => nav("/catalogo")}
          style={{ background: "#00ccff", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const imagenes = obtenerImagenes();
  const diasDisponibles = obtenerDiasDisponibles();

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
        </div>

        {/* Badge de Servicio */}
        <div style={{
          display: "inline-block",
          background: "#ff5722",
          color: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "20px"
        }}>
          🛠️ SERVICIO
        </div>

        {/* Detalle del Servicio */}
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
                    alt={servicio.titulo}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: "8px"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div style="text-align: center; color: #999;"><div style="font-size: 80px; margin-bottom: 20px;">🛠️</div><p>Sin imagen disponible</p></div>';
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
                  <div style={{ fontSize: "80px", marginBottom: "20px" }}>🛠️</div>
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
                      alt={`${servicio.titulo} ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Botones: Favorito y Reportar */}
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
              {servicio.vendedor && (
                <button
                  onClick={() => nav(`/mensajes?vendedorId=${servicio.vendedor.id}&servicioId=${servicio.id}`)}
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
                🚩 Reportar servicio
              </button>
            </div>
          </div>

          {/* Información del Servicio */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            
            {/* Título y Categoría */}
            <div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                {servicio.categoria} › {servicio.modalidad}
              </div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#333",
                margin: "0 0 16px 0"
              }}>
                {servicio.titulo}
              </h1>
              
              {/* Precio */}
              <div style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#00ccff",
                marginBottom: "8px"
              }}>
                {servicio.tipoPrecio === "negociable" 
                  ? "A negociar" 
                  : servicio.tipoPrecio === "desde"
                  ? `Desde $${servicio.precio?.toFixed(2)}`
                  : `$${servicio.precio?.toFixed(2)}`
                }
              </div>
              
              {servicio.duracion && (
                <div style={{
                  fontSize: "14px",
                  color: "#666",
                  marginTop: "8px"
                }}>
                  {servicio.duracion === "hora" && "Por hora"}
                  {servicio.duracion === "dia" && "Por día"}
                  {servicio.duracion === "proyecto" && "Por proyecto"}
                  {servicio.duracion === "evento" && "Por evento"}
                  {servicio.duracion === "clase" && "Por clase"}
                </div>
              )}
            </div>

            {/* Información del Proveedor */}
            {servicio.vendedor && (
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
                  Información del Proveedor
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: "#666" }}>Proveedor:</span>
                    <span style={{ color: "#333", fontWeight: "600" }}>
                      {servicio.vendedor.nombre} {servicio.vendedor.apellido}
                    </span>
                  </div>
                  
                  <button
                    onClick={contactarVendedor}
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

            {/* Detalles del servicio */}
            <div style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "12px"
            }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                margin: "0 0 16px 0"
              }}>
                Detalles del servicio
              </h3>
              
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Categoría:</span>
                  <span style={{ color: "#333" }}>{servicio.categoria}</span>
                </div>
                
                <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Modalidad:</span>
                  <span style={{ color: "#333", fontWeight: "bold" }}>
                    {servicio.modalidad === "presencial" && "Presencial"}
                    {servicio.modalidad === "domicilio" && "A Domicilio"}
                    {servicio.modalidad === "local" && "En Local"}
                    {servicio.modalidad === "virtual" && "En Línea / Virtual"}
                  </span>
                </div>
                
                <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Ubicación:</span>
                  <span style={{ color: "#333" }}>
                    📍 {servicio.ciudad}{servicio.barrio && `, ${servicio.barrio}`}
                  </span>
                </div>
                
                {diasDisponibles.length > 0 && (
                  <div style={{ padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                    <span style={{ color: "#666", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                      Días disponibles:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {diasDisponibles.map((dia, index) => (
                        <span key={index} style={{
                          padding: "4px 12px",
                          background: "#e7f6ff",
                          color: "#00ccff",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {dia}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {servicio.horario && (
                  <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #ddd" }}>
                    <span style={{ color: "#666", fontWeight: "600", width: "40%" }}>Horario:</span>
                    <span style={{ color: "#333" }}>🕐 {servicio.horario}</span>
                  </div>
                )}
              </div>

              {servicio.descripcion && (
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
                    {servicio.descripcion}
                  </p>
                </div>
              )}

              {servicio.condiciones && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #ddd" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                    Condiciones del servicio:
                  </h4>
                  <p style={{
                    color: "#666",
                    lineHeight: "1.6",
                    margin: 0,
                    whiteSpace: "pre-line"
                  }}>
                    {servicio.condiciones}
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
              Reportar servicio
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
                  <option value="SERVICIO_NO_DISPONIBLE">Servicio no disponible</option>
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
                  placeholder="Explica por qué reportas este servicio..."
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