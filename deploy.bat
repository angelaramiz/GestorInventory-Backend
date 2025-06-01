@echo off
echo 🚀 Iniciando proceso de despliegue a Fly.io...

echo.
echo 📋 Verificando configuración...
if not exist "fly.toml" (
    echo ❌ No se encontró fly.toml
    pause
    exit /b 1
)

if not exist ".env" (
    echo ⚠️  No se encontró archivo .env local (esto es normal para producción)
) else (
    echo ✅ Archivo .env encontrado (solo para desarrollo local)
)

echo.
echo 📦 Verificando dependencias...
npm audit --audit-level moderate
if errorlevel 1 (
    echo ⚠️  Se encontraron vulnerabilidades. Considera ejecutar 'npm audit fix'
)

echo.
echo 🧪 Probando aplicación localmente...
start /B npm start
timeout /t 5 /nobreak >nul
echo Probando endpoints...

curl -s http://localhost:8080/ping >nul
if errorlevel 1 (
    echo ❌ El servidor local no responde
    pause
    exit /b 1
) else (
    echo ✅ Servidor local funcionando
)

echo.
echo 🛠️  Desplegando a Fly.io...
fly deploy

if errorlevel 1 (
    echo ❌ Error en el despliegue
    pause
    exit /b 1
)

echo.
echo ✅ Despliegue completado!
echo 🌐 Verificando despliegue...
timeout /t 10 /nobreak >nul

curl -s https://gestorinventory-backend.fly.dev/health
if errorlevel 1 (
    echo ⚠️  El servidor desplegado no responde inmediatamente
    echo    Esto puede ser normal, intenta acceder en unos minutos
) else (
    echo ✅ Servidor desplegado funcionando
)

echo.
echo 🎉 Proceso completado!
echo 📱 Tu aplicación está disponible en: https://gestorinventory-backend.fly.dev
pause
