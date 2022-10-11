export function delay<T>(
  runner: () => Promise<T>,
  delayTime: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      runner().then(resolve).catch(reject);
    }, delayTime);
  });
}
export function debounce(fn: any, delayTime: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    const later = () => {
      clearTimeout(timeoutId);
      fn(...args);
    };
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delayTime);
  };
}
