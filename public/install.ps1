$ErrorActionPreference = "Stop"
$release = Invoke-RestMethod "https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases/latest"
$installer = $release.assets | Where-Object { $_.name -match '\.msi$' } | Select-Object -First 1
$checksums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (-not $installer -or -not $checksums) { throw "Windows downloads are still being published." }
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("diagram-source-studio-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tempDir | Out-Null
try {
  $installerPath = Join-Path $tempDir $installer.name
  $checksumPath = Join-Path $tempDir "SHA256SUMS"
  Invoke-WebRequest $installer.browser_download_url -OutFile $installerPath
  Invoke-WebRequest $checksums.browser_download_url -OutFile $checksumPath
  $line = Get-Content $checksumPath | Where-Object { $_ -match ('^[0-9a-fA-F]{64}\s+\*?\.?/?' + [regex]::Escape($installer.name) + '$') } | Select-Object -First 1
  if (-not $line) { throw "Installer checksum is missing." }
  $expected = ($line -split '\s+')[0].ToLowerInvariant()
  $actual = (Get-FileHash $installerPath -Algorithm SHA256).Hash.ToLowerInvariant()
  if (-not $expected -or $expected -ne $actual) { throw "Checksum verification failed." }
  Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`"" -Wait
  Write-Host "Installed Diagram Source Studio after SHA256 verification."
} finally { Remove-Item -Recurse -Force $tempDir }
