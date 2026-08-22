#!/usr/bin/env bun
import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import pa11y from 'pa11y';

const args = process.argv.slice(2);
const command = args[0];
const targetUrl = args[1];

function printUsage() {
  console.log(`
🚀 Vibe-Browser Tool Suite (Powered by Bun & Playwright)

Usage:
  bun scripts/vibe-browser.ts <command> <url> [options]

Commands:
  capture <url> [outDir]       Capture multi-device screenshots (Mobile, Tablet, Desktop)
  extract-design <url> [out]   Extract colors, fonts, assets, and Markdown layout from any page
  audit <url>                  Run instant WCAG accessibility and console health audit

Examples:
  bun scripts/vibe-browser.ts capture http://localhost:5173
  bun scripts/vibe-browser.ts extract-design https://stripe.com
  bun scripts/vibe-browser.ts audit http://localhost:5173
`);
}

if (!command || !targetUrl) {
  printUsage();
  process.exit(0);
}

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2 },
  { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1.5 },
];

async function runCapture(url: string, outDir = './screenshots') {
  console.log(`📸 Capturing multi-device snapshots for: ${url}`);
  fs.mkdirSync(outDir, { recursive: true });

  const chromiumPath = process.env.CHROMIUM_PATH || Bun.which('chromium') || undefined;
  const browser = await chromium.launch({
    ...(chromiumPath ? { executablePath: chromiumPath } : {}),
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const results: string[] = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
    });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);
      const filename = `${vp.name}_${timestamp}.png`;
      const filepath = path.join(outDir, filename);
      await page.screenshot({ path: filepath, fullPage: true });
      console.log(`  ✅ [${vp.name.toUpperCase()}] Saved to: ${filepath}`);
      results.push(filepath);
    } catch (e: any) {
      console.error(`  ❌ Error capturing ${vp.name}:`, e.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`\n✨ Captured ${results.length} screenshots in: ${outDir}`);
}

async function runExtractDesign(url: string, outReport?: string) {
  console.log(`🎨 Extracting design tokens & assets from: ${url}`);

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  const title = await page.title();
  const html = await page.content();
  const $ = cheerio.load(html);

  const designTokens = await page.evaluate(() => {
    const colors = new Set<string>();
    const fonts = new Set<string>();
    const images: { src: string; alt: string }[] = [];

    const elements = Array.from(document.querySelectorAll('*'));
    for (const el of elements.slice(0, 300)) {
      const style = window.getComputedStyle(el);
      if (style.color) colors.add(style.color);
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colors.add(style.backgroundColor);
      }
      if (style.fontFamily) {
        style.fontFamily.split(',').forEach((f) => fonts.add(f.trim().replace(/['"]/g, '')));
      }
    }

    document.querySelectorAll('img').forEach((img) => {
      if (img.src && images.length < 20) {
        images.push({ src: img.src, alt: img.alt || '' });
      }
    });

    return {
      colors: Array.from(colors).slice(0, 25),
      fonts: Array.from(fonts).slice(0, 10),
      images,
    };
  });

  const turndown = new TurndownService({ headingStyle: 'atx' });
  const markdown = turndown.turndown(html).slice(0, 3000);

  const report = `# Design & Asset Extraction: ${title}
**Target URL:** ${url}
**Extracted At:** ${new Date().toISOString()}

---

## 🎨 Color Palette (${designTokens.colors.length} found)
${designTokens.colors.map((c) => `- \`${c}\``).join('\n')}

---

## 🔤 Font Families (${designTokens.fonts.length} found)
${designTokens.fonts.map((f) => `- **${f}**`).join('\n')}

---

## 🖼️ Media & Images (${designTokens.images.length} found)
${designTokens.images.map((img) => `- ![${img.alt || 'asset'}](${img.src})`).join('\n') || '_None found_'}

---

## 📝 Page Markdown Structure
\`\`\`markdown
${markdown}
\`\`\`
`;

  await browser.close();

  const reportPath = outReport || path.join(process.cwd(), 'design-extraction.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n✅ Design extraction complete! Saved report to: ${reportPath}`);
}

async function runAudit(url: string) {
  console.log(`🔍 Running accessibility & health audit for: ${url}...\n`);
  try {
    const results = await pa11y(url, {
      chromeLaunchConfig: {
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    });

    console.log(`📊 Audit Results for: ${results.pageUrl}`);
    console.log(`   Total issues found: ${results.issues.length}`);

    const errors = results.issues.filter((i) => i.type === 'error');
    const warnings = results.issues.filter((i) => i.type === 'warning');
    const notices = results.issues.filter((i) => i.type === 'notice');

    console.log(`   🔴 Errors:   ${errors.length}`);
    console.log(`   🟡 Warnings: ${warnings.length}`);
    console.log(`   🔵 Notices:  ${notices.length}\n`);

    if (errors.length > 0) {
      console.log('Top Priority Accessibility Fixes:');
      errors.slice(0, 5).forEach((err, idx) => {
        console.log(`  ${idx + 1}. [${err.code}] ${err.message}`);
        console.log(`     Selector: ${err.selector}\n`);
      });
    } else {
      console.log('🎉 No critical WCAG errors detected!');
    }
  } catch (err: any) {
    console.error('Audit failed:', err.message);
  }
}

async function main() {
  switch (command) {
    case 'capture':
      await runCapture(targetUrl, args[2]);
      break;
    case 'extract-design':
      await runExtractDesign(targetUrl, args[2]);
      break;
    case 'audit':
      await runAudit(targetUrl);
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
