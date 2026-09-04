import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

type Codec<T> = {
  parse: (value: string) => T;
  stringify: (value: T) => string;
};

type LocalStorageUtils = {
  remove: () => void;
  clear: () => void;
};

type UseLocalStorageStateReturn<T> = [T, Dispatch<SetStateAction<T>>, LocalStorageUtils];

/**
 * useLocalStorageState
 *
 * A custom React hook for persisting state in localStorage, with support for a custom codec.
 *
 * @param key - The localStorage key to use.
 * @param initialValue - The initial state value or a function returning the initial value.
 * @param codec - An optional codec for parsing/stringifying the data.
 * @returns A tuple containing:
 *   1. The state value.
 *   2. A setter function to update the state (and localStorage).
 *   3. An object with utility methods: remove (to remove the item) and clear (to clear all localStorage).
 */
function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
  codec?: Codec<T>
): UseLocalStorageStateReturn<T> {
  // Lazy initialization: attempt to read from localStorage using the codec if provided.
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        return codec ? codec.parse(storedValue) : JSON.parse(storedValue) as T;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  // Update localStorage whenever the state or key changes.
  useEffect(() => {
    try {
      const valueToStore = codec ? codec.stringify(state) : JSON.stringify(state);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state, codec]);

  // Utility: Remove this key from localStorage and reset the state.
  const remove = useCallback((): void => {
    try {
      localStorage.removeItem(key);
      setState(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Utility: Clear all of localStorage (use with caution) and reset the state.
  const clear = useCallback((): void => {
    try {
      localStorage.clear();
      setState(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  // Listen for changes to the localStorage key in other windows/tabs.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === key) {
        try {
          setState(
            event.newValue
              ? codec ? codec.parse(event.newValue) : (JSON.parse(event.newValue) as T)
              : typeof initialValue === 'function'
              ? (initialValue as () => T)()
              : initialValue
          );
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}" during storage event:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, codec]);

  return [state, setState, { remove, clear }];
}

export default useLocalStorageState;
