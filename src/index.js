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
        "https://angelaramiz.github.io/GestorInventory-Frontend",
        "http://localhost:8158",
        "https://angelaramiz.github.io",
        "http://127.0.0.1:5500",
        "https://angelaramiz.github.io/GestorInventory-Frontend/index.html",
        "https://tu-app.fly.dev" // Tu dominio en Fly.io - actualiza con tu dominio real
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Habilitar trust proxy para aplicaciones detrás de un proxy reverso (como Fly.io)
app.enable('trust proxy');

// Forzar HTTPS en producción (necesario para cookies seguras)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Aplicar el limitador de tasa global a todas las rutas
app.use(apiLimiter);

// Nuevo endpoint para devolver las credenciales de Supabase
app.get('/api/supabase-config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_KEY
    });
});

// Rutas existentes
app.use("/productos", productosRoutes);

const PORT = process.env.PORT || 8080; // Fly.io usa 8080 por defecto
const server = app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));;

// Crear un servidor WebSocket
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado');

    // Escuchar mensajes del cliente
    ws.on('message', (message) => {
        console.log(`Mensaje recibido: ${message}`);
    });

    // Enviar un mensaje de bienvenida
    ws.send(JSON.stringify({ message: "Conexión WebSocket establecida" }));
});

console.log(`Servidor WebSocket escuchando en ws://localhost:${PORT}`);

// Iniciar la suscripción a cambios en Supabase
suscribirCambiosInventario();
