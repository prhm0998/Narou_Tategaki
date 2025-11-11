export const waitForScrollComplete = (delay = 100) => {
  return new Promise((resolve) => {
    let resolveTimeout: NodeJS.Timeout
    let fallback = setTimeout(() => resolve(true), delay)

    const onScroll = () => {
      clearTimeout(fallback)
      clearTimeout(resolveTimeout)
      resolveTimeout = setTimeout(() => {
        window.removeEventListener('scroll', onScroll)
        resolve(true)
      }, delay)
    }

    window.addEventListener('scroll', onScroll)
  })
}
