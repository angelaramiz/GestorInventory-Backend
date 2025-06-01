# ✅ Checklist de Despliegue - GestorInventory Backend

## Preparación Local

### 1. Verificar Configuración
- [ ] Puerto cambiado a 5000 en `src/index.js`
- [ ] WebSocket duplicado eliminado de `src/services/supabase.js`
- [ ] `fly.toml` configurado con puerto 5000
- [ ] Scripts de test actualizados

### 2. Pruebas Locales
```powershell
# Ejecutar servidor local
npm start

# En otra terminal, probar endpoints
curl http://localhost:5000/ping
curl http://localhost:5000/health
curl http://localhost:5000/api/supabase-config
```

**Resultado esperado**: Todos los endpoints responden correctamente, sin errores de puerto.

### 3. Verificar WebSocket
```javascript
// En consola del navegador
const ws = new WebSocket('ws://localhost:5000');
ws.onopen = () => console.log('✅ WebSocket conectado');
ws.onmessage = (e) => console.log('📨', e.data);
```

## Despliegue en Fly.io

### 4. Variables de Entorno
```powershell
fly secrets set SUPABASE_URL=https://tu-proyecto.supabase.co
fly secrets set SUPABASE_KEY=tu-anon-key
```

### 5. Despliegue
```powershell
fly deploy
```

### 6. Verificación Post-Despliegue
```powershell
# Verificar estado
fly status

# Ver logs
fly logs

# Probar endpoints
curl https://gestorinventory-backend.fly.dev/health
curl https://gestorinventory-backend.fly.dev/ping
```

### 7. Test WebSocket en Producción
```javascript
// En consola del navegador
const ws = new WebSocket('wss://gestorinventory-backend.fly.dev');
ws.onopen = () => console.log('✅ WebSocket conectado en producción');
```

## Frontend

### 8. Actualizar URLs del Frontend
Asegurarse de que el frontend use:
- API: `https://gestorinventory-backend.fly.dev`
- WebSocket: `wss://gestorinventory-backend.fly.dev`

### 9. Verificar CORS
El frontend debe poder hacer peticiones desde:
- `https://angelaramiz.github.io/GestorInventory-Frontend`
- `http://127.0.0.1:5500` (desarrollo local)

## Troubleshooting

### Si el puerto sigue ocupado:
```powershell
netstat -ano | findstr :5000
# Terminar procesos si es necesario
```

### Si CORS falla:
- Verificar que el origen esté en la lista
- Comprobar logs de Fly.io: `fly logs`

### Si WebSocket no conecta:
- Verificar que use WSS en producción
- Comprobar que no hay proxy bloqueando

## Comandos Útiles

```powershell
# Desarrollo local
npm run dev          # Servidor con auto-reload
npm run test-local   # Test completo local
npm run verify       # Verificación rápida

# Fly.io
npm run deploy       # Desplegar
npm run logs         # Ver logs
npm run status       # Estado de la app
```

---

## ✅ Confirmación Final

Una vez completado todo:

- [ ] Servidor local inicia sin errores
- [ ] Todos los endpoints responden
- [ ] WebSocket funciona localmente
- [ ] Despliegue exitoso en Fly.io
- [ ] Endpoints funcionan en producción
- [ ] WebSocket funciona en producción
- [ ] Frontend puede conectarse correctamente
- [ ] No hay errores en los logs de Fly.io

**¡Despliegue completado exitosamente! 🚀**
