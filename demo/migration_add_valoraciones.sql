CREATE TABLE IF NOT EXISTS valoraciones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vendedor_id BIGINT NOT NULL,
    comprador_id BIGINT NOT NULL,
    calificacion INT NOT NULL,
    comentario VARCHAR(1000),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_valoraciones_vendedor FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
    CONSTRAINT fk_valoraciones_comprador FOREIGN KEY (comprador_id) REFERENCES usuarios(id)
);
