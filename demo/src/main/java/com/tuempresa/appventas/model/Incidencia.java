package com.tuempresa.appventas.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "incidencias")
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    @Column(length = 50)
    private String tipo; // DETECCION_AUTOMATICA, REPORTE_COMPRADOR, REPORTE_MODERADOR

    @Column(length = 1000)
    private String descripcion;

    @Column(length = 50)
    private String estado; // PENDIENTE, EN_REVISION, RESUELTO, APELADO

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaIncidencia;

    @ManyToOne
    @JoinColumn(name = "moderador_id")
    private Usuario moderadorEncargado;

    @ManyToOne
    @JoinColumn(name = "vendedor_id")
    private Usuario vendedor;

    @ManyToOne
    @JoinColumn(name = "reportador_id")
    private Usuario reportador; // Usuario que reportó (si es reporte de comprador)

    @Column(length = 100)
    private String motivoDeteccion; // Ej: "Contenido prohibido detectado", "Palabras sospechosas", etc.

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaAsignacion;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaResolucion;

    @Column(length = 50)
    private String decision; // PRODUCTO_PERMITIDO, PRODUCTO_PROHIBIDO, REQUIERE_REVISION

    @Column(length = 1000)
    private String comentarioModerador;

    public Incidencia() {
        this.fechaIncidencia = new Date();
        this.estado = "PENDIENTE";
    }

    // Constructor para detección automática
    public Incidencia(Producto producto, String motivoDeteccion, Usuario vendedor) {
        this();
        this.producto = producto;
        this.tipo = "DETECCION_AUTOMATICA";
        this.motivoDeteccion = motivoDeteccion;
        this.vendedor = vendedor;
        this.descripcion = "Detección automática: " + motivoDeteccion;
    }

    // Constructor para detección automática de servicios
    public Incidencia(Servicio servicio, String motivoDeteccion, Usuario vendedor) {
        this();
        this.servicio = servicio;
        this.tipo = "DETECCION_AUTOMATICA";
        this.motivoDeteccion = motivoDeteccion;
        this.vendedor = vendedor;
        this.descripcion = "Detección automática: " + motivoDeteccion;
    }

    // Constructor para reporte de comprador
    public Incidencia(Producto producto, Usuario reportador, String descripcion, Usuario vendedor) {
        this();
        this.producto = producto;
        this.tipo = "REPORTE_COMPRADOR";
        this.reportador = reportador;
        this.descripcion = descripcion;
        this.vendedor = vendedor;
    }

    // Constructor para reporte de servicio por comprador
    public Incidencia(Servicio servicio, Usuario reportador, String descripcion, Usuario vendedor) {
        this();
        this.servicio = servicio;
        this.tipo = "REPORTE_COMPRADOR";
        this.reportador = reportador;
        this.descripcion = descripcion;
        this.vendedor = vendedor;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Servicio getServicio() {
        return servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Date getFechaIncidencia() {
        return fechaIncidencia;
    }

    public void setFechaIncidencia(Date fechaIncidencia) {
        this.fechaIncidencia = fechaIncidencia;
    }

    public Usuario getModeradorEncargado() {
        return moderadorEncargado;
    }

    public void setModeradorEncargado(Usuario moderadorEncargado) {
        this.moderadorEncargado = moderadorEncargado;
    }

    public Usuario getVendedor() {
        return vendedor;
    }

    public void setVendedor(Usuario vendedor) {
        this.vendedor = vendedor;
    }

    public Usuario getReportador() {
        return reportador;
    }

    public void setReportador(Usuario reportador) {
        this.reportador = reportador;
    }

    public String getMotivoDeteccion() {
        return motivoDeteccion;
    }

    public void setMotivoDeteccion(String motivoDeteccion) {
        this.motivoDeteccion = motivoDeteccion;
    }

    public Date getFechaAsignacion() {
        return fechaAsignacion;
    }

    public void setFechaAsignacion(Date fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }

    public Date getFechaResolucion() {
        return fechaResolucion;
    }

    public void setFechaResolucion(Date fechaResolucion) {
        this.fechaResolucion = fechaResolucion;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getComentarioModerador() {
        return comentarioModerador;
    }

    public void setComentarioModerador(String comentarioModerador) {
        this.comentarioModerador = comentarioModerador;
    }
}
