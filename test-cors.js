// Script para probar CORS localmente
import fetch from 'node-fetch';

const TEST_ORIGINS = [
    'http://127.0.0.1:5500',
    'http://localhost:8158',
    'https://angelaramiz.github.io'
];

<<<<<<< HEAD
<<<<<<< HEAD
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
=======
const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';
>>>>>>> 6b9ff48 (Actualizar configuración de CORS, ajustar puertos y agregar script de despliegue a Fly.io)
=======
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
>>>>>>> d6d66c6 (Actualizar configuración de puertos a 5000, eliminar WebSocket duplicado y optimizar scripts de despliegue y verificación)

async function testCORS() {
    console.log(`🧪 Probando CORS en ${BASE_URL}...`);
    
    for (const origin of TEST_ORIGINS) {
        console.log(`\n🔍 Probando origen: ${origin}`);
        
        try {
            // Probar OPTIONS (preflight)
            const optionsResponse = await fetch(`${BASE_URL}/health`, {
                method: 'OPTIONS',
                headers: {
                    'Origin': origin,
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });
            
            console.log(`   OPTIONS /health: ${optionsResponse.status}`);
            console.log(`   CORS Headers:`, {
                'access-control-allow-origin': optionsResponse.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': optionsResponse.headers.get('access-control-allow-methods'),
                'access-control-allow-credentials': optionsResponse.headers.get('access-control-allow-credentials')
            });
            
            // Probar GET real
            const getResponse = await fetch(`${BASE_URL}/health`, {
                headers: { 'Origin': origin }
            });
            
            console.log(`   GET /health: ${getResponse.status}`);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

testCORS().catch(console.error);
