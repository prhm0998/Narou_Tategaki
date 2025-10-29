// novelDOMUtils.ts
import { traverseTextNodes, latinToZenkaku, getFixedElementsTotalHeight, scrollWithFixedOffset } from '@prhm0998/shared/utils'

/** l-main の基本的なスタイルを設定する */
export async function updateLmainStyle(lMain: HTMLElement) {
  lMain.style.width = '100%'
  lMain.style.padding = '0'
  lMain.style.margin = '0'
}

/** 目次ボタンを本文要素の最後に移動させる */
export function moveTocToEnd(pNovel: HTMLElement) {
  const toc = document.querySelector('.c-pager')
  if (toc && toc instanceof HTMLElement) {
    pNovel.appendChild(toc)
  }
}

/** 本文要素のスタイルを更新する */
export function updateHonbunStyles(pNovel: HTMLElement, option: UserOption) {
  pNovel.style.writingMode = 'vertical-rl'
  pNovel.style.width = '100%'
  pNovel.style.overflowX = 'auto'
  pNovel.style.whiteSpace = 'nowrap'
  pNovel.style.padding = '0'
  pNovel.style.margin = '0'

  if (option.expandHeight) {
    pNovel.style.height = `${option.viewportHeight}vh`
  }
}

/** 初期ロード時のオプション処理を適用する */
export function handleOnloadOptions(pNovel: HTMLElement, option: UserOption) {
  if (option.fixedOnload) {
    scrollWithFixedOffset(pNovel, getFixedElementsTotalHeight())
  }
  if (option.latinToZen) {
    // テキストノードを走査して変換
    traverseTextNodes(pNovel, latinToZenkaku)
  }
}
