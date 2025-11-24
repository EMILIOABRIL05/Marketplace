import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [genero, setGenero] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setShowResendButton(false);
    setShowResendForm(false);
    
    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });
      
      // ✅ Guardar el objeto completo con el token JWT
      const usuarioConToken = {
        ...res.data.usuario,
        token: res.data.token // Agregar el token JWT al objeto usuario
      };
      
      localStorage.setItem("user", JSON.stringify(usuarioConToken));
      localStorage.setItem("tipoUsuario", res.data.tipoUsuario);
      
      // ✅ Verificar el tipo de usuario y redirigir
      const tipoUsuario = res.data.tipoUsuario;
      
      if (tipoUsuario === 'USUARIO' || tipoUsuario === 'VENDEDOR') {
        nav("/catalogo"); // Ir directamente al catálogo
      } else if (tipoUsuario === 'ADMINISTRADOR' || tipoUsuario === 'MODERADOR') {
        nav("/selector-modo"); // Ir al selector de modo
      } else {
        nav("/catalogo"); // Por defecto al catálogo
      }
      
    } catch (err) {
      const errorMsg = err.response?.data || "Email o contraseña incorrectos";
      setError(errorMsg);
      
      // Solo mostrar botón de reenvío si el error es específicamente de falta de verificación
      if (typeof errorMsg === 'string' && errorMsg.includes("verificar tu email")) {
        setShowResendButton(true);
      }
    }
  }

  async function handleResendVerification() {
    setError("");
    setSuccessMessage("");
    
    const emailToUse = showResendForm ? resendEmail : email;
    
    if (!emailToUse || !emailToUse.includes('@')) {
      setError("Por favor ingresa un email válido");
      return;
    }
    
    try {
      const response = await api.post("/auth/reenviar-verificacion", { email: emailToUse });
      setSuccessMessage("✅ Email de verificación reenviado exitosamente. Revisa tu correo (puede estar en spam).");
      setShowResendButton(false);
      setShowResendForm(false);
      setResendEmail("");
    } catch (err) {
      const errorMessage = err.response?.data || "Error al reenviar email. Verifica que el email sea correcto.";
      if (typeof errorMessage === 'string' && errorMessage.includes("ya está verificada")) {
        setError("✅ Tu cuenta ya está verificada. Puedes iniciar sesión directamente.");
      } else {
        setError(errorMessage);
      }
    }
  }

  function validarCedulaSimple(cedula) {
    if (!/^\d+$/.test(cedula)) {
      return false;
    }
    if (cedula.length !== 10) {
      return false;
    }
    return true;
  }

  function handleCedulaChange(e) {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCedula(value);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (!cedula || cedula.trim() === "") {
      setError("La cédula es obligatoria");
      return;
    }

    if (!validarCedulaSimple(cedula)) {
      setError("La cédula debe contener exactamente 10 números");
      return;
    }
    
    if (password.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (!genero) {
      setError("Debe seleccionar un género");
      return;
    }
    
    try {
      await api.post("/auth/registro", {
        email,
        password,
        nombre,
        apellido,
        cedula,
        genero,
        telefono,
        direccion,
        tipoUsuario: "USUARIO" // ✅ ACTUALIZADO: Por defecto USUARIO
      });
      
      setSuccessMessage("Cuenta creada. Revisa tu email para verificar tu cuenta (puede estar en spam).");
      setIsRegistering(false);
      
      setPassword("");
      setConfirmPassword("");
      setNombre("");
      setApellido("");
      setCedula("");
      setGenero("");
      setTelefono("");
      setDireccion("");
      
    } catch (err) {
      setError(err.response?.data || "Error al registrarse. Verifica los datos.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", paddingTop: "20px" }}>
      <div style={{ background: "white", padding: "15px 40px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", background: "#2563eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "24px" }}>
            🛒
          </div>
          <h1 style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#1e40af" }}>Sistema de Ventas Multiempresa</h1>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "0 20px 40px" }}>
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "40px", width: "100%", maxWidth: "500px" }}>
          
          {isRegistering ? (
            <>
              <h2 style={{ color: "#1e40af", fontSize: "24px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>Crear cuenta nueva</h2>
              <p style={{ color: "#666", fontSize: "14px", textAlign: "center", marginBottom: "30px" }}>Completa el siguiente formulario para registrarte</p>

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre"
                      style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Apellido</label>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Tu apellido"
                      style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Cédula</label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={handleCedulaChange}
                    placeholder="1234567890"
                    maxLength="10"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  />
                  <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 0" }}>Solo números, exactamente 10 dígitos</p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0987654321"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Género</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  >
                    <option value="">Selecciona tu género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Dirección</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, número, ciudad"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  />
                  <p style={{ fontSize: "12px", color: "#999", margin: "4px 0 0 0" }}>Mínimo 5 caracteres</p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  />
                </div>

                {error && (
                  <div style={{ background: "#fee", border: "1px solid #fcc", color: "#c33", padding: "12px", borderRadius: "6px", fontSize: "13px" }}>
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div style={{ background: "#efe", border: "1px solid #cfc", color: "#3c3", padding: "12px", borderRadius: "6px", fontSize: "13px" }}>
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  style={{ background: "#2563eb", color: "white", fontWeight: "600", padding: "12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px", transition: "background 0.3s" }}
                  onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                  onMouseLeave={(e) => e.target.style.background = "#2563eb"}
                >
                  → Crear cuenta
                </button>
              </form>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <p style={{ color: "#666", fontSize: "13px", margin: "0" }}>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    onClick={() => {
                      setIsRegistering(false);
                      setError("");
                      setSuccessMessage("");
                    }}
                    style={{ color: "#2563eb", fontWeight: "600", cursor: "pointer", border: "none", background: "none", textDecoration: "underline" }}
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ color: "#1e40af", fontSize: "24px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>Iniciar sesión</h2>
              <p style={{ color: "#666", fontSize: "13px", textAlign: "center", marginBottom: "30px" }}>Accede con tu correo y contraseña para continuar</p>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    required
                  />
                </div>

                {error && (
                  <div style={{ background: "#fee", border: "1px solid #fcc", color: "#c33", padding: "12px", borderRadius: "6px", fontSize: "13px" }}>
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div style={{ background: "#efe", border: "1px solid #cfc", color: "#3c3", padding: "12px", borderRadius: "6px", fontSize: "13px" }}>
                    {successMessage}
                  </div>
                )}

                {showResendButton && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    style={{ background: "#f59e0b", color: "white", fontWeight: "600", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px" }}
                  >
                    📧 Reenviar email de verificación
                  </button>
                )}

                {showResendForm && (
                  <div style={{ padding: "16px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "6px" }}>Email para reenviar verificación</label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box", marginBottom: "10px" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        style={{ flex: 1, background: "#059669", color: "white", fontWeight: "600", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px" }}
                      >
                        ✉️ Enviar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowResendForm(false); setResendEmail(""); setError(""); }}
                        style={{ flex: 1, background: "#6b7280", color: "white", fontWeight: "600", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  style={{ background: "#2563eb", color: "white", fontWeight: "600", padding: "12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px", transition: "background 0.3s" }}
                  onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
                  onMouseLeave={(e) => e.target.style.background = "#2563eb"}
                >
                  → Iniciar sesión
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => nav("/recuperar-password")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "14px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: "0"
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowResendForm(true); setError(""); setSuccessMessage(""); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#059669",
                      fontSize: "14px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: "0"
                    }}
                  >
                    ¿No verificaste tu email? Reenviar verificación
                  </button>
                </div>
              </form>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <p style={{ color: "#666", fontSize: "13px", margin: "0" }}>
                  ¿No tienes una cuenta?{" "}
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setError("");
                      setSuccessMessage("");
                    }}
                    style={{ color: "#2563eb", fontWeight: "600", cursor: "pointer", border: "none", background: "none", textDecoration: "underline" }}
                  >
                    Crear cuenta nueva
                  </button>
                </p>
              </div>
            </>
          )}

          <div style={{ marginTop: "30px", textAlign: "center", paddingTop: "20px", borderTop: "1px solid #eee" }}>
            <p style={{ color: "#999", fontSize: "12px", margin: "0" }}>©2025 Sistema de Ventas Multiempresa</p>
          </div>
        </div>
      </div>
    </div>
  );
}