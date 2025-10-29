// useNovelScroll.ts

import { useThrottleFn } from '@vueuse/core'
import type { Ref } from 'vue'
import type { UserOption } from './useUserOption'
import { getFixedElementsTotalHeight, scrollWithFixedOffset, smoothScroll } from '@prhm0998/shared/utils'
import { useWindowScrollLock } from '@prhm0998/shared/composables'

/**
 * 本文のカスタムスクロールとイベント処理を提供するComposables
 * @param pNovelRef 本文要素のRef
 * @param optionRef ユーザーオプションのRef
 */
export function useNovelScroll(pNovelRef: Ref<HTMLElement | null>, optionRef: Ref<UserOption>) {
  /**
   * 横書き領域のスクロールは前提がややこしいので注意
   * まず、右から左←へスクロールするとき要素の座標はマイナス方向に進みます
   * つまり、マウスホイール/スクロールなどで"進む"ときは座標に対して負の値を加算します
   * 逆に"戻る"ときは座標に対して正の値を加算します
   */
  const { lockScroll, unlockScroll } = useWindowScrollLock()

  // スムーススクロールのロジックをスロットル化
  const throttledSmoothScroll = useThrottleFn(
    async (el: HTMLElement, amount: number) => {
      await smoothScroll(el, amount, {
        direction: 'horizontal',
        mode: 'speed',
        speedPerMs: 20,
        timeout: 2000,
        onStart: () => lockScroll(),
        onFinish: () => unlockScroll(),
      })
    },
    200
  )

  function onWheelScroll(el: HTMLElement) {
    return function (e: WheelEvent) {
      const { wheelReverse, scrollAmount } = optionRef.value
      const direction = e.deltaY > 0 ? 1 : -1
      const baseAmount = wheelReverse ? scrollAmount : -scrollAmount
      const amount = baseAmount * direction
      throttledSmoothScroll(el, amount)
      e.preventDefault()
    }
  }

  function onDoubleClick(el: HTMLElement) {
    return async function (e: Event) {
      e.preventDefault()
      scrollWithFixedOffset(el, getFixedElementsTotalHeight())
    }
  }
  function attachNovelEvents() {
    const pNovel = pNovelRef.value
    if (!pNovel) return
    pNovel.addEventListener('wheel', onWheelScroll(pNovel))
    pNovel.addEventListener('dblclick', onDoubleClick(pNovel))
  }

  return {
    attachNovelEvents,
    // onWheelScroll, // 必要なら公開
  }
}
