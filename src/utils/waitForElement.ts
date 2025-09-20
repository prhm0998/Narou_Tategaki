/**
 * 指定した要素が現れるまで待機
 */
export async function waitForElement<T extends Element>(selector: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const element = document.querySelector<T>(selector)
    if (element) return resolve(element)

    const observer = new MutationObserver(() => {
      const element = document.querySelector<T>(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  })
}
