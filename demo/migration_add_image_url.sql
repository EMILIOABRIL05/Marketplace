-- Agregar columna image_url a la tabla mensajes
ALTER TABLE mensajes ADD COLUMN image_url VARCHAR(500) AFTER contenido;

-- Verificar que se agregó correctamente
DESCRIBE mensajes;
