<script setup lang="ts">
import { useRangeInput } from '@/composables/useRangeInput'

const props = defineProps<{
  value: number
  min: number
  max: number
  step: number
  disabled?: boolean
  updateTrigger?: 'input' | 'change' // 追加
}>()

const emit = defineEmits<{
  (e: 'update:value' | 'input' | 'change', value: number): void
}>()

const { internalValue, handleUpdate } = useRangeInput(props, emit)
</script>

<template>
  <div class="flex font-bold ml-1 mt-2 text-sm">
    <slot></slot>
    <input type="range" :value="internalValue" :min="min" :max="max" :step="step" :disabled="disabled" class="ml-auto"
      @input="handleUpdate('input', $event)" @change="handleUpdate('change', $event)" />
  </div>
</template>
