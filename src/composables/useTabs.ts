// useTabs.ts

import { IconGear } from '@iconify-prerendered/vue-pepicons-pop'

import UserOption from '@/components/useroption/UserOption.vue'

export interface TabType {
  name: 'Option'
  icon: Component
  component: Component
}

export type TabsState = number

export interface Tabs {
  current: TabsState
  tabType: TabType
}

export type TabsUpdateEvent =
  | { type: 'update', value: number }

type UpdateStateFn<S, E> = (
  state: Ref<S>,
  event: E,
) => void

const updateStateLogic: UpdateStateFn<TabsState, TabsUpdateEvent> = (
  state,
  event
) => {
  const { type } = event

  switch (type) {
    case 'update': {
      const { value } = event
      if (typeof value === 'number')
        state.value = value
      break
    }
    default:
      break
  }
}

export function useTabs() {
  const state = ref(0)

  const tabs: TabType[] = [
    { name: 'Option', icon: IconGear, component: markRaw(UserOption) },
  ]

  function updateState(event: TabsUpdateEvent) {
    updateStateLogic(state, event)
  }

  const activeTab = computed(() => tabs[state.value])

  return {
    current: state,
    tabs,
    activeTab,
    updateState,
  }
}