import { chromium, devices } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://push44.vercel.app";
const OUT_DIR = "./screenshots/mobile";

const PAGES_TO_AUDIT = [
  { name: "01_mobile_blog_hub", url: `${BASE_URL}/blog` },
  { name: "02_mobile_platform_base44", url: `${BASE_URL}/platforms/base44` },
  { name: "03_mobile_platform_bolt_new", url: `${BASE_URL}/platforms/bolt-new` },
  { name: "04_mobile_platform_floot", url: `${BASE_URL}/platforms/floot` },
  { name: "05_mobile_platform_rocket_new", url: `${BASE_URL}/platforms/rocket-new` },
  { name: "06_mobile_platform_zite", url: `${BASE_URL}/platforms/zite` },
  { name: "07_mobile_compare_base44_vs_rocket", url: `${BASE_URL}/compare/base44-vs-rocket-new` },
  { name: "08_mobile_compare_push44_vs_zip", url: `${BASE_URL}/compare/push44-vs-zip-download` },
  { name: "09_mobile_privacy_policy", url: `${BASE_URL}/privacy` },
  { name: "10_mobile_terms_of_service", url: `${BASE_URL}/terms` },
  { name: "11_mobile_article_base44_export", url: `${BASE_URL}/blog/how-to-export-code-from-base44` },
  { name: "12_mobile_article_rocket_apk", url: `${BASE_URL}/blog/download-rocket-new-flutter-source-code-and-apk` },
  { name: "13_mobile_article_bolt_branding", url: `${BASE_URL}/blog/bolt-new-badge-removal-guide` },
  { name: "14_mobile_article_top5_tools", url: `${BASE_URL}/blog/top-5-tools-to-export-ai-generated-apps-to-github` },
  { name: "15_mobile_article_why_push44_free", url: `${BASE_URL}/blog/why-push44-is-free` },
];

interface MobileAuditResult {
  name: string;
  url: string;
  status: number;
  title: string;
  h1: string;
  hasHorizontalOverflow: boolean;
  scrollWidth: number;
  viewportWidth: number;
  smallTouchTargetsCount: number;
  smallTouchTargetExamples: string[];
  screenshotPath: string;
  consoleErrors: string[];
  loadTimeMs: number;
}

async function runMobileAudit() {
  console.log(`\n📱 Starting Mobile User Live Site Audit for: ${BASE_URL}`);
  console.log(`📱 Device: iPhone 14 Pro (390x844, Touch Enabled)`);
  console.log(`📁 Output Directory: ${OUT_DIR}\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const chromiumPath = process.env.CHROMIUM_PATH || (Bun.which ? Bun.which("chromium") : undefined) || undefined;

  const browser = await chromium.launch({
    ...(chromiumPath ? { executablePath: chromiumPath } : {}),
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox"],
  });

  const iPhone14 = devices["iPhone 14 Pro"] || {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: "chromium",
  };

  const context = await browser.newContext({
    ...iPhone14,
  });

  const results: MobileAuditResult[] = [];

  for (const pageItem of PAGES_TO_AUDIT) {
    console.log(`📱 Mobile Auditing: [${pageItem.name}] -> ${pageItem.url}`);
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
      const h1Text = await page.$eval("h1", (el) => el.textContent?.trim() || "").catch(() => "None");

      // Check horizontal overflow (crucial for mobile UX)
      const overflowInfo = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        const innerWidth = window.innerWidth;
        const hasOverflow = scrollWidth > innerWidth + 1;

        // Check tap targets < 36px in clickable elements
        const smallTargets: string[] = [];
        const interactives = document.querySelectorAll("button, a, input, [role='button']");
        interactives.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && (rect.width < 32 || rect.height < 32)) {
            const text = (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30);
            if (text && !smallTargets.includes(text)) {
              smallTargets.push(`${text} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
            }
          }
        });

        return {
          scrollWidth,
          clientWidth,
          innerWidth,
          hasOverflow,
          smallTargets,
        };
      });

      const screenshotFile = `${pageItem.name}.png`;
      const screenshotPath = path.join(OUT_DIR, screenshotFile);

      await page.screenshot({ path: screenshotPath, fullPage: true });

      const loadTimeMs = Date.now() - start;

      results.push({
        name: pageItem.name,
        url: pageItem.url,
        status,
        title,
        h1: h1Text,
        hasHorizontalOverflow: overflowInfo.hasOverflow,
        scrollWidth: overflowInfo.scrollWidth,
        viewportWidth: overflowInfo.innerWidth,
        smallTouchTargetsCount: overflowInfo.smallTargets.length,
        smallTouchTargetExamples: overflowInfo.smallTargets.slice(0, 4),
        screenshotPath,
        consoleErrors,
        loadTimeMs,
      });

      console.log(
        `   ✅ Status: ${status} | Overflow: ${overflowInfo.hasOverflow ? "⚠️ YES" : "✅ NONE"} (${overflowInfo.scrollWidth}px / ${overflowInfo.innerWidth}px) | ${loadTimeMs}ms`
      );
    } catch (err: any) {
      console.error(`   ❌ Failed mobile audit on ${pageItem.url}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Save mobile audit report
  const reportPath = path.join(OUT_DIR, "audit-mobile-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`\n======================================================`);
  console.log(`🎉 MOBILE AUDIT COMPLETE: ${results.length} Pages Verified`);
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`======================================================\n`);
}

runMobileAudit().catch(console.error);
