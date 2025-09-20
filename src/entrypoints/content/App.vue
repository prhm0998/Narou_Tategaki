<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';

const { state: option } = useUserOption();
const pNovel = ref<HTMLElement | null>(null);
async function modifyContents() {
  await updateLmainStyle()
  pNovel.value = (await waitForElement('.p-novel')) as HTMLElement | null;
  if (!pNovel.value) {
    return;
  }
  await sleep(1) // Optionの読み込みが間に合わないのでちょっとまってね

  updateLmainStyle()
  moveTocToEnd()
  updateHonbunStyles();
  attachNovelEvents()
  handleOnloadOptions()
  setupAutoPagerize()
}

async function updateLmainStyle() {
  const lMain = await waitForElement('main.l-main');
  if (!lMain || !(lMain instanceof HTMLElement)) {
    return;
  }
  lMain.style.width = '100%'; // 画面幅いっぱいに
  lMain.style.padding = '0'
  lMain.style.margin = '0'; // 余白を削除
}

/** 目次を縦書き要素に移動させる */
function moveTocToEnd() {
  const toc = document.querySelector('.c-pager'); // 目次ボタン
  if (toc && toc instanceof HTMLElement && pNovel.value) {
    pNovel.value.appendChild(toc); // 本文の最後に移動
  }

}

/** 本文にイベントを追加 */
function attachNovelEvents() {
  if (!pNovel.value) return
  pNovel.value.addEventListener('wheel', onWheelScroll)
  pNovel.value.addEventListener('dblclick', onDoubleClick)
}

/** オプションに応じて本文に処理を適用 */
function handleOnloadOptions() {
  if (!pNovel.value) return
  if (option.value.fixedOnload) {
    pNovel.value.scrollIntoView({ inline: 'start', behavior: 'smooth' })
  }
  if (option.value.latinToZen) {
    elementLatinToZenkaku(pNovel.value)
  }
}

// honbun のスタイルを更新する関数
function updateHonbunStyles() {
  if (!pNovel.value) return;

  pNovel.value.style.writingMode = 'vertical-rl'; // 縦書き
  pNovel.value.style.width = '100%'; // 画面幅いっぱい
  if (option.value.expandHeight) {
    pNovel.value.style.height = `${option.value.viewportHeight}vh`; // heightはwatchで管理する
  }
  pNovel.value.style.overflowX = 'auto'; // 横スクロール
  pNovel.value.style.whiteSpace = 'nowrap'; // 折り返し防止
  pNovel.value.style.padding = '0';
  pNovel.value.style.margin = '0';
}

onMounted(() => modifyContents());

/** option.viewportHeightの変更を監視し、honbunのheightを更新 */
watch(
  () => option.value.viewportHeight,
  () => updateHonbunStyles()
);

/** AutoPagerize 対応：追加本文を縦書き要素に結合 */
function setupAutoPagerize() {
  if (!option.value.autoPagerizer) return

  addEventListener('AutoPagerize_DOMNodeInserted', (e) => {
    const el = e.target
    if (!(el instanceof HTMLElement)) return

    const novel = el.matches('article.p-novel')
      ? el
      : el.querySelector('article.p-novel')

    if (!novel || !pNovel.value) return

    const pager = novel.querySelector('.c-pager')
    const siori = novel.querySelector('.p-novel__number')
    const title = novel.querySelector('.p-novel__title')
    const body = novel.querySelector('.p-novel__body')

    if (pager && siori && title && body) {

      elementLatinToZenkaku(siori)
      if (option.value.latinToZen) {
        elementLatinToZenkaku(body)
      }
      pNovel.value.append(siori, title, body, pager)
    }
  })
}

const smoothScroll = (
  honbun: HTMLElement,
  target: number,
  duration = 300,
  maxAmountPerFrame = 100
) => {
  const start = honbun.scrollLeft;
  const distance = target - start;
  const startTime = performance.now();
  let lastFrameTime = startTime;

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const deltaTime = currentTime - lastFrameTime;
    const progress = Math.min(elapsed / duration, 1);

    // イージング関数 (easeOutQuad)
    const easedProgress = 1 - (1 - progress) * (1 - progress);
    const idealPosition = start + distance * easedProgress;

    const maxAmount = (maxAmountPerFrame / 100) * deltaTime;
    const actualMove = Math.min(
      Math.abs(idealPosition - honbun.scrollLeft),
      maxAmount
    );

    if (idealPosition > honbun.scrollLeft) {
      honbun.scrollLeft += actualMove;
    }
    else {
      honbun.scrollLeft -= actualMove;
    }

    lastFrameTime = currentTime;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const throttledSmoothScroll = useThrottleFn(
  (honbun: HTMLElement, moving: number) => {
    smoothScroll(honbun, moving);
  },
  300
);

function onWheelScroll(e: WheelEvent) {
  if (!pNovel.value) return;
  const movelr = e.deltaY > 0 ? -1 : 1;
  const amount: number = option.value.wheelReverse
    ? option.value.scrollAmount
    : -option.value.scrollAmount;
  const moving = pNovel.value.scrollLeft - amount * movelr;
  throttledSmoothScroll(pNovel.value, moving);
  e.preventDefault();
}

function onDoubleClick(this: HTMLElement, e: { preventDefault: () => void }) {
  this.scrollIntoView({ inline: 'start', behavior: 'smooth' });
  e.preventDefault();
}
</script>

<template>
  <div></div>
</template>

<style lang="scss">
.p-novel__number {
  text-align: left !important;
  margin-top: 32px !important;
}

.c-pager__item {
  margin-top: 24px !important;
}

.c-pager__item:not(:first-child) {
  padding-left: 0 !important;
}

.c-pager__item:not(:last-child) {
  padding-right: 0 !important;
  border-right: none !important;
}

.c-pager--center {
  writing-mode: vertical-rl !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  margin-top: 24px !important;
  margin-left: 24px;
  gap: 48px !important;

  >*>a:first-of-type {
    margin-top: 16px !important;
  }

  a {
    border: 0 !important;
    padding: 0 !important;
  }
}
</style>