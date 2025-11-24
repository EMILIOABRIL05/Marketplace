# Sistema de Ventas Multiempresa - VEYCOFLASH

Sistema de comercio electrónico multi-vendedor con gestión de incidencias, moderación de contenido y mensajería entre usuarios.

## 🚀 Características Principales

### Roles de Usuario

#### 1. Compradores/Visualizadores
- ✅ Visualizar catálogo de productos y servicios
- ✅ Filtrar por categoría, precio y ubicación
- ✅ Ver detalles completos de productos/servicios
- ✅ Guardar favoritos ("me interesa")
- ✅ Contactar vendedores mediante mensajes
- ✅ Reportar productos/servicios inapropiados
- ✅ Ver historial de visualizaciones

#### 2. Vendedores
- ✅ Publicar productos con descripción, precio, hasta 5 fotos, disponibilidad
- ✅ Publicar servicios con horarios, modalidades y condiciones
- ✅ Editar y eliminar publicaciones
- ✅ Ver incidencias de sus productos/servicios
- ✅ Apelar decisiones de moderadores
- ✅ Recibir mensajes de compradores interesados
- ✅ Gestionar stock y disponibilidad

#### 3. Moderadores
- ✅ Revisar incidencias reportadas y detectadas automáticamente
- ✅ Asignar incidencias a sí mismos
- ✅ Resolver incidencias (permitir/prohibir/revisar)
- ✅ Suspender y reactivar cuentas de usuarios
- ✅ Revisar apelaciones (diferente moderador del caso original)
- ✅ Dashboard con estadísticas del sistema

#### 4. Administradores
- ✅ Registrar nuevos moderadores
- ✅ Todas las funcionalidades de moderador
- ✅ Acceso completo al sistema de gestión

## 🛠️ Stack Tecnológico

### Backend
- **Framework:** Spring Boot 3.5.6
- **Lenguaje:** Java 17
- **Base de Datos:** MySQL 8
- **Seguridad:** Spring Security con BCrypt
- **Email:** Spring Mail (Gmail SMTP)
- **ORM:** JPA/Hibernate
- **Arquitectura:** REST API

### Frontend
- **Framework:** React 19.2.0
- **Routing:** React Router 7.9.4
- **HTTP Client:** Axios 1.12.2
- **Estilos:** CSS en línea + Tailwind CSS
- **Build:** React Scripts 5.0.1

## 📦 Instalación

### Prerrequisitos
- Java 17 o superior
- Node.js 16+ y npm
- MySQL 8.0+
- Git

### Backend Setup

1. **Clonar el repositorio**
```bash
git clone https://github.com/EMILIOABRIL05/e-commerce.git
cd e-commerce/demo
```

2. **Configurar Base de Datos**

Crear base de datos en MySQL:
```sql
CREATE DATABASE app_ventas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'appunoSW';
GRANT ALL PRIVILEGES ON app_ventas.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configurar Email** (opcional pero recomendado)

Editar `demo/src/main/resources/application.properties`:
```properties
spring.mail.username=tu_email@gmail.com
spring.mail.password=tu_app_password
```

4. **Compilar y ejecutar**
```bash
chmod +x mvnw
./mvnw clean install
./mvnw spring-boot:run
```

El servidor iniciará en `http://localhost:8080`

### Frontend Setup

1. **Navegar al directorio frontend**
```bash
cd ../frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servidor de desarrollo**
```bash
npm start
```

La aplicación iniciará en `http://localhost:3000`

## 🔐 Gestión de Usuarios

### Registro de Usuario Regular
1. Ir a `/login` y seleccionar "Registrarse"
2. Completar formulario con todos los datos
3. Verificar email (revisar bandeja de entrada)
4. Iniciar sesión

### Crear Primer Administrador
Ejecutar directamente en la base de datos:
```sql
INSERT INTO usuarios (nombre, apellido, cedula, email, password, genero, telefono, direccion, tipo_usuario, estado, cuenta_verificada, fecha_registro)
VALUES ('Admin', 'Sistema', '0000000000', 'admin@veycoflash.com', '$2a$10$encrypted_password_here', 'Otro', '0000000000', 'Sistema', 'ADMINISTRADOR', 'ACTIVO', true, NOW());
```

### Crear Moderadores
Los administradores pueden registrar moderadores desde:
- Dashboard Admin → Gestionar Usuarios → Registrar Moderador

## 📚 Estructura del Proyecto

### Backend (`/demo`)
```
src/main/java/com/tuempresa/appventas/
├── model/              # Entidades JPA
│   ├── Usuario.java
│   ├── Producto.java
│   ├── Servicio.java
│   ├── Incidencia.java
│   ├── Apelacion.java
│   ├── Mensaje.java
│   ├── Favorito.java
│   ├── Historial.java
│   └── Reporte.java
├── repository/         # Repositorios JPA
├── service/           # Lógica de negocio
├── controller/        # Endpoints REST API
└── config/           # Configuraciones
```

### Frontend (`/frontend`)
```
src/
├── pages/             # Componentes de páginas
│   ├── Login.jsx
│   ├── Catalogo.jsx
│   ├── DetalleProducto.jsx
│   ├── DetalleServicio.jsx
│   ├── PublicarProducto.jsx
│   ├── GestionIncidencias.jsx
│   ├── GestionUsuarios.jsx
│   ├── RegistrarModerador.jsx
│   ├── Mensajes.jsx
│   └── DashboardAdmin.jsx
├── services/         # API clients
└── App.js           # Routing principal
```

