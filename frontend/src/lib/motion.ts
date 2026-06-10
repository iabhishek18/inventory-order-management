import { useEffect, useRef, useState } from "react";
import type { Variants } from "framer-motion";

export const easeOutSmooth = [0.22, 1, 0.36, 1] as const;
export const easeInOutSmooth = [0.4, 0, 0.2, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutSmooth },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easeOutSmooth } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOutSmooth },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOutSmooth },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easeOutSmooth },
  },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

export const routeFade: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: easeOutSmooth } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: easeInOutSmooth } },
};

export function useCountUp(
  target: number,
  durationMs = 1200,
  start = true,
): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!start || !Number.isFinite(target)) {
      setValue(target);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    startTime.current = null;
    const step = (ts: number) => {
      if (startTime.current === null) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs, start]);

  return value;
}

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}
