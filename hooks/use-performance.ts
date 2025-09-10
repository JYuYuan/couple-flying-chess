'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 防抖Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 节流Hook
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current),
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// 稳定的回调Hook - 防止不必要的重新渲染
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback);

  // 更新ref但不触发重新渲染
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 返回稳定的回调引用
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// 深度比较的memo Hook
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
}

// 深度比较函数
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }

  if (a.prototype !== b.prototype) return false;

  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  return keys.every((k) => deepEqual(a[k], b[k]));
}

// 优化的状态更新Hook - 避免相同值的更新
export function useOptimizedState<T>(
  initialState: T | (() => T),
  compareFn?: (prev: T, next: T) => boolean,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(initialState);

  const optimizedSetState = useCallback(
    (value: React.SetStateAction<T>) => {
      setState((prev) => {
        const nextValue = typeof value === 'function' ? (value as Function)(prev) : value;

        // 使用自定义比较函数或默认的浅比较
        const areEqual = compareFn ? compareFn(prev, nextValue) : Object.is(prev, nextValue);

        return areEqual ? prev : nextValue;
      });
    },
    [compareFn],
  );

  return [state, optimizedSetState];
}

// 虚拟化列表Hook - 用于长列表优化
export function useVirtualList<T>(
  items: T[],
  options: {
    containerHeight: number;
    itemHeight: number;
    overscan?: number;
  },
) {
  const { containerHeight, itemHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1,
    );

    const visibleStartIndex = Math.max(0, startIndex - overscan);

    return {
      startIndex: visibleStartIndex,
      endIndex,
      items: items.slice(visibleStartIndex, endIndex + 1),
      offsetY: visibleStartIndex * itemHeight,
      totalHeight: items.length * itemHeight,
    };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    onScroll,
    totalHeight: visibleItems.totalHeight,
  };
}

// 内存化选择器Hook
export function useSelector<T, R>(
  source: T,
  selector: (source: T) => R,
  equalityFn?: (left: R, right: R) => boolean,
): R {
  const selectedValue = useMemo(() => selector(source), [source, selector]);
  const ref = useRef<R>(selectedValue);

  if (!equalityFn) {
    equalityFn = Object.is;
  }

  if (!equalityFn(ref.current, selectedValue)) {
    ref.current = selectedValue;
  }

  return ref.current;
}

// 批量状态更新Hook
export function useBatchedState<T extends Record<string, any>>(
  initialState: T,
): [T, (updates: Partial<T> | ((prev: T) => Partial<T>)) => void] {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const batchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const batchedSetState = useCallback(
    (updates: Partial<T> | ((prev: T) => Partial<T>)) => {
      const newUpdates = typeof updates === 'function' ? updates(state) : updates;

      // 合并到待处理的更新中
      Object.assign(pendingUpdates.current, newUpdates);

      // 清除之前的批处理计时器
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      // 设置新的批处理计时器
      batchTimeoutRef.current = setTimeout(() => {
        setState((prevState) => ({
          ...prevState,
          ...pendingUpdates.current,
        }));
        pendingUpdates.current = {};
      }, 0);
    },
    [state],
  );

  return [state, batchedSetState];
}

// 计算缓存Hook
export function useComputedValue<T, R>(
  source: T,
  computeFn: (source: T) => R,
  deps?: React.DependencyList,
): R {
  return useMemo(() => computeFn(source), deps ? [source, ...deps] : [source]);
}

// 异步状态Hook - 减少loading状态的重复渲染
export function useAsyncState<T>(asyncFn: () => Promise<T>, deps?: React.DependencyList) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const stableAsyncFn = useStableCallback(asyncFn);

  useEffect(
    () => {
      let cancelled = false;

      setState((prev) => (prev.loading ? prev : { ...prev, loading: true, error: null }));

      stableAsyncFn()
        .then((data) => {
          if (!cancelled) {
            setState({ data, loading: false, error: null });
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setState({ data: null, loading: false, error });
          }
        });

      return () => {
        cancelled = true;
      };
    },
    deps || [stableAsyncFn],
  );

  return state;
}

// 窗口尺寸Hook - 使用节流避免频繁更新
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150); // 150ms 节流
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return windowSize;
}
