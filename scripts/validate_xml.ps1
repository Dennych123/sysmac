# Validasi XML hasil generate ke XSD RESMI-nya, sebelum dibawa ke Sysmac Studio.
#
# Kenapa ada: bentuk XML yang salah selama ini baru ketahuan setelah dibuka Studio, dan
# pesannya cuma "(Import failed)" di layar - tanpa nama elemen, tanpa nomor baris. Padahal
# Studio memasang XSD-nya sendiri di komputer ini, dan .NET bisa memakainya langsung. Satu
# kali jalan di sini menggantikan satu putaran bolak-balik ke Studio.
#
#   pwsh scripts/validate_xml.ps1                     # semua outputs/*.xml
#   pwsh scripts/validate_xml.ps1 outputs/x.xml a.xml # berkas tertentu, sebanyak apa pun
#   pwsh scripts/validate_xml.ps1 -SchemaDir "D:\..." # kalau Sysmac dipasang di tempat lain
#
# CATATAN: XSD cuma memeriksa BENTUK. Nama instruksi yang tidak ada di library tetap lolos
# di sini dan baru ditolak Studio sebagai (DefinitionError). Dua-duanya perlu.
[CmdletBinding()]
param(
  # ValueFromRemainingArguments supaya daftar berkas boleh ditulis polos. Tanpa itu berkas
  # kedua nyangkut ke parameter posisi berikutnya dan dikira folder XSD - pesan galatnya
  # menuduh XSD-nya hilang padahal yang salah cara memanggil.
  [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
  [string[]]$Path,
  [string]$SchemaDir = "C:\Program Files\OMRON\Sysmac Studio\Sample\IEC 61131-10 XML\Controller"
)

$ErrorActionPreference = 'Stop'

$main = Join-Path $SchemaDir 'IEC61131_10_Ed1_0_Spc1_0.xsd'
$ext  = Join-Path $SchemaDir 'IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd'
foreach ($f in @($main, $ext)) {
  if (-not (Test-Path $f)) {
    Write-Host "XSD tidak ketemu: $f" -ForegroundColor Red
    Write-Host "Sysmac Studio memasangnya di Sample\IEC 61131-10 XML\Controller." -ForegroundColor Yellow
    Write-Host "Kalau dipasang di tempat lain, pakai -SchemaDir." -ForegroundColor Yellow
    exit 2
  }
}

if (-not $Path) {
  $root = Split-Path -Parent $PSScriptRoot
  $Path = Get-ChildItem (Join-Path $root 'outputs') -Filter *.xml | ForEach-Object { $_.FullName }
}

$set = New-Object System.Xml.Schema.XmlSchemaSet
# Namespace tiap XSD dibaca dari targetNamespace-nya sendiri. Melewatkan $null ke Add()
# TIDAK berarti "pakai punyamu" - .NET menganggapnya namespace kosong lalu menolak.
foreach ($f in @($main, $ext)) {
  $ns = ([xml](Get-Content -Raw $f)).schema.targetNamespace
  $null = $set.Add($ns, $f)
}
$set.Compile()

$bad = 0
foreach ($p in $Path) {
  $errors = New-Object System.Collections.Generic.List[string]
  $settings = New-Object System.Xml.XmlReaderSettings
  $settings.ValidationType = [System.Xml.ValidationType]::Schema
  $settings.Schemas = $set
  # Peringatan ikut dicatat: "tidak ada deklarasi buat elemen ini" muncul sebagai WARNING,
  # bukan error, dan itu justru tanda paling sering bahwa namespace-nya salah ketik.
  $settings.ValidationFlags = [System.Xml.Schema.XmlSchemaValidationFlags]::ReportValidationWarnings
  $handler = [System.Xml.Schema.ValidationEventHandler] {
    param($s, $e)
    $errors.Add(("  {0} baris {1}:{2}  {3}" -f $e.Severity, $e.Exception.LineNumber,
                                               $e.Exception.LinePosition, $e.Message))
  }
  $settings.add_ValidationEventHandler($handler)

  $reader = [System.Xml.XmlReader]::Create($p, $settings)
  try { while ($reader.Read()) { } }
  catch { $errors.Add("  FATAL  " + $_.Exception.Message) }
  finally { $reader.Dispose() }

  $name = Split-Path -Leaf $p
  if ($errors.Count -eq 0) {
    Write-Host ("  OK    " + $name) -ForegroundColor Green
  } else {
    $bad++
    Write-Host (">>BAD  " + $name) -ForegroundColor Red
    # Satu bentuk yang salah bisa memicu ratusan pesan turunan; yang berguna yang pertama.
    $errors | Select-Object -First 8 | ForEach-Object { Write-Host $_ }
    if ($errors.Count -gt 8) { Write-Host ("  ... " + ($errors.Count - 8) + " pesan lagi") }
  }
}

Write-Host ""
if ($bad) { Write-Host "$bad berkas tidak lolos XSD" -ForegroundColor Red; exit 1 }
Write-Host "Semua lolos XSD" -ForegroundColor Green
