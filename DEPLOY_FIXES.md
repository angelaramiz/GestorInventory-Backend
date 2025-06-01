# 🔧 Correcciones Aplicadas para Fly.io

## Problema Principal Solucionado
**Error**: `EADDRINUSE: address already in use :::8080`

### ✅ Cambios Realizados

#### 1. **Eliminación del WebSocket Duplicado**
- **Archivo**: `src/services/supabase.js`
- **Problema**: Tenía un servidor WebSocket independiente en puerto 8080
- **Solución**: Eliminado y modificado para usar el servidor principal

```javascript
// ANTES (PROBLEMA):
import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 }); // ❌ Conflicto

// DESPUÉS (SOLUCIONADO):
export async function suscribirCambiosInventario(wss) { // ✅ Recibe como parámetro
```

#### 2. **Puerto Corregido**
- **Cambio**: Puerto 8080 → 5000
- **Archivos modificados**:
  - `src/index.js`: `const PORT = process.env.PORT || 5000;`
  - `fly.toml`: `internal_port = 5000`
  - `test-cors.js`: Base URL actualizada
  - `deploy.bat`: URLs de prueba actualizadas

#### 3. **WebSocket Simplificado**
- **Antes**: Dos servidores WebSocket (uno en `/ws`, otro en `/`)
- **Después**: Un solo servidor que acepta conexiones en cualquier ruta
- **Resultado**: Menos complejidad, mejor rendimiento

#### 4. **Configuración de Fly.io Optimizada**
```toml
[env]
  NODE_ENV = "production"
  PORT = "5000"

[http_service]
  internal_port = 5000
  force_https = true
```

### 🚀 Próximos Pasos para Desplegar

1. **Verificar cambios localmente**:
```powershell
npm start
# Debería mostrar: "Servidor corriendo en puerto 5000"
```

2. **Probar endpoints**:
```powershell
curl http://localhost:5000/health
curl http://localhost:5000/ping
```

3. **Desplegar a Fly.io**:
```powershell
fly deploy
```

4. **Configurar variables de entorno en Fly.io**:
```powershell
fly secrets set SUPABASE_URL=tu-url-aqui
fly secrets set SUPABASE_KEY=tu-key-aqui
```

5. **Verificar despliegue**:
```powershell
fly logs
curl https://gestorinventory-backend.fly.dev/health
```

### 🔍 Verificaciones Importantes

#### En el Frontend
Actualizar la URL del WebSocket a:
```javascript
const ws = new WebSocket("wss://gestorinventory-backend.fly.dev");
```

#### Logs Esperados
```
🚀 ========================================
📡 Servidor corriendo en puerto 5000
🌍 Entorno: production
🔗 Health check: http://localhost:5000/health
⚙️  Supabase config: http://localhost:5000/api/supabase-config
🚀 ========================================
🔌 Servidor WebSocket disponible en ws://localhost:5000
✅ Suscripción a Supabase inicializada correctamente
```

### 🆘 Si Hay Problemas

1. **Puerto aún ocupado**:
```powershell
netstat -ano | findstr :5000
# Si hay procesos, terminarlos o reiniciar
```

2. **Error de CORS**:
- Verificar que el origen esté en la lista de CORS
- Comprobar que `credentials: true` esté configurado

3. **WebSocket no conecta**:
- Verificar que no hay proxy/firewall bloqueando
- Usar WSS (no WS) en producción

### 📋 Checklist de Despliegue

- [ ] Servidor local inicia sin errores de puerto
- [ ] Endpoints `/health` y `/ping` responden
- [ ] WebSocket se conecta localmente
- [ ] Variables de entorno configuradas en Fly.io
- [ ] Despliegue exitoso con `fly deploy`
- [ ] Logs no muestran errores de puerto
- [ ] Frontend puede conectarse al WebSocket
- [ ] CORS funciona correctamente

---

**Nota**: Estos cambios eliminan completamente el conflicto de puertos y optimizan la aplicación para un despliegue exitoso en Fly.io.
