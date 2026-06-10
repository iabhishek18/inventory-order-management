import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeroSceneLazy } from "@/components/three/hero-scene-lazy";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { extractApiError } from "@/lib/errors";
import { fadeIn, fadeInUp, slideInLeft, stagger } from "@/lib/motion";

const schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

const strengthLabels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
const strengthColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-gradient-to-r from-emerald-400 to-cyan-400",
];

function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

const perks = [
  "Free forever for solo operators",
  "Set up in under two minutes",
  "Cancel anytime, no credit card",
];

export function RegisterPage() {
  const { register: doRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  const password = watch("password") || "";
  const strength = useMemo(() => scorePassword(password), [password]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await doRegister(values.email, values.full_name, values.password);
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(extractApiError(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      <motion.aside
        variants={slideInLeft}
        initial="hidden"
        animate="show"
        className="relative isolate hidden overflow-hidden bg-ink-gradient lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <HeroSceneLazy className="!absolute inset-0" />
        <div className="pointer-events-none absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl animate-aurora-fast" />

        <motion.div variants={fadeInUp} className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-200 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>
        </motion.div>

        <motion.div
          variants={stagger(0.08, 0.2)}
          initial="hidden"
          animate="show"
          className="relative z-10 space-y-6"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient shadow-glow-violet">
              <Boxes className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-xl font-semibold tracking-wide text-white">
              IOMS
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl font-semibold leading-tight text-white"
          >
            Run operations
            <br />
            <span className="text-gradient">like the best teams do.</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="max-w-md text-base leading-relaxed text-slate-300/85"
          >
            Create your workspace in minutes. Bring your stock, your orders,
            your team — and replace the patchwork.
          </motion.p>

          <motion.ul variants={fadeInUp} className="space-y-3 text-sm text-slate-200/90">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-300" />
                <span>{p}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.aside>

      <motion.section
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="relative flex flex-col items-center justify-center bg-background p-6 text-foreground lg:p-12"
      >
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient">
            <Boxes className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-base font-semibold">IOMS</span>
        </Link>

        <motion.div
          variants={stagger(0.06, 0.1)}
          initial="hidden"
          animate="show"
          className="w-full max-w-md"
        >
          <motion.h1
            variants={fadeInUp}
            className="font-display text-3xl font-semibold tracking-tight text-foreground"
          >
            Create your account
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-2 text-sm text-muted-foreground">
            Start managing inventory and orders in seconds.
          </motion.p>

          <motion.form
            variants={stagger(0.06)}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            <motion.div variants={fadeInUp} className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground/85">
                Full name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="full_name"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className="input-glow h-11 pl-10 text-foreground"
                  {...register("full_name")}
                />
              </div>
              {errors.full_name ? (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              ) : null}
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
              <Label htmlFor="email" className="text-foreground/85">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-glow h-11 pl-10 text-foreground"
                  {...register("email")}
                />
              </div>
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
              <Label htmlFor="password" className="text-foreground/85">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="input-glow h-11 pl-10 text-foreground"
                  {...register("password")}
                />
              </div>
              {password ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < strength ? strengthColors[strength] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength:{" "}
                    <span className="font-medium text-foreground">
                      {strengthLabels[strength]}
                    </span>
                  </p>
                </div>
              ) : null}
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button
                type="submit"
                disabled={submitting}
                className="btn-gradient h-11 w-full gap-2 text-white shadow-glow-violet"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Create account
              </Button>
            </motion.div>
          </motion.form>

          <motion.p
            variants={fadeInUp}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </motion.section>
    </div>
  );
}
