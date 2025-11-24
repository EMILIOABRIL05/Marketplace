import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "white", // Fondo blanco para el 1/4 inferior
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif"
    }}>
      
      {/* Sección Azul (3/4 de la página) */}
      <div style={{
        flex: 3, // Ocupa 3 partes de 4
        background: "#00ccff", // Azul cian
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
      }}>
        
        {/* Header con Logo */}
        <header style={{
          padding: "30px 50px",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          {/* Ícono del carrito */}
          <div style={{
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(10px)"
          }}>
            🛒
          </div>
          
          {/* Texto del logo */}
          <h1 style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: "bold",
            color: "#1a237e",
            letterSpacing: "1px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            VEYCOFLASH
          </h1>
        </header>

        {/* Contenido Principal Centrado */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 40px 60px 40px"
        }}>
          <div style={{
            textAlign: "center",
            maxWidth: "800px"
          }}>
            {/* Mensaje Principal */}
            <h2 style={{
              fontSize: "52px",
              fontWeight: "bold",
              color: "white",
              margin: "0 0 60px 0",
              textShadow: "0 0 30px rgba(173, 216, 230, 0.9)",
              lineHeight: "1.3",
              letterSpacing: "0.5px"
            }}>
              Listo para comprar y vender rápidamente
            </h2>

            {/* Botón de Iniciar Sesión */}
            <button
              onClick={() => nav("/login")}
              style={{
                background: "linear-gradient(to bottom, #e3f2fd, #64b5f6)",
                color: "#1565c0",
                padding: "18px 60px",
                fontSize: "20px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: `
                  0 6px 20px rgba(100, 181, 246, 0.4),
                  0 0 0 3px rgba(255, 255, 255, 0.4) inset,
                  0 3px 0 rgba(255, 255, 255, 0.3) inset
                `,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = `
                  0 8px 25px rgba(100, 181, 246, 0.5),
                  0 0 0 3px rgba(255, 255, 255, 0.5) inset,
                  0 3px 0 rgba(255, 255, 255, 0.4) inset
                `;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `
                  0 6px 20px rgba(100, 181, 246, 0.4),
                  0 0 0 3px rgba(255, 255, 255, 0.4) inset,
                  0 3px 0 rgba(255, 255, 255, 0.3) inset
                `;
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>

        {/* Efectos de profundidad */}
        <div style={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%"
        }}></div>
        
        <div style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%"
        }}></div>
      </div>

      {/* Sección Blanca (1/4 inferior) */}
      <div style={{
        flex: 1, // Ocupa 1 parte de 4
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px"
      }}>
        <div style={{
          textAlign: "center",
          color: "#666",
          maxWidth: "600px"
        }}>
          <h3 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
            margin: "0 0 20px 0"
          }}>
            La plataforma más rápida para comprar y vender
          </h3>
          <p style={{
            fontSize: "16px",
            lineHeight: "1.6",
            margin: "0 0 30px 0",
            color: "#666"
          }}>
            Conectamos compradores y vendedores de forma segura y eficiente. 
            Publica tus productos o encuentra lo que necesitas en segundos.
          </p>
          
          {/* Footer */}
          <p style={{
            fontSize: "14px",
            color: "#999",
            margin: "40px 0 0 0"
          }}>
            © 2025 VEYCOFLASH - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}