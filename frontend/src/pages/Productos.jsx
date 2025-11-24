import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function agregarProducto(e) {
    e.preventDefault();
    if (!nombre || !precio) {
      alert("Completa nombre y precio");
      return;
    }
    try {
      await api.post("/productos", {
        nombre,
        precio: parseFloat(precio),
        descripcion,
        imagenUrl: ""
      });
      setNombre("");
      setPrecio("");
      setDescripcion("");
      cargarProductos();
    } catch (err) {
      console.error(err);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    nav("/");
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Productos en venta</h1>
        <button onClick={handleLogout} style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "white", cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ maxWidth: "400px", marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Agregar producto</h3>
        <form onSubmit={agregarProducto}>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <textarea
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </div>
          <button type="submit" style={{ width: "100%", padding: "10px" }}>
            Agregar
          </button>
        </form>
      </div>

      <div>
        <h2>Lista de productos</h2>
        {productos.length === 0 ? (
          <p>No hay productos aún</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {productos.map((p) => (
              <div key={p.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
                <h3>{p.nombre}</h3>
                <p style={{ color: "#2196F3", fontSize: "18px", fontWeight: "bold" }}>${p.precio}</p>
                <p>{p.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}