import { useGenericStore, type UpdateStateFn } from '@prhm0998/shared/composables'

export interface UserOption {
  wheelReverse: boolean
  fixedOnload: boolean
  expandHeight: boolean
  latinToZen: boolean
  autoPagerizer: boolean
  scrollAmount: number,
  viewportHeight: number,
}

export type BooleanKeys = { [K in keyof UserOption]: UserOption[K] extends boolean ? K : never
}[keyof UserOption]

export type NumberKeys = {
  [K in keyof UserOption]: UserOption[K] extends number ? K : never
}[keyof UserOption]

type UserOptionUpdateEvent =
  | {
    type: 'toggle',
    subKey: BooleanKeys
  }
  | {
    type: 'set',
    subKey: NumberKeys,
    value: number
  }

const getDefaultState = (): UserOption => ({
  wheelReverse: false,
  expandHeight: false,
  fixedOnload: false,
  latinToZen: true,
  autoPagerizer: true,
  scrollAmount: 272,
  viewportHeight: 96,
})

// json to state
const deserialize = (jsonString: string): UserOption => {
  try {
    const parsed = JSON.parse(jsonString) as Partial<UserOption>
    // jsonにないプロパティはデフォルトから持ってくる
    return Object.assign({}, getDefaultState(), parsed)
  }
  catch {
    return getDefaultState()
  }
}

const serialize = (cache: UserOption) => JSON.stringify(cache)
const updateStateLogic: UpdateStateFn<UserOption, UserOptionUpdateEvent> = (state, event) => {
  switch (event.type) {
    case 'toggle': {
      const keyToToggle = event.subKey
      state.value[keyToToggle] = !state.value[keyToToggle]
      break
    }
    case 'set': {
      const keyToSet = event.subKey
      state.value[keyToSet] = event.value
      break
    }
    default:
      console.warn('不明な UserOptionUpdateEvent が渡されました。', event)
  }
}

export default function useUserOption() {
  return useGenericStore<UserOption, UserOptionUpdateEvent>(
    'local:UserOption',
    getDefaultState,
    deserialize,
    serialize,
    updateStateLogic
  )
}