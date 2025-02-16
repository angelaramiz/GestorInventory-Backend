import express from "express";
import { obtenerProductos, agregarProducto } from "../services/supabase.js";
import { escribirEnSheets } from "../services/sheets.js";

const router = express.Router();

// Obtener productos desde Supabase
router.get("/", async (req, res) => {
    const productos = await obtenerProductos();
    res.json(productos);
});

// Agregar producto a Supabase y Google Sheets
router.post("/", async (req, res) => {
    const nuevoProducto = req.body;

    // Validar que los datos requeridos estén presentes
    if (!nuevoProducto.codigo || !nuevoProducto.nombre || !nuevoProducto.categoria || !nuevoProducto.marca || !nuevoProducto.unidad) {
        return res.status(400).json({ error: "Faltan campos obligatorios en el producto" });
    }

    // Agregar producto a Supabase
    const resultado = await agregarProducto(nuevoProducto);
    if (resultado) {
        // Escribir en la hoja "Productos"
        const datos = [[
            nuevoProducto.codigo,
            nuevoProducto.nombre,
            nuevoProducto.categoria,
            nuevoProducto.marca,
            nuevoProducto.unidad
        ]];
        await escribirEnSheets("Productos", "A1", datos); // Especificar la hoja "Productos"

        res.json({ success: true, data: resultado });
    } else {
        res.status(400).json({ error: "Error al agregar producto" });
    }
});

export default router;