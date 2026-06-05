# open-firewall-ports.ps1
# Script to open ports 3000, 3001, 5000, and 8100 in Windows Firewall
Write-Host "[INFO] Configurando reglas de firewall de Windows..." -ForegroundColor Cyan

$ports = @(3000, 3001, 5000, 8100)

foreach ($port in $ports) {
    $ruleName = "S-Park Port $port"
    $ruleExists = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    
    if ($ruleExists) {
        Write-Host "[WARN] Regla '$ruleName' ya existe. Omitiendo..." -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Creando regla de firewall para el puerto $port..." -ForegroundColor Green
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port -ErrorAction Stop
    }
}

Write-Host "[SUCCESS] Puertos configurados correctamente en el Firewall de Windows." -ForegroundColor Green
