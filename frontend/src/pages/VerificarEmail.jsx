import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const [estado, setEstado] = useState("verificando"); // verificando, exito, error
  const [mensaje, setMensaje] = useState("");
  const nav = useNavigate();
  const verificacionIniciada = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setEstado("error");
      setMensaje("Token de verificación no encontrado en el link");
      return;
    }

    // Evitar doble ejecución en desarrollo (React.StrictMode)
    if (verificacionIniciada.current) {
      return;
    }
    verificacionIniciada.current = true;

    verificarEmail(token);
  }, [searchParams]);

  async function verificarEmail(token) {
    try {
      // ✅ Esperar la respuesta completa antes de cambiar estado
      const response = await api.get(`/auth/verificar-email?token=${token}`);
      
      // ✅ Solo cambiar a éxito DESPUÉS de recibir respuesta
      setEstado("exito");
      setMensaje("¡Tu cuenta ha sido verificada exitosamente! Ya puedes iniciar sesión.");
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        nav("/login");
      }, 3000);
      
    } catch (error) {
      // ✅ Solo mostrar error si realmente falló
      setEstado("error");
      const errorMsg = error.response?.data || "Error al verificar el email. El token puede haber expirado.";
      setMensaje(errorMsg);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "40px", maxWidth: "500px", width: "100%", textAlign: "center" }}>
        
        {estado === "verificando" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>⏳</div>
            <h2 style={{ color: "#1e40af", fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Verificando tu email...</h2>
            <p style={{ color: "#666", fontSize: "14px" }}>Por favor espera un momento</p>
            {/* ✅ Indicador de carga animado */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {estado === "exito" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
            <h2 style={{ color: "#10b981", fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>¡Verificación exitosa!</h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>{mensaje}</p>
            <p style={{ color: "#999", fontSize: "13px" }}>Redirigiendo al inicio de sesión en 3 segundos...</p>
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => nav("/login")}
                style={{ background: "#2563eb", color: "white", fontWeight: "600", padding: "12px 24px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                Ir al inicio ahora
              </button>
            </div>
          </>
        )}

        {estado === "error" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>❌</div>
            <h2 style={{ color: "#ef4444", fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Error en la verificación</h2>
            <div style={{ background: "#fee", border: "1px solid #fcc", color: "#c33", padding: "12px", borderRadius: "6px", fontSize: "14px", marginBottom: "20px" }}>
              {mensaje}
            </div>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
              Si el link expiró, puedes solicitar un nuevo email de verificación desde la página de inicio de sesión.
            </p>
            <button
              onClick={() => nav("/login")}
              style={{ background: "#2563eb", color: "white", fontWeight: "600", padding: "12px 24px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px" }}
            >
              Volver al inicio
            </button>
          </>
        )}

      </div>
    </div>
  );
}