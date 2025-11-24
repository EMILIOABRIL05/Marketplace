import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicarProductoForm from "./PublicarProductoForm";
import PublicarServicioForm from "./PublicarServicioForm.jsx";

export default function PublicarProducto() {
  const nav = useNavigate();
  const [tipoPublicacion, setTipoPublicacion] = useState(null); // null, 'producto', 'servicio'

  // Si no se ha seleccionado tipo, mostrar opciones
  if (!tipoPublicacion) {
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

        {/* Contenido Principal - Selección de tipo */}
        <div style={{
          flex: 1,
          padding: "30px 40px",
          background: "#f8f9fa",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          
          <div style={{ maxWidth: "900px", width: "100%", textAlign: "center" }}>
            
            <h1 style={{
              color: "#333",
              fontSize: "32px",
              fontWeight: "bold",
              margin: "0 0 12px 0"
            }}>
              ¿Qué deseas publicar?
            </h1>
            
            <p style={{ 
              color: "#666", 
              margin: "0 0 50px 0", 
              fontSize: "16px" 
            }}>
              Selecciona el tipo de publicación que quieres crear
            </p>

            {/* Tarjetas de opciones */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
              marginBottom: "30px"
            }}>
              
              {/* Opción: Producto */}
              <div 
                onClick={() => setTipoPublicacion('producto')}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "40px 30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "3px solid #e9ecef",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#00ccff";
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,204,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e9ecef";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{
                  fontSize: "64px",
                  marginBottom: "20px"
                }}>
                  📦
                </div>
                <h2 style={{
                  color: "#333",
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: "0 0 12px 0"
                }}>
                  Producto
                </h2>
                <p style={{
                  color: "#666",
                  fontSize: "15px",
                  margin: 0,
                  lineHeight: "1.6"
                }}>
                  Publica artículos físicos como electrónica, ropa, muebles, vehículos y más
                </p>
              </div>

              {/* Opción: Servicio */}
              <div 
                onClick={() => setTipoPublicacion('servicio')}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "40px 30px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "3px solid #e9ecef",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#00ccff";
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,204,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e9ecef";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{
                  fontSize: "64px",
                  marginBottom: "20px"
                }}>
                  🛠️
                </div>
                <h2 style={{
                  color: "#333",
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: "0 0 12px 0"
                }}>
                  Servicio
                </h2>
                <p style={{
                  color: "#666",
                  fontSize: "15px",
                  margin: 0,
                  lineHeight: "1.6"
                }}>
                  Ofrece servicios como limpieza, clases, reparaciones, diseño y más
                </p>
              </div>

            </div>

            <button 
              onClick={() => nav("/catalogo")}
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
              ← Volver al Catálogo
            </button>

          </div>
        </div>
      </div>
    );
  }

  // Si se seleccionó un tipo, mostrar el formulario correspondiente
  if (tipoPublicacion === 'producto') {
    return <PublicarProductoForm onVolver={() => setTipoPublicacion(null)} />;
  }

  if (tipoPublicacion === 'servicio') {
    return <PublicarServicioForm onVolver={() => setTipoPublicacion(null)} />;
  }
}