$ports = @(3000, 4000)

foreach ($port in $ports) {
  $lines = netstat -ano | Select-String ":$port"
  $pids = @()

  foreach ($line in $lines) {
    $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
    if ($parts.Length -gt 0) {
      $processIdValue = $parts[-1]
      if ($processIdValue -match '^\d+$') {
        $pids += $processIdValue
      }
    }
  }

  $pids = $pids | Select-Object -Unique

  foreach ($processIdValue in $pids) {
    if ($processIdValue -ne "0") {
      try {
        taskkill /PID $processIdValue /F | Out-Null
      } catch {
        # Ignore failures for processes that end before kill.
      }
    }
  }
}

npm run dev:full
