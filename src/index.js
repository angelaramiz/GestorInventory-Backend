import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productosRoutes from "./routes/productos.js";
import rateLimit from 'express-rate-limit';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        "https://angelaramiz.github.io/GestorInventory-Frontend",
        "http://localhost:8158",
        "https://angelaramiz.github.io",
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Límite de 5 intentos por IP
    message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.',
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
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
