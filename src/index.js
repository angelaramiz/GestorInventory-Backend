import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productosRoutes from "./routes/productos.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        "https://gestorinventory.netlify.app",
        "http://localhost:8158",
        "https://angelaramiz.github.io",
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Asegurar que Authorization está permitido
    credentials: true
}));
// Rutas
app.use("/productos", productosRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
