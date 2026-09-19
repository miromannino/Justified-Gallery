// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const base = "/Justified-Gallery";

export default defineConfig({
  site: "https://miromannino.github.io",
  base,
  outDir: "./_site",
  integrations: [
    starlight({
      title: "Justified Gallery",
      description:
        "Justified Gallery is a JavaScript library that allows you to create a high quality justified gallery of images, similar to the ones used by 500px, Flickr, or Google.",
      favicon: "/favicon.svg",
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            sizes: "192x192",
            href: `${base}/favicon-192.png`,
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: `${base}/apple-touch-icon.png`,
          },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/miromannino/Justified-Gallery",
        },
      ],
      customCss: ["./src/styles/custom.css"],
      components: {
        Head: "./src/components/Head.astro",
        SocialIcons: "./src/components/SocialIcons.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      sidebar: [
        {
          label: "Documentation",
          items: [
            { label: "Getting Started", slug: "getting-started" },
            { label: "Options and Events", slug: "options-and-events" },
            { label: "Infinite Scroll", slug: "endless-scroll" },
            { label: "Lightboxes", slug: "lightboxes" },
            { label: "Input Formats", slug: "input-formats" },
            { label: "Captions", slug: "captions" },
          ],
        },
        {
          label: "Advanced Topics",
          items: [
            { label: "Performance Tips", slug: "performance-tips" },
            { label: "Errors Handling", slug: "errors-handling" },
          ],
        },
      ],
    }),
  ],
});
