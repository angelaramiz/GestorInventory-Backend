import supabase from '../services/supabase.js';

export async function verificarAutenticacion(req, res, next) {
    const token = req.cookies.access_token;
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
        if (req.user.rol !== rolRequerido) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        next();
    };
}

