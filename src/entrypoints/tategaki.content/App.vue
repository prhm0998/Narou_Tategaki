<script setup lang="ts">
import { onMounted } from 'vue'
const { state: option } = useUserOption()
const { modifyContents } = useNovelModifier(option)
onMounted(() => modifyContents())
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