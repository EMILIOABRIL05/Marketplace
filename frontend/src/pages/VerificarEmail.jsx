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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center border border-slate-100">
        
        {estado === "verificando" && (
          <>
            <div className="text-6xl mb-5 animate-pulse">⏳</div>
            <h2 className="text-blue-800 text-2xl font-bold mb-2">Verificando tu email...</h2>
            <p className="text-slate-500 text-sm">Por favor espera un momento</p>
            {/* ✅ Indicador de carga animado */}
            <div className="mt-5 flex justify-center">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </>
        )}

        {estado === "exito" && (
          <>
            <div className="text-6xl mb-5">✅</div>
            <h2 className="text-green-500 text-2xl font-bold mb-2">¡Verificación exitosa!</h2>
            <p className="text-slate-500 text-sm mb-5">{mensaje}</p>
            <p className="text-slate-400 text-xs">Redirigiendo al inicio de sesión en 3 segundos...</p>
            <div className="mt-5">
              <button
                onClick={() => nav("/login")}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Ir al inicio ahora
              </button>
            </div>
          </>
        )}

        {estado === "error" && (
          <>
            <div className="text-6xl mb-5">❌</div>
            <h2 className="text-red-500 text-2xl font-bold mb-2">Error en la verificación</h2>
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm mb-5">
              {mensaje}
            </div>
            <p className="text-slate-500 text-xs mb-5">
              Si el link expiró, puedes solicitar un nuevo email de verificación desde la página de inicio de sesión.
            </p>
            <button
              onClick={() => nav("/login")}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Volver al inicio
            </button>
          </>
        )}

      </div>
    </div>
  );
}