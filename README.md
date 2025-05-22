# GestorInventory - Backend

Sistema de gestión de inventario con autenticación, autorización basada en roles y sincronización en tiempo real.

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Variables de Entorno](#variables-de-entorno)
7. [Endpoints de la API](#endpoints-de-la-api)
8. [Autenticación y Autorización](#autenticación-y-autorización)
9. [WebSockets para Tiempo Real](#websockets-para-tiempo-real)
10. [Integración con Supabase](#integración-con-supabase)
11. [Despliegue](#despliegue)
12. [Solución de Problemas](#solución-de-problemas)
13. [Contribuciones](#contribuciones)

## 📝 Descripción General

GestorInventory es un sistema completo de gestión de inventario que permite a los usuarios registrarse, iniciar sesión, y gestionar productos según sus roles y categorías asignadas. El sistema incluye sincronización en tiempo real mediante WebSockets y almacenamiento en Supabase.

## 🛠️ Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript
- **Express**: Framework web para Node.js
- **Supabase**: Base de datos PostgreSQL y autenticación
- **WebSockets**: Para actualizaciones en tiempo real
- **JWT**: Autenticación basada en tokens
- **Express-validator**: Validación de datos de entrada
- **Express-rate-limit**: Protección contra ataques de fuerza bruta y DoS
- **dotenv**: Gestión de variables de entorno
- **cors**: Manejo de CORS (Cross-Origin Resource Sharing)

## 🗂️ Estructura del Proyecto

```
GestorInventory-Backend/
├── nixpacks.toml         # Configuración para despliegue en Railway
├── package.json          # Dependencias y scripts
├── src/
│   ├── index.js          # Punto de entrada de la aplicación
│   ├── config/           # Configuraciones
│   │   └── env.js        # Gestión de variables de entorno
│   ├── middlewares/      # Middlewares
│   │   ├── authMiddleware.js     # Middleware de autenticación
│   │   └── rateLimitMiddleware.js # Control de límites de acceso
│   ├── routes/           # Rutas de la API
│   │   └── productos.js  # Rutas para la gestión de productos
│   └── services/         # Servicios
│       ├── sheets.js     # Integración con Google Sheets
│       └── supabase.js   # Conexión y funciones de Supabase
```

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Cuenta en Supabase
- Cuenta en Google Cloud Platform (para integración con Google Sheets)

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**:

```powershell
git clone https://github.com/angelaramiz/GestorInventory-Backend.git
cd GestorInventory-Backend
```

2. **Instalar dependencias**:

```powershell
npm install
```

3. **Configurar variables de entorno**:

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables (ver sección Variables de Entorno).

4. **Iniciar el servidor en modo desarrollo**:

```powershell
npm run start
```

El servidor estará disponible en `http://localhost:5000` por defecto.

## 🔐 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```
SUPABASE_URL=tu-url-de-supabase
SUPABASE_KEY=tu-clave-de-api-de-supabase
PORT=5000
NODE_ENV=development (o production para producción)
```

## 📡 Endpoints de la API

### Productos

- `GET /productos`: Obtener todos los productos (requiere autenticación)
- `POST /productos`: Añadir un nuevo producto (requiere autenticación)
- `DELETE /productos/:id`: Eliminar un producto (requiere rol admin)

### Autenticación y Usuarios

- `POST /productos/registro`: Registrar un nuevo usuario
- `POST /productos/login`: Iniciar sesión
- `POST /productos/logout`: Cerrar sesión
- `GET /productos/usuario`: Obtener información del usuario actual (requiere autenticación)

### Inventario

- `POST /productos/inventario`: Añadir inventario (requiere autenticación)
- `GET /productos/sincronizar`: Sincronizar productos según categoría del usuario (requiere autenticación)

### Utilidades

- `GET /api/supabase-config`: Obtener configuración de Supabase para el frontend
- `GET /productos/verificar-token`: Verificar si el token es válido
- `POST /productos/refresh-token`: Refrescar el token de acceso

## 🔒 Autenticación y Autorización

### Registro de Usuarios

```javascript
// Ejemplo de registro
const response = await fetch('https://tu-api.com/productos/registro', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nombre: 'Usuario Ejemplo',
    email: 'usuario@ejemplo.com',
    password: 'contraseña-segura'
  })
});
```

### Inicio de Sesión

```javascript
// Ejemplo de inicio de sesión
const response = await fetch('https://tu-api.com/productos/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Importante para cookies
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña-segura'
  })
});
```

### Verificación de Roles

El sistema utiliza un middleware para verificar los roles de usuario:

```javascript
// Ejemplo de uso en rutas
router.delete('/productos/:id', verificarAutenticacion, verificarRol('admin'), async (req, res) => {
  // Solo usuarios con rol 'admin' pueden acceder
});
```

## 🔄 WebSockets para Tiempo Real

El sistema implementa WebSockets para proporcionar actualizaciones en tiempo real del inventario:

```javascript
// Cliente WebSocket (ejemplo)
const ws = new WebSocket('ws://tu-api.com');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Actualizar interfaz con los nuevos datos
};
```

## 🗃️ Integración con Supabase

### Estructura de Base de Datos

Las principales tablas en Supabase son:

- `auth.users`: Gestión de autenticación (manejada por Supabase)
- `usuarios`: Información extendida de usuarios
- `roles`: Roles de usuario (admin, usuario, etc.)
- `productos`: Catálogo de productos
- `inventario`: Control de inventario
- `usuario_categoria`: Relación de usuarios con categorías de productos

### Ejemplo de Consulta

```javascript
// Consulta de productos por categoría
const { data, error } = await supabase
  .from("productos")
  .select("*")
  .in("categoria_id", categoriasIds);
```

## 🚀 Despliegue

El proyecto está configurado para despliegue en Railway usando Nixpacks:

1. Conecta tu repositorio con Railway
2. Configura las variables de entorno necesarias
3. Railway detectará automáticamente el archivo `nixpacks.toml`

## ❓ Solución de Problemas

### Error 429 (Too Many Requests)

El sistema implementa limitación de tasas para prevenir ataques:
- API general: 100 solicitudes por IP cada 15 minutos
- Login: 10 intentos por IP cada hora

Para ajustar estos límites, modifica `src/middlewares/rateLimitMiddleware.js`.

### Problemas de Autenticación

Si experimentas problemas con la autenticación:

1. Verifica que las cookies estén configuradas correctamente
2. Asegúrate de que el cliente incluya `credentials: 'include'` en las solicitudes
3. Comprueba que el CORS esté correctamente configurado para tu dominio

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir característica asombrosa'`)
4. Sube tus cambios (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

📅 Última actualización: Mayo 2025

© 2025 GestorInventory-Backend