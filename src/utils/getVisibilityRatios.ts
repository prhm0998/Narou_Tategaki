export type VisibilityRatios = {
  horizontal: number
  vertical: number
}
/**
 * 要素の可視率を計算する
 * @returns 横方向・縦方向それぞれの可視率（0〜1）
 */
export function getVisibilityRatios(element: Element): VisibilityRatios {
  const rect = element.getBoundingClientRect()
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth

  const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)

  const horizontal = Math.max(0, Math.min(visibleWidth / rect.width, 1))
  const vertical = Math.max(0, Math.min(visibleHeight / rect.height, 1))

  //if (horizontal < 1) {
  //  console.log('要素', element)
  //  console.log('縦方向の可視率', vertical)
  //  console.log('横方向の可視率', horizontal)
  //
  //}

  return { horizontal, vertical }
}
