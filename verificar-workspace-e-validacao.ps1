$ErrorActionPreference = "Continue"

# ============================================================
# TREINO IA — VERIFICAÇÃO DE WORKSPACE + PIPELINE
# Repo: F:\Treino-Ia
# Gera relatório Markdown em .ops/workspace-verification/
# ============================================================

$RepoPath = "F:\Treino-Ia"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

if (-not (Test-Path $RepoPath)) {
    Write-Host "ERRO: Repositório não encontrado em: $RepoPath" -ForegroundColor Red
    exit 1
}

Set-Location $RepoPath

$OutputRoot = Join-Path $RepoPath ".ops\workspace-verification"
$LogDir = Join-Path $OutputRoot "logs-$Timestamp"
$ReportPath = Join-Path $OutputRoot "workspace-validation-report-$Timestamp.md"
$DiffPath = Join-Path $LogDir "git-diff-$Timestamp.patch"
$CachedDiffPath = Join-Path $LogDir "git-diff-cached-$Timestamp.patch"
$StatusPath = Join-Path $LogDir "git-status-short-$Timestamp.txt"
$UntrackedPath = Join-Path $LogDir "git-untracked-$Timestamp.txt"

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-File {
    param(
        [string]$Path,
        [string]$Content
    )
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Append-File {
    param(
        [string]$Path,
        [string]$Content
    )
    [System.IO.File]::AppendAllText($Path, $Content, $Utf8NoBom)
}

function Run-Step {
    param(
        [string]$Name,
        [scriptblock]$Script,
        [string]$LogFileName
    )

    $LogPath = Join-Path $LogDir $LogFileName
    $Start = Get-Date

    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Cyan

    $global:LASTEXITCODE = $null

    try {
        $Output = & $Script 2>&1
        $ExitCode = if ($null -ne $global:LASTEXITCODE) { [int]$global:LASTEXITCODE } elseif ($?) { 0 } else { 1 }
    }
    catch {
        $Output = $_ | Out-String
        $ExitCode = 1
    }

    $End = Get-Date
    $Duration = [Math]::Round(($End - $Start).TotalSeconds, 2)

    $Text = @()
    $Text += "COMMAND: $Name"
    $Text += "START: $Start"
    $Text += "END: $End"
    $Text += "DURATION_SECONDS: $Duration"
    $Text += "EXIT_CODE: $ExitCode"
    $Text += ""
    $Text += "OUTPUT:"
    $Text += "------------------------------------------------------------"
    $Text += ($Output | Out-String)
    $Text += "------------------------------------------------------------"
    Write-File -Path $LogPath -Content ($Text -join "`r`n")

    if ($ExitCode -eq 0) {
        Write-Host "PASS: $Name" -ForegroundColor Green
        $Status = "PASS"
    }
    else {
        Write-Host "FAIL: $Name — exit code $ExitCode" -ForegroundColor Red
        $Status = "FAIL"
    }

    return [PSCustomObject]@{
        Name = $Name
        Status = $Status
        ExitCode = $ExitCode
        DurationSeconds = $Duration
        LogPath = $LogPath
    }
}

function Get-CommandOutput {
    param(
        [scriptblock]$Script
    )
    $global:LASTEXITCODE = $null
    try {
        $Output = & $Script 2>&1
        return ($Output | Out-String).Trim()
    }
    catch {
        return ($_ | Out-String).Trim()
    }
}

# ============================================================
# Coleta inicial
# ============================================================

$GitVersion = Get-CommandOutput { git --version }
$NodeVersion = Get-CommandOutput { node --version }
$NpmVersion = Get-CommandOutput { npm --version }
$Branch = Get-CommandOutput { git branch --show-current }
$LastCommits = Get-CommandOutput { git log --oneline -10 }
$GitRemote = Get-CommandOutput { git remote -v }
$GitStatusShort = Get-CommandOutput { git status --short }
$GitStatusSb = Get-CommandOutput { git status -sb }
$GitDiffStat = Get-CommandOutput { git diff --stat }
$GitDiffNameStatus = Get-CommandOutput { git diff --name-status }
$GitCachedDiffNameStatus = Get-CommandOutput { git diff --cached --name-status }
$GitUntracked = Get-CommandOutput { git ls-files --others --exclude-standard }

Write-File -Path $StatusPath -Content $GitStatusShort
Write-File -Path $UntrackedPath -Content $GitUntracked

# Gerar diffs completos em arquivos separados
try {
    git diff | Out-File -FilePath $DiffPath -Encoding utf8
}
catch {}

try {
    git diff --cached | Out-File -FilePath $CachedDiffPath -Encoding utf8
}
catch {}

# ============================================================
# Heurística de classificação dos arquivos alterados
# ============================================================

$ExpectedBatchPatterns = @(
    "^\.ops[\\/]+batch-ai-lifestyle-capability-51-58-59-60-67[\\/]+",
    "^src[\\/]+components[\\/]+ai[\\/]+",
    "^src[\\/]+services[\\/]+ai[\\/]+formCheckerCapabilityService",
    "^src[\\/]+services[\\/]+ai[\\/]+equipmentReplanService",
    "^src[\\/]+components[\\/]+nutrition[\\/]+PantryPlannerPanel",
    "^src[\\/]+services[\\/]+nutrition[\\/]+pantryPlannerService",
    "^src[\\/]+components[\\/]+wellness[\\/]+LongevitySignalPanel",
    "^src[\\/]+services[\\/]+wellness[\\/]+longevitySignalService",
    "^src[\\/]+components[\\/]+xr[\\/]+WebXRPreviewPanel",
    "^src[\\/]+services[\\/]+xr[\\/]+webxrCapabilityService",
    "^src[\\/]+features[\\/]+strategic-items[\\/]+strategicItems\.registry\.ts$",
    "^src[\\/]+pages[\\/]+Dashboard\.tsx$"
)

$StatusLines = @()
if (-not [string]::IsNullOrWhiteSpace($GitStatusShort)) {
    $StatusLines = $GitStatusShort -split "`r?`n"
}

$ClassifiedFiles = @()

foreach ($Line in $StatusLines) {
    if ([string]::IsNullOrWhiteSpace($Line)) { continue }

    $Trimmed = $Line.Trim()
    $StatusCode = ""
    $FilePath = ""

    if ($Trimmed.Length -ge 3) {
        $StatusCode = $Trimmed.Substring(0, 2).Trim()
        $FilePath = $Trimmed.Substring(2).Trim()
    }
    else {
        $StatusCode = $Trimmed
        $FilePath = $Trimmed
    }

    # Normalizar path removendo aspas
    $FilePath = $FilePath.Trim('"')

    $MatchesExpected = $false
    foreach ($Pattern in $ExpectedBatchPatterns) {
        if ($FilePath -match $Pattern) {
            $MatchesExpected = $true
            break
        }
    }

    $Classification = if ($MatchesExpected) {
        "POSSIVELMENTE_RELACIONADO_AO_LOTE_51_58_59_60_67"
    }
    else {
        "FORA_DO_LOTE_OU_PRECISA_ANALISE"
    }

    $ClassifiedFiles += [PSCustomObject]@{
        Status = $StatusCode
        Path = $FilePath
        Classification = $Classification
    }
}

# ============================================================
# Rodar validações
# ============================================================

$Results = @()

$Results += Run-Step -Name "git diff --check" -LogFileName "01-git-diff-check.log" -Script {
    git diff --check
}

$Results += Run-Step -Name "npm run lint" -LogFileName "02-npm-run-lint.log" -Script {
    npm run lint
}

$Results += Run-Step -Name "npm run typecheck" -LogFileName "03-npm-run-typecheck.log" -Script {
    npm run typecheck
}

$Results += Run-Step -Name "npm test" -LogFileName "04-npm-test.log" -Script {
    npm test
}

$Results += Run-Step -Name "npm run build" -LogFileName "05-npm-run-build.log" -Script {
    npm run build
}

# Recoleta final
$FinalGitStatusShort = Get-CommandOutput { git status --short }
$FinalGitStatusSb = Get-CommandOutput { git status -sb }
$FinalGitDiffStat = Get-CommandOutput { git diff --stat }
$FinalGitUntracked = Get-CommandOutput { git ls-files --others --exclude-standard }

$HasDirtyWorkspace = -not [string]::IsNullOrWhiteSpace($FinalGitStatusShort)
$FailedSteps = $Results | Where-Object { $_.Status -ne "PASS" }
$AllValidationPassed = ($FailedSteps.Count -eq 0)

# ============================================================
# Montar relatório Markdown
# ============================================================

$Report = New-Object System.Collections.Generic.List[string]

$Report.Add("# Relatório de Verificação — TREINO IA")
$Report.Add("")
$Report.Add("Gerado em: `$Timestamp`")
$Report.Add("")
$Report.Add("## 1. Contexto")
$Report.Add("")
$Report.Add("| Campo | Valor |")
$Report.Add("|---|---|")
$Report.Add("| Repositório | `$RepoPath` |")
$Report.Add("| Branch | `$Branch` |")
$Report.Add("| Git | `$GitVersion` |")
$Report.Add("| Node | `$NodeVersion` |")
$Report.Add("| npm | `$NpmVersion` |")
$Report.Add("| Pasta de logs | `$LogDir` |")
$Report.Add("")

$Report.Add("## 2. Últimos commits")
$Report.Add("")
$Report.Add("```txt")
$Report.Add($LastCommits)
$Report.Add("```")
$Report.Add("")

$Report.Add("## 3. Remote")
$Report.Add("")
$Report.Add("```txt")
$Report.Add($GitRemote)
$Report.Add("```")
$Report.Add("")

$Report.Add("## 4. Status Git inicial")
$Report.Add("")
$Report.Add("### git status -sb")
$Report.Add("")
$Report.Add("```txt")
$Report.Add($GitStatusSb)
$Report.Add("```")
$Report.Add("")
$Report.Add("### git status --short")
$Report.Add("")
$Report.Add("```txt")
if ([string]::IsNullOrWhiteSpace($GitStatusShort)) {
    $Report.Add("(limpo)")
}
else {
    $Report.Add($GitStatusShort)
}
$Report.Add("```")
$Report.Add("")

$Report.Add("## 5. Arquivos alterados / não rastreados")
$Report.Add("")

if ($ClassifiedFiles.Count -eq 0) {
    $Report.Add("Nenhum arquivo alterado ou não rastreado no início da verificação.")
}
else {
    $Report.Add("| Status | Arquivo | Classificação heurística |")
    $Report.Add("|---|---|---|")

    foreach ($Item in $ClassifiedFiles) {
        $SafePath = $Item.Path.Replace("|", "\|")
        $Report.Add("| `$($Item.Status)` | `$SafePath` | `$($Item.Classification)` |")
    }
}
$Report.Add("")

$Report.Add("### Diff stat inicial")
$Report.Add("")
$Report.Add("```txt")
if ([string]::IsNullOrWhiteSpace($GitDiffStat)) {
    $Report.Add("(sem diff)")
}
else {
    $Report.Add($GitDiffStat)
}
$Report.Add("```")
$Report.Add("")

$Report.Add("### Arquivos untracked")
$Report.Add("")
$Report.Add("```txt")
if ([string]::IsNullOrWhiteSpace($GitUntracked)) {
    $Report.Add("(nenhum)")
}
else {
    $Report.Add($GitUntracked)
}
$Report.Add("```")
$Report.Add("")

$Report.Add("## 6. Arquivos de diff gerados")
$Report.Add("")
$Report.Add("- Diff completo: `$DiffPath`")
$Report.Add("- Diff staged/cached: `$CachedDiffPath`")
$Report.Add("- Status short: `$StatusPath`")
$Report.Add("- Untracked: `$UntrackedPath`")
$Report.Add("")

$Report.Add("## 7. Resultado das validações")
$Report.Add("")
$Report.Add("| Comando | Status | Exit code | Duração | Log |")
$Report.Add("|---|---:|---:|---:|---|")

foreach ($Result in $Results) {
    $Report.Add("| `$($Result.Name)` | **$($Result.Status)** | `$($Result.ExitCode)` | `$($Result.DurationSeconds)s` | `$($Result.LogPath)` |")
}
$Report.Add("")

$Report.Add("## 8. Status Git final")
$Report.Add("")
$Report.Add("### git status -sb")
$Report.Add("")
$Report.Add("```txt")
$Report.Add($FinalGitStatusSb)
$Report.Add("```")
$Report.Add("")
$Report.Add("### git status --short")
$Report.Add("")
$Report.Add("```txt")
if ([string]::IsNullOrWhiteSpace($FinalGitStatusShort)) {
    $Report.Add("(limpo)")
}
else {
    $Report.Add($FinalGitStatusShort)
}
$Report.Add("```")
$Report.Add("")

$Report.Add("### Diff stat final")
$Report.Add("")
$Report.Add("```txt")
if ([string]::IsNullOrWhiteSpace($FinalGitDiffStat)) {
    $Report.Add("(sem diff)")
}
else {
    $Report.Add($FinalGitDiffStat)
}
$Report.Add("```")
$Report.Add("")

$Report.Add("## 9. Diagnóstico automático")
$Report.Add("")

if ($AllValidationPassed) {
    $Report.Add("- Validação técnica: **PASS**")
}
else {
    $Report.Add("- Validação técnica: **FAIL**")
    $Report.Add("- Comandos com falha:")
    foreach ($Fail in $FailedSteps) {
        $Report.Add("  - `$($Fail.Name)` — exit code `$($Fail.ExitCode)` — log: `$($Fail.LogPath)`")
    }
}

if ($HasDirtyWorkspace) {
    $Report.Add("- Workspace final: **DIRTY / COM ALTERAÇÕES**")
    $Report.Add("- Recomendação: **não iniciar próximo lote** antes de revisar/restaurar/commitar esses arquivos.")
}
else {
    $Report.Add("- Workspace final: **LIMPO**")
}

$OutsideBatch = $ClassifiedFiles | Where-Object { $_.Classification -eq "FORA_DO_LOTE_OU_PRECISA_ANALISE" }

if ($OutsideBatch.Count -gt 0) {
    $Report.Add("- Arquivos possivelmente fora do lote anterior: **SIM**")
    foreach ($Item in $OutsideBatch) {
        $Report.Add("  - `$($Item.Status)` `$($Item.Path)`")
    }
}
else {
    $Report.Add("- Arquivos possivelmente fora do lote anterior: **NÃO detectado pela heurística**")
}
$Report.Add("")

$Report.Add("## 10. Próximas ações sugeridas")
$Report.Add("")

if ($HasDirtyWorkspace) {
    $Report.Add("1. Revisar os arquivos listados em `git status --short`.")
    $Report.Add("2. Para arquivo acidental/temporário, restaurar/remover.")
    $Report.Add("3. Para alteração legítima esquecida, commitar separadamente.")
    $Report.Add("4. Rodar novamente este script até o workspace ficar limpo.")
}
elseif (-not $AllValidationPassed) {
    $Report.Add("1. Corrigir os comandos que falharam.")
    $Report.Add("2. Rodar novamente este script.")
}
else {
    $Report.Add("1. Base limpa e validação verde.")
    $Report.Add("2. Próximo passo recomendado: executar P0 Security & Production Hardening antes de novos lotes de feature.")
}
$Report.Add("")

$Report.Add("## 11. Checklist para me enviar")
$Report.Add("")
$Report.Add("Cole esta seção na conversa junto com o arquivo de relatório:")
$Report.Add("")
$Report.Add("```txt")
$Report.Add("Relatório gerado: $ReportPath")
$Report.Add("Validação técnica: " + $(if ($AllValidationPassed) { "PASS" } else { "FAIL" }))
$Report.Add("Workspace final: " + $(if ($HasDirtyWorkspace) { "DIRTY" } else { "LIMPO" }))
$Report.Add("Arquivos fora do lote detectados: " + $(if ($OutsideBatch.Count -gt 0) { "SIM" } else { "NÃO" }))
$Report.Add("```")
$Report.Add("")

Write-File -Path $ReportPath -Content ($Report -join "`r`n")

# ============================================================
# Resultado no console
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host "RELATÓRIO GERADO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host $ReportPath -ForegroundColor Yellow
Write-Host ""

if ($AllValidationPassed) {
    Write-Host "Validação técnica: PASS" -ForegroundColor Green
}
else {
    Write-Host "Validação técnica: FAIL" -ForegroundColor Red
}

if ($HasDirtyWorkspace) {
    Write-Host "Workspace final: DIRTY / COM ALTERAÇÕES" -ForegroundColor Yellow
}
else {
    Write-Host "Workspace final: LIMPO" -ForegroundColor Green
}

Write-Host ""
Write-Host "Abra o relatório com:" -ForegroundColor Cyan
Write-Host "notepad `"$ReportPath`"" -ForegroundColor White
Write-Host ""

# Também abrir automaticamente no Notepad
try {
    notepad $ReportPath
}
catch {}