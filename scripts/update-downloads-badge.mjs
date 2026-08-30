#!/usr/bin/env node

// Updates the combined npm-download stats (badge + history chart) used by the
// README. Everything is stored in one Gist since GitHub READMEs can't run JS

// Primary source: npm-stat.com's unofficial full-history API (no 18-month
// cap, self-heals any gap, gives real daily granularity since 2015).
// Fallback: baseline total + own weekly ledger, built independently from
// npm's official (rate-capped but stable) download API, so the badge doesn't
// break if npm-stat disappears. The history chart simply stops advancing
// until npm-stat comes back, since the ledger alone can't reconstruct
// daily/monthly granularity.

import { requireGistEnv, fetchJson, loadGistFile, saveGistFiles } from "./gist-utils.mjs";

const PACKAGES = {
  justifiedGallery: "2015-01-10",
  "justified-gallery": "2016-07-14",
};

const gist = { ...requireGistEnv(), userAgent: "justified-gallery-downloads-badge" };

const todayISO = () => new Date().toISOString().slice(0, 10);

// Official npm download-counts API: total downloads over [start, end] for one package.
async function officialWeekTotal(pkg, start, end) {
  const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${encodeURIComponent(pkg)}`;
  const data = await fetchJson(url);
  return data.downloads || 0;
}

// npm-stat.com's cached full-history API (undocumented, no 18-month cap):
// returns a { "YYYY-MM-DD": count } series for one package.
async function npmStatSeries(pkg, from) {
  const url = `https://npm-stat.com/api/download-counts?package=${encodeURIComponent(pkg)}&from=${from}&until=${todayISO()}`;
  const data = await fetchJson(url);
  const series = data[pkg];
  if (!series || typeof series !== "object")
    throw new Error(`unexpected npm-stat response for ${pkg}`);
  return series;
}

function bucketByMonth(series) {
  const monthly = {};
  for (const [date, count] of Object.entries(series)) {
    const month = date.slice(0, 7);
    monthly[month] = (monthly[month] || 0) + count;
  }
  return monthly;
}

function mergeMonthly(a, b) {
  const merged = { ...a };
  for (const [month, count] of Object.entries(b))
    merged[month] = (merged[month] || 0) + count;
  return merged;
}

function formatMessage(total) {
  return `${total.toLocaleString("en-US")} total`;
}

// Hand-rolled cumulative-downloads chart (no chart lib needed for two dozen
// points). Uses mid-tone colors + a transparent background so it reads fine
// on both GitHub's light and dark themes without needing two separate
// palettes beyond the axis/label text color. The Y axis is zoomed to the
// visible range (not from zero) since eleven years of history dwarfs any
// month-to-month movement in the last two years.
function formatCompact(value) {
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return String(value);
}

