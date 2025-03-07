import express from "express";
import { obtenerProductos, agregarProducto, registrarUsuario, iniciarSesion, cerrarSesion, obtenerUsuarioActual, agregarInventarioSupabase, upsertProductosSeguro, actualizarInventarioSupabase } from "../services/supabase.js";
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
        console.log("Datos formateados:", productos); // <-- Verificar los datos formateados
        res.json({
            success: true,
            message: "Sincronización completada",
            productos: productos // <- Enviar datos formateados
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

// Ruta para agregar inventario
router.post('/inventario', verificarAutenticacion, async (req, res) => {
    const { codigo, nombre, cantidad } = req.body;
    if (!codigo || !nombre || !cantidad) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Usuario no autenticado", user: req.user });
        }

        if (!req.user.user.id) {
            return res.status(401).json({ error: "ID de usuario no encontrado", userId: req.user.user.id });
        }

        const result = await agregarInventarioSupabase(req.body, req.user.user.id);

        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        res.json({ success: true, data: result.data });

    } catch (error) {
        console.error("Error general en /inventario:", error);
        res.status(500).json({ error: error.message || 'Error al guardar inventario' });
    }
});

// Nueva ruta para actualizar inventario
router.put('/inventario/:id', verificarAutenticacion, async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, cantidad } = req.body;
    if (!codigo || !nombre || !cantidad) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Usuario no autenticado", user: req.user });
        }

        if (!req.user.user.id) {
            return res.status(401).json({ error: "ID de usuario no encontrado", userId: req.user.user.id });
        }

        const result = await actualizarInventarioSupabase(id, req.body, req.user.user.id);

        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        res.json({ success: true, data: result.data });

    } catch (error) {
        console.error("Error general en /inventario/:id:", error);
        res.status(500).json({ error: error.message || 'Error al actualizar inventario' });
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

router.post('/actualizar-usuario-productos', verificarAutenticacion, async (req, res) => {
    try {
        const { productos } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: "Usuario no autenticado", user: req.user });
        }

        if (!req.user.user.id) {
            return res.status(401).json({ error: "ID de usuario no encontrado", userId: req.user.user.id });
        }

        const nuevoUserId = req.user.user.id;

        const result = await upsertProductosSeguro(productos, nuevoUserId);

        res.json({
            success: true,
            deleted: result.deletedCount,
            inserted: result.insertedCount,
            data: result.insertedData
        });

    } catch (error) {
        res.status(500).json({ error: error.message, user: req.user.user.id });
    }
});

export default router;
