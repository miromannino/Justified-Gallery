# Justified Gallery — Website (gh-pages)

This branch contains the [Justified Gallery](https://github.com/miromannino/Justified-Gallery)
documentation and demo site, built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build), and published at
<https://miromannino.github.io/Justified-Gallery/>.

## Structure

- `src/content/docs/` — the documentation pages (MDX), one file per page.
- `src/components/` — live demo components (`GalleryDemo.astro`, `OptionsPlayground.astro`, `EndlessScrollDemo.astro`, …).
- `src/data/images.ts` — the demo photo catalog and shared gallery settings.
- `src/scripts/jg-demos.ts` — the client script that initializes every `[data-jg]` gallery demo.
- `public/photos/` — the demo photos with Flickr-style size suffixes (`_t`, `_m`, `_n`, `_z`, `_b`), plus `resize_imgs.py`, which generates those variants from a full-resolution source image and then deletes the source (the unsuffixed original isn't served — see `src/data/images.ts`).
- `resources/`, `dist/`, `test/` — a separate, gitignored library-development workspace for the `justified-gallery` library itself, unrelated to this site. Leave these alone.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./_site/` |
| `npm run preview` | Preview the build locally |

## Deployment

Pushing to this branch triggers the `.github/workflows/deploy.yml` GitHub Actions
workflow, which builds the site and publishes it to GitHub Pages. The repository's
**Settings → Pages → Source** must be set to "GitHub Actions" for this to take effect.