function renderChartSvg(monthly, { textColor, lineColor, areaColor, gridColor }) {
  const sortedMonths = Object.keys(monthly).sort();
  let running = 0;
  const cumulativeByMonth = new Map(sortedMonths.map((m) => [m, (running += monthly[m])]));

  const months = sortedMonths.slice(-24);
  const values = months.map((m) => cumulativeByMonth.get(m));

  const width = 720;
  const height = 220;
  const fontFamily = "-apple-system,Segoe UI,Helvetica,Arial,sans-serif";
  const padding = { top: 16, right: 16, bottom: 34, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Round the visible range out to the nearest 10k so the axis reads cleanly
  // (e.g. ~500k-590k) instead of the exact, jagged min/max.
  const step = 10000;
  const yMin = Math.floor(Math.min(...values) / step) * step;
  const yMax = Math.ceil(Math.max(...values) / step) * step;
  const range = yMax - yMin || 1;

  const xAt = (i) => padding.left + (months.length === 1 ? 0 : (i / (months.length - 1)) * chartW);
  const yAt = (value) => padding.top + chartH - ((value - yMin) / range) * chartH;

  const yTicks = [yMin, (yMin + yMax) / 2, yMax];
  const yAxis = yTicks
    .map((tick) => {
      const y = yAt(tick);
      return `
        <line x1="${padding.left}" y1="${y.toFixed(1)}" x2="${width - padding.right}" y2="${y.toFixed(1)}" stroke="${gridColor}" stroke-width="1" />
        <text x="${padding.left - 8}" y="${(y + 3).toFixed(1)}" font-size="11" fill="${textColor}" text-anchor="end" font-family="${fontFamily}">${formatCompact(Math.round(tick))}</text>
      `;
    })
    .join("");

  const points = months.map((month, i) => [xAt(i), yAt(cumulativeByMonth.get(month))]);
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${(padding.top + chartH).toFixed(1)} L${points[0][0].toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`;

  const xLabels = months
    .map((month, i) => {
      const showLabel = i % 3 === 0 || i === months.length - 1;
      if (!showLabel) return "";
      const [x] = points[i];
      return `<text x="${x.toFixed(1)}" y="${height - padding.bottom + 16}" font-size="11" fill="${textColor}" text-anchor="middle" font-family="${fontFamily}">${month.slice(2)}</text>`;
    })
    .join("");

  const dots = points
    .map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${lineColor}"><title>${months[i]}: ${values[i].toLocaleString("en-US")} cumulative downloads</title></circle>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${yAxis}<path d="${areaPath}" fill="${areaColor}" stroke="none" /><path d="${linePath}" fill="none" stroke="${lineColor}" stroke-width="2" />${dots}${xLabels}</svg>`;
}

async function main() {
  const log = await loadGistFile(gist, "downloads-log.json");
  let history = await loadGistFile(gist, "downloads-history.json", {});

  // Always record this week's official-API numbers into our own ledger,
  // independent of whether npm-stat is reachable.
  const end = todayISO();
  const lastWeekStart = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  const weekCounts = {};
  for (const pkg of Object.keys(PACKAGES)) {
    try {
      weekCounts[pkg] = await officialWeekTotal(pkg, lastWeekStart, end);
    } catch (err) {
      console.error(`official API failed for ${pkg}:`, err.message);
      weekCounts[pkg] = 0;
    }
  }

  const weekEntry = { weekEnding: end, ...weekCounts };
  const existingIdx = log.weekly.findIndex((w) => w.weekEnding === end);
  if (existingIdx >= 0) log.weekly[existingIdx] = weekEntry;
  else log.weekly.push(weekEntry);

  // Try npm-stat's full-history reconciliation as the primary source for
  // both the total and the monthly chart history.
  let total;
  let source;
  try {
    const seriesPerPackage = await Promise.all(
      Object.entries(PACKAGES).map(([pkg, from]) => npmStatSeries(pkg, from))
    );
    total = seriesPerPackage.reduce(
      (sum, series) => sum + Object.values(series).reduce((a, b) => a + b, 0),
      0
    );
    history = seriesPerPackage.map(bucketByMonth).reduce(mergeMonthly, {});
    source = "npm-stat";
  } catch (err) {
    console.error(
      "npm-stat reconciliation failed, falling back to ledger:",
      err.message
    );
    const ledgerSum = log.weekly.reduce(
      (sum, w) =>
        sum + Object.keys(PACKAGES).reduce((s, pkg) => s + (w[pkg] || 0), 0),
      0
    );
    total = log.baseline.total + ledgerSum;
    source = "ledger-fallback";
    // history is left as whatever was last successfully computed from npm-stat.
  }

  log.lastUpdated = end;
  log.lastSource = source;

  const badge = {
    schemaVersion: 1,
    label: "downloads",
    message: formatMessage(total),
    color: "brightgreen",
  };

  await saveGistFiles(gist, {
    "downloads.json": JSON.stringify(badge),
    "downloads-log.json": JSON.stringify(log, null, 2),
    "downloads-history.json": JSON.stringify(history, null, 2),
    "downloads-chart-light.svg": renderChartSvg(history, {
      textColor: "#57606a",
      lineColor: "#316dca",
      areaColor: "#316dca26",
      gridColor: "#d0d7de",
    }),
    "downloads-chart-dark.svg": renderChartSvg(history, {
      textColor: "#9198a1",
      gridColor: "#30363d",
      lineColor: "#6cb6ff",
      areaColor: "#6cb6ff26",
    }),
  });

  console.log(`Updated badge: ${badge.message} (source: ${source})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
