// useNovelScroll.ts

import { useThrottleFn } from '@vueuse/core'
import { Ref } from 'vue'
import type { UserOption } from './useUserOption'

// スムーススクロール関数 (変更なし)
const smoothScroll = (
  honbun: HTMLElement,
  target: number,
  duration = 300,
  maxAmountPerFrame = 100
) => {
  // ... 既存の smoothScroll ロジック ...
  const start = honbun.scrollLeft
  const distance = target - start
  const startTime = performance.now()
  let lastFrameTime = startTime

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const deltaTime = currentTime - lastFrameTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = 1 - (1 - progress) * (1 - progress)
    const idealPosition = start + distance * easedProgress

    const maxAmount = (maxAmountPerFrame / 100) * deltaTime
    const actualMove = Math.min(
      Math.abs(idealPosition - honbun.scrollLeft),
      maxAmount
    )

    if (idealPosition > honbun.scrollLeft) {
      honbun.scrollLeft += actualMove
    }
    else {
      honbun.scrollLeft -= actualMove
    }

    lastFrameTime = currentTime

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

/**
 * 本文のカスタムスクロールとイベント処理を提供するComposables
 * @param pNovelRef 本文要素のRef
 * @param optionRef ユーザーオプションのRef
 */
export function useNovelScroll(pNovelRef: Ref<HTMLElement | null>, optionRef: Ref<UserOption>) {

  // スムーススクロールのロジックをスロットル化
  const throttledSmoothScroll = useThrottleFn(
    (honbun: HTMLElement, moving: number) => {
      smoothScroll(honbun, moving)
    },
    300
  )

  function onWheelScroll(e: WheelEvent) {
    const pNovel = pNovelRef.value
    if (!pNovel) return

    // optionRef.value を参照
    const movelr = e.deltaY > 0 ? -1 : 1
    const amount: number = optionRef.value.wheelReverse
      ? optionRef.value.scrollAmount
      : -optionRef.value.scrollAmount

    const moving = pNovel.scrollLeft - amount * movelr
    throttledSmoothScroll(pNovel, moving)
    e.preventDefault()
  }

  function onDoubleClick(e: Event) {
    const pNovel = pNovelRef.value
    if (!pNovel) return

    // dblclick でスクロールをリセット
    pNovel.scrollIntoView({ inline: 'start', behavior: 'smooth' })
    e.preventDefault()
  }

  /** イベントリスナーを本文要素にアタッチする */
  function attachNovelEvents() {
    const pNovel = pNovelRef.value
    if (!pNovel) return
    pNovel.addEventListener('wheel', onWheelScroll as EventListener)
    pNovel.addEventListener('dblclick', onDoubleClick)
  }

  // イベント削除用のcleanup関数も提供すると良いですが、ここでは省略します。

  return {
    attachNovelEvents,
    onWheelScroll, // 必要なら公開
  }
}