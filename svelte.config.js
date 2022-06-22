import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import nodePolyfills from "rollup-plugin-polyfill-node";

const production = process.env.NODE_ENV === "production";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		
		postcss: true,
	}),

	kit: {
		adapter: adapter(),
		vite: {
			plugins: [
				// ↓ Needed for development mode
				!production &&
				nodePolyfills({
					include: ["node_modules/**/*.js", new RegExp("node_modules/.vite/.*js")]
				})
			],

			build: {
				rollupOptions: {
					plugins: [
						// ↓ Needed for build
						nodePolyfills()
					]
				},
				// ↓ Needed for build if using WalletConnect and other providers
				commonjsOptions: {
					transformMixedEsModules: true
				}
			}
		}
	}
};

export default config;
