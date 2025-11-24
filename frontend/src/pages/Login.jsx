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
    
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    // Validación de contraseña fuerte
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe ser fuerte: al menos 8 caracteres, una mayúscula, una minúscula y un número.");
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
    <div className="min-h-screen bg-slate-50 pt-5">
      <div className="bg-white py-4 px-10 shadow-sm mb-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl">
            🛒
          </div>
          <h1 className="m-0 text-xl font-bold text-blue-800">Sistema de Ventas Multiempresa</h1>
        </div>
      </div>

      <div className="flex justify-center px-5 pb-10">
        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-[500px]">
          
          {isRegistering ? (
            <>
              <h2 className="text-blue-800 text-2xl font-bold mb-2.5 text-center">Crear cuenta nueva</h2>
              <p className="text-gray-500 text-sm text-center mb-8">Completa el siguiente formulario para registrarte</p>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1.5">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1.5">Apellido</label>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Tu apellido"
                      className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Cédula</label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={handleCedulaChange}
                    placeholder="1234567890"
                    maxLength="10"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1 m-0">Solo números, exactamente 10 dígitos</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0987654321"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Género</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona tu género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Dirección</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, número, ciudad"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1 m-0">Mínimo 8 caracteres, mayúscula, minúscula y número</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-xs">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md text-xs">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-blue-600 text-white font-semibold p-3 rounded-md border-none cursor-pointer text-base transition-colors duration-300 hover:bg-blue-700"
                >
                  → Crear cuenta
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-gray-500 text-xs m-0">
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    onClick={() => {
                      setIsRegistering(false);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-blue-600 font-semibold cursor-pointer border-none bg-transparent underline hover:text-blue-800"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-blue-800 text-2xl font-bold mb-2.5 text-center">Iniciar sesión</h2>
              <p className="text-gray-500 text-xs text-center mb-8">Accede con tu correo y contraseña para continuar</p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-200 rounded-md text-sm box-border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-xs">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md text-xs">
                    {successMessage}
                  </div>
                )}

                {showResendButton && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="bg-amber-500 text-white font-semibold p-2.5 rounded-md border-none cursor-pointer text-sm hover:bg-amber-600 transition-colors"
                  >
                    📧 Reenviar email de verificación
                  </button>
                )}

                {showResendForm && (
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-md">
                    <label className="block text-xs font-semibold text-gray-800 mb-1.5">Email para reenviar verificación</label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full p-2.5 border border-gray-200 rounded-md text-sm box-border mb-2.5 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="flex-1 bg-emerald-600 text-white font-semibold p-2.5 rounded-md border-none cursor-pointer text-sm hover:bg-emerald-700 transition-colors"
                      >
                        ✉️ Enviar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowResendForm(false); setResendEmail(""); setError(""); }}
                        className="flex-1 bg-gray-500 text-white font-semibold p-2.5 rounded-md border-none cursor-pointer text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-blue-600 text-white font-semibold p-3 rounded-md border-none cursor-pointer text-base transition-colors duration-300 hover:bg-blue-700"
                >
                  → Iniciar sesión
                </button>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => nav("/recuperar-password")}
                    className="bg-transparent border-none text-blue-600 text-sm cursor-pointer underline p-0 hover:text-blue-800 text-left"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowResendForm(true); setError(""); setSuccessMessage(""); }}
                    className="bg-transparent border-none text-emerald-600 text-sm cursor-pointer underline p-0 hover:text-emerald-800 text-left"
                  >
                    ¿No verificaste tu email? Reenviar verificación
                  </button>
                </div>
              </form>

              <div className="mt-5 text-center">
                <p className="text-gray-500 text-xs m-0">
                  ¿No tienes una cuenta?{" "}
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-blue-600 font-semibold cursor-pointer border-none bg-transparent underline hover:text-blue-800"
                  >
                    Crear cuenta nueva
                  </button>
                </p>
              </div>
            </>
          )}

          <div className="mt-8 pt-5 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-xs m-0">©2025 Sistema de Ventas Multiempresa</p>
          </div>
        </div>
      </div>
    </div>
  );
}