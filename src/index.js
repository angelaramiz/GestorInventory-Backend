import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productosRoutes from "./routes/productos.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/productos", productosRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
