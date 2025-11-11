// useUserOption.ts

import { useGenericStore } from '@prhm0998/shared/composables'
import type { UpdateStateFn } from '@prhm0998/shared/composables'

export interface UserOption {
  wheelReverse: boolean
  fixedOnload: boolean
  expandHeight: boolean
  latinToZen: boolean
  autoPagerizer: boolean
  //scrollAmount: number //廃止
  viewportHeight: number
  wheelScrollLines: number
  wheelCtrlSwap: boolean
  arrowScrollLines: number
  arrowCtrlSwap: boolean
}

export type BooleanKeys = { [K in keyof UserOption]: UserOption[K] extends boolean ? K : never
}[keyof UserOption]

export type NumberKeys = {
  [K in keyof UserOption]: UserOption[K] extends number ? K : never
}[keyof UserOption]

type UserOptionUpdateEvent =
  | {
    type: 'toggle'
    subKey: BooleanKeys
  }
  | {
    type: 'set'
    subKey: NumberKeys
    value: number
  }

const getDefaultState = (): UserOption => ({
  wheelReverse: false,
  expandHeight: false,
  fixedOnload: false,
  latinToZen: true,
  autoPagerizer: true,
  //scrollAmount: 272, //廃止
  viewportHeight: 96,
  wheelScrollLines: 4,
  wheelCtrlSwap: false,
  arrowScrollLines: 4,
  arrowCtrlSwap: true,
})

// json to state
const deserialize = (jsonString: string): UserOption => {
  try {
    const parsed = JSON.parse(jsonString) as Partial<UserOption> & { scrollAmount?: number }
    const base = getDefaultState()

    // scrollAmount廃止に伴う移行対応
    if (typeof parsed.scrollAmount === 'number') {
      parsed.wheelScrollLines = Math.round(parsed.scrollAmount / 28) || base.wheelScrollLines
    }
    if (parsed.scrollAmount) delete parsed.scrollAmount

    // jsonにないプロパティはデフォルトから持ってくる
    return Object.assign({}, base, parsed)
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
    'local:UserOption', getDefaultState, deserialize, serialize, updateStateLogic
  )
}