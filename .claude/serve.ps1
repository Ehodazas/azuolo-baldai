param([string]$Root = ".", [int]$Port = 5500)
$Root = (Resolve-Path $Root).Path
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving on http://localhost:$Port/"
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".svg"="image/svg+xml"; ".webp"="image/webp"; ".ico"="image/x-icon" }
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
    if ($p -eq "") { $p = "index.html" }
    $f = Join-Path $Root $p
    if (Test-Path $f -PathType Leaf) {
      $b = [IO.File]::ReadAllBytes($f)
      $ext = [IO.Path]::GetExtension($f).ToLower()
      if ($types.ContainsKey($ext)) { $c.Response.ContentType = $types[$ext] }
      $c.Response.Headers.Add("Cache-Control", "no-store")
      $c.Response.ContentLength64 = $b.Length
      if ($c.Request.HttpMethod -ne "HEAD") { $c.Response.OutputStream.Write($b, 0, $b.Length) }
    } else {
      $c.Response.StatusCode = 404
      $nf = Join-Path $Root "404.html"
      if (Test-Path $nf) {
        $b = [IO.File]::ReadAllBytes($nf)
        $c.Response.ContentType = "text/html; charset=utf-8"
        $c.Response.ContentLength64 = $b.Length
        if ($c.Request.HttpMethod -ne "HEAD") { $c.Response.OutputStream.Write($b, 0, $b.Length) }
      }
    }
  } catch {} finally { try { $c.Response.Close() } catch {} }
}
