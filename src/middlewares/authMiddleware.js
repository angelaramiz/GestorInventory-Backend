import supabase from '../services/supabase.js';

export async function verificarAutenticacion(req, res, next) {
    const token = req.cookies?.access_token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No autenticado" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data) {
        return res.status(401).json({ error: "Autenticación fallida" });
    }

    req.user = data.user;
    next();
}

export function verificarRol(rolRequerido) {
    return (req, res, next) => {
        // Verificar si el usuario tiene el rol requerido
        // Ahora estamos obteniendo el nombre del rol desde la consulta join
        if (req.user.rol !== rolRequerido) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        next();
    };
}

