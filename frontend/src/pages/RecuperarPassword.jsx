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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-white px-10 py-4 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-600/30">
            🛒
          </div>
          <h1 className="m-0 text-lg font-bold text-slate-800 tracking-wide">
            VEYCOFLASH
          </h1>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center border border-slate-100">
          
          {/* Ícono */}
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            📧
          </div>

          {/* Título */}
          <h2 className="text-blue-800 text-2xl font-bold mb-3">
            Recuperar contraseña
          </h2>

          {/* Descripción */}
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {paso === 1 && "Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña"}
            {paso === 2 && "Ingresa el código de 6 dígitos que enviamos a tu correo"}
            {paso === 3 && "Ingresa tu nueva contraseña"}
          </p>

          {/* Formulario Paso 1: Email */}
          {paso === 1 && (
            <form onSubmit={handleEnviarCodigo}>
              <div className="mb-5 text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                    📧
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm mb-5">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-xl text-sm mb-5">
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none mb-4"
              >
                {cargando ? "Enviando..." : "→ Enviar código"}
              </button>
            </form>
          )}

          {/* Formulario Paso 2: Código */}
          {paso === 2 && (
            <form onSubmit={handleVerificarCodigo}>
              <div className="mb-5 text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="123456"
                  maxLength="6"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-2xl text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm mb-5">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-xl text-sm mb-5">
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none mb-4"
              >
                {cargando ? "Verificando..." : "→ Verificar código"}
              </button>
            </form>
          )}

          {/* Formulario Paso 3: Nueva Contraseña */}
          {paso === 3 && (
            <form onSubmit={handleRestablecerPassword}>
              <div className="mb-5 text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="mb-5 text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm mb-5">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-xl text-sm mb-5">
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none mb-4"
              >
                {cargando ? "Guardando..." : "→ Restablecer contraseña"}
              </button>
            </form>
          )}

          {/* Link volver */}
          <button
            onClick={() => nav("/login")}
            className="text-blue-600 text-sm hover:underline font-medium bg-transparent border-none cursor-pointer"
          >
            Volver al inicio de sesión
          </button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-slate-400 text-xs m-0">
              ©2025 VEYCOFLASH
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}