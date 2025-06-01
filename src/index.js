import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // Importa cookie-parser
import productosRoutes from "./routes/productos.js";
import { apiLimiter } from './middlewares/rateLimitMiddleware.js'; // Importar los middleware de rate limiting
import { WebSocketServer } from 'ws'; // Importa WebSocketServer
import { suscribirCambiosInventario } from './services/supabase.js'; // Importa la función de suscripción

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser()); // Usa cookie-parser
app.use(cors({
    origin: [
        // Orígenes de producción
        "https://angelaramiz.github.io/GestorInventory-Frontend",
        "https://angelaramiz.github.io",
        "https://angelaramiz.github.io/GestorInventory-Frontend/index.html",
        "https://gestorinventory-backend.fly.dev",
        
        // Orígenes de desarrollo local
        "http://localhost:8158",
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8158",
        "http://127.0.0.1:3000",
        
        // Live Server y otros servidores de desarrollo
        "http://localhost:5173", // Vite
        "http://localhost:8080", // Webpack dev server
        "http://localhost:4200"  // Angular CLI
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    credentials: true,
    optionsSuccessStatus: 200 // Para IE11
}));

// Habilitar trust proxy para aplicaciones detrás de un proxy reverso (como Fly.io)
app.enable('trust proxy');

// Middleware específico para manejar preflight OPTIONS requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 horas
    res.sendStatus(200);
});

// Forzar HTTPS en producción (necesario para cookies seguras)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Aplicar el limitador de tasa global a todas las rutas
app.use(apiLimiter);

// Middleware de logging para debuggear CORS
app.use((req, res, next) => {
    if (req.method === 'OPTIONS' || req.path.includes('/health') || req.path.includes('/api/supabase-config')) {
        console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    }
    next();
});

// Health check endpoint - no requiere autenticación
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint de ping simple para verificar conectividad
app.get('/ping', (req, res) => {
    res.json({ 
        message: 'pong',
        timestamp: new Date().toISOString()
    });
});

// Nuevo endpoint para devolver las credenciales de Supabase con manejo de errores
app.get('/api/supabase-config', (req, res) => {
    try {
        // Verificar que las variables de entorno estén disponibles
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('Variables de entorno de Supabase no configuradas');
            return res.status(500).json({
                error: 'Configuración del servidor incompleta',
                message: 'Variables de entorno de Supabase no encontradas'
            });
        }
        
        // Configurar headers para evitar problemas de cache
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json({
            supabaseUrl,
            supabaseKey,
            status: 'success',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error en endpoint supabase-config:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo obtener la configuración de Supabase'
        });
    }
});

// Rutas existentes
app.use("/productos", productosRoutes);

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        timestamp: new Date().toISOString()
    });
});

// Middleware global para manejo de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'production' ? 'Algo salió mal' : error.message,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000; // Usar 5000 como puerto por defecto
const server = app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log(`📡 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`⚙️  Supabase config: http://localhost:${PORT}/api/supabase-config`);
    console.log('🚀 ========================================');
});

// Crear un servidor WebSocket con manejo de errores mejorado
const wss = new WebSocketServer({ 
    server
    // Sin path específico, acepta conexiones WebSocket en cualquier ruta
});

// Función para manejar conexiones WebSocket
function handleWebSocketConnection(ws, req) {
    console.log(`🔌 Nuevo cliente WebSocket conectado desde ${req.socket.remoteAddress}`);

    // Enviar un mensaje de bienvenida
    ws.send(JSON.stringify({ 
        type: 'connection',
        message: "Conexión WebSocket establecida",
        timestamp: new Date().toISOString()
    }));

    // Escuchar mensajes del cliente
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📨 Mensaje recibido:`, data);
        } catch (error) {
            console.log(`📨 Mensaje recibido (texto plano): ${message}`);
        }
    });

    // Manejar errores de WebSocket
    ws.on('error', (error) => {
        console.error(`❌ Error en WebSocket:`, error);
    });

    // Manejar desconexión
    ws.on('close', (code, reason) => {
        console.log(`🔌 Cliente WebSocket desconectado - Código: ${code}, Razón: ${reason}`);
    });

    // Ping periódico para mantener la conexión
    const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        } else {
            clearInterval(pingInterval);
        }
    }, 30000); // Ping cada 30 segundos
}

wss.on('connection', (ws, req) => handleWebSocketConnection(ws, req));

console.log(`🔌 Servidor WebSocket disponible en ws://localhost:${PORT}`);

// Iniciar la suscripción a cambios en Supabase con manejo de errores
try {
    suscribirCambiosInventario(wss); // Pasar el servidor WebSocket principal
    console.log('✅ Suscripción a Supabase inicializada correctamente');
} catch (error) {
    console.error('❌ Error al inicializar suscripción a Supabase:', error);
}
