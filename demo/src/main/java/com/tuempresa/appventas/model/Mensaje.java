package com.tuempresa.appventas.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "mensajes")
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "remitente_id", nullable = false)
    private Usuario remitente;

    @ManyToOne
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto; // Producto relacionado (opcional)

    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio; // Servicio relacionado (opcional)

    @Column(length = 2000, nullable = false)
    private String contenido;

    @Column(length = 500)
    private String imageUrl; // URL de la imagen adjunta (opcional)

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaEnvio;

    @Column(nullable = false)
    private Boolean leido = false;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaLeido;

    // Campo para agrupar conversaciones
    @Column(length = 100)
    private String conversacionId; // ID único para agrupar mensajes entre dos usuarios

    public Mensaje() {
        this.fechaEnvio = new Date();
        this.leido = false;
    }

    public Mensaje(Usuario remitente, Usuario destinatario, String contenido) {
        this();
        this.remitente = remitente;
        this.destinatario = destinatario;
        this.contenido = contenido;
        this.conversacionId = generarConversacionId(remitente.getId(), destinatario.getId());
    }

    public Mensaje(Usuario remitente, Usuario destinatario, String contenido, Producto producto) {
        this(remitente, destinatario, contenido);
        this.producto = producto;
    }

    public Mensaje(Usuario remitente, Usuario destinatario, String contenido, Servicio servicio) {
        this(remitente, destinatario, contenido);
        this.servicio = servicio;
    }

    // Genera un ID único para la conversación entre dos usuarios
    private String generarConversacionId(Long userId1, Long userId2) {
        Long menor = Math.min(userId1, userId2);
        Long mayor = Math.max(userId1, userId2);
        return menor + "_" + mayor;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getRemitente() {
        return remitente;
    }

    public void setRemitente(Usuario remitente) {
        this.remitente = remitente;
    }

    public Usuario getDestinatario() {
        return destinatario;
    }

    public void setDestinatario(Usuario destinatario) {
        this.destinatario = destinatario;
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

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public Date getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(Date fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }

    public Boolean getLeido() {
        return leido;
    }

    public void setLeido(Boolean leido) {
        this.leido = leido;
    }

    public Date getFechaLeido() {
        return fechaLeido;
    }

    public void setFechaLeido(Date fechaLeido) {
        this.fechaLeido = fechaLeido;
    }

    public String getConversacionId() {
        return conversacionId;
    }

    public void setConversacionId(String conversacionId) {
        this.conversacionId = conversacionId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
