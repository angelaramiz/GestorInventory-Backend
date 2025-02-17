import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function obtenerProductos() {
    const { data, error } = await supabase.from("productos").select("*");
    if (error) {
        console.error("Error obteniendo productos:", error);
        return [];
    }
    return data;
}

export async function agregarProducto(producto) {
    const { data, error } = await supabase.from("productos").insert([producto]);
    if (error) {
        console.error("Error agregando producto:", error);
        return null;
    }
    return data;
}

// Función para registrar un nuevo usuario
export async function registrarUsuario(nombre, email, password) {
    const { data, error } = await supabase.auth.signUp({ // Cambia "user" por "data"
        email,
        password,
    });

    if (error) {
        console.error("Error al registrar usuario:", error);
        return null;
    }

    // Verificar si el usuario está disponible en "data"
    if (!data?.user) {
        console.error("Usuario no registrado correctamente");
        return null;
    }

    // Usar data.user.id en lugar de user.id
    const { data: dbData, error: dbError } = await supabase
    .from("usuarios")
    .insert([{ 
        user_id: data.user.id, // Nuevo campo para almacenar el UUID
        nombre, 
        email 
    }]);

    if (dbError) {
        console.error("Error al guardar datos adicionales:", dbError);
        return null;
    }

    return data.user;
}

// Función para iniciar sesión
export async function iniciarSesion(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Error al iniciar sesión:", error);
        return null;
    }

    return data.user;
}

// Función para cerrar sesión
export async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error al cerrar sesión:", error);
        return false;
    }

    return true;
}

// Función para obtener el usuario actual
export async function obtenerUsuarioActual() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error("Error al obtener el usuario actual:", error);
        return null;
    }

    return user;
}

export default supabase;
