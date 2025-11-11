import { getVisibilityRatios } from '@/utils/getVisibilityRatios'

export type InViewOptions = {
  /** 要素の最小水平可視率（0〜1） */
  minHorizontalRatio?: number
  /** 要素の最小垂直可視率（0〜1） */
  minVerticalRatio?: number
  /** 水平方向の可視率判定を無視 */
  ignoreHorizontal?: boolean
  /** 垂直方向の可視率判定を無視 */
  ignoreVertical?: boolean
}

/**
 * 要素がビューポート内で完全または指定割合以上表示されているかを判定します。
 *
 * @param {Element} element - 判定対象のDOM要素
 * @param {InViewOptions} [options] - 表示率や無視設定などのオプション
 * @returns {boolean} 指定条件を満たしている場合は `true`
 */
export function isElementInView(element: Element, options: InViewOptions = {}): boolean {
  const { horizontal, vertical } = getVisibilityRatios(element)
  const rect = element.getBoundingClientRect()

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth

  const isCompletelyVisible =
    rect.top >= 0 &&
    rect.bottom <= viewportHeight &&
    rect.left >= 0 &&
    rect.right <= viewportWidth

  // オプション未指定時は完全表示のみチェック
  const noRatioOptions =
    options.minHorizontalRatio == null &&
    options.minVerticalRatio == null &&
    !options.ignoreHorizontal &&
    !options.ignoreVertical

  if (noRatioOptions) return isCompletelyVisible

  const horizontalOk =
    options.ignoreHorizontal || horizontal >= (options.minHorizontalRatio ?? 1)

  const verticalOk =
    options.ignoreVertical || vertical >= (options.minVerticalRatio ?? 1)

  return horizontalOk && verticalOk
}
