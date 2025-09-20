<script setup lang="ts">
import UserOption from '@/components/useroption/UserOption.vue'
import { IconGear } from '@iconify-prerendered/vue-pepicons-pop'

export interface TabType {
  key: StorageItemKey,
  name: 'Option'
}

const tabs: TabType[] = [
  { key: 'local:Option', name: 'Option' },
]

const activeTab = ref<TabType>(tabs[0])
</script>

<template>
  <div class="tab-container">
    <div class="border-b border-gray-200 dark:border-gray-700">
      <ul class="dark:text-gray-400 flex flex-wrap font-medium text-gray-500 text-lg">
        <li v-for="tab in tabs" :key="tab.key" class="me-2" @click="activeTab = tab">
          <a href="#"
            class="border-b-2 border-transparent dark:hover:text-gray-300 hover:border-gray-300 hover:text-gray-600 inline-flex items-center justify-center p-4 rounded-t-lg">
            <IconGear v-if="tab.name === `Option`" class="inline-block mr-2" />
            {{ tab.name }}
          </a>
        </li>
      </ul>
      <div class="px-2">
        <UserOption v-if="activeTab.name === `Option`" :model-value="activeTab" />
      </div>
    </div>
  </div>
</template>