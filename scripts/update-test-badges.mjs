#!/usr/bin/env node

// Publishes passing unit and e2e tests reusing the same gist as the downloads
// badge (README can't run JS, so the badge data lives in a gist that
// shields.io's endpoint badge reads).

import { readFile } from "node:fs/promises";
import { requireGistEnv, saveGistFiles } from "./gist-utils.mjs";

const gist = { ...requireGistEnv(), userAgent: "justified-gallery-test-badges" };

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (err) {
    console.error(`could not read ${path}:`, err.message);
    return null;
  }
}

function unitBadge(report) {
  if (!report) return null;
  const passed = report.numPassedTests ?? 0;
  const total = report.numTotalTests ?? 0;
  return { passed, total };
}

function e2eBadge(report) {
  if (!report) return null;
  const stats = report.stats ?? {};
  const passed = (stats.expected ?? 0) + (stats.flaky ?? 0);
  const total =
    (stats.expected ?? 0) +
    (stats.unexpected ?? 0) +
    (stats.flaky ?? 0) +
    (stats.skipped ?? 0);
  return { passed, total };
}

function toBadge(label, counts) {
  if (!counts || counts.total === 0) {
    return { schemaVersion: 1, label, message: "no data", color: "lightgrey" };
  }
  const { passed, total } = counts;
  return {
    schemaVersion: 1,
    label,
    message: `${passed}/${total} passing`,
    color: passed === total ? "brightgreen" : "red",
  };
}

async function main() {
  const unitReport = await readJson("unit-results.json");
  const e2eReport = await readJson("e2e-results.json");

  const files = {};
  if (unitReport) {
    const unit = toBadge("unit tests", unitBadge(unitReport));
    files["unit-tests.json"] = JSON.stringify(unit);
    console.log(`unit=${unit.message}`);
  }
  if (e2eReport) {
    const e2e = toBadge("e2e tests", e2eBadge(e2eReport));
    files["e2e-tests.json"] = JSON.stringify(e2e);
    console.log(`e2e=${e2e.message}`);
  }

  if (Object.keys(files).length === 0) {
    console.error("no report files found, nothing to update");
    process.exit(1);
  }

  await saveGistFiles(gist, files);
  console.log("Gist updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
