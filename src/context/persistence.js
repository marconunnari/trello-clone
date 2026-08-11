const STORAGE_KEY = "state";

export function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

export function throttle(fn, wait) {
  let lastCall = 0;
  let timeoutId = null;
  let lastArgs = null;

  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    lastArgs = args;

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...lastArgs);
      return;
    }

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...lastArgs);
      }, remaining);
    }
  };
}
