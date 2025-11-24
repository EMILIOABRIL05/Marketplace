package com.tuempresa.appventas.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "historial")
public class Historial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaVisto;

    // NUEVO CAMPO: Estado de la transacción
    @Column(length = 20)
    private String estado = "VISTO"; // "VISTO", "COMPLETADO", "CANCELADO"

    public Historial() {}

    public Historial(Usuario usuario, Producto producto, Servicio servicio) {
        this.usuario = usuario;
        this.producto = producto;
        this.servicio = servicio;
        this.fechaVisto = new Date();
        this.estado = "VISTO"; // Valor por defecto
    }

    // Constructor con estado personalizado
    public Historial(Usuario usuario, Producto producto, Servicio servicio, String estado) {
        this.usuario = usuario;
        this.producto = producto;
        this.servicio = servicio;
        this.fechaVisto = new Date();
        this.estado = estado != null ? estado : "VISTO";
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public Servicio getServicio() { return servicio; }
    public void setServicio(Servicio servicio) { this.servicio = servicio; }

    public Date getFechaVisto() { return fechaVisto; }
    public void setFechaVisto(Date fechaVisto) { this.fechaVisto = fechaVisto; }

    // NUEVO GETTER Y SETTER PARA ESTADO
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}