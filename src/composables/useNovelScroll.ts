// useNovelScroll.ts

import { flexibleClamp, getFixedElementsTotalHeight, scrollWithFixedOffset, smoothScroll } from '@prhm0998/shared/utils'
import { useThrottleFn } from '@vueuse/core'
import type { Ref } from 'vue'

export function useNovelScroll(pNovelRef: Ref<HTMLElement | null>) {

  const { state: userOption } = useUserOption()

  // 行移動の管理用
  const novelRowsSet = ref(new Set<HTMLElement>())
  const novelRows = computed(() => [...novelRowsSet.value])
  const insertRowElm = (el: HTMLElement) => novelRowsSet.value.add(el)

  function attachNovelEvents() {
    const pNovel = pNovelRef.value
    if (!pNovel) return

    const wheelHandler = onWheelScroll()
    const dblClickHandler = onDoubleClick(pNovel)
    const keyHandler = onKeyScroll()

    pNovel.addEventListener('wheel', wheelHandler)
    pNovel.addEventListener('dblclick', dblClickHandler)
    window.addEventListener('keydown', keyHandler)
  }

  function onDoubleClick(el: HTMLElement) {
    return async function (e: Event) {
      e.preventDefault()
      scrollWithFixedOffset(el, getFixedElementsTotalHeight())
    }
  }

  function onWheelScroll() {
    return function (e: WheelEvent) {
      const { wheelReverse, wheelScrollLines, wheelCtrlSwap } = userOption.value
      const isScrollDown = e.deltaY > 0
      const isCtrl = e.ctrlKey

      const direction = wheelReverse
        ? isScrollDown ? -1 : 1   // 反転: 下スクロールで-1, 上スクロールで1
        : isScrollDown ? 1 : -1    // 通常: 下スクロールで1, 上スクロールで-1

      const isSwappedCtrl = wheelCtrlSwap ? !isCtrl : isCtrl

      // amount=nullはページ送り
      const amount = isSwappedCtrl ? null : wheelScrollLines * direction

      throttledScrollToRow(direction, amount)

      e.preventDefault()
    }
  }

  function onKeyScroll() {
    return function (e: KeyboardEvent) {

      const { arrowScrollLines, arrowCtrlSwap } = userOption.value

      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const direction = e.key === 'ArrowLeft' ? 1 : -1

      const isCtrl = e.ctrlKey

      const isSwappedCtrl = arrowCtrlSwap ? !isCtrl : isCtrl

      const amount = isSwappedCtrl ? null : arrowScrollLines * direction

      throttledScrollToRow(direction, amount)

      e.preventDefault()
    }
  }

  const throttledScrollToRow = useThrottleFn(async (...args: Parameters<typeof scrollToTargetRow>) => {
    await scrollToTargetRow(...args)
  }, 200)

  async function scrollToTargetRow(direction: 1 | -1, amount?: number | null) {
    const search = getVisibleRowRange()
    if (!search) {
      return
    }

    let targetIndex: number
    // 現在は end=ページ戻りの判定用, 将来的にscroll後のターゲットの位置の指定にするつもり
    let block: 'start' | 'end'

    if (amount) {
      const [first] = search
      targetIndex = flexibleClamp(first + amount, {
        min: 0,
        max: novelRows.value.length - 1,
      })
      block = 'start'
    }

    else {
      if (direction === 1) {
        const [, last] = search
        targetIndex = flexibleClamp(last + 1, {
          min: 0,
          max: novelRows.value.length - 1,
        })
        block = 'start'
      }
      else {
        const [first] = search
        targetIndex = flexibleClamp(first - 1, {
          min: 0,
          max: novelRows.value.length - 1,
        })
        block = 'end'
      }
    }

    if (pNovelRef.value) {
      performHorizontalScroll(pNovelRef.value, novelRows.value[targetIndex], block)
    }
  }

  async function performHorizontalScroll(outer: HTMLElement, target: HTMLElement, block: 'start' | 'end') {
    if (block === 'start') {
      /**
       * scrollElement, targetElementから移動量を計算します
      */
      const leftDistance = outer.offsetWidth - target.getBoundingClientRect().right
      smoothScroll(outer, leftDistance * -1, {
        mode: 'duration',
        duration: 10,
        direction: 'horizontal',
      })
    }
    else {
      // 「1ページ分戻る」はスクロールエリアのサイズ分戻る
      smoothScroll(outer, outer.offsetWidth, {
        mode: 'duration',
        duration: 10,
        direction: 'horizontal',
      })

    }
  }

  /**
   * 連続した可視/非可視要素の配列から
   * [最初に見えている要素のindex, 最後に見えている要素のindex] を返します
   *
   * 配列中の可視要素は連続した一つの塊であることを前提とします
   */
  function getVisibleRowRange(): [number, number] | null {
    const n = novelRows.value.length
    if (n === 0) return null

    let startIndex = 0

    // 最初に見えている要素のindexの探索
    let firstVisibleIndex = null
    for (let i = startIndex; i < n; i++) {
      const current = novelRows.value[i]
      if (isElementInView(current, {
        ignoreVertical: true,
      })) {
        firstVisibleIndex = i
        break
      }
    }

    if (firstVisibleIndex === null) return null

    // 最後に見えている要素のindexの探索
    let lastVisibleIndex = firstVisibleIndex
    for (let i = firstVisibleIndex; i < n; i++) {
      const current = novelRows.value[i]
      if (isElementInView(current, {
        // 最後の行は大体8割見えていれば読めるため、水平方向は甘めに判定する
        ignoreVertical: true,
        minHorizontalRatio: 0.8,
      })) {
        lastVisibleIndex = i
      }
      else {
        break
      }
    }
    return [firstVisibleIndex, lastVisibleIndex]
  }

  return {
    attachNovelEvents,
    insertRowElm,
  }
}
