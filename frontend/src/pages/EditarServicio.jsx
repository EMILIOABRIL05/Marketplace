import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function EditarServicio() {
  const nav = useNavigate();
  const { id } = useParams();
  const [guardando, setGuardando] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    descripcion: "",
    tipoPrecio: "",
    precio: "",
    modalidad: "",
    ciudad: "",
    barrio: "",
    diasDisponibles: [],
    horario: "",
    duracion: "",
    condiciones: ""
  });

  const categoriasServicio = [
    "Mantenimiento",
    "Educación",
    "Belleza",
    "Tecnología",
    "Transporte",
    "Diseño / Creativo",
    "Salud y Bienestar",
    "Eventos",
    "Limpieza",
    "Reparaciones",
    "Consultoría",
    "Otros"
  ];

  const provincias = [
    "Azuay",
    "Bolívar",
    "Cañar",
    "Carchi",
    "Chimborazo",
    "Cotopaxi",
    "El Oro",
    "Esmeraldas",
    "Galápagos",
    "Guayas",
    "Imbabura",
    "Loja",
    "Los Ríos",
    "Manabí",
    "Morona Santiago",
    "Napo",
    "Orellana",
    "Pastaza",
    "Pichincha",
    "Santa Elena",
    "Santo Domingo de los Tsáchilas",
    "Sucumbíos",
    "Tungurahua",
    "Zamora Chinchipe"
  ];

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"
  ];

  useEffect(() => {
    cargarServicio();
  }, [id]);

  async function cargarServicio() {
    try {
      const res = await api.get(`/servicios/${id}`);
      const servicio = res.data;
      
      // Parsear días disponibles si vienen como string JSON
      let diasDisponibles = [];
      if (servicio.diasDisponibles) {
        try {
          diasDisponibles = typeof servicio.diasDisponibles === 'string' 
            ? JSON.parse(servicio.diasDisponibles) 
            : servicio.diasDisponibles;
        } catch (e) {
          console.error("Error parseando días disponibles:", e);
        }
      }

      // Parsear imágenes si existen
      let imagenesServicio = [];
      if (servicio.imagenes) {
        try {
          const imagenesArray = typeof servicio.imagenes === 'string' 
            ? JSON.parse(servicio.imagenes) 
            : servicio.imagenes;
          
          imagenesServicio = imagenesArray.map(img => ({
            preview: `http://localhost:8080${img}`,
            nombre: img.split('/').pop(),
            url: img
          }));
        } catch (e) {
          console.error("Error parseando imágenes:", e);
        }
      }

      setFormData({
        titulo: servicio.titulo || "",
        categoria: servicio.categoria || "",
        descripcion: servicio.descripcion || "",
        tipoPrecio: servicio.tipoPrecio || "",
        precio: servicio.precio || "",
        modalidad: servicio.modalidad || "",
        ciudad: servicio.ciudad || "",
        barrio: servicio.barrio || "",
        diasDisponibles: diasDisponibles,
        horario: servicio.horario || "",
        duracion: servicio.duracion || "",
        condiciones: servicio.condiciones || ""
      });

      setImagenes(imagenesServicio);
    } catch (err) {
      console.error("Error cargando servicio:", err);
      alert("Error al cargar servicio");
      nav("/perfil");
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handleDiaToggle(dia) {
    setFormData(prev => ({
      ...prev,
      diasDisponibles: prev.diasDisponibles.includes(dia)
        ? prev.diasDisponibles.filter(d => d !== dia)
        : [...prev.diasDisponibles, dia]
    }));
  }

  function handleImagenesChange(e) {
    const archivos = Array.from(e.target.files);
    
    if (imagenes.length + archivos.length > 5) {
      alert("Puedes subir máximo 5 imágenes");
      e.target.value = "";
      return;
    }

    const imagenesValidas = [];

    for (let archivo of archivos) {
      if (!archivo.type.startsWith('image/')) {
        alert(`${archivo.name} no es una imagen válida`);
        continue;
      }

      if (archivo.size > 5 * 1024 * 1024) {
        alert(`${archivo.name} supera los 5MB`);
        continue;
      }

      imagenesValidas.push(archivo);
    }

    imagenesValidas.forEach(archivo => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenes(prev => [...prev, {
          archivo: archivo,
          preview: reader.result,
          nombre: archivo.name,
          tamanio: archivo.size
        }]);
      };
      reader.readAsDataURL(archivo);
    });

    e.target.value = "";
  }

  function eliminarImagen(index) {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  }

  function establecerPrincipal(index) {
    setImagenes(prev => {
      const nuevasImagenes = [...prev];
      const [imagen] = nuevasImagenes.splice(index, 1);
      nuevasImagenes.unshift(imagen);
      return nuevasImagenes;
    });
  }

  // 🟢 FUNCIÓN ACTUALIZADA - USANDO PUT Y AGREGANDO VENDEDOR ID
  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.titulo || !formData.categoria || !formData.descripcion || !formData.tipoPrecio || !formData.modalidad || !formData.ciudad || !formData.duracion) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.tipoPrecio !== "negociable" && (!formData.precio || formData.precio <= 0)) {
      alert("Debes ingresar un precio válido");
      return;
    }

    if (formData.diasDisponibles.length === 0) {
      alert("Selecciona al menos un día disponible");
      return;
    }

    setGuardando(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("tipoPrecio", formData.tipoPrecio);
      formDataToSend.append("precio", formData.precio || "0");
      formDataToSend.append("modalidad", formData.modalidad);
      formDataToSend.append("ciudad", formData.ciudad);
      formDataToSend.append("barrio", formData.barrio);
      formDataToSend.append("diasDisponibles", JSON.stringify(formData.diasDisponibles));
      formDataToSend.append("horario", formData.horario);
      formDataToSend.append("duracion", formData.duracion);
      formDataToSend.append("condiciones", formData.condiciones);
      
      // 🟢 AGREGAR VENDEDOR ID (requerido por el backend)
      formDataToSend.append("vendedorId", user.id.toString());

      // Agregar solo las imágenes nuevas (archivos)
      imagenes.forEach((img) => {
        if (img.archivo) {
          formDataToSend.append("imagenes", img.archivo);
        }
      });

      // 🟢 USAR PUT EN LUGAR DE PATCH
      const response = await fetch(`http://localhost:8080/api/servicios/${id}`, {
        method: 'PUT', // ← CAMBIADO DE PATCH A PUT
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      alert("¡Servicio actualizado exitosamente!");
      nav("/perfil");
    } catch (err) {
      console.error("Error actualizando servicio:", err);
      
      // Mensaje de error más específico
      let mensaje = "Error al actualizar el servicio";
      if (err.message.includes("415")) {
        mensaje = "Error de formato - el servidor no acepta el tipo de datos";
      } else if (err.message.includes("401")) {
        mensaje = "No autorizado - token inválido o expirado";
      } else if (err.message.includes("404")) {
        mensaje = "Servicio no encontrado";
      } else if (err.message.includes("400")) {
        mensaje = "Datos inválidos - verifica la información";
      }
      
      alert(mensaje);
      setGuardando(false);
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "white", 
      display: "flex",
      fontFamily: "Arial, sans-serif"
    }}>
      
      {/* Sidebar Azul - IDÉNTICO al de PublicarServicio */}
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
              👤 Mi Perfil
            </button>
          </div>
        </nav>
      </div>

      {/* Contenido Principal - IDÉNTICO al de PublicarServicio */}
      <div style={{
        flex: 1,
        padding: "30px 40px",
        background: "#f8f9fa",
        overflowY: "auto"
      }}>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <div>
            <h1 style={{
              color: "#333",
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0 0 8px 0"
            }}>
              ✏️ Editar Servicio
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              Actualiza la información de tu servicio
            </p>
          </div>
          
          <button 
            onClick={() => nav("/perfil")}
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
            ← Volver al Perfil
          </button>
        </div>

        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          maxWidth: "800px"
        }}>
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Título del Servicio *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Limpieza de casas, Clases de inglés, Reparación de celulares"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "pointer",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box",
                  background: "white"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              >
                <option value="">Selecciona una categoría</option>
                {categoriasServicio.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Descripción Detallada *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe tu servicio: qué incluye, cómo funciona, qué espera el cliente, etc."
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "Arial, sans-serif",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "24px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Tipo de Precio *
                </label>
                <select
                  name="tipoPrecio"
                  value={formData.tipoPrecio}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="">Selecciona</option>
                  <option value="fijo">Precio Fijo</option>
                  <option value="desde">Desde (precio mínimo)</option>
                  <option value="negociable">A Negociar</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  {formData.tipoPrecio === "desde" ? "Precio Desde ($)" : "Precio ($)"}
                  {formData.tipoPrecio !== "negociable" && " *"}
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder={formData.tipoPrecio === "negociable" ? "No aplica" : "0.00"}
                  step="0.01"
                  min="0"
                  disabled={formData.tipoPrecio === "negociable"}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: formData.tipoPrecio === "negociable" ? "#e9ecef" : "white",
                    cursor: formData.tipoPrecio === "negociable" ? "not-allowed" : "text"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "24px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Modalidad del Servicio *
                </label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="">Selecciona</option>
                  <option value="presencial">Presencial</option>
                  <option value="domicilio">A Domicilio</option>
                  <option value="local">En Local</option>
                  <option value="virtual">En Línea / Virtual</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Duración / Tipo de Servicio *
                </label>
                <select
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="">Selecciona</option>
                  <option value="hora">Por Hora</option>
                  <option value="dia">Por Día</option>
                  <option value="proyecto">Por Proyecto</option>
                  <option value="evento">Por Evento</option>
                  <option value="clase">Por Clase</option>
                </select>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "24px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Provincia / Ciudad *
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                >
                  <option value="">Selecciona una provincia</option>
                  {provincias.map(provincia => (
                    <option key={provincia} value={provincia}>{provincia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Barrio / Sector (Opcional)
                </label>
                <input
                  type="text"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  placeholder="Ej: Centro, Norte, Sur"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Días Disponibles *
              </label>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                {diasSemana.map(dia => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => handleDiaToggle(dia)}
                    style={{
                      padding: "10px 20px",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                      background: formData.diasDisponibles.includes(dia) ? "#00ccff" : "white",
                      color: formData.diasDisponibles.includes(dia) ? "white" : "#333",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Horario de Atención (Opcional)
              </label>
              <input
                type="text"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                placeholder="Ej: 8:00 AM - 6:00 PM, Mañanas, Tardes"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Condiciones del Servicio (Opcional)
              </label>
              <textarea
                name="condiciones"
                value={formData.condiciones}
                onChange={handleChange}
                placeholder="Ej: No incluye materiales, Se paga el transporte extra, Se requiere reserva con 1 día de anticipación"
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "Arial, sans-serif",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00ccff"}
                onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333"
              }}>
                Imágenes o Portafolio (Opcional, máximo 5)
              </label>
              <p style={{
                fontSize: "13px",
                color: "#666",
                margin: "0 0 12px 0"
              }}>
                Sube fotos de trabajos anteriores, tu logo, o ejemplos de tu servicio
              </p>

              {imagenes.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px"
                }}>
                  {imagenes.map((img, index) => (
                    <div key={index} style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: index === 0 ? "3px solid #00ccff" : "2px solid #e9ecef",
                      background: "#f8f9fa"
                    }}>
                      <img 
                        src={img.preview} 
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      
                      {index === 0 && (
                        <div style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: "#00ccff",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}>
                          ⭐ PRINCIPAL
                        </div>
                      )}

                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        justifyContent: "space-around",
                        padding: "8px"
                      }}>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => establecerPrincipal(index)}
                            style={{
                              background: "transparent",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "18px",
                              padding: "4px"
                            }}
                            title="Establecer como principal"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarImagen(index)}
                          style={{
                            background: "transparent",
                            color: "#ff4444",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                            padding: "4px"
                          }}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {imagenes.length < 5 && (
                <div 
                  style={{
                    border: "2px dashed #00ccff",
                    borderRadius: "8px",
                    padding: "30px",
                    textAlign: "center",
                    background: "#f8f9fa",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#e9ecef"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#f8f9fa"}
                  onClick={() => document.getElementById("imagenes-servicio-input").click()}
                >
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🖼️</div>
                  <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#333" }}>
                    {imagenes.length === 0 ? "Haz clic para agregar imágenes" : `Agregar más imágenes (${imagenes.length}/5)`}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                    JPG, PNG o GIF (máximo 5MB cada una)
                  </p>
                  <input
                    id="imagenes-servicio-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenesChange}
                    style={{ display: "none" }}
                  />
                </div>
              )}

              {imagenes.length > 0 && (
                <p style={{ 
                  margin: "12px 0 0 0", 
                  fontSize: "13px", 
                  color: "#666",
                  fontStyle: "italic"
                }}>
                  💡 La primera imagen será la principal. Haz clic en ⭐ para cambiarla.
                </p>
              )}
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              borderTop: "2px solid #e9ecef"
            }}>
              <button
                type="button"
                onClick={() => nav("/perfil")}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "background 0.3s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#5a6268"}
                onMouseLeave={(e) => e.target.style.background = "#6c757d"}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                style={{
                  background: guardando ? "#999" : "#00ccff",
                  color: "white",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "8px",
                  cursor: guardando ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "background 0.3s ease"
                }}
                onMouseEnter={(e) => !guardando && (e.target.style.background = "#00b3e6")}
                onMouseLeave={(e) => !guardando && (e.target.style.background = "#00ccff")}
              >
                {guardando ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </div>

          </form>
        </div>

        <div style={{
          marginTop: "20px",
          padding: "16px",
          background: "#d1ecf1",
          border: "1px solid #bee5eb",
          borderRadius: "8px",
          maxWidth: "800px"
        }}>
          <p style={{
            margin: 0,
            fontSize: "14px",
            color: "#0c5460"
          }}>
            💡 <strong>Consejo:</strong> Mantén tu información actualizada para atraer más clientes. Las fotos recientes y descripciones claras aumentan la confianza.
          </p>
        </div>

      </div>
    </div>
  );
}