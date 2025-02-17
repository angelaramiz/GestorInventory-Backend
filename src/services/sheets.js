import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Configuración de autenticación con Google Sheets
const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

/**
 * Función para limpiar los datos de una hoja específica.
 * @param {string} sheetName - Nombre de la hoja (ej. "Productos").
 */
export async function limpiarHoja(sheetName) {
    try {
        await sheets.spreadsheets.values.clear({
            spreadsheetId: process.env.SHEET_ID,
            range: `${sheetName}!A1:Z1000` // Rango amplio para asegurar que se limpia todo
        });
        console.log(`Datos limpiados correctamente en la hoja "${sheetName}"`);
    } catch (error) {
        console.error(`Error limpiando la hoja "${sheetName}":`, error);
    }
}

/**
 * Función para obtener los nombres y IDs de todas las hojas en el archivo.
 * @returns {Array<{nombre: string, gid: number}>} - Lista de hojas con sus nombres y IDs.
 */
export async function obtenerNombresDeHojas() {
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: process.env.SHEET_ID
        });
        return response.data.sheets.map(sheet => ({
            nombre: sheet.properties.title,
            gid: sheet.properties.sheetId
        }));
    } catch (error) {
        console.error("Error obteniendo nombres de hojas:", error);
        return [];
    }
}

/**
 * Función para escribir datos en una hoja específica usando su nombre.
 * @param {string} sheetName - Nombre de la hoja (ej. "Productos").
 * @param {string} range - Rango donde se escribirán los datos (ej. "A1").
 * @param {Array<Array<string>>} datos - Datos a escribir en formato de matriz.
 */
export async function escribirEnSheets(datos, sheetName = "Productos", range = "A1") {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: `${sheetName}!${range}`,
            valueInputOption: "RAW",
            requestBody: { values: datos }
        });
        console.log(`Datos escritos correctamente en la hoja "${sheetName}"`);
    } catch (error) {
        console.error(`Error escribiendo en la hoja "${sheetName}":`, error);
    }
}

/**
 * Función para sincronizar productos de Supabase con Google Sheets.
 * @param {Array<Object>} productos - Lista de productos obtenida de Supabase.
 * @param {string} sheetName - Nombre de la hoja (ej. "Productos").
 */
export async function sincronizarProductos(productos, sheetName) {
    try {
        await limpiarHoja(sheetName);
        const datos = productos.map(producto => [
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.marca,
            producto.unidad
        ]);
        
        // Corregir orden de parámetros (primero sheetName, luego datos)
        await escribirEnSheets(datos, sheetName); // <-- ¡Parámetros en orden correcto!
        
        console.log("Sincronización completada");
    } catch (error) {
        console.error("Error durante la sincronización:", error);
        throw error; // Propagar el error
    }
}