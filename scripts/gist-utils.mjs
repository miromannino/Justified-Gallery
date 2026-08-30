// Shared helpers for scripts that publish shields.io endpoint-badge data
// (and other README assets) to a GitHub Gist, since GitHub READMEs can't
// run JS to compute anything live.

export function requireGistEnv() {
  const GIST_ID = process.env.GIST_ID;
  const GIST_TOKEN = process.env.GIST_TOKEN;
  if (!GIST_ID || !GIST_TOKEN) {
    console.error("GIST_ID and GIST_TOKEN env vars are required");
    process.exit(1);
  }
  return { GIST_ID, GIST_TOKEN };
}

export async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

export async function loadGistFile(
  { GIST_ID, GIST_TOKEN, userAgent },
  filename,
  fallback
) {
  const gist = await fetchJson(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `token ${GIST_TOKEN}`,
      "User-Agent": userAgent,
    },
  });
  const file = gist.files[filename];
  return file ? JSON.parse(file.content) : fallback;
}

export async function saveGistFiles({ GIST_ID, GIST_TOKEN, userAgent }, files) {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${GIST_TOKEN}`,
      "User-Agent": userAgent,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: Object.fromEntries(
        Object.entries(files).map(([name, content]) => [name, { content }])
      ),
    }),
  });
  if (!res.ok)
    throw new Error(
      `Gist update failed: HTTP ${res.status} ${await res.text()}`
    );
}
