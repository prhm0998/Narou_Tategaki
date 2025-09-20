import useStoredValue from './useStoredValue'
import { useDebounceFn } from '@vueuse/core'

export interface UserOption {
  wheelReverse: boolean
  fixedOnload: boolean
  expandHeight: boolean
  latinToZen: boolean
  scrollAmount: number,
  viewportHeight: number,
  autoPagerizer: boolean
}

export type UserOptionEvent =
  | { type: 'toggle', key: keyof Omit<UserOption, 'scrollAmount' | 'viewportHeight'> }
  | { type: 'set', key: keyof Pick<UserOption, 'scrollAmount' | 'viewportHeight'>, value: number }

const getDefaultUserOption = (): UserOption => ({
  wheelReverse: false,
  expandHeight: false,
  fixedOnload: false,
  latinToZen: true,
  scrollAmount: 272,
  viewportHeight: 96,
  autoPagerizer: false,
})

export default function () {
  const defaultUserOption = getDefaultUserOption()
  const { state: storedJson } = useStoredValue('local:Option', '{}')
  const memoryCache = ref<UserOption>(defaultUserOption)

  // json to state
  const deserialize = (jsonString: string): UserOption => {
    try {
      const parsed = JSON.parse(jsonString) as Partial<UserOption>
      // jsonにないプロパティはデフォルトから持ってくる
      return Object.assign({}, getDefaultUserOption(), parsed)
    }
    catch {
      return getDefaultUserOption()
    }
  }

  // state to json 後はstringifyするだけの状態に加工する
  const serialize = (): UserOption => {
    return memoryCache.value
  }

  // ストアに更新があったらキャッシュも更新する
  const initializeCache = () => memoryCache.value = deserialize(storedJson.value)
  watch(storedJson, (newVal) => memoryCache.value = deserialize(newVal))
  initializeCache()

  const saveToStorage = useDebounceFn(() => {
    storedJson.value = JSON.stringify(serialize())
  }, 100, { maxWait: 1000 })

  const updateUserOption = (event: UserOptionEvent) => {
    switch (event.type) {
      case 'set':
        memoryCache.value[event.key] = event.value
        break;
      case 'toggle':
        memoryCache.value[event.key] = !memoryCache.value[event.key]
        break;
      default:
        break;
    }
    saveToStorage()
  }

  return {
    state: (memoryCache),
    updateUserOption,
  }
}