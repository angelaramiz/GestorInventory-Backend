#!/usr/bin/env powershell

Write-Host "🔧 VERIFICACIÓN COMPLETA DE CORRECCIONES" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. Verificar archivos clave
Write-Host "`n📁 Verificando archivos modificados..." -ForegroundColor Yellow

$files = @(
    "src/index.js",
    "src/services/supabase.js", 
    "fly.toml",
    "package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NO ENCONTRADO" -ForegroundColor Red
    }
}

# 2. Verificar configuración de puerto
Write-Host "`n🔍 Verificando configuración de puerto..." -ForegroundColor Yellow

$indexContent = Get-Content "src/index.js" -Raw
if ($indexContent -match "PORT.*5000") {
    Write-Host "✅ Puerto 5000 configurado en index.js" -ForegroundColor Green
} else {
    Write-Host "❌ Puerto 5000 NO configurado en index.js" -ForegroundColor Red
}

$flyContent = Get-Content "fly.toml" -Raw
if ($flyContent -match "internal_port = 5000") {
    Write-Host "✅ Puerto 5000 configurado en fly.toml" -ForegroundColor Green
} else {
    Write-Host "❌ Puerto 5000 NO configurado en fly.toml" -ForegroundColor Red
}

# 3. Verificar eliminación de WebSocket duplicado
Write-Host "`n🔌 Verificando WebSocket..." -ForegroundColor Yellow

$supabaseContent = Get-Content "src/services/supabase.js" -Raw
if ($supabaseContent -notmatch "new WebSocketServer.*port.*8080") {
    Write-Host "✅ WebSocket duplicado eliminado de supabase.js" -ForegroundColor Green
} else {
    Write-Host "❌ WebSocket duplicado AÚN EXISTE en supabase.js" -ForegroundColor Red
}

if ($supabaseContent -match "suscribirCambiosInventario\(wss\)") {
    Write-Host "✅ Función suscribirCambiosInventario acepta parámetro wss" -ForegroundColor Green
} else {
    Write-Host "❌ Función suscribirCambiosInventario NO acepta parámetro wss" -ForegroundColor Red
}

# 4. Verificar que no hay procesos usando puerto 5000
Write-Host "`n🚦 Verificando disponibilidad del puerto 5000..." -ForegroundColor Yellow

$portCheck = netstat -ano | Select-String ":5000"
if ($portCheck) {
    Write-Host "⚠️  Puerto 5000 está ocupado por:" -ForegroundColor Yellow
    $portCheck | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "✅ Puerto 5000 disponible" -ForegroundColor Green
}

# 5. Verificar dependencias
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules no encontrado. Ejecute: npm install" -ForegroundColor Yellow
}

# 6. Resumen y próximos pasos
Write-Host "`n📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "1. Si no hay errores ❌, ejecuta: npm start" -ForegroundColor White
Write-Host "2. Prueba los endpoints: curl http://localhost:5000/health" -ForegroundColor White
Write-Host "3. Si todo funciona, deploya: fly deploy" -ForegroundColor White
Write-Host ""
Write-Host "📁 Archivos de ayuda creados:" -ForegroundColor Green
Write-Host "   - DEPLOY_FIXES.md  (resumen de cambios)" -ForegroundColor Gray
Write-Host "   - CHECKLIST.md     (lista de verificación)" -ForegroundColor Gray
Write-Host "   - test-local.bat   (pruebas locales)" -ForegroundColor Gray

Write-Host "`n🎯 ¡Correcciones completadas!" -ForegroundColor Green

Read-Host "Presiona Enter para continuar"
