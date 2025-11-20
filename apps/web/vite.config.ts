import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [tsconfigPaths(), tailwindcss(), tanstackStart(), viteReact()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Only chunk vendor libraries, not React (which is external in SSR)
					if (id.includes('node_modules')) {
						if (id.includes('@tanstack')) {
							return 'tanstack-vendor';
						}
						if (id.includes('@trpc')) {
							return 'trpc-vendor';
						}
						// Other node_modules go into vendor chunk
						if (!id.includes('react') && !id.includes('react-dom')) {
							return 'vendor';
						}
					}
				},
			},
		},
	},
});
