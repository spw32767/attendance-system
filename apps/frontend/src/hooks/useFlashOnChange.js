import { useEffect, useRef, useState } from "react";

/**
 * Returns `true` briefly whenever `value` changes (but not on first mount).
 * Used to flash a confirmation highlight on an element when its underlying
 * data changes — e.g. a status pill after a toggle's refetch lands — so the
 * change is visible where the user is looking, not only in a corner toast.
 * Purely presentational: it observes value changes, it does not cause them.
 */
export function useFlashOnChange(value, ms = 1000) {
  const previous = useRef(value);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (previous.current === value) {
      return undefined;
    }
    previous.current = value;
    setFlashing(true);
    const timer = window.setTimeout(() => setFlashing(false), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);

  return flashing;
}
