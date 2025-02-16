import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

/**
 * Función para escribir datos en una hoja específica.
 * @param {string} sheetName - Nombre de la hoja (ej. "Productos").
 * @param {string} range - Rango donde se escribirán los datos (ej. "A1").
 * @param {Array<Array<string>>} datos - Datos a escribir en formato de matriz.
 */
export async function escribirEnSheets(sheetName, range, datos) {
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