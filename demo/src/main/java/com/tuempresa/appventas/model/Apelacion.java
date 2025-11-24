package com.tuempresa.appventas.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "apelaciones")
public class Apelacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "incidencia_id", nullable = false)
    private Incidencia incidencia;

    @ManyToOne
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @Column(length = 1000, nullable = false)
    private String motivo;

    @Column(length = 2000)
    private String justificacion;

    @Column(length = 50)
    private String estado; // PENDIENTE, EN_REVISION, APROBADA, RECHAZADA

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaApelacion;

    @ManyToOne
    @JoinColumn(name = "moderador_revisor_id")
    private Usuario moderadorRevisor; // Moderador diferente que revisa la apelación

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaRevision;

    @Column(length = 50)
    private String decisionFinal; // APELACION_APROBADA, APELACION_RECHAZADA

    @Column(length = 1000)
    private String comentarioRevisor;

    public Apelacion() {
        this.fechaApelacion = new Date();
        this.estado = "PENDIENTE";
    }

    public Apelacion(Incidencia incidencia, Usuario vendedor, String motivo, String justificacion) {
        this();
        this.incidencia = incidencia;
        this.vendedor = vendedor;
        this.motivo = motivo;
        this.justificacion = justificacion;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Incidencia getIncidencia() {
        return incidencia;
    }

    public void setIncidencia(Incidencia incidencia) {
        this.incidencia = incidencia;
    }

    public Usuario getVendedor() {
        return vendedor;
    }

    public void setVendedor(Usuario vendedor) {
        this.vendedor = vendedor;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getJustificacion() {
        return justificacion;
    }

    public void setJustificacion(String justificacion) {
        this.justificacion = justificacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Date getFechaApelacion() {
        return fechaApelacion;
    }

    public void setFechaApelacion(Date fechaApelacion) {
        this.fechaApelacion = fechaApelacion;
    }

    public Usuario getModeradorRevisor() {
        return moderadorRevisor;
    }

    public void setModeradorRevisor(Usuario moderadorRevisor) {
        this.moderadorRevisor = moderadorRevisor;
    }

    public Date getFechaRevision() {
        return fechaRevision;
    }

    public void setFechaRevision(Date fechaRevision) {
        this.fechaRevision = fechaRevision;
    }

    public String getDecisionFinal() {
        return decisionFinal;
    }

    public void setDecisionFinal(String decisionFinal) {
        this.decisionFinal = decisionFinal;
    }

    public String getComentarioRevisor() {
        return comentarioRevisor;
    }

    public void setComentarioRevisor(String comentarioRevisor) {
        this.comentarioRevisor = comentarioRevisor;
    }
}
