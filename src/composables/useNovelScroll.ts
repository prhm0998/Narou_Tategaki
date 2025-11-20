// useNovelScroll.ts

import { flexibleClamp, getFixedElementsTotalHeight, scrollWithFixedOffset, smoothScroll } from '@prhm0998/shared/utils'
import { useThrottleFn } from '@vueuse/core'
import type { Ref } from 'vue'

export function useNovelScroll(pNovelRef: Ref<HTMLElement | null>) {

  const { state: userOption } = useUserOption()

  // 行移動の管理用
  const linesSet = ref(new Set<HTMLElement>())
  const lines = computed(() => [...linesSet.value])
  const addLine = (el: HTMLElement) => linesSet.value.add(el)

  const lastKnownFirstIndex = ref<number | undefined>(undefined) // startSearchIndexに利用
  const lastKnownStep = ref<number>(1) // stepに利用 (デフォルトは1)

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

  function runSearch(startSearchIndex?: number, step?: number): [number, number] | null {
    return getVisibleRowRange({
      startSearchIndex,
      step,
    })
  }

  async function scrollToTargetRow(direction: 1 | -1, amount?: number | null) {
    let search = runSearch(lastKnownFirstIndex.value, lastKnownStep.value)

    if (!search && lastKnownStep.value > 1) {
      search = runSearch(lastKnownFirstIndex.value)
    }

    if (!search) {
      return
    }

    const [first, last] = search
    lastKnownFirstIndex.value = first
    lastKnownStep.value = flexibleClamp(Math.floor((last - first) / 2), { min: 1 })

    let targetIndex: number
    // 現在は end=ページ戻りの判定用, 将来的にscroll後のターゲットの位置の指定にするつもり
    let block: 'start' | 'end'

    const linesArray = lines.value // DOM要素の配列

    if (amount) {
      targetIndex = flexibleClamp(first + amount, {
        min: 0,
        max: linesArray.length - 1,
      })
      block = 'start'
    }

    else {
      if (direction === 1) {
        targetIndex = flexibleClamp(last + 1, {
          min: 0,
          max: linesArray.length - 1,
        })
        block = 'start'
      }
      else {
        targetIndex = flexibleClamp(first - 1, {
          min: 0,
          max: linesArray.length - 1,
        })
        block = 'end'
      }
    }

    // スクロール移動の間の要素にタイトルがあればそこをtargetにする
    if (block === 'start' && first !== targetIndex) {
      if (direction === 1) {
        for (let i = first + 1; i <= targetIndex - 1; i++) {
          if (i < 0 || i >= linesArray.length) break // 配列の範囲外チェック
          const element = linesArray[i]
          if (element.tagName === 'H1') {
            targetIndex = i
            break
          }
        }
      }
      else if (direction === -1) {
        for (let i = first - 1; i >= targetIndex + 1; i--) {
          if (i < 0 || i >= linesArray.length) break // 配列の範囲外チェック
          const element = linesArray[i]
          if (element.tagName === 'H1') {
            targetIndex = i
            break
          }
        }

      }
    }

    if (pNovelRef.value) {
      performHorizontalScroll(pNovelRef.value, linesArray[targetIndex], block)
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

  interface VisibleRangeOptions {
    /** 探索開始のヒントとなるインデックス */
    startSearchIndex?: number
    /** 通常探索時のインクリメント量 (デフォルト: 1) */
    step?: number
  }

  /**
   * 連続した可視/非可視要素の配列から
   * [最初に見えている要素のindex, 最後に見えている要素のindex] を返します
   *
   * 配列中の可視要素は連続した一つの塊のみであることを前提とします
   */
  function getVisibleRowRange(options: VisibleRangeOptions = {}): [number, number] | null {
    const n = lines.value.length
    if (n === 0) return null

    const { startSearchIndex, step = 1 } = options

    // --- Phase 1: 起点（最初に見つかる見えている要素）の探索 ---
    let pivotIndex: number | null = null

    // 1-A. 指定されたインデックスの判定
    if (typeof startSearchIndex === 'number' && startSearchIndex >= 0 && startSearchIndex < n) {
      const target = lines.value[startSearchIndex]
      if (isElementInView(target, { ignoreVertical: true })) {
        pivotIndex = startSearchIndex
      }
    }

    // 1-B. 通常の探索（ヒントで見つからなかった場合）
    if (pivotIndex === null) {
      // step数ごとに飛ばして探索
      for (let i = 0; i < n; i += step) {
        const current = lines.value[i]
        if (isElementInView(current, { ignoreVertical: true })) {
          pivotIndex = i
          break
        }
      }
    }

    // 見えている要素がひとつも見つからなければ null を返す
    if (pivotIndex === null) return null

    // --- Phase 2: 起点から前後への範囲拡大 ---

    // 2-A. マイナス方向への探索（firstVisibleIndexの確定）
    let firstVisibleIndex = pivotIndex
    // 起点の1つ前から逆順にチェック
    for (let i = pivotIndex - 1; i >= 0; i--) {
      const current = lines.value[i]
      if (isElementInView(current, { ignoreVertical: true })) {
        firstVisibleIndex = i
      }
      else {
        // 見えなくなったらそこで終了（それより前も見えないはず）
        break
      }
    }

    // 2-B. プラス方向への探索（lastVisibleIndexの確定）
    let lastVisibleIndex = pivotIndex
    // 起点の1つ後ろから順にチェック
    for (let i = pivotIndex + 1; i < n; i++) {
      const current = lines.value[i]
      if (isElementInView(current, {
        ignoreVertical: true,
        minHorizontalRatio: 0.8, // 以前と同様、最後尾は甘めに判定
      })) {
        lastVisibleIndex = i
      }
      else {
        // 見えなくなったらそこで終了
        break
      }
    }

    return [firstVisibleIndex, lastVisibleIndex]
  }

  return {
    attachNovelEvents,
    addLine,
  }
}
