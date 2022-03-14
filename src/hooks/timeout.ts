import raf from 'raf';
import { useCallback, useRef } from 'react';

function getTime() {
  return new Date().getTime();
}

export function useTimeout() {
  const ref = useRef(0);

  const requestTimeout = useCallback((fn: () => void, delay: number) => {
    const startTime = getTime();

    const tick = () => {
      const currentTime = getTime();

      if (delay <= currentTime - startTime) {
        fn();
      } else {
        ref.current = raf(tick);
      }
    };

    ref.current = raf(tick);
  }, []);

  const removeTimeout = useCallback(() => {
    raf.cancel(ref.current);
  }, []);

  return {
    requestTimeout,
    removeTimeout,
  };
}
