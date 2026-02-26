$ErrorActionPreference = 'Stop'

Write-Host '== Obsidian GitLog environment doctor (Windows) =='

function Add-PathIfMissing {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathToAdd
    )

    if (-not (Test-Path $PathToAdd)) {
        return $false
    }

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ([string]::IsNullOrWhiteSpace($userPath)) {
        $userPath = ''
    }

    $parts = $userPath -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    $exists = $parts | Where-Object { $_.TrimEnd('\\') -ieq $PathToAdd.TrimEnd('\\') }

    if (-not $exists) {
        [Environment]::SetEnvironmentVariable('Path', "$userPath;$PathToAdd", 'User')
        Write-Host "[PATH] Added to user PATH: $PathToAdd"
    }

    if ($env:Path -notlike "*$PathToAdd*") {
        $env:Path = "$env:Path;$PathToAdd"
    }

    return $true
}

Write-Host '[1/4] Setting PowerShell execution policy to CurrentUser RemoteSigned...'
try {
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction Stop
    Write-Host '[policy] CurrentUser policy set to RemoteSigned.'
}
catch {
    Write-Warning '[policy] Could not update execution policy in this session. Continuing...'
}

Write-Host '[2/4] Checking uv command...'
$uvDir = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe'
$uvOk = Add-PathIfMissing -PathToAdd $uvDir
if ($uvOk) {
    try {
        $uvVersion = & uv --version
        Write-Host "[uv] OK: $uvVersion"
    }
    catch {
        Write-Warning '[uv] Directory found but command is still unavailable. Reopen terminal and retry.'
    }
}
else {
    Write-Warning '[uv] Install directory not found. Run: winget install --id astral-sh.uv -e'
}

Write-Host '[3/4] Checking Node.js command...'
$nodeDir = Join-Path $env:LOCALAPPDATA 'Programs\nodejs'
$nodeOk = Add-PathIfMissing -PathToAdd $nodeDir
if ($nodeOk) {
    try {
        $nodeVersion = & node --version
        Write-Host "[node] OK: $nodeVersion"
    }
    catch {
        Write-Warning '[node] Directory found but command is still unavailable. Reopen terminal and retry.'
    }
}
else {
    Write-Warning '[node] User install directory not found. Install Node.js LTS first.'
}

Write-Host '[4/4] Checking npm command...'
try {
    $npmVersion = & npm --version
    Write-Host "[npm] OK: $npmVersion"
}
catch {
    try {
        $npmCmdVersion = & npm.cmd --version
        Write-Warning "[npm] Use npm.cmd in this shell. Detected version: $npmCmdVersion"
    }
    catch {
        Write-Warning '[npm] Not available. Install Node.js first.'
    }
}

Write-Host ''
Write-Host 'Done. Reopen a PowerShell terminal to ensure PATH is fully refreshed.'