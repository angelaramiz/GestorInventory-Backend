import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productosRoutes from "./routes/productos.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: "https://gestorinventory.netlify.app", // Permite solicitudes desde este origen
    methods: ["GET", "POST", "PUT", "DELETE"],     // Métodos HTTP permitidos
    allowedHeaders: ["Content-Type", "Authorization"] // Encabezados permitidos
}));
// Rutas
app.use("/productos", productosRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
