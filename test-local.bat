@echo off
echo 🧪 Probando configuracion local...
echo.

echo 📦 Verificando que no hay procesos en puerto 5000...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5000 esta ocupado. Terminando procesos...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /pid %%a /f >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo.
echo 🚀 Iniciando servidor...
start /B npm start
timeout /t 5 /nobreak >nul

echo.
echo 🔍 Probando endpoints...
curl -s http://localhost:5000/ping >nul
if %errorlevel% equ 0 (
    echo ✅ Endpoint /ping funciona
) else (
    echo ❌ Endpoint /ping no responde
)

curl -s http://localhost:5000/health >nul
if %errorlevel% equ 0 (
    echo ✅ Endpoint /health funciona
) else (
    echo ❌ Endpoint /health no responde
)

echo.
echo 📊 Estado del servidor:
curl -s http://localhost:5000/health | find "status"

echo.
echo 🔌 Para probar WebSocket manualmente:
echo    1. Abre una consola del navegador
echo    2. Ejecuta: const ws = new WebSocket('ws://localhost:5000');
echo    3. ws.onmessage = (e) =^> console.log(e.data);

echo.
echo ⏹️  Para detener el servidor:
echo    Presiona Ctrl+C o cierra esta ventana
echo.
pause
