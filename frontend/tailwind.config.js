/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Space Grotesk",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: "#eef0ff",
          100: "#dde2ff",
          200: "#bcc7ff",
          300: "#94a3ff",
          400: "#6e7cff",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",
        },
        violet: {
          500: "#7c3aed",
          600: "#6d28d9",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        ink: {
          900: "#0b1023",
          800: "#10162e",
          700: "#1a0b2e",
          600: "#1f1740",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        "glow-indigo":
          "0 0 0 1px rgba(99,102,241,0.25), 0 10px 40px -10px rgba(79,70,229,0.55)",
        "glow-violet":
          "0 0 0 1px rgba(124,58,237,0.3), 0 10px 40px -10px rgba(124,58,237,0.55)",
        "glow-cyan":
          "0 0 0 1px rgba(34,211,238,0.3), 0 10px 40px -10px rgba(34,211,238,0.5)",
        "soft-lg":
          "0 10px 30px -10px rgba(15,23,42,0.15), 0 4px 10px -6px rgba(15,23,42,0.08)",
        soft:
          "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)",
        elevated:
          "0 4px 12px -2px rgba(15,23,42,0.08), 0 10px 30px -10px rgba(15,23,42,0.15)",
        floating:
          "0 8px 24px -6px rgba(15,23,42,0.12), 0 18px 48px -12px rgba(15,23,42,0.18)",
        glow:
          "0 0 0 1px rgba(124,58,237,0.25), 0 16px 48px -12px rgba(124,58,237,0.45)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #22d3ee 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(124,58,237,0.14) 50%, rgba(34,211,238,0.18) 100%)",
        "gradient-mesh":
          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)",
        "gradient-radial":
          "radial-gradient(ellipse at top, hsl(var(--accent) / 0.18), transparent 70%)",
        "ink-gradient":
          "radial-gradient(at 20% 10%, rgba(124,58,237,0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(34,211,238,0.18) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(79,70,229,0.35) 0px, transparent 50%), linear-gradient(180deg, #0b1023 0%, #1a0b2e 100%)",
        "grid-fade":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-fade": "44px 44px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.65" },
          "33%": { transform: "translate3d(40px,-30px,0) scale(1.08)", opacity: "0.85" },
          "66%": { transform: "translate3d(-30px,20px,0) scale(0.95)", opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(0.6deg)" },
          "75%": { transform: "rotate(-0.6deg)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "aurora-slow": "aurora 18s ease-in-out infinite",
        "aurora-fast": "aurora 12s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        tilt: "tilt 8s ease-in-out infinite",
        "fade-in-up": "fade-in-up 600ms cubic-bezier(0.22,1,0.36,1) both",
        "slide-in-right": "slide-in-right 500ms cubic-bezier(0.22,1,0.36,1) both",
        shake: "shake 360ms ease-in-out",
        "spin-slow": "spin-slow 12s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
