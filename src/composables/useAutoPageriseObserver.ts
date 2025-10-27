// useAutoPagerizeObserver.ts (最終修正版)

import { Ref } from 'vue'
import type { UserOption } from './useUserOption'

const THRESHOLD = 500
let isWaitingForNextPage = false
// 💡 ウィンドウのスクロール操作のロックフラグ
let isScrollLocked = false

/**
 * 縦書き本文の横スクロールを監視し、終端到達を検知するComposables
 */
export function useAutoPagerizeObserver(
  pNovelRef: Ref<HTMLElement | null>,
  optionRef: Ref<UserOption>
) {
  /** 💡 ウィンドウ全体のスクロールイベントを無効化するハンドラ */
  const preventWindowScroll = (e: Event) => {
    if (isScrollLocked) {
      // スクロール操作を防ぐ
      e.preventDefault()
      e.stopPropagation()
      // スクロールイベントが発生しても処理しない
      return false
    }
  }

  /** スクロール操作を一時的にロックする */
  function lockScroll() {
    isScrollLocked = true

    // ユーザーのスクロール操作をキャプチャして無効化
    // 💡 passive: false にして preventDefault を可能にする
    window.addEventListener('scroll', preventWindowScroll, { capture: true, passive: false })
    window.addEventListener('wheel', preventWindowScroll, { capture: true, passive: false })
    window.addEventListener('touchmove', preventWindowScroll, { capture: true, passive: false })
  }

  /** スクロールロックを解除する */
  function unlockScroll() {
    isScrollLocked = false

    // リスナーを解除
    window.removeEventListener('scroll', preventWindowScroll, { capture: true })
    window.removeEventListener('wheel', preventWindowScroll, { capture: true })
    window.removeEventListener('touchmove', preventWindowScroll, { capture: true })
  }

  /** ウィンドウを最下部にスクロールし、すぐに元の位置に戻す */
  function scrollToBottomAndBack() {
    // 💡 実行前にウィンドウのスクロールをロック
    lockScroll()

    const originalY = window.scrollY

    // 1. 最下部にスクロール (AutoPagerizeの発動トリガー)
    //    この window.scrollTo() 操作は、lockScroll() の制御下ではないため、実行されます。
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })

    setTimeout(() => {
      window.scrollTo({ top: originalY, behavior: 'instant' })
    }, 0)
    setTimeout(() => {
      unlockScroll()
    }, 0)
  }

  /** スクロールイベントハンドラ (pNovel用) */
  const onNovelScroll = () => {
    const pNovel = pNovelRef.value

    // 💡 isScrollLocked のチェックは不要 (ウィンドウレベルで処理されるため)
    //    ただし、ここでは念の為、二重ロックを防ぐための isWaitingForNextPage のチェックのみ
    if (!pNovel || isWaitingForNextPage || !optionRef.value.autoPagerizer) {
      return
    }

    // ... (終端到達の判定ロジックはそのまま) ...
    const scrollAmount = pNovel.scrollLeft
    const maxScroll = pNovel.scrollWidth - pNovel.clientWidth
    const currentScrollPosition = Math.abs(scrollAmount)
    const distanceToContentEnd = maxScroll - currentScrollPosition

    if (distanceToContentEnd < THRESHOLD) {
      isWaitingForNextPage = true

      scrollToBottomAndBack()
    }
  }

  /** 監視を再開 (AutoPagerize_DOMNodeInserted イベント処理後に呼び出す) */
  const resumeObserver = () => {
    isWaitingForNextPage = false
  }

  /** スクロール監視の開始 (pNovel用) */
  const setupObserver = () => {
    const pNovel = pNovelRef.value
    if (!pNovel) return

    // pNovel へのイベントリスナーはそのまま残す
    pNovel.addEventListener('scroll', onNovelScroll, { passive: true })
  }

  /** クリーンアップロジック */
  const cleanupObserver = () => {
    const pNovel = pNovelRef.value
    if (pNovel) {
      pNovel.removeEventListener('scroll', onNovelScroll)
    }
    // コンポーネントが破棄されるときのために、念の為ロックを解除
    unlockScroll()
  }

  return {
    setupObserver,
    cleanupObserver,
    resumeObserver,
  }
}