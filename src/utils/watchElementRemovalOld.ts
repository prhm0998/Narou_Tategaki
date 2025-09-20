// eslint-disable-next-line @typescript-eslint/no-unused-vars
const watchElementRemovalOld = (element: Element, callback: () => void) => {
  if (!element.isConnected) {
    // console.warn('Element is not connected to the document, it might already be removed.');
    callback();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!document.body.contains(element)) {
      observer.disconnect(); // 監視を停止
      callback(); // コールバックを実行
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // クリーンアップ関数を返す
  return () => observer.disconnect();
};

// documentの監視は頻度がたかすぎなため一旦廃止