# Headless Playwright Chromium Capabilities

## Executable Location
`$REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE` -> `/nix/store/71577rskzyhch3axhdqx7faygc2xyn4v-playwright-browsers-1.55.0-with-cjk/chromium-1187/chrome-linux/chrome`

## Empirical Automation Capabilities

### 1. Headless JavaScript DOM Rendering
```bash
python3 -c "
import subprocess, os
executable = os.environ.get('REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE')
cmd = [executable, '--headless', '--no-sandbox', '--disable-gpu', '--dump-dom', 'https://example.com']
res = subprocess.run(cmd, capture_output=True, text=True)
print(res.stdout[:200])
"
# Result: Successfully dumps fully rendered HTML DOM.
```

### 2. Full-Page Visual Screenshotting
```bash
python3 -c "
import subprocess, os
executable = os.environ.get('REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE')
cmd = [executable, '--headless', '--no-sandbox', '--disable-gpu', '--screenshot=/tmp/screenshot.png', '--window-size=1280,800', 'https://example.com']
subprocess.run(cmd)
"
# Result: Generates 20KB visual PNG screenshot.
```

### 3. PDF Document Export
```bash
python3 -c "
import subprocess, os
executable = os.environ.get('REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE')
cmd = [executable, '--headless', '--no-sandbox', '--disable-gpu', '--print-to-pdf=/tmp/document.pdf', 'https://example.com']
subprocess.run(cmd)
"
# Result: Exports clean PDF file.
```
