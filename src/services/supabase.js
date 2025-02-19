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
// En src/services/supabase.js
export async function registrarUsuario(nombre, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("Error al registrar usuario:", error);
        return null;
    }

    // Verificar si el usuario está disponible
    if (!data?.user) {
        console.error("Usuario no registrado correctamente");
        return null;
    }

    // Insertar en la tabla "usuarios" usando las columnas existentes
    const { data: dbData, error: dbError } = await supabase
        .from("usuarios")
        .insert([{ 
            id: data.user.id, // Esto causará un error (UUID vs integer)
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

    return {
        user: data.user,                // Datos del usuario
        access_token: data.session.access_token,   // Token JWT
        refresh_token: data.session.refresh_token  // Token de refresco
    };
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

// Nueva función para agregar inventario
export async function agregarInventarioSupabase(inventarioData, userId) {
    const { data, error } = await supabase
        .from('inventario')
        .insert([{
            ...inventarioData,
            usuario_id: userId
        }]);

    if (error) {
        console.error("Error agregando inventario:", error);
        return null;
    }
    return data;
}

// En src/services/supabase.js
export async function upsertProductosSeguro(productos, nuevoUserId) {
    try {
        const { error: deleteError, count: deletedCount } = await supabase
            .from('productos')
            .delete()
            .in('codigo', productos.map(p => p.codigo))
            .eq('usuario_id', nuevoUserId);

        if (deleteError) throw deleteError;

        const { data: insertedData, error: insertError } = await supabase
            .from('productos')
            .upsert(productos.map(p => ({
                ...p,
                usuario_id: nuevoUserId
            })), {
                onConflict: ['codigo', 'usuario_id']
            });

        if (insertError) throw insertError;

        const insertedCount = insertedData ? insertedData.length : 0;

        return { deletedCount, insertedCount, insertedData };
    } catch (error) {
        console.error("Error en upsertProductosSeguro:", error);
        throw error;
    }
}
export default supabase;
