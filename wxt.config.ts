import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue', '@wxt-dev/auto-icons'],

  vite: () => {
    const isProd = process.env.NODE_ENV === 'production'
    return {
      minify: 'esbuild',
      esbuild: {
        drop: isProd ? ['console', 'debugger'] : [],
      },
      plugins: [
        tailwindcss(),
      ],
    };
  },

  manifest: () => ({
    permissions: ['storage'],
    name: import.meta.env.WXT_EXT_NAME,
    description: import.meta.env.WXT_EXT_DESC,
  }),
});
