#!/usr/bin/env node

// Publishes an "open issues" badge with a custom color threshold (green at
// or below 50 open issues, yellow above) that shields.io's built-in GitHub
// issues badge can't express — it only supports a fixed color, and its
// default auto-coloring scales with the raw count regardless of what that
// count actually means for this project.

import { requireGistEnv, fetchJson, saveGistFiles } from "./gist-utils.mjs";

const REPO = "miromannino/Justified-Gallery";
const OPEN_ISSUES_YELLOW_THRESHOLD = 50;

const gist = { ...requireGistEnv(), userAgent: "justified-gallery-issues-badge" };

async function openIssueCount() {
  // The repo API's open_issues_count also counts open PRs; the search API
  // lets us filter to issues only.
  const url = `https://api.github.com/search/issues?q=repo:${REPO}+type:issue+state:open`;
  const headers = { "User-Agent": gist.userAgent };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  const data = await fetchJson(url, { headers });
  return data.total_count;
}

async function main() {
  const count = await openIssueCount();

  const badge = {
    schemaVersion: 1,
    label: "open issues",
    message: String(count),
    color: count > OPEN_ISSUES_YELLOW_THRESHOLD ? "yellow" : "brightgreen",
  };

  await saveGistFiles(gist, { "open-issues.json": JSON.stringify(badge) });

  console.log(`Updated badge: open issues = ${count} (${badge.color})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
