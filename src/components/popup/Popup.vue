<script setup lang="ts">
import { useTabs } from '@/composables/useTabs'

const { tabs, activeTab, updateState } = useTabs()
</script>

<template>
  <div class="h-[500px]  tab-container  w-[460px]">
    <div>
      <ul class="dark:text-gray-400 flex flex-wrap font-medium text-gray-500 text-lg">
        <li v-for="(tab, index) in tabs" :key="tab.name" class="me-2" @click="activeTab = tab">
          <button type="button"
            class="border-b-2 border-transparent dark:hover:text-gray-300 hover:border-gray-300 hover:text-gray-600 inline-flex items-center justify-center p-4"
            :class="{ 'border-blue-200 text-blue-300 dark:text-blue-200': activeTab.name === tab.name }"
            @click="updateState({ type: 'update', value: index })">
            <component :is="tab.icon" class="inline-block mr-2" />
            {{ tab.name }}
          </button>
        </li>
      </ul>
      <KeepAlive>
        <component :is="activeTab.component" class="tabs__content" />
      </KeepAlive>
    </div>
  </div>
</template>