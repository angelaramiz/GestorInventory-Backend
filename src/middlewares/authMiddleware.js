import supabase from "../services/supabase.js";

async function verificarAutenticacion(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No autorizado, falta el token" });
        }

        const token = authHeader.split(" ")[1]; // Extraer el token después de "Bearer"

        const { data: user, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Token inválido o expirado" });
        }

        req.user = user; // Asignar el usuario al request para que `req.user.id` funcione
        next();
    } catch (error) {
        res.status(401).json({ error: "Error en autenticación" });
    }
}
