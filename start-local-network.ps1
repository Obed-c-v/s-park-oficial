# start-local-network.ps1
# Script to launch all S-Park services concurrently in separate shells

Write-Host "[START] Iniciando red local de pruebas de S-Park..." -ForegroundColor Cyan

# 1. Backend S-Park Express
Write-Host "[INFO] Iniciando Backend Express (Puerto 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\prueb\S-park\backend\S_park_api'; npm run dev"

# 2. Backend Simple (equipo-10)
Write-Host "[INFO] Iniciando Backend Simple (Puerto 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\prueb\Downloads\equipo-10_Spark-main\equipo-10_Spark-main\backend'; npm run dev"

# 3. Microservicio Flask/ML
Write-Host "[INFO] Iniciando Microservicio Flask/ML (Puerto 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\prueb\S-park\ml'; .\venv\Scripts\python.exe app.py"

# 4. Frontend Ionic (Live Reload)
Write-Host "[INFO] Iniciando Ionic Frontend (Puerto 8100)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\prueb\S-park\frontend-movil-ionic'; npx ionic serve --host=0.0.0.0 --port=8100"

# Obtener la dirección IP local de forma dinámica
$localIp = (Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress
if (-not $localIp) {
    $localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPAddress
}
if (-not $localIp) {
    $localIp = "127.0.0.1"
}

Write-Host ""
Write-Host "[SUCCESS] Todos los servicios han sido lanzados!" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor Gray
Write-Host "IP del servidor local detectada: $localIp" -ForegroundColor Cyan
Write-Host "Pasos para conectar tu celular:" -ForegroundColor Cyan
Write-Host "  1. Asegurate de que el celular esta en la misma red Wi-Fi." -ForegroundColor White
Write-Host "  2. Abre la app o navega a: http://$($localIp):8100" -ForegroundColor White
Write-Host "--------------------------------------------------------" -ForegroundColor Gray
