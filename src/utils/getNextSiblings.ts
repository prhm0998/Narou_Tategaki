export function getNextSiblings(el: Element): Element[] {
  const siblings: Element[] = []
  let next = el.nextElementSibling
  while (next) {
    siblings.push(next)
    next = next.nextElementSibling
  }
  return siblings
}