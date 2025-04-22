import express from "express";
import { body, validationResult } from 'express-validator';
import { obtenerProductos, agregarProducto, registrarUsuario, iniciarSesion, cerrarSesion, obtenerUsuarioActual, obtenerProductosPorCategoriaUsuario } from "../services/supabase.js"; // Importar supabase
import { verificarAutenticacion, verificarRol } from "../middlewares/authMiddleware.js"; // Importa el middleware

const router = express.Router();

// Middleware de validación para agregar producto
const validarProducto = [
    body('codigo').trim().isLength({ min: 1 }).withMessage('El código es obligatorio'),
    body('nombre').trim().isLength({ min: 1 }).withMessage('El nombre es obligatorio'),
    body('categoria').trim().isLength({ min: 1 }).withMessage('La categoría es obligatoria'),
    body('marca').trim().isLength({ min: 1 }).withMessage('La marca es obligatoria'),
    body('unidad').trim().isLength({ min: 1 }).withMessage('La unidad es obligatoria'),
];

// Aplicar validación en la ruta POST
router.post("/", verificarAutenticacion, validarProducto, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const nuevoProducto = req.body;

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
    try {
        console.log("Intentando iniciar sesión con:", { email, password });

        // Verificar si el usuario existe y obtener sus datos
        console.log(email, password);
        const user = await iniciarSesion(email, password);
        console.log(user);
        if (!user) {
            console.log("Error al iniciar sesión: Usuario no encontrado");
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        // Configurar cookies para autenticación
        res.cookie('access_token', user.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            sameSite: 'None', // Permite cross-origin
            maxAge: 3600000, // 1 hora
        });
        res.cookie('refresh_token', user.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            sameSite: 'None', // Permite cross-origin
            maxAge: 86400000, // 24 horas
        });

        // Devolver usuario con su categoría incluida
        res.json({ success: true, user });
    } catch (error) {
        if (error.code === 'invalid_credentials') {
            console.error("Error al iniciar sesión: Credenciales incorrectas");
            res.status(400).json({ error: "Credenciales incorrectas" });
        } else {
            console.error("Error al iniciar sesión:", error);
            res.status(500).json({ error: error.message || "Error interno del servidor" });
        }
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
        const userId = req.user?.id; // Obtener el ID del usuario autenticado
        if (!userId) {
            console.error("ID de usuario no proporcionado");
            return res.status(400).json({ error: "ID de usuario no proporcionado" });
        }

        const productos = await obtenerProductosPorCategoriaUsuario(userId); // <- Función de categorías
        console.log("Productos sincronizados:", productos);
        res.json({ success: true, productos });
    } catch (error) {
        console.error("Error durante la sincronización:", error);
        res.status(500).json({ error: "Error al obtener productos por categoría" });
    }
});

router.get("/prueba", async (req, res) => {
    res.json({ message: "Ruta de prueba" });
});

// Nueva ruta protegida para inventario
router.post('/inventario', verificarAutenticacion, async (req, res) => {
    try {
        const { ubicacion, ...restoDatos } = req.body;
        const { data, error } = await supabase
            .from('inventario')
            .insert([{
                ...restoDatos,
                ubicacion_almacen: ubicacion, // Nueva columna para la ubicación
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

router.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Token de refresco no proporcionado' });
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) {
        return res.status(401).json({ error: 'Token de refresco inválido' });
    }

    res.cookie('access_token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
    });
    res.json({ success: true });
});

// Nueva ruta protegida para eliminar productos
router.delete('/productos/:id', verificarAutenticacion, verificarRol('admin'), async (req, res) => {
    // Solo los administradores pueden eliminar productos...
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error al eliminar producto' });
    }
});

export default router;
