"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useState backed by localStorage. Hydrates after mount (never during the
 * SSR/first render) so server and client markup always match, and keeps the
 * saved value in sync once hydrated. Options are read through a ref so callers
 * may pass inline callbacks without re-triggering the hydration effect.
 */
export default function usePersistentState(key, defaultValue, options = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) {
        const parsed = optionsRef.current.deserialize(saved);
        const { validate } = optionsRef.current;
        if (!validate || validate(parsed)) setValue(parsed);
      }
    } catch {
      // Fall back to the default when storage is unavailable or corrupted.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, optionsRef.current.serialize(value));
    } catch {
      // The value remains active for the current session.
    }
  }, [key, hydrated, value]);

  return [value, setValue, hydrated];
}
