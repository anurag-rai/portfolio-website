/**
 * Reads coverage-summary.json and generates a shields.io-style SVG badge.
 * Usage: node scripts/generate-coverage-badge.mjs
 * Output: coverage/badge.svg
 */

import { readFileSync, writeFileSync } from "fs";

const summary = JSON.parse(readFileSync("coverage/coverage-summary.json", "utf8"));
const pct = Math.round(summary.total.statements.pct);

const color = pct >= 90 ? "#4c1" : pct >= 75 ? "#dfb317" : pct >= 50 ? "#fe7d37" : "#e05d44";
const label = "coverage";
const value = `${pct}%`;

// Calculate widths for proper text fitting
const labelWidth = 62;
const valueWidth = 42;
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
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;

writeFileSync("coverage/badge.svg", svg);
console.log(`Coverage badge generated: ${pct}%`);
