/**
 * Reads Lighthouse results from .lighthouseci/, generates a performance badge SVG,
 * and appends scores to the history JSON file.
 *
 * Usage: node scripts/process-lighthouse-results.mjs
 *
 * Reads:  .lighthouseci/*.json (Lighthouse Result objects)
 * Writes: performance/lighthouse-badge.svg
 *         performance/lighthouse-history.json
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const RESULTS_DIR = ".lighthouseci";
const OUTPUT_DIR = "performance";
const BADGE_PATH = join(OUTPUT_DIR, "lighthouse-badge.svg");
const HISTORY_PATH = join(OUTPUT_DIR, "lighthouse-history.json");

const SKIP_FILES = new Set(["manifest.json", "links.json"]);

const files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json") && !SKIP_FILES.has(f));

const results = files
  .map((f) => {
    try {
      return JSON.parse(readFileSync(join(RESULTS_DIR, f), "utf8"));
    } catch {
      return null;
    }
  })
  .filter((r) => r?.categories?.performance);

if (results.length === 0) {
  console.error("No Lighthouse results found in .lighthouseci/");
  process.exit(1);
}

const mobile = results.filter((r) => r.configSettings.formFactor === "mobile");
const desktop = results.filter((r) => r.configSettings.formFactor === "desktop");

function extractMetrics(lhr) {
  return {
    performance: Math.round(lhr.categories.performance.score * 100),
    fcp: Math.round(lhr.audits["first-contentful-paint"].numericValue),
    lcp: Math.round(lhr.audits["largest-contentful-paint"].numericValue),
    tbt: Math.round(lhr.audits["total-blocking-time"].numericValue),
    cls: parseFloat(lhr.audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    si: Math.round(lhr.audits["speed-index"].numericValue),
  };
}

function getMedianByPerformance(arr) {
  const sorted = [...arr].sort(
    (a, b) => a.categories.performance.score - b.categories.performance.score,
  );
  return sorted[Math.floor(sorted.length / 2)];
}

const mobileMedian = mobile.length > 0 ? extractMetrics(getMedianByPerformance(mobile)) : null;
const desktopMedian = desktop.length > 0 ? extractMetrics(getMedianByPerformance(desktop)) : null;

function printMetrics(label, metrics) {
  console.log(`${label} (median of ${label === "Mobile" ? mobile.length : desktop.length} runs):`);
  console.log(`  Performance: ${metrics.performance}`);
  console.log(`  FCP:  ${metrics.fcp}ms`);
  console.log(`  LCP:  ${metrics.lcp}ms`);
  console.log(`  TBT:  ${metrics.tbt}ms`);
  console.log(`  CLS:  ${metrics.cls}`);
  console.log(`  SI:   ${metrics.si}ms`);
}

console.log("\n=== Lighthouse Results ===\n");
if (mobileMedian) printMetrics("Mobile", mobileMedian);
if (desktopMedian) printMetrics("Desktop", desktopMedian);

// --- Badge (mobile performance score) ---

const score = mobileMedian?.performance ?? desktopMedian?.performance ?? 0;
const badgeColor =
  score >= 90 ? "#4c1" : score >= 75 ? "#dfb317" : score >= 50 ? "#fe7d37" : "#e05d44";

const label = "performance";
const value = `${score}`;
const labelWidth = 82;
const valueWidth = 36;
const totalWidth = labelWidth + valueWidth;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${badgeColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(BADGE_PATH, svg);
console.log(`\nBadge written: ${BADGE_PATH} (score: ${score})`);

// --- History ---

let history = [];
if (existsSync(HISTORY_PATH)) {
  try {
    history = JSON.parse(readFileSync(HISTORY_PATH, "utf8"));
  } catch {
    history = [];
  }
}

let commit = "unknown";
try {
  commit = (
    process.env.GITHUB_SHA ?? execSync("git rev-parse HEAD", { encoding: "utf8" }).trim()
  ).slice(0, 7);
} catch {
  /* keep unknown */
}

const entry = {
  commit,
  date: new Date().toISOString(),
  ...(mobileMedian && { mobile: mobileMedian }),
  ...(desktopMedian && { desktop: desktopMedian }),
};

history.push(entry);
writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2) + "\n");
console.log(`History updated: ${HISTORY_PATH} (${history.length} entries)\n`);
