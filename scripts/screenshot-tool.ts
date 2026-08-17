#!/usr/bin/env bun
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
📸 Pro Screenshot & Visual Diff Tool Suite (Powered by Bun & Playwright)

Usage:
  bun scripts/screenshot-tool.ts <command> [arguments] [options]

Commands:
  shot <url> [outPath]         Capture custom screenshot
    --full                     Full page capture
    --mobile                   Mobile viewport (390x844)
    --tablet                   Tablet viewport (768x1024)
    --desktop                  Desktop viewport (1440x900)
    --element="<selector>"     Capture only specific DOM element
    --dark                     Emulate dark color scheme
    --delay=<ms>               Wait N milliseconds before capture

  diff <imageA> <imageB> [out] Compare two screenshots and output visual diff

Examples:
  bun scripts/screenshot-tool.ts shot http://localhost:5173 --full
  bun scripts/screenshot-tool.ts shot http://localhost:5173 --element="#hero-section"
  bun scripts/screenshot-tool.ts shot https://example.com --dark --mobile
  bun scripts/screenshot-tool.ts diff /tmp/before.png /tmp/after.png /tmp/diff.png
`);
}

if (!command) {
  printUsage();
  process.exit(0);
}

async function takeScreenshot(url: string, outPath?: string) {
  const isFull = args.includes('--full');
  const isMobile = args.includes('--mobile');
  const isTablet = args.includes('--tablet');
  const isDark = args.includes('--dark');
  
  const elementArg = args.find((a) => a.startsWith('--element='));
  const elementSelector = elementArg ? elementArg.split('=')[1] : null;

  const delayArg = args.find((a) => a.startsWith('--delay='));
  const delay = delayArg ? parseInt(delayArg.split('=')[1], 10) : 1000;

  let viewport = { width: 1440, height: 900 };
  let deviceScaleFactor = 1.5;

  if (isMobile) {
    viewport = { width: 390, height: 844 };
    deviceScaleFactor = 2;
  } else if (isTablet) {
    viewport = { width: 768, height: 1024 };
    deviceScaleFactor = 2;
  }

  const outDir = './screenshots';
  if (!outPath && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const defaultName = `shot_${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}_${Date.now()}.png`;
  const finalPath = outPath && !outPath.startsWith('--') ? outPath : path.join(outDir, defaultName);

  console.log(`📸 Taking screenshot of: ${url}`);
  console.log(`   Viewport: ${viewport.width}x${viewport.height} (${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'})`);
  if (elementSelector) console.log(`   Target Element: ${elementSelector}`);
  if (isDark) console.log(`   Theme: Dark Mode`);

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: isDark ? 'dark' : 'light',
  });

  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  if (delay > 0) {
    await page.waitForTimeout(delay);
  }

  if (elementSelector) {
    const el = await page.$(elementSelector);
    if (!el) {
      console.error(`❌ Element not found: ${elementSelector}`);
      await browser.close();
      return;
    }
    await el.screenshot({ path: finalPath });
  } else {
    await page.screenshot({ path: finalPath, fullPage: isFull });
  }

  await browser.close();
  console.log(`✅ Saved screenshot to: ${finalPath}`);
}

async function diffImages(imgAPath: string, imgBPath: string, outDiffPath = './diff.png') {
  console.log(`🔍 Comparing:\n   Image A: ${imgAPath}\n   Image B: ${imgBPath}`);

  if (!fs.existsSync(imgAPath) || !fs.existsSync(imgBPath)) {
    console.error('❌ One or both image paths do not exist.');
    return;
  }

  const imgA = PNG.sync.read(fs.readFileSync(imgAPath));
  const imgB = PNG.sync.read(fs.readFileSync(imgBPath));

  const { width, height } = imgA;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    imgA.data,
    imgB.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(outDiffPath, PNG.sync.write(diff));
  console.log(`\n📊 Visual Diff Results:`);
  console.log(`   Total differing pixels: ${numDiffPixels}`);
  console.log(`   Visual diff saved to:   ${outDiffPath}`);

  if (numDiffPixels === 0) {
    console.log(`🎉 Images are pixel-identical!`);
  } else {
    console.log(`⚠️ Visual differences detected.`);
  }
}

async function main() {
  switch (command) {
    case 'shot':
      await takeScreenshot(args[1], args[2]);
      break;
    case 'diff':
      await diffImages(args[1], args[2], args[3]);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
