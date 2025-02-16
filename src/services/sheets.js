import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

export async function escribirEnSheets(datos) {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: "Inventario!A1",
            valueInputOption: "RAW",
            requestBody: { values: datos }
        });
    } catch (error) {
        console.error("Error escribiendo en Google Sheets:", error);
    }
}
