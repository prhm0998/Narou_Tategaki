// composables/useTimer.ts

export default function () {
  const startTime = ref<number | null>(null)

  function start() {
    startTime.value = performance.now()
  }

  function elapsed(): number {
    if (startTime.value === null) return 0
    return performance.now() - startTime.value
  }

  function end() {
    startTime.value = null
  }

  return {
    start,
    elapsed,
    end,
  }
}
