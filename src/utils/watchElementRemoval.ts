/**
 Element.isConnectedを使って要素が使用されなくなったことを検知する
 */
export const watchElementRemoval = (
  element: Element,
  callback: () => void,
  interval: number = 1000 // デフォルトは1秒
) => {
  if (!element.isConnected) {
    console.warn('Element is not connected to the document, it might already be removed.');
    callback();
    return;
  }

  const checkInterval = setInterval(() => {
    if (!element.isConnected) {
      clearInterval(checkInterval);
      callback();
    }
  }, interval);

  // クリーンアップ関数を返す
  return () => clearInterval(checkInterval);
};