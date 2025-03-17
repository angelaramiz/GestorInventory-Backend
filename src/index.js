import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // Importa cookie-parser
import productosRoutes from "./routes/productos.js";
import rateLimit from 'express-rate-limit';
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
        "https://angelaramiz.github.io/GestorInventory-Frontend/index.html"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Límite de 5 intentos por IP
    message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.',
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }
});

app.use('/productos/login', limiter);

// Nuevo endpoint para devolver las credenciales de Supabase
app.get('/api/supabase-config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_KEY
    });
});

// Rutas existentes
app.use("/productos", productosRoutes);

const PORT = process.env.PORT || 5000;
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
