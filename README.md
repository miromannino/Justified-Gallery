<div align="center">
  <a href="http://miromannino.github.io/Justified-Gallery/" target="_blank">
    <img src="https://raw.github.com/miromannino/Justified-Gallery/gh-imgs/justified-gallery.webp" />
  </a>
</div>

<br/>

**Justified Gallery is a JavaScript library that allows you to create an high
quality justified gallery of images.**

<div align="center">
  <a href="http://miromannino.github.io/Justified-Gallery/" target="_blank">
    <img src="https://img.shields.io/badge/official%20project%20page-visit-2ea44f?style=for-the-badge" alt="Official project page" />
  </a>
</div>

<br/>

This is a common problem for people who create websites: you have a series of
images to display, but you are not sure how to arrange them in an elegant way.
Important websites such as 500px, Flickr, or Google display images in an
excellent way, justifying them similarly to brick wall. Justified Gallery will
give you the power to do that too.

Justified Gallery is a professional and open source library that even 500px, one
of the best photography social network, chose for displaying their images!

<div align="center">

[![npm version](https://img.shields.io/npm/v/justified-gallery?style=for-the-badge)](https://www.npmjs.com/package/justified-gallery)
[![license](https://img.shields.io/npm/l/justified-gallery?style=for-the-badge)](https://github.com/miromannino/Justified-Gallery/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/miromannino/Justified-Gallery?style=for-the-badge)](https://github.com/miromannino/Justified-Gallery/stargazers)

</div>

<div align="center">

[![total downloads](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/miromannino/75ca0785d41059c9a61f37e477609f9c/raw/downloads.json&style=for-the-badge)](#downloads)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gist.githubusercontent.com/miromannino/75ca0785d41059c9a61f37e477609f9c/raw/downloads-chart-dark.svg">
  <img src="https://gist.githubusercontent.com/miromannino/75ca0785d41059c9a61f37e477609f9c/raw/downloads-chart-light.svg" alt="Monthly npm downloads (last 24 months)" width="100%">
</picture>

<em>(combined across <code>justified-gallery</code> and legacy <code>justifiedGallery</code> npm packages)</em>

</div>

## Usage

```ts
import { JustifiedGallery } from 'justified-gallery';
import 'justified-gallery/style.css';

const gallery = document.getElementById('gallery');
const jg = new JustifiedGallery(gallery);
jg.init();

// later, on unmount:
jg.destroy();
```

`JustifiedGallery` is a plain class working against a real `HTMLElement`, so it
integrates the same way in any framework: get a ref to the container, call
`init()` once it's mounted, and call `destroy()` on cleanup. See
[`test/browser/html/react_gallery.tsx`](test/browser/html/react_gallery.tsx)
and [`test/browser/html/vue_gallery.vue`](test/browser/html/vue_gallery.vue)
for working React and Vue examples.

## Contributing

### Important notes

Please don't edit files in the `dist` subdirectory as they are generated via
Vite/TypeScript. You'll find source code in the `src` subdirectory.

#### Code style

Regarding code style like indentation and whitespace, **follow the conventions
you see used in the source already.**

### Modifying the code

- Prerequisites:

  - Node.js
  - `npm install` to install all dependencies.

- Develop:

  - `npm run dev` starts a Vite dev server against `test/browser`, serving the
    source directly (no build step needed while iterating). In this mode
    `/text/browser/html` pages can be explored. These are the same pages used by
    the e2e tests.

- Build:

  - `npm run build` compiles the library for distribution: bundles `src/justified-gallery.ts`
    with Vite into `dist/justified-gallery.js` and
    `dist/assets/justified-gallery.css`, and emits type declarations
    (`dist/*.d.ts`) with `tsc`.
  - `npm run preview` serves the built `dist` output locally.

- Test:

  - `npm test` runs the full suite (unit tests, then browser/e2e tests).
  - `npm run test:unit` runs the Vitest unit tests in `test/unit`.
  - `npm run test:e2e` runs the Playwright browser tests in `test/browser`.

- Try the built package as a real npm dependency:
  - `scripts/test-local-package.sh` builds the library, `npm link`s it, and
    links/serves it from `sandbox-consumer/` (a throwaway, gitignored Vite
    project) — useful to confirm the published package resolves and works the
    way a downstream consumer would experience it.

### Submitting pull requests

- Create a new branch, please don't work in your `master` branch directly.
- Add failing tests for the change you want to make.
- Fix stuff.
- Ensure that the written tests don't fail anymore, as well as the other tests.
- Update the documentation to reflect any changes.
- Push to your fork and submit a pull request.
