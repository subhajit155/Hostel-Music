import { useState, useEffect } from 'react';

/**
 * A hook that syncs state with localStorage.
 * @param {string} key  - localStorage key
 * @param {*} initial   - default value if key not found
 */
export const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded or private mode — fail silently
    }
  }, [key, value]);

  return [value, setValue];
};
