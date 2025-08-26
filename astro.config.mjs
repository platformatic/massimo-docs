// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Massimo',
			description: 'Generate typed HTTP clients for your OpenAPI and GraphQL APIs',
			logo: {
				light: './src/assets/platformatic-logo-light.svg',
				dark: './src/assets/platformatic-logo-dark.svg',
				alt: 'Platformatic'
			},
			customCss: [
				'./src/styles/custom.css',
			],
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/platformatic/massimo' 
				},
				{
					icon: 'discord',
					label: 'Discord',
					href: 'https://discord.com/invite/platformatic',
				},
			],
			sidebar: [
				{
					label: 'Overview',
					link: '/',
				},
				{
					label: 'Getting Started',
					link: '/getting-started/',
				},
				{
					label: 'Reference',
					items: [
						{ label: 'CLI Reference', link: '/reference/overview/' },
						{ label: 'Frontend Client', link: '/reference/frontend/' },
						{ label: 'Programmatic API', link: '/reference/programmatic/' },
						{ label: 'Error Reference', link: '/reference/errors/' },
					],
				},
			],
		}),
	],
});
