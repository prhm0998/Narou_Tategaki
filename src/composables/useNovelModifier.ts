// useNovelModifier.ts

import { waitElement } from '@1natsu/wait-element'
import { latinToZenkaku, sleep, traverseTextNodes } from '@prhm0998/shared/utils'
import { watch, ref, type Ref } from 'vue'
import { useNovelScroll } from './useNovelScroll' // 新しいComposablesをインポート
import type { UserOption } from './useUserOption'
import { useEdgeScrollObserver, useWindowScrollLock } from '@prhm0998/shared/composables'

export function useNovelModifier(optionRef: Ref<UserOption>) {
  const pNovel = ref<HTMLElement | null>(null)
  const { attachNovelEvents } = useNovelScroll(pNovel, optionRef)
  const { setupObserver, resumeObserver } = useEdgeScrollObserver(pNovel, 'horizontal', 500, scrollToBottomAndBack)
  const { lockScroll, unlockScroll } = useWindowScrollLock()

  /** ページロード時の一連のコンテンツ操作を実行する */
  async function modifyContents() {
    // l-main のスタイルをすぐに適用
    const lMain = await waitElement<HTMLElement>('main.l-main')
    if (lMain) {
      updateLmainStyle(lMain)
    }

    // 本文要素の取得
    pNovel.value = (await waitElement<HTMLElement>('.p-novel'))
    if (!pNovel.value) {
      return
    }

    await sleep(1) //optionの取得待ち時間

    // 💡 DOM操作
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

  /** ウィンドウを最下部にスクロールし、すぐに元の位置に戻す autoPagerizeを反応させる */
  async function scrollToBottomAndBack() {
    if (!optionRef.value.autoPagerizer) return
    // 💡 実行前にウィンドウのスクロールをロック
    lockScroll()
    const originalY = window.scrollY
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    setTimeout(() => {
      window.scrollTo({ top: originalY, behavior: 'instant' })
    }, 0)
    setTimeout(() => {
      unlockScroll()
    }, 0)
  }

  /** AutoPagerize 対応：追加本文を縦書き要素に結合し、オプションを適用する */
  function setupAutoPagerize() {
    addEventListener('AutoPagerize_DOMNodeInserted', ((e: CustomEvent) => { // CustomEventとして扱う
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
        if (optionRef.value.latinToZen) {
          traverseTextNodes(siori, latinToZenkaku)
          traverseTextNodes(body, latinToZenkaku)
        }
        pNovel.value.append(siori, title, body, pager)
      }
      resumeObserver()
    }) as EventListener) // EventListenerとしてキャストして警告を回避
  }

  return {
    modifyContents,
    pNovel,
  }
}