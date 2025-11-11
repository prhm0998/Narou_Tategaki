export function scrollVerticalAmountToElement(scrollEl: HTMLElement, targetEl: HTMLElement, blockOption: string): number {
  // 1. 基本となる差分を計算（ターゲットがコンテナ上端から現在どれだけ離れているか）
  const targetTop = targetEl.getBoundingClientRect().top
  const scrollContainerTop = scrollEl.getBoundingClientRect().top
  const distanceToStart = targetTop - scrollContainerTop

  // 2. 基本の TargetScrollTop (block: 'start' の値)
  let targetScrollTop = scrollEl.scrollTop + distanceToStart

  // 3. blockオプションに基づき、補正値を計算
  switch (blockOption) {
    case 'start':
      // 補正なし
      break

    case 'end':
      {
        const heightDiffEnd = scrollEl.offsetHeight - targetEl.offsetHeight
        // スクロールコンテナの高さ - ターゲットの高さ分だけ、上に巻き戻す
        targetScrollTop -= heightDiffEnd
        break
      }

    case 'center':
      {
        const halfHeightDiffCenter = (scrollEl.offsetHeight / 2) - (targetEl.offsetHeight / 2)
        // スクロールコンテナの半分の高さ - ターゲットの半分の高さ分だけ、上に巻き戻す
        targetScrollTop -= halfHeightDiffCenter
        break
      }

    default:
      console.error(`無効な blockOption: ${blockOption}`)
      return scrollEl.scrollTop // 無効な場合は現在の値を返す
  }

  // スクロールの境界チェック（スクロール可能な範囲内に収める）
  const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight
  targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll))

  return targetScrollTop
}