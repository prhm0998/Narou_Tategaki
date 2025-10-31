import { waitElement } from '@1natsu/wait-element'
import { createApp } from 'vue'

import App from './App.vue'

export default defineContentScript({
  //https://ncode.syosetu.com/n9669bk/2/
  matches: [
    '*://*.syosetu.com/*',
  ],
  async main(ctx) {
    /**
     * 小説のページを判定
     * /^https:\/\/(?:[\w-]+\.)?syosetu\.com\/n[\w-]+\/\d+\/?$/
     */
    if (!(location.hostname === 'ncode.syosetu.com')) return //この判定をしなければ同じ系列のサイトも対象になるが、動作確認してないのでナシ
    const paths = (location.pathname.split('/').filter(n => n))
    if (!paths.length) return
    if (!/^n/.test(paths[0])) return

    /**
     * 単発小説の場合URLのみでは判断がつかないため、それっぽい要素を探索する
     */
    const body = await waitElement('.p-novel__body', { signal: AbortSignal.timeout(2000) })
      .catch(null)
    if (!body) return
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const app = createApp(App, {
          ctx,
        })
        app.mount(container)
        return app
      },
      onRemove: (app) => {
        if (app) {
          app.unmount()
        }
      },
    })
    ui.mount()
  },
})