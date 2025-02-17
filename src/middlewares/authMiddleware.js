import supabase  from "../services/supabase.js";

export async function verificarAutenticacion(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado. Por favor, inicia sesión." });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: "Token inválido o usuario no autenticado. Por favor, inicia sesión nuevamente." });
    }

    req.user = user; // Adjuntar usuario a la solicitud
    next();
}