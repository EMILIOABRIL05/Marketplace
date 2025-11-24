-- Script para limpiar la base de datos manteniendo solo usuarios

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todos los mensajes
DELETE FROM mensajes;

-- Eliminar todos los detalles de pedidos
DELETE FROM detalles_pedido;

-- Eliminar todos los items del carrito
DELETE FROM items_carrito;

-- Eliminar todos los pedidos
DELETE FROM pedidos;

-- Eliminar todos los carritos
DELETE FROM carritos;

-- Eliminar todos los favoritos
DELETE FROM favoritos;

-- Eliminar todo el historial
DELETE FROM historial;

-- Eliminar todos los reportes
DELETE FROM reportes;

-- Eliminar todas las apelaciones
DELETE FROM apelaciones;

-- Eliminar todas las valoraciones
DELETE FROM valoraciones;

-- Eliminar todos los servicios
DELETE FROM servicios;

-- Eliminar todos los productos
DELETE FROM productos;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Resetear los auto_increment
ALTER TABLE mensajes AUTO_INCREMENT = 1;
ALTER TABLE detalles_pedido AUTO_INCREMENT = 1;
ALTER TABLE items_carrito AUTO_INCREMENT = 1;
ALTER TABLE pedidos AUTO_INCREMENT = 1;
ALTER TABLE carritos AUTO_INCREMENT = 1;
ALTER TABLE favoritos AUTO_INCREMENT = 1;
ALTER TABLE historial AUTO_INCREMENT = 1;
ALTER TABLE reportes AUTO_INCREMENT = 1;
ALTER TABLE apelaciones AUTO_INCREMENT = 1;
ALTER TABLE valoraciones AUTO_INCREMENT = 1;
ALTER TABLE servicios AUTO_INCREMENT = 1;
ALTER TABLE productos AUTO_INCREMENT = 1;

SELECT 'Base de datos limpiada exitosamente. Usuarios preservados.' as resultado;
