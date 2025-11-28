import axios from "axios";

// Detectar si estamos en producción o desarrollo
const getBaseURL = () => {
  // En producción, usar la URL del servidor
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:8080/api`;
  }
  // En desarrollo, usar localhost
  return "http://localhost:8080/api";
};

// URL base del servidor para imágenes y archivos estáticos
export const getServerURL = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:8080`;
  }
  return "http://localhost:8080";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// INTERCEPTOR MEJORADO
api.interceptors.request.use(
  (config) => {
    // Obtener usuario de localStorage de forma segura
    let user = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user");
    }

    // Si hay usuario y token, agregarlo al header
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      console.log(`✅ Token agregado a: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`⚠️ No hay token disponible para: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("Error en interceptor de request:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("❌ Error de autenticación (401/403). Redirigiendo al login...");
      // Opcional: limpiar localStorage y redirigir al login
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardAPI = {
    getEstadisticas: () => 
        api.get('/dashboard/estadisticas').then(response => response.data),
    
    getActividadesRecientes: () => 
        api.get('/dashboard/actividades-recientes').then(response => response.data),
    
    getEstadoPlataforma: () => 
        api.get('/dashboard/estado-plataforma').then(response => response.data)
};

export default api;