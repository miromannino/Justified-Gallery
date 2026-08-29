# scripts

Standalone tooling that isn't part of the published `justified-gallery`
package (excluded via `package.json`'s `files` field and `.npmignore`) or
wired into any `npm run` script. Run manually as needed.

## Test-fixture generators (Python)

Used to (re)create the placeholder images and HTML pages under
`test/browser/` when adding or changing test fixtures. `generate-images.py`
needs [Pillow](https://pypi.org/project/pillow/):

```
pip install pillow
```

- **`generate-images.py`** — generates placeholder JPEGs (with a gradient
  background and frame) in multiple sizes/aspect ratios, named so
  `generate-html.py` can match them up.
  ```
  python3 generate-images.py -n 20 -o ../test/browser/imgs
  ```
- **`generate-html.py`** — scans `test/browser/imgs` and injects `<a><img>`
  entries for each image between the `<!-- GALLERY START -->` /
  `<!-- GALLERY END -->` markers in every file under `test/browser/html`,
  then formats the result with Prettier.
  ```
  python3 generate-html.py
  ```
- **`generate-index.py`** — builds `test/browser/index.html`, a simple
  links page listing every file in `test/browser/html`, so they're easy to
  browse from `npm run dev`.
  ```
  python3 generate-index.py
  ```

## `update-downloads-badge.mjs` (Node)

Run weekly by
[`.github/workflows/update-downloads-badge.yml`](../.github/workflows/update-downloads-badge.yml)
to refresh the combined npm-downloads badge and history chart shown in the
README's "Downloads" section. Since `justified-gallery` replaced the legacy
`justifiedGallery` package name in the v4 rewrite, npm has no single API that
reports a combined total across both — this script computes it and publishes
the result (a shields.io-compatible badge JSON, a monthly download history,
and light/dark SVG charts) to a Gist that the README embeds.

Primary source is npm-stat.com's unofficial full-history API (no 18-month
cap, unlike npm's own API). If that's unreachable, it falls back to a
baseline total plus a weekly ledger built independently from npm's official
API, so the badge doesn't break if npm-stat.com ever goes away — though in
that case the history chart stops advancing until npm-stat.com recovers.

Requires `GIST_ID` and `GIST_TOKEN` (a classic PAT with `gist` scope) env
vars:

```
GIST_ID=<gist-id> GIST_TOKEN=<token> node update-downloads-badge.mjs
```