## 🔄 Flujos Principales

### 1. Publicación de Producto
1. Usuario registrado → Publicar Producto
2. Completar formulario (mínimo 1 imagen, máximo 5)
3. Sistema detecta automáticamente palabras prohibidas
4. Si hay detección → Crea incidencia automática
5. Moderador revisa y decide
6. Producto visible o prohibido según decisión

### 2. Gestión de Incidencias
1. Incidencia creada (auto-detección o reporte)
2. Aparece en dashboard de moderadores
3. Moderador se asigna el caso
4. Revisa y toma decisión:
   - PRODUCTO_PERMITIDO → Activa publicación
   - PRODUCTO_PROHIBIDO → Oculta publicación
   - REQUIERE_REVISION → Mantiene en revisión
5. Vendedor puede apelar decisión

### 3. Apelaciones
1. Vendedor apela decisión desde sus incidencias
2. Sistema asigna a moderador diferente
3. Nuevo moderador revisa caso completo
4. Decisión final:
   - APELACION_APROBADA → Reactiva producto
   - APELACION_RECHAZADA → Mantiene prohibición

### 4. Mensajería
1. Comprador ve producto/servicio de interés
2. Click en "Contactar Vendedor"
3. Se abre chat en `/mensajes`
4. Conversación agrupada y persistente
5. Actualización automática cada 10 segundos
6. Marcado de mensajes leídos automático

## 🛡️ Seguridad Implementada

- ✅ Contraseñas encriptadas con BCrypt
- ✅ Verificación de email obligatoria
- ✅ Un email por cuenta
- ✅ Validación de contraseñas fuertes (mínimo 8 caracteres)
- ✅ Control de acceso basado en roles
- ✅ Tokens de verificación con expiración
- ✅ Prevención de inyección SQL (JPA)
- ✅ CORS configurado

## 📊 Detección Automática

El sistema detecta automáticamente contenido prohibido mediante palabras clave:
- arma, armas
- droga, drogas
- explosivo, explosivos
- robo, robado, robada
- ilegal, ilegales
- piratería, falsificación
- replica, contrabando

Cuando se detecta: Producto → Estado "EN_REVISION" + Incidencia automática

## 🌐 API Endpoints Principales

### Autenticación
- POST `/api/auth/registro` - Registrar usuario
- POST `/api/auth/login` - Iniciar sesión
- GET `/api/auth/verificar-email?token=` - Verificar email
- POST `/api/auth/crear-moderador` - Crear moderador (admin)

### Productos
- GET `/api/productos/public` - Listar productos públicos
- GET `/api/productos/public/{id}` - Detalle de producto
- POST `/api/productos` - Crear producto (multipart)
- PUT `/api/productos/{id}` - Actualizar producto
- GET `/api/productos/vendedor/{id}` - Productos por vendedor

### Servicios
- GET `/api/servicios` - Listar servicios
- GET `/api/servicios/{id}` - Detalle de servicio
- POST `/api/servicios` - Crear servicio
- PUT `/api/servicios/{id}` - Actualizar servicio

### Incidencias
- GET `/api/incidencias/pendientes` - Incidencias pendientes
- POST `/api/incidencias/reportar/producto` - Reportar producto
- PUT `/api/incidencias/{id}/asignar` - Asignar a moderador
- PUT `/api/incidencias/{id}/resolver` - Resolver incidencia

### Mensajes
- POST `/api/mensajes/enviar` - Enviar mensaje
- GET `/api/mensajes/conversaciones/{usuarioId}` - Listar conversaciones
- GET `/api/mensajes/conversacion/{conversacionId}` - Mensajes de conversación
- GET `/api/mensajes/no-leidos/count/{usuarioId}` - Contar no leídos

### Usuarios
- GET `/api/usuarios` - Listar todos los usuarios
- PUT `/api/usuarios/{id}/estado` - Cambiar estado usuario
- GET `/api/usuarios/{id}` - Obtener usuario por ID

## 🎨 Estilos Gráficos

El sistema mantiene un diseño consistente con:
- **Colores principales:** Azul (#00ccff), Morado
- **Gradientes:** from-blue-50 to-purple-50
- **Estilo:** Moderno, cards con sombras, esquinas redondeadas
- **Responsive:** Diseño adaptable a diferentes tamaños de pantalla
- **Iconos:** Emojis para accesibilidad visual

## 📝 Información Manejada

### Usuario
- Cédula, nombre, apellido
- Correo, teléfono, dirección
- Género, tipo de usuario
- Estado, verificación de cuenta

### Producto
- Código, nombre, descripción
- Fotos (1-5), precio, ubicación
- Disponibilidad, tipo, estado
- Fecha de publicación, cantidad, estado del producto

### Servicio
- Título, categoría, descripción
- Horario de atención, días disponibles
- Precio, modalidad (presencial/virtual/domicilio)
- Ciudad, barrio, duración

### Incidencia
- Tipo (auto-detección/reporte/moderador)
- Descripción, motivo
- Estado, fecha
- Moderador encargado, decisión

## 🤝 Contribución

Este proyecto fue desarrollado para cumplir con los requisitos de un sistema de ventas multiempresa con gestión completa de usuarios, productos, servicios y moderación.

## 📄 Licencia

Este proyecto es de código privado y pertenece a VEYCOFLASH.

## 👥 Autores

- EMILIOABRIL05
- Sistema desarrollado para gestión de comercio electrónico multiempresa

## 📞 Soporte

Para soporte técnico, contactar a través del sistema de incidencias o email del administrador.
