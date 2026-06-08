import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  duration?: number;
  start?: number;
  enabled?: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCountUp(
  target: number | null | undefined,
  { duration = 1100, start = 0, enabled = true }: UseCountUpOptions = {},
): number {
  const [value, setValue] = useState(target == null ? start : enabled ? start : target);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const fromRef = useRef<number>(start);

  useEffect(() => {
    if (target == null) return;
    if (!enabled) {
      setValue(target);
      return;
    }
    if (typeof window === "undefined") {
      setValue(target);
      return;
    }
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    fromRef.current = value;
    startTimeRef.current = null;

    const tick = (now: number) => {
      if (startTimeRef.current == null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setValue(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return value;
}
