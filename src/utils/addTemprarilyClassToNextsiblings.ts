import { getNextSiblings } from '@/utils/getNextSiblings'

export function addTemporarilyClassToNextSiblings(
  el: Element,
  className: string | string[],
  duration = 1000
): Promise<void> {
  const siblings = getNextSiblings(el)
  const classList = Array.isArray(className) ? className : [className]
  siblings.forEach((sibling) => sibling.classList.add(...classList))
  return new Promise((resolve) => {
    setTimeout(() => {
      siblings.forEach((sibling) => sibling.classList.remove(...classList))
      resolve()
    }, duration)
  })
}