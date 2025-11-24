package com.tuempresa.appventas.model;

import java.math.BigDecimal;
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
@Table(name = "servicios")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 20)
    private String tipoPrecio; // "fijo", "desde", "negociable"

    @Column(precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false, length = 50)
    private String modalidad; // "presencial", "domicilio", "local", "virtual"

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Column(length = 100)
    private String barrio;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diasDisponibles; // JSON array de días

    @Column(length = 100)
    private String horario;

    @Column(nullable = false, length = 50)
    private String duracion; // "hora", "dia", "proyecto", "evento", "clase"

    @Column(columnDefinition = "TEXT")
    private String condiciones;

    @ManyToOne
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @Column(columnDefinition = "TEXT")
    private String imagenes; // JSON array de URLs de imágenes

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion;

    @Column(nullable = false)
    private Boolean activo = true;

    // CONTROLAR VISIBILIDAD
    @Column(length = 20)
    private String estado = "ACTIVO"; // "ACTIVO", "OCULTO"

    @Column(name = "deuna_numero")
    private String deunaNumero;

    @Column(name = "deuna_qr_url", length = 1000)
    private String deunaQrUrl;

    // Constructores
    public Servicio() {
        this.fechaCreacion = new Date();
        this.estado = "ACTIVO";
    }

    public Servicio(String titulo, String categoria, String descripcion, String tipoPrecio,
                    BigDecimal precio, String modalidad, String ciudad, String barrio,
                    String diasDisponibles, String horario, String duracion, String condiciones,
                    Usuario vendedor) {
        this.titulo = titulo;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.tipoPrecio = tipoPrecio;
        this.precio = precio;
        this.modalidad = modalidad;
        this.ciudad = ciudad;
        this.barrio = barrio;
        this.diasDisponibles = diasDisponibles;
        this.horario = horario;
        this.duracion = duracion;
        this.condiciones = condiciones;
        this.vendedor = vendedor;
        this.fechaCreacion = new Date();
        this.activo = true;
        this.estado = "ACTIVO";
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTipoPrecio() { return tipoPrecio; }
    public void setTipoPrecio(String tipoPrecio) { this.tipoPrecio = tipoPrecio; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getDiasDisponibles() { return diasDisponibles; }
    public void setDiasDisponibles(String diasDisponibles) { this.diasDisponibles = diasDisponibles; }

    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }

    public String getDuracion() { return duracion; }
    public void setDuracion(String duracion) { this.duracion = duracion; }

    public String getCondiciones() { return condiciones; }
    public void setCondiciones(String condiciones) { this.condiciones = condiciones; }

    public Usuario getVendedor() { return vendedor; }
    public void setVendedor(Usuario vendedor) { this.vendedor = vendedor; }

    public String getImagenes() { return imagenes; }
    public void setImagenes(String imagenes) { this.imagenes = imagenes; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDeunaNumero() { return deunaNumero; }
    public void setDeunaNumero(String deunaNumero) { this.deunaNumero = deunaNumero; }

    public String getDeunaQrUrl() { return deunaQrUrl; }
    public void setDeunaQrUrl(String deunaQrUrl) { this.deunaQrUrl = deunaQrUrl; }
}