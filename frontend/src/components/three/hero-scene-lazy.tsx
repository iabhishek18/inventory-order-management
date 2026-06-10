import { Suspense, lazy } from "react";

const HeroScene = lazy(() =>
  import("./hero-scene").then((m) => ({ default: m.HeroScene })),
);

function GradientFallback({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.45), transparent 55%), radial-gradient(circle at 70% 60%, rgba(34,211,238,0.35), transparent 55%), radial-gradient(circle at 50% 90%, rgba(79,70,229,0.4), transparent 50%)",
      }}
    />
  );
}

export function HeroSceneLazy({ className }: { className?: string }) {
  return (
    <Suspense fallback={<GradientFallback className={className} />}>
      <HeroScene className={className} />
    </Suspense>
  );
}
