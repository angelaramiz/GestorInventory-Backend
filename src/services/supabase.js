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
export async function registrarUsuario(email, password) {
    const { user, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("Error al registrar usuario:", error);
        return null;
    }

    return user;
}

// Función para iniciar sesión
export async function iniciarSesion(email, password) {
    const { user, error } = await supabase.auth.signIn({
        email,
        password,
    });

    if (error) {
        console.error("Error al iniciar sesión:", error);
        return null;
    }

    return user;
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
