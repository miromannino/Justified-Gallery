// Shared client script for the live gallery demos. Any element with a
// `data-jg` attribute gets a JustifiedGallery instance built from the JSON
// options in that attribute; `data-lightbox` additionally wires GLightbox
// to the entry links of that gallery.

import { JustifiedGallery } from 'justified-gallery';
import 'justified-gallery/style.css';
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import { sizeRangeSuffixes } from '../data/images';

const initialized = new WeakSet<HTMLElement>();

function initAll() {
  document.querySelectorAll<HTMLElement>('[data-jg]').forEach((el) => {
    if (initialized.has(el)) return;
    initialized.add(el);
    const options = JSON.parse(el.dataset.jg || '{}');
    new JustifiedGallery(el, { sizeRangeSuffixes, ...options }).init();
    if (el.dataset.lightbox !== undefined && el.id) {
      GLightbox({ selector: `#${el.id} a` });
    }
  });
}

initAll();
document.addEventListener('astro:page-load', initAll);
