import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/i18n/module', '@wxt-dev/module-vue', '@wxt-dev/auto-icons'],

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
    name: '__MSG_name__',
    description: '__MSG_description__',
    default_locale: 'ja',
  }),
});
