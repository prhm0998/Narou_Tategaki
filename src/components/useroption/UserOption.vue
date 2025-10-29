<script setup lang="ts">
import useUserOption, { BooleanKeys, NumberKeys } from '@/composables/useUserOption'
import RangeInput from './RangeInput.vue'

const { state, updateState } = useUserOption()

/**
 * 💡 すべてのオプション設定を定義するための共通インターフェース
 * RangeInputのプロパティを 'range' タイプに追加しています
 */
interface BaseOption {
  label: string;
  key: BooleanKeys | NumberKeys;
}

interface BoolOption extends BaseOption {
  type: 'bool';
  key: BooleanKeys;
}

interface RangeOption extends BaseOption {
  type: 'range';
  key: NumberKeys;
  min: number;
  max: number;
  step: number;
  // RangeInputの :disabled に対応するキー
  disabledKey?: BooleanKeys;
  updateTrigger: 'input' | 'change';
  unit: string; // 表示用の単位
}

type OptionItem = BoolOption | RangeOption;

// 💡 新しい単一のオプションリスト
const optionsList: OptionItem[] = [
  // 1. マウスホイールを反転する (Boolean)
  {
    type: 'bool',
    key: 'wheelReverse',
    label: 'マウスホイールを反転する',
  },
  // 2. スクロール量 (Range) - wheelReverseと関連
  {
    type: 'range',
    key: 'scrollAmount',
    label: 'スクロール量',
    min: 10,
    max: 2000,
    step: 10,
    updateTrigger: 'change',
    unit: 'px',
  },

  // 3. 本文の高さを調整する (Boolean)
  {
    type: 'bool',
    key: 'expandHeight',
    label: '本文領域の高さを調整する',
  },
  // 4. 本文領域の高さ (Range) - expandHeightと関連
  {
    type: 'range',
    key: 'viewportHeight',
    label: '本文領域の高さ',
    min: 4,
    max: 100,
    step: 4,
    disabledKey: 'expandHeight', // expandHeight が false の場合に無効化
    updateTrigger: 'input',
    unit: '%',
  },

  // 5. その他の Boolean オプション (続けて配置)
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

// 💡 型ガード関数 (テンプレート内で安全に型を判別するため)
const isRangeOption = (option: OptionItem): option is RangeOption => option.type === 'range'
</script>

<template>
  <div class="box-border flex flex-col h-[280px] w-[320px]">
    <h2 class="dark:text-gray-600 flex gap-2 mb-4 mt-1 text-2xl text-gray-700">
      <span>User Option Management</span>
    </h2>

    <div v-if="state" class="flex flex-col gap-2 grow">
      <template v-for="option in optionsList" :key="option.key">
        <div v-if="option.type === 'bool'" class="cursor-pointer flex gap-1 items-center select-none text-sm">
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

      </template>
    </div>
  </div>
</template>