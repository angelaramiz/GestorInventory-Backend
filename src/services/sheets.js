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
export async function escribirEnSheetsPorNombre(sheetName, range, datos) {
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
 * Función para escribir datos en una hoja específica usando su GID.
 * @param {number} gid - ID de la hoja (GID).
 * @param {string} range - Rango donde se escribirán los datos (ej. "A1").
 * @param {Array<Array<string>>} datos - Datos a escribir en formato de matriz.
 */
export async function escribirEnSheetsPorGid(gid, range, datos) {
    try {
        // Obtener el nombre de la hoja correspondiente al GID
        const hojas = await obtenerNombresDeHojas();
        const hoja = hojas.find(h => h.gid === gid);

        if (!hoja) {
            console.error(`No se encontró una hoja con GID=${gid}`);
            return;
        }

        // Escribir en la hoja usando su nombre
        await escribirEnSheetsPorNombre(hoja.nombre, range, datos);
    } catch (error) {
        console.error("Error escribiendo en Google Sheets:", error);
    }
}
/**
 * Función para sincronizar productos de Supabase con Google Sheets.
 * @param {Array<Object>} productos - Lista de productos obtenida de Supabase.
 * @param {string} sheetName - Nombre de la hoja (ej. "Productos").
 */
export async function sincronizarProductos(productos, sheetName) {
    try {
        // Limpiar la hoja antes de escribir nuevos datos
        await limpiarHoja(sheetName);

        // Formatear los productos como una matriz para Google Sheets
        const datos = productos.map(producto => [
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.marca,
            producto.unidad
        ]);

        // Escribir los datos en la hoja
        await escribirEnSheets(sheetName, datos);
        console.log("Sincronización completada correctamente");
    } catch (error) {
        console.error("Error durante la sincronización:", error);
    }
}