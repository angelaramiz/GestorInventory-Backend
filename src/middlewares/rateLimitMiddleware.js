import rateLimit from 'express-rate-limit';

// Configuración básica de rate limiting
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por ventana por IP
    standardHeaders: true, // Devuelve info de rate limit en los headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intente nuevamente después de 15 minutos'
    }
});

// Configuración más estricta para rutas de autenticación
export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Límite de 10 intentos de login por hora por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo después de una hora'
    }
});