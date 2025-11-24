import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RecuperarPassword() {
  const [paso, setPaso] = useState(1); // 1: email, 2: código, 3: nueva contraseña
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const nav = useNavigate();

  async function handleEnviarCodigo(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      await api.post("/auth/recuperar-password", { email });
      setMensaje("✅ Código enviado a tu correo. Revisa tu bandeja de entrada.");
      setPaso(2);
    } catch (err) {
      setError(err.response?.data || "Error al enviar el código");
    } finally {
      setCargando(false);
    }
  }

  async function handleVerificarCodigo(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      await api.post("/auth/verificar-codigo", { email, codigo });
      setMensaje("✅ Código válido. Ahora ingresa tu nueva contraseña.");
      setPaso(3);
    } catch (err) {
      setError(err.response?.data || "Código inválido o expirado");
    } finally {
      setCargando(false);
    }
  }

  async function handleRestablecerPassword(e) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (nuevaPassword.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      await api.post("/auth/restablecer-password", {
        email,
        codigo,
        nuevaPassword
      });
      setMensaje("✅ Contraseña actualizada correctamente");
      
      setTimeout(() => {
        nav("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data || "Error al restablecer la contraseña");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif"
    }}>
      
      {/* Header */}
      <div style={{
        background: "white",
        padding: "15px 40px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "#2563eb",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px"
          }}>
            🛒
          </div>
          <h1 style={{
            margin: "0",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1e40af"
          }}>
            Sistema de Ventas Multiempresa
          </h1>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          padding: "40px",
          width: "100%",
          maxWidth: "450px",
          textAlign: "center"
        }}>
          
          {/* Ícono */}
          <div style={{
            width: "80px",
            height: "80px",
            background: "#e0f2fe",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "40px"
          }}>
            📧
          </div>

          {/* Título */}
          <h2 style={{
            color: "#1e40af",
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "12px"
          }}>
            Recuperar contraseña
          </h2>

          {/* Descripción */}
          <p style={{
            color: "#666",
            fontSize: "14px",
            marginBottom: "30px",
            lineHeight: "1.6"
          }}>
            {paso === 1 && "Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña"}
            {paso === 2 && "Ingresa el código de 6 dígitos que enviamos a tu correo"}
            {paso === 3 && "Ingresa tu nueva contraseña"}
          </p>

          {/* Formulario Paso 1: Email */}
          {paso === 1 && (
            <form onSubmit={handleEnviarCodigo}>
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "8px"
                }}>
                  Correo electrónico
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "18px"
                  }}>
                    📧
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 45px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  background: "#fee",
                  border: "1px solid #fcc",
                  color: "#c33",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}>
                  {error}
                </div>
              )}

              {mensaje && (
                <div style={{
                  background: "#d4edda",
                  border: "1px solid #c3e6cb",
                  color: "#155724",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}>
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                style={{
                  width: "100%",
                  background: cargando ? "#999" : "#2563eb",
                  color: "white",
                  fontWeight: "600",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: cargando ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  marginBottom: "16px"
                }}
              >
                {cargando ? "Enviando..." : "→ Enviar código"}
              </button>
            </form>
          )}

          {/* Formulario Paso 2: Código */}
          {paso === 2 && (
            <form onSubmit={handleVerificarCodigo}>
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "8px"
                }}>
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="123456"
                  maxLength="6"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "24px",
                    textAlign: "center",
                    letterSpacing: "8px",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: "#fee",
                  border: "1px solid #fcc",
                  color: "#c33",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}>
                  {error}
                </div>
              )}

              {mensaje && (
                <div style={{
                  background: "#d4edda",
                  border: "1px solid #c3e6cb",
                  color: "#155724",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}>
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                style={{
                  width: "100%",
                  background: cargando ? "#999" : "#2563eb",
                  color: "white",
                  fontWeight: "600",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: cargando ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  marginBottom: "16px"
                }}
              >
                {cargando ? "Verificando..." : "→ Verificar código"}
              </button>
            </form>
          )}

          {/* Formulario Paso 3: Nueva Contraseña */}
          {paso === 3 && (
            <form onSubmit={handleRestablecerPassword}>
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "8px"
                }}>
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "8px"
                }}>
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: "#fee",
                  border: "1px solid #fcc",
                  color: "#c33",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}>
                  {error}
                </div>
              )}

              {mensaje && (
                <div style={{
                  background: "#d4edda",
                  border: "1px solid #c3e6cb",
                  color: "#155724",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}>
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                style={{
                  width: "100%",
                  background: cargando ? "#999" : "#10b981",
                  color: "white",
                  fontWeight: "600",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: cargando ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  marginBottom: "16px"
                }}
              >
                {cargando ? "Guardando..." : "→ Restablecer contraseña"}
              </button>
            </form>
          )}

          {/* Link volver */}
          <button
            onClick={() => nav("/login")}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              fontSize: "14px",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Volver al inicio de sesión
          </button>

          {/* Footer */}
          <div style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <p style={{
              color: "#999",
              fontSize: "12px",
              margin: "0"
            }}>
              ©2025 Sistema de Ventas Multiempresa
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}