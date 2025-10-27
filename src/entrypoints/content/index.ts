import { createApp } from 'vue'
import App from './App.vue'
export default defineContentScript({
  //https://ncode.syosetu.com/n9669bk/2/
  matches: [
    '*://*.syosetu.com/*',
  ],
  main(ctx) {
    const syosetuPattern = new RegExp(/^https:\/\/(?:[\w-]+\.)?syosetu\.com\/n[\w-]+\/\d+\/?$/)
    // 小説以外のURL(トップページなど)は弾く
    if (!syosetuPattern.test(location.href)) return
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        // Create the app and mount it to the UI container
        const app = createApp(App, {
          ctx,
        })
        app.mount(container)
        return app
      },
      onRemove: (app) => {
        // Unmount the app when the UI is removed
        if (app) {
          app.unmount()
        }
      },
    })
    // Call mount to add the UI to the DOM
    ui.mount()
  },
})