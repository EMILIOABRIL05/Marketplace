#!/bin/bash

# Configuración
SERVER_IP="86.48.2.202"
REPO_URL="https://github.com/EMILIOABRIL05/Marketplace.git"
APP_DIR="/opt/marketplace"
DB_NAME="app_ventas"
DB_USER="appuser"
DB_PASS="appunoSW"

echo "🚀 Iniciando despliegue en $SERVER_IP..."

# 1. Actualizar sistema e instalar dependencias
echo "📦 Instalando dependencias..."
apt update && apt upgrade -y
# Node.js 20.x ya incluye npm, no instalar 'npm' por separado para evitar conflictos
apt install -y openjdk-17-jdk maven nodejs nginx mysql-server git acl

# 2. Configurar Base de Datos MySQL
echo "🗄️ Configurando Base de Datos..."
# Asegurar que MySQL esté corriendo
systemctl start mysql
sleep 5

mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# 3. Clonar o Actualizar Repositorio
echo "📂 Gestionando código fuente..."
if [ -d "$APP_DIR/.git" ]; then
    echo "   Actualizando repositorio existente..."
    cd $APP_DIR
    # Descartar cambios locales para evitar conflictos
    git reset --hard
    git pull
else
    echo "   Directorio no es un repo o no existe. Limpiando y clonando..."
    rm -rf $APP_DIR
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 4. Configurar Backend (Spring Boot)
echo "⚙️ Configurando Backend..."
# Actualizar URL de la app en properties
sed -i "s|app.url=http://localhost:3000|app.url=http://$SERVER_IP|g" $APP_DIR/demo/src/main/resources/application.properties

# Construir Backend
echo "☕ Construyendo Backend..."
cd $APP_DIR/demo
mvn clean package -DskipTests

# Crear directorio de uploads y asignar permisos
echo "📂 Configurando directorio de uploads..."
mkdir -p $APP_DIR/demo/uploads/productos
mkdir -p $APP_DIR/demo/uploads/servicios
mkdir -p $APP_DIR/demo/uploads/mensajes
mkdir -p $APP_DIR/demo/uploads/perfiles
chmod -R 777 $APP_DIR/demo/uploads

# 5. Configurar Frontend (React)
echo "⚙️ Configurando Frontend..."
# Actualizar URL de la API para producción (usando proxy inverso)
sed -i "s|baseURL: \"http://localhost:8080/api\"|baseURL: \"/api\"|g" $APP_DIR/frontend/src/services/api.js

# Construir Frontend
echo "⚛️ Construyendo Frontend..."
cd $APP_DIR/frontend
npm install
npm run build

# 6. Configurar Servicio Systemd para Spring Boot
echo "🚀 Configurando servicio del sistema..."
cat > /etc/systemd/system/appventas.service <<EOF
[Unit]
Description=AppVentas Backend
After=syslog.target

[Service]
User=root
WorkingDirectory=$APP_DIR/demo
ExecStart=/usr/bin/java -jar $APP_DIR/demo/target/app-ventas-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable appventas
systemctl restart appventas

# 7. Configurar Nginx
echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/appventas <<'EOF'
server {
    listen 80;
    server_name 86.48.2.202;

    root /opt/marketplace/frontend/build;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket Proxy
    location /ws {
        proxy_pass http://localhost:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Archivos subidos (Imágenes)
    location /uploads {
        alias /opt/marketplace/demo/uploads;
    }
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/appventas /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar y reiniciar Nginx
nginx -t
systemctl restart nginx

echo "✅ ¡Despliegue completado con éxito!"
echo "🌍 Tu aplicación está disponible en: http://$SERVER_IP"
