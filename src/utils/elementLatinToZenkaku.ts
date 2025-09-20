/** textContentのラテン文字と数字を全角にする */
export default function elementLatinToZenkaku(element: Element): void {
  function processElement(el: Element): void {
    if (el.children.length) {
      Array.from(el.children).forEach((child) => processElement(child))
    }
    else {
      if (el.textContent !== null) {
        el.textContent = latinToZenkaku(el.textContent)
      }
    }
  }
  processElement(element)
}