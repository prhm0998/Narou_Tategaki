// useNovelModifier.ts

import { waitElement } from '@1natsu/wait-element'
import { latinToZenkaku, sleep, traverseTextNodes } from '@prhm0998/shared/utils'
import { watch, ref, Ref } from 'vue'
import { useNovelScroll } from './useNovelScroll' // 新しいComposablesをインポート
import type { UserOption } from './useUserOption'
import { useAutoPagerizeObserver } from '@/composables/useAutoPageriseObserver'

export function useNovelModifier(optionRef: Ref<UserOption>) {
  const pNovel = ref<HTMLElement | null>(null)
  const { attachNovelEvents } = useNovelScroll(pNovel, optionRef)
  const { setupObserver, resumeObserver } = useAutoPagerizeObserver(pNovel, optionRef)

  /** ページロード時の一連のコンテンツ操作を実行する */
  async function modifyContents() {
    // l-main のスタイルをすぐに適用（待機関数はDOMユーティリティ内から削除し、こちらで待つ）
    const lMain = await waitElement('main.l-main') as HTMLElement | null
    if (lMain) {
      updateLmainStyle(lMain)
    }

    // 本文要素の取得
    pNovel.value = (await waitElement('.p-novel')) as HTMLElement | null
    if (!pNovel.value) {
      return
    }

    await sleep(1) // 以前のコメント通り、少し待機

    // 💡 変更: DOM操作ユーティリティに optionRef.value を渡す
    updateHonbunStyles(pNovel.value, optionRef.value)
    moveTocToEnd(pNovel.value)
    handleOnloadOptions(pNovel.value, optionRef.value)

    // イベント設定
    attachNovelEvents()
    setupAutoPagerize()
    setupObserver()
  }

  // ----------------------------------------------------
  // 💡 将来的にオプションの反映箇所をリアクティブにする
  // ----------------------------------------------------

  // 1. viewportHeight と expandHeight の監視
  watch(
    [() => optionRef.value.viewportHeight, () => optionRef.value.expandHeight],
    () => {
      if (pNovel.value) {
        // 変更があったらスタイルを再適用
        updateHonbunStyles(pNovel.value, optionRef.value)
      }
    },
    { deep: true, immediate: true } // immediate: true で初期反映も兼ねる
  )

  /** AutoPagerize 対応：追加本文を縦書き要素に結合し、オプションを適用する */
  function setupAutoPagerize() {
    // 💡 オプションのチェックはリスナーの起動時ではなく、イベント発生時に行う

    addEventListener('AutoPagerize_DOMNodeInserted', ((e: CustomEvent) => { // CustomEventとして扱う
      console.info('AutoPagerize_DOMNodeInserted')
      // 💡 イベントリスナーは、常に useNovelModifier のスコープ内で定義し、
      //    pNovel.value がセットされているかチェック
      if (!pNovel.value || !optionRef.value.autoPagerizer) return // pNovelがないか、オプションが無効なら処理しない

      const el = e.target
      if (!(el instanceof HTMLElement)) return

      // 追加された要素から本文を探す
      const novel = el.matches('article.p-novel')
        ? el
        : el.querySelector('article.p-novel')

      if (!novel) return

      // 必要な子要素を取得
      const pager = novel.querySelector('.c-pager')
      const siori = novel.querySelector('.p-novel__number')
      const title = novel.querySelector('.p-novel__title')
      const body = novel.querySelector('.p-novel__body')

      if (pager && siori && title && body) {

        // 💡 既存ロジックを再現
        // しおりの変換はオプションに関わらず実行？ (元のコードを再現)
        traverseTextNodes(siori, latinToZenkaku)

        // 本文の変換はオプションに依存
        if (optionRef.value.latinToZen) {
          traverseTextNodes(body, latinToZenkaku)
        }

        // pNovel（元の本文コンテナ）に新しい要素を追記
        pNovel.value.append(siori, title, body, pager)

        //
        resumeObserver()
      }
    }) as EventListener) // EventListenerとしてキャストして警告を回避
  }

  return {
    modifyContents,
    pNovel,
  }
}