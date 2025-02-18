import express from "express";
import { obtenerProductos, agregarProducto, registrarUsuario, iniciarSesion, cerrarSesion, obtenerUsuarioActual } from "../services/supabase.js";
import { sincronizarProductos } from "../services/sheets.js";
import { verificarAutenticacion } from "../middlewares/authMiddleware.js"; // Importa el middleware

const router = express.Router();

// Agregar producto a Supabase y Google Sheets
router.post("/", verificarAutenticacion, async (req, res) => {
    const nuevoProducto = req.body;

    // Validar que los datos requeridos estén presentes
    if (!nuevoProducto.codigo || !nuevoProducto.nombre || !nuevoProducto.categoria || !nuevoProducto.marca || !nuevoProducto.unidad) {
        return res.status(400).json({ error: "Faltan campos obligatorios en el producto" });
    }

    // Agregar producto a Supabase
    const resultado = await agregarProducto(nuevoProducto);
    if (resultado) {
        console.log("Producto agregado en Supabase:", nuevoProducto);

        // Escribir en Google Sheets
        const datos = [[
            nuevoProducto.codigo,
            nuevoProducto.nombre,
            nuevoProducto.categoria,
            nuevoProducto.marca,
            nuevoProducto.unidad
        ]];
        console.log("Datos formateados para Google Sheets:", datos);

        await escribirEnSheets(datos);

        res.json({ success: true, data: resultado });
    } else {
        res.status(400).json({ error: "Error al agregar producto" });
    }
});

// Ruta para registrar un nuevo usuario
router.post("/registro", async (req, res) => {
    const { nombre, email, password } = req.body;
    const user = await registrarUsuario(nombre, email, password);

    if (user) {
        res.status(201).json({ success: true, user }); // 201: Created
    } else {
        res.status(500).json({ error: "Error al registrar usuario" }); // 500: Internal Server Error
    }
});

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await iniciarSesion(email, password);

    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(400).json({ error: "Error al iniciar sesión" });
    }
});

// Ruta para cerrar sesión
router.post("/logout", async (req, res) => {
    const success = await cerrarSesion();

    if (success) {
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Error al cerrar sesión" });
    }
});

// Ruta para obtener el usuario actual
router.get("/usuario", verificarAutenticacion, async (req, res) => {
    const user = await obtenerUsuarioActual();

    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(400).json({ error: "No hay usuario autenticado" });
    }
});

// Aplicar el middleware a las rutas que necesitan protección
router.get("/", verificarAutenticacion, async (req, res) => {
    const productos = await obtenerProductos();
    res.json(productos);
});

// Otras rutas protegidas...
router.post("/sincronizar", verificarAutenticacion, async (req, res) => {
    try {
        const productos = await obtenerProductos();
        const datos = await sincronizarProductos(productos, "Productos"); // <-- Capturar datos
        console.log("Datos formateados:", datos); // <-- Verificar los datos formateados
        res.json({
            success: true,
            message: "Sincronización completada",
            productos: datos // <- Enviar datos formateados
        });

    } catch (error) {
        console.error("Error durante la sincronización:", error);
        res.status(500).json({
            error: error.message || "Error durante la sincronización"
        });
    }
});

router.get("/prueba", async (req, res) => {
    res.json({ message: "Ruta de prueba" });
});

// Nueva ruta protegida para inventario
router.post('/inventario', verificarAutenticacion, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inventario')
            .insert([{
                ...req.body,
                usuario_id: req.user.id
            }]);

        if (error) throw error;
        res.json({ success: true, data });
        
    } catch (error) {
        res.status(500).json({ 
            error: error.message || 'Error al guardar inventario' 
        });
    }
});

router.get("/verificar-token", verificarAutenticacion, async (req, res) => {
    try {
        const user = await obtenerUsuarioActual();
        if (user) {
            res.json({ success: true, message: "Token válido" });
        } else {
            res.status(401).json({ success: false, message: "Token no válido" });
        }
    } catch (error) {
        console.error("Error al verificar el token:", error);
        res.status(500).json({ error: error.message || "Error al verificar el token" });
    }
});

export default router;
