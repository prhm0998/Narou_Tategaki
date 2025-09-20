// composables/useObservers.ts
import { ref } from 'vue'

export default function useObservers() {
  const observers = ref(new Set<MutationObserver>())

  const addObserver = (observer: MutationObserver) => {
    observers.value.add(observer)
  }

  const resetObservers = () => {
    observers.value.forEach((ob) => ob.disconnect())
    observers.value.clear()
  }

  return { observers, addObserver, resetObservers }
}
