<script setup lang="ts">
import { computed } from 'vue'

import useUserOption from '@/composables/useUserOption'
import type { BooleanKeys, NumberKeys } from '@/composables/useUserOption'

import RangeInput from './RangeInput.vue'

const { state, updateState } = useUserOption()

interface BaseOption {
  label: string
  key: BooleanKeys | NumberKeys
}

interface BoolOption extends BaseOption {
  type: 'bool'
  key: BooleanKeys
}

interface RangeOption extends BaseOption {
  type: 'range'
  key: NumberKeys
  min: number
  max: number
  step: number
  disabledKey?: BooleanKeys
  updateTrigger: 'input' | 'change'
  unit: string
}

type OptionItem = BoolOption | RangeOption

// --------------------------------------------
// オプションリスト
// --------------------------------------------
const optionsList: OptionItem[] = [
  {
    type: 'bool',
    key: 'wheelReverse',
    label: 'マウスホイールを反転する',
  },
  {
    type: 'range',
    key: 'wheelScrollLines',
    label: 'マウスホイール1回の移動行数',
    min: 1,
    max: 20,
    step: 1,
    updateTrigger: 'input',
    unit: '行',
  },
  {
    type: 'bool',
    key: 'wheelCtrlSwap',
    label: 'Ctrl+ホイールの動作を通常と入れ替える',
  },
  {
    type: 'range',
    key: 'arrowScrollLines',
    label: '矢印キー1回の移動行数',
    min: 1,
    max: 20,
    step: 1,
    updateTrigger: 'input',
    unit: '行',
  },
  {
    type: 'bool',
    key: 'arrowCtrlSwap',
    label: 'Ctrl+矢印キーの動作を通常と入れ替える',
  },
  {
    type: 'bool',
    key: 'expandHeight',
    label: '本文領域の高さを調整する',
  },
  {
    type: 'range',
    key: 'viewportHeight',
    label: '本文領域の高さ',
    min: 2,
    max: 100,
    step: 2,
    disabledKey: 'expandHeight',
    updateTrigger: 'input',
    unit: '%',
  },
  {
    type: 'bool',
    key: 'fixedOnload',
    label: '読み込み時に本文に位置を合わせる',
  },
  {
    type: 'bool',
    key: 'latinToZen',
    label: '読み込み時に英数字を全角にする',
  },
  {
    type: 'bool',
    key: 'autoPagerizer',
    label: 'AutoPagerize拡張になるべく対応する',
  },
] as const

const isRangeOption = (option: OptionItem): option is RangeOption => option.type === 'range'

// --------------------------------------------
// 💬 説明テキスト（リアルタイム表示）
// --------------------------------------------
const wheelDescription = computed(() => {
  if (!state.value) return ''
  const { wheelCtrlSwap } = state.value
  return wheelCtrlSwap
    ? '現在: 通常ホイールでページ送り、Ctrl+ホイールで行スクロール'
    : '現在: 通常ホイールで行スクロール、Ctrl+ホイールでページ送り'
})

const arrowDescription = computed(() => {
  if (!state.value) return ''
  const { arrowCtrlSwap } = state.value
  return arrowCtrlSwap
    ? '現在: 通常矢印キーでページ送り、Ctrl+矢印キーで行スクロール'
    : '現在: 通常矢印キーで行スクロール、Ctrl+矢印キーでページ送り'
})
</script>

<template>
  <div class="flex flex-col px-2">
    <h2 class="dark:text-gray-600 flex gap-2 mb-4 mt-1 text-2xl text-gray-700">
      <span>User Option Management</span>
    </h2>

    <div v-if="state" class="flex flex-col gap-2 grow text-sm">
      <template v-for="option in optionsList" :key="option.key">
        <div v-if="option.type === 'bool'" class="cursor-pointer flex gap-1 items-center select-none">
          <label class="cursor-pointer flex gap-1 items-center">
            <input type="checkbox"
              class="appearance-none bg-white border-2 border-black checked:bg-indigo-600 h-4 rounded shrink-0 w-4"
              :checked="state[option.key]" @click="updateState({ type: 'toggle', subKey: option.key })" />
            {{ option.label }}
          </label>
        </div>
        <RangeInput v-else-if="isRangeOption(option)" v-model:value="state[option.key]" :min="option.min"
          :max="option.max" :step="option.step" :disabled="option.disabledKey ? !state[option.disabledKey] : false"
          :update-trigger="option.updateTrigger"
          @update:value="(value) => updateState({ type: 'set', subKey: option.key, value })">
          {{ `${option.label}: ${state[option.key]}${option.unit}` }}
        </RangeInput>

        <!-- 💡 動作説明行を挿入 -->
        <p v-if="option.key === 'wheelCtrlSwap'" class="-mt-1 mb-2 ml-5 text-gray-500 text-xs">
          {{ wheelDescription }}
        </p>
        <p v-if="option.key === 'arrowCtrlSwap'" class="-mt-1 mb-2 ml-5 text-gray-500 text-xs">
          {{ arrowDescription }}
        </p>
      </template>
    </div>
  </div>
</template>
