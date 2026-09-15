// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://miromannino.github.io',
	base: '/Justified-Gallery',
	// Root `dist/` is reserved for the separate library-development workspace
	// (see .gitignore) — build the site into `_site/` instead.
	outDir: './_site',
	integrations: [
		starlight({
			title: 'Justified Gallery',
			description:
				'Justified Gallery is a JavaScript library that allows you to create a high quality justified gallery of images, similar to the ones used by 500px, Flickr, or Google.',
			favicon: '/favico.png',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/miromannino/Justified-Gallery',
				},
			],
			customCss: ['./src/styles/custom.css'],
			components: {
				Head: './src/components/Head.astro',
				SocialIcons: './src/components/SocialIcons.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			sidebar: [
				{
					label: 'Documentation',
					items: [
						{ label: 'Getting Started', slug: 'getting-started' },
						{ label: 'Options and Events', slug: 'options-and-events' },
						{ label: 'Infinite Scroll', slug: 'endless-scroll' },
						{ label: 'Lightboxes', slug: 'lightboxes' },
						{ label: 'Input Formats', slug: 'input-formats' },
						{ label: 'Captions', slug: 'captions' },
					],
				},
				{
					label: 'Advanced Topics',
					items: [
						{ label: 'Performance Tips', slug: 'performance-tips' },
						{ label: 'Errors Handling', slug: 'errors-handling' },
					],
				},
			],
		}),
	],
});
