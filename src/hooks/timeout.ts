import { Timeout, raf } from '@react-spring/rafz';
import { useCallback, useRef } from 'react';

export function useTimeout() {
  const ref = useRef<Timeout>();

  const requestTimeout = useCallback((fn: () => void, ms: number) => {
    ref.current = raf.setTimeout(fn, ms);
  }, []);

  const removeTimeout = useCallback(() => {
    if (ref.current) {
      ref.current.cancel();
    }
  }, []);

  return {
    requestTimeout,
    removeTimeout,
  };
}
