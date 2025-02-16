import express from "express";
import { obtenerProductos, agregarProducto } from "../services/supabase.js";
import { escribirEnSheetsPorGid, sincronizarProductos } from "../services/sheets.js";

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
        // Escribir en la hoja "Productos" usando su GID
        await escribirEnSheetsPorGid(1882986845, "A1", [[
            nuevoProducto.codigo,
            nuevoProducto.nombre,
            nuevoProducto.categoria,
            nuevoProducto.marca,
            nuevoProducto.unidad
        ]]);

        res.json({ success: true, data: resultado });
    } else {
        res.status(400).json({ error: "Error al agregar producto" });
    }
});

// Sincronizar productos de Supabase con Google Sheets
router.post("/sincronizar", async (req, res) => {
    try {
        // Obtener productos de Supabase
        const productos = await obtenerProductos();

        // Sincronizar productos con Google Sheets
        await sincronizarProductos(productos, "Productos");

        res.json({ success: true, message: "Sincronización completada correctamente" });
    } catch (error) {
        console.error("Error durante la sincronización:", error);
        res.status(500).json({ error: "Error durante la sincronización" });
    }
});

export default router;