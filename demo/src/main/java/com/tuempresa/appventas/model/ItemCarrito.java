package com.tuempresa.appventas.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "items_carrito")
public class ItemCarrito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer cantidad;

    @ManyToOne
    @JoinColumn(name = "carrito_id")
    @JsonIgnore
    private Carrito carrito;

    public ItemCarrito() {}

    public ItemCarrito(Producto producto, Integer cantidad, Carrito carrito) {
        this.producto = producto;
        this.cantidad = cantidad;
        this.carrito = carrito;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public Carrito getCarrito() { return carrito; }
    public void setCarrito(Carrito carrito) { this.carrito = carrito; }
    
    public Double getSubtotal() {
        if (producto != null) {
            return producto.getPrecio() * cantidad;
        }
        return 0.0;
    }
}
