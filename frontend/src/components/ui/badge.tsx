import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25 dark:bg-destructive/20 dark:text-red-200",
        outline: "border-border text-foreground",
        success:
          "border-transparent bg-emerald-500/12 text-emerald-700 ring-1 ring-inset ring-emerald-500/25 dark:bg-emerald-500/18 dark:text-emerald-200",
        warning:
          "border-transparent bg-amber-500/14 text-amber-800 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200",
        info:
          "border-transparent bg-sky-500/12 text-sky-700 ring-1 ring-inset ring-sky-500/25 dark:bg-sky-500/18 dark:text-sky-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
