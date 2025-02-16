import { obtenerUsuarioActual } from '../services/supabase.js';

export function verificarAutenticacion(req, res, next) {
    const user = obtenerUsuarioActual();

    if (user) {
        // Si el usuario está autenticado, continuar con la siguiente función (controlador)
        next();
    } else {
        // Si el usuario no está autenticado, devolver un error 401 (No autorizado)
        res.status(401).json({ error: "No autorizado. Debes iniciar sesión para acceder a esta ruta." });
    }
}