# Stiahne vsetky obrazky z bylinkyspodtatier.sk podla obrazky-manifest.csv
# Spustenie z koreňa repozitára: powershell -ExecutionPolicy Bypass -File scripts\stiahni-obrazky.ps1
$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path -Parent $PSScriptRoot
$rows = Import-Csv -Path (Join-Path $root 'obrazky-manifest.csv') -Delimiter ';'
$i = 0; $ok = 0; $skip = 0; $fail = @()
foreach ($r in $rows) {
    $i++
    $dest = Join-Path $root ($r.lokalna_cesta -replace '/', '\')
    if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 0)) { $skip++; continue }
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    Write-Progress -Activity 'Stahujem obrazky' -Status "$i / $($rows.Count): $($r.lokalna_cesta)" -PercentComplete ($i * 100 / $rows.Count)
    try {
        Invoke-WebRequest -Uri $r.zdroj_url -OutFile $dest -UseBasicParsing -TimeoutSec 120
        $ok++
    } catch {
        $fail += $r.lokalna_cesta
        Write-Warning "Nepodarilo sa: $($r.lokalna_cesta) ($($_.Exception.Message))"
    }
}
Write-Host ""
Write-Host "Hotovo. Stiahnute: $ok, uz existovalo: $skip, chyby: $($fail.Count)" -ForegroundColor Green
if ($fail.Count) { $fail | Set-Content (Join-Path $root 'obrazky-chyby.txt'); Write-Host "Zoznam chyb: obrazky-chyby.txt (spusti skript znova)" -ForegroundColor Yellow }
