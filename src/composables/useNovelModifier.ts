// useNovelModifier.ts

import { waitElement } from '@1natsu/wait-element'
import { latinToZenkaku, sleep, traverseTextNodes } from '@prhm0998/shared/utils'
import { useIntersectionObserver } from '@vueuse/core'
import consola from 'consola'
import { watch, ref } from 'vue'
import type { Ref } from 'vue'

import { addTemporarilyClassToNextSiblings } from '@/utils/addTemprarilyClassToNextsiblings'

import { useNovelScroll } from './useNovelScroll'
import type { UserOption } from './useUserOption'

export function useNovelModifier(optionRef: Ref<UserOption>) {
  const pNovel = ref<HTMLElement | null>(null)
  const { attachNovelEvents } = useNovelScroll(pNovel, optionRef)

  const lastEpisodeRef = ref<HTMLElement | null>(document.querySelector<HTMLElement>('.p-novel__body'))
  const { pause: stimulatorPause, resume: stimulatorResume, stop: stimulatorStop } = useIntersectionObserver(
    [lastEpisodeRef],
    async ([entry]) => {
      if (entry.isIntersecting) {
        stimulatorPause()
        await stimulatePagerize()
        await sleep(1000)
      }
    }
  )
  stimulatorPause() //一旦停止しておく

  /** ページロード時の一連のコンテンツ操作を実行する */
  async function modifyContents() {
    // l-main のスタイルをすぐに適用
    const lMain = await waitElement<HTMLElement>('main.l-main')
    if (lMain) {
      updateLmainStyle(lMain)
    }

    // 本文要素の取得
    pNovel.value = (await waitElement<HTMLElement>('.p-novel'))
    if (!pNovel.value) {
      return
    }

    await sleep(1) //optionの取得待ち時間

    // DOM操作
    updateHonbunStyles(pNovel.value, optionRef.value)
    moveTocToEnd(pNovel.value)
    handleOnloadOptions(pNovel.value, optionRef.value)

    // イベント設定
    attachNovelEvents()
    setupAutoPagerize()

    if (optionRef.value.autoPagerizer) {
      stimulatorResume()
    }
    else {
      consola.error('stimulator is stop')
      stimulatorStop()
    }
  }

  /** autoPagerizeを反応させる */
  async function stimulatePagerize() {
    if (!optionRef.value.autoPagerizer) return
    if (pNovel.value) {
      await addTemporarilyClassToNextSiblings(pNovel.value, 'ext-stimulate-pagerize', 20)
    }
  }

  // 1. viewportHeight と expandHeight の監視
  watch(
    [() => optionRef.value.viewportHeight, () => optionRef.value.expandHeight],
    () => {
      if (pNovel.value) {
        // 変更があったらスタイルを再適用
        updateHonbunStyles(pNovel.value, optionRef.value)
      }
    },
    { deep: true, immediate: true } // immediate: true で初期反映も兼ねる
  )

  /** AutoPagerize 対応：追加本文を縦書き要素に結合し、オプションを適用する */
  function setupAutoPagerize() {
    addEventListener('AutoPagerize_DOMNodeInserted', (async (e: CustomEvent) => { // CustomEventとして扱う
      if (!pNovel.value || !optionRef.value.autoPagerizer) return // pNovelがないか、オプションが無効なら処理しない
      const el = e.target
      if (!(el instanceof HTMLElement)) return
      // 追加された要素から本文を探す
      const novel = el.matches('article.p-novel')
        ? el
        : el.querySelector('article.p-novel')

      if (!novel) return

      // 必要な子要素を取得
      const [title, body, siori, pager] = await Promise.all([
        waitElement<HTMLElement>('.p-novel__title', { target: novel }),
        waitElement<HTMLElement>('.p-novel__body', { target: novel }),
        waitElement<HTMLElement>('.p-novel__number', { target: novel }),
        waitElement<HTMLElement>('.c-pager', { target: novel }),
      ])

      if (title && body && siori && pager) {
        if (optionRef.value.latinToZen) {
          traverseTextNodes(siori, latinToZenkaku)
          traverseTextNodes(body, latinToZenkaku)
        }
        pNovel.value.append(siori, title, body, pager)
        if (optionRef.value.autoPagerizer) {
          // 追加の話数の読み込みは1秒一話にゆるく制限する
          // ※Resumeが早すぎると動作が不安定になる、autoPagerizeの読み込み速度の制限があるのかも
          lastEpisodeRef.value = body
          await sleep(1000)
          stimulatorResume()
        }
      }
    }) as unknown as EventListener) // EventListenerとしてキャストして警告を回避
  }

  return {
    modifyContents,
    pNovel,
  }
}