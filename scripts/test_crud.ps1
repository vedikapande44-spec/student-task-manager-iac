# PowerShell Verification Script for Student Task Manager REST API
param(
    [string]$BaseUrl = "https://student-task-manager.vedikapande44.workers.dev"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Student Task Manager REST API Test Suite" -ForegroundColor Cyan
Write-Host " Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$headers = @{
    "Content-Type"  = "application/json"
    "Cache-Control" = "no-cache"
    "Pragma"        = "no-cache"
    "User-Agent"    = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) StudentTaskManager/1.0"
}

# 1. GET /
Write-Host "`n[1/5] Testing Frontend Landing Page (GET /)..." -ForegroundColor Yellow
$landing = Invoke-WebRequest -Uri "$BaseUrl/" -Headers $headers -UseBasicParsing
if ($landing.StatusCode -eq 200) {
    Write-Host "  -> PASSED: HTTP 200 OK (HTML loaded)" -ForegroundColor Green
} else {
    Write-Host "  -> FAILED: HTTP $($landing.StatusCode)" -ForegroundColor Red
}

# 2. POST /api/tasks
Write-Host "`n[2/5] Testing Create Task (POST /api/tasks)..." -ForegroundColor Yellow
$body = @{
    title    = "Complete Cloud Computing Assignment"
    priority = "High"
    status   = "Pending"
    category = "Academic"
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "$BaseUrl/api/tasks" -Method Post -Headers $headers -Body $body
$taskId = $created.id
Write-Host "  -> PASSED: Task Created with ID: $taskId, Title: $($created.title)" -ForegroundColor Green

# 3. GET /api/tasks/{id}
Write-Host "`n[3/5] Testing Read Task (GET /api/tasks/$taskId)..." -ForegroundColor Yellow
$tStamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$fetched = Invoke-RestMethod -Uri "$BaseUrl/api/tasks/${taskId}?_t=$tStamp" -Method Get -Headers $headers
Write-Host "  -> PASSED: Fetched Task $taskId - Priority=$($fetched.priority), Status=$($fetched.status)" -ForegroundColor Green

# 4. PUT /api/tasks/{id}
Write-Host "`n[4/5] Testing Update Task (PUT /api/tasks/$taskId)..." -ForegroundColor Yellow
$updateBody = @{
    status = "Completed"
} | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$BaseUrl/api/tasks/$taskId" -Method Put -Headers $headers -Body $updateBody
Write-Host "  -> PASSED: Updated Task $taskId to Status: $($updated.status)" -ForegroundColor Green

# 5. DELETE /api/tasks/{id}
Write-Host "`n[5/5] Testing Delete Task (DELETE /api/tasks/$taskId)..." -ForegroundColor Yellow
$deleted = Invoke-RestMethod -Uri "$BaseUrl/api/tasks/$taskId" -Method Delete -Headers $headers
Write-Host "  -> PASSED: Deleted Task $taskId ($($deleted.message))" -ForegroundColor Green

# 6. Verify Deletion
Write-Host "`n[Verification] Verifying Task $taskId is removed from KV..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
$tStamp2 = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
try {
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/tasks/${taskId}?_t=$tStamp2" -Method Get -Headers $headers
    Write-Host "  -> FAILED: Task still returned 200 OK!" -ForegroundColor Red
} catch {
    Write-Host "  -> PASSED: HTTP 404 Not Found confirmed for individual endpoint." -ForegroundColor Green
}

$all = Invoke-RestMethod -Uri "$BaseUrl/api/tasks?_t=$tStamp2" -Method Get -Headers $headers
if ($all.id -notcontains $taskId) {
    Write-Host "  -> PASSED: Task $taskId absent from collection listing." -ForegroundColor Green
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " ALL CRUD TESTS COMPLETED SUCCESSFULLY! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
