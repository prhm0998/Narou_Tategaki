export function scrollHorizontalAmountToElement(scrollEl: HTMLElement, targetEl: HTMLElement, inlineOption: string) {
  const isRtl = getComputedStyle(scrollEl).direction === 'rtl'

  // スクロール可能な最大幅（常に正の値）
  const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth

  // LTR環境では、前回の修正されたロジックを使用 (offsetLeft基準)
  if (!isRtl) {
    let targetOffsetLeft = targetEl.offsetLeft
    const scrollWidth = scrollEl.offsetWidth
    const targetWidth = targetEl.offsetWidth
    let targetScrollLeft

    switch (inlineOption) {
      case 'start':
        targetScrollLeft = targetOffsetLeft
        break
      case 'end':
        targetScrollLeft = targetOffsetLeft - (scrollWidth - targetWidth)
        break
      case 'center':
        targetScrollLeft = targetOffsetLeft - ((scrollWidth / 2) - (targetWidth / 2))
        break
      default:
        targetScrollLeft = scrollEl.scrollLeft
    }
    return Math.max(0, Math.min(targetScrollLeft, maxScroll))
  }

  // -----------------------------------------------------------------
  // RTL環境 (scrollLeftが負の値を取るモデル) の計算
  // -----------------------------------------------------------------
  const targetWidth = targetEl.offsetWidth
  const scrollClientWidth = scrollEl.clientWidth

  // targetElの右端からコンテナのスクロール可能な右端までの距離 (正の値)
  // targetEl.offsetLeft は RTLでは信頼できないため、targetElの絶対左オフセットを使用
  const targetAbsLeft = targetEl.offsetLeft

  // targetElの絶対右オフセット (スクロールコンテナの左端からの距離)
  const targetAbsRight = targetAbsLeft + targetWidth

  let targetScrollLeft

  switch (inlineOption) {
    case 'start': // targetElの左端をコンテナの左端に合わせる (最大負の値に近い位置)
      // LTRで 'end' に合わせた時と数値的な絶対値が一致する
      targetScrollLeft = -(maxScroll - (scrollEl.scrollWidth - targetAbsRight - targetWidth))

      // 簡略化: targetElの左端がコンテナの左端から targetAbsLeft 離れているため、
      // その位置に合わせるには、ターゲットの左端をコンテナの左端に合わせ、
      // コンテナの幅だけ右にずらす (-targetAbsLeft + scrollClientWidth - targetWidth)
      targetScrollLeft = targetAbsLeft + targetWidth - scrollClientWidth
      break

    case 'end': // targetElの右端をコンテナの右端に合わせる (0に近い位置)
      // targetElの右端の位置を0に設定する
      targetScrollLeft = targetAbsRight - scrollEl.scrollWidth
      break

    case 'center':
      {
        const centerOffset = (scrollClientWidth - targetWidth) / 2
        // 'end' の位置から centerOffset だけ左にずらす (負の値を小さくする/0に近づける)
        targetScrollLeft = (targetAbsRight - scrollEl.scrollWidth) + centerOffset
        break
      }
    default:
      targetScrollLeft = scrollEl.scrollLeft
  }

  // 境界チェック: 0 から -maxScroll の範囲に収める
  return targetScrollLeft
}
