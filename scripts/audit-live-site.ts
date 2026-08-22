import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://push44.vercel.app";
const OUT_DIR = "./screenshots/live";

const PAGES_TO_AUDIT = [
  { name: "01_blog_hub", url: `${BASE_URL}/blog` },
  { name: "02_platform_base44", url: `${BASE_URL}/platforms/base44` },
  { name: "03_platform_bolt_new", url: `${BASE_URL}/platforms/bolt-new` },
  { name: "04_platform_floot", url: `${BASE_URL}/platforms/floot` },
  { name: "05_platform_rocket_new", url: `${BASE_URL}/platforms/rocket-new` },
  { name: "06_platform_zite", url: `${BASE_URL}/platforms/zite` },
  { name: "07_platform_framer", url: `${BASE_URL}/platforms/framer` },
  { name: "08_compare_base44_vs_rocket", url: `${BASE_URL}/compare/base44-vs-rocket-new` },
  { name: "09_compare_push44_vs_zip", url: `${BASE_URL}/compare/push44-vs-zip-download` },
  { name: "10_compare_best_tools", url: `${BASE_URL}/compare/best-ai-export-tools-2025` },
  { name: "11_privacy_policy", url: `${BASE_URL}/privacy` },
  { name: "12_terms_of_service", url: `${BASE_URL}/terms` },
  { name: "13_article_base44_export", url: `${BASE_URL}/blog/how-to-export-code-from-base44` },
  { name: "14_article_rocket_apk", url: `${BASE_URL}/blog/download-rocket-new-flutter-source-code-and-apk` },
  { name: "15_article_floot_export", url: `${BASE_URL}/blog/export-floot-to-github` },
  { name: "16_article_zite_export", url: `${BASE_URL}/blog/zite-github-export-guide` },
  { name: "17_article_bolt_branding", url: `${BASE_URL}/blog/bolt-new-badge-removal-guide` },
  { name: "18_article_top5_tools", url: `${BASE_URL}/blog/top-5-tools-to-export-ai-generated-apps-to-github` },
  { name: "19_article_why_push44_free", url: `${BASE_URL}/blog/why-push44-is-free` },
];

interface AuditResult {
  name: string;
  url: string;
  status: number;
  title: string;
  h1Count: number;
  h1Text: string;
  headings: string[];
  screenshotPath: string;
  consoleErrors: string[];
  loadTimeMs: number;
}

async function runLiveAudit() {
  console.log(`\n🚀 Starting Live Site Audit for: ${BASE_URL}`);
  console.log(`📁 Output Directory: ${OUT_DIR}\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const chromiumPath = process.env.CHROMIUM_PATH || (Bun.which ? Bun.which("chromium") : undefined) || undefined;

  const browser = await chromium.launch({
    ...(chromiumPath ? { executablePath: chromiumPath } : {}),
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const results: AuditResult[] = [];

  for (const pageItem of PAGES_TO_AUDIT) {
    console.log(`🌐 Auditing: [${pageItem.name}] -> ${pageItem.url}`);
    const page = await context.newPage();
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const start = Date.now();
    try {
      const response = await page.goto(pageItem.url, {
        waitUntil: "domcontentloaded",
        timeout: 25000,
      });

      await page.waitForTimeout(600);

      const status = response ? response.status() : 0;
      const title = await page.title();
      const h1Elements = await page.$$eval("h1", (els) => els.map((e) => e.textContent?.trim() || ""));
      const h2Elements = await page.$$eval("h2", (els) => els.map((e) => e.textContent?.trim() || ""));

      const screenshotFile = `${pageItem.name}.png`;
      const screenshotPath = path.join(OUT_DIR, screenshotFile);

      await page.screenshot({ path: screenshotPath, fullPage: true });

      const loadTimeMs = Date.now() - start;

      results.push({
        name: pageItem.name,
        url: pageItem.url,
        status,
        title,
        h1Count: h1Elements.length,
        h1Text: h1Elements[0] || "None",
        headings: h2Elements.slice(0, 5),
        screenshotPath,
        consoleErrors,
        loadTimeMs,
      });

      console.log(`   ✅ Status: ${status} | H1: "${h1Elements[0]?.slice(0, 35)}..." | ${loadTimeMs}ms`);
    } catch (err: any) {
      console.error(`   ❌ Failed to audit ${pageItem.url}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Save audit report JSON
  const reportPath = path.join(OUT_DIR, "audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`\n======================================================`);
  console.log(`🎉 LIVE AUDIT COMPLETE: ${results.length} Pages Verified`);
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`======================================================\n`);
}

runLiveAudit().catch(console.error);
