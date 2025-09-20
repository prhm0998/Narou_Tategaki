<script setup lang="ts">
import useUserOption from '@/composables/useUserOption'
import RangeInput from './RangeInput.vue';

const { state, updateUserOption } = useUserOption()

const boolOptions = [
  { key: 'wheelReverse', label: 'マウスホイールを反転する' },
  { key: 'expandHeight', label: '本文の高さを調整する' },
  { key: 'fixedOnload', label: '読み込み時に本文に位置を合わせる' },
  { key: 'latinToZen', label: '読み込み時に英数字を全角にする' },
  { key: 'autoPagerizer', label: '読み込み時にautoPagerize拡張に対応する' },
] as const;
</script>

<template>
  <div class="box-border flex flex-col h-[420px] w-[520px]">
    <h2 class="dark:text-gray-600 flex gap-2 mb-4 mt-1 text-2xl text-gray-700">
      <span>User Option Management</span>
    </h2>
    <div v-if="state" class="flex flex-col flex-grow gap-2">
      <div v-for="option in boolOptions" :key="option.key"
        class="cursor-pointer flex gap-1 items-center select-none text-sm">
        <label class="cursor-pointer flex gap-1 items-center">
          <input type="checkbox"
            class="appearance-none bg-white border-2 border-black checked:bg-indigo-600 flex-shrink-0 h-4 rounded w-4"
            :checked="state[option.key]" @click="updateUserOption({ type: 'toggle', key: option.key })" />
          {{ option.label }}
        </label>
      </div>
      <RangeInput v-model:value="state.scrollAmount" :min="10" :max="300" :step="10" :disabled="false"
        update-trigger="change"
        @update:value="(value) => updateUserOption({ type: 'set', key: 'scrollAmount', value })">
        {{ `スクロール量: ${state.scrollAmount}` }}
      </RangeInput>
      <RangeInput v-model:value="state.viewportHeight" :min="4" :max="100" :step="4" :disabled="!state.expandHeight"
        update-trigger="input"
        @update:value="(value) => updateUserOption({ type: 'set', key: 'viewportHeight', value })">
        {{ `本文領域の高さ: ${state.viewportHeight}` }}
      </RangeInput>
    </div>
  </div>
</template>
