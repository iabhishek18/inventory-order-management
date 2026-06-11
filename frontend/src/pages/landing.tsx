import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Github,
  LineChart,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroSceneLazy } from "@/components/three/hero-scene-lazy";
import {
  fadeIn,
  fadeInUp,
  slideInLeft,
  slideInRight,
  stagger,
  useCountUp,
} from "@/lib/motion";

const trustedLogos = [
  "Northwind",
  "Acme Supply",
  "Loop Logistics",
  "Hexa Retail",
  "Vertex Goods",
  "Atlas Co.",
];

const features = [
  {
    icon: PackageSearch,
    title: "Real-time inventory",
    body: "See every SKU, every warehouse, every movement — updated the moment it happens, never a refresh later.",
  },
  {
    icon: ShoppingCart,
    title: "Frictionless orders",
    body: "Capture, route, and fulfill in one flow. Cart-to-shipped in fewer clicks than your spreadsheet takes to open.",
  },
  {
    icon: Users,
    title: "Customer intelligence",
    body: "Repeat buyers, churn risk, lifetime value — surfaced where you actually make decisions.",
  },
  {
    icon: LineChart,
    title: "Analytics that decide",
    body: "Not vanity dashboards. Cohorts, margins, and stock velocity tuned for ops teams that ship daily.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-grade trail",
    body: "Every edit signed, every action traceable. SOC2-ready primitives so compliance never blocks shipping.",
  },
  {
    icon: Workflow,
    title: "Plays well with everything",
    body: "REST + webhooks. Drop into Shopify, Stripe, NetSuite, and the homegrown thing nobody touches.",
  },
];

const steps = [
  {
    n: "01",
    title: "Connect your stock",
    body: "Import via CSV or sync warehouses with a single click. Stock counts reconcile automatically.",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop",
  },
  {
    n: "02",
    title: "Capture orders fluidly",
    body: "Pipe in orders from any channel. Routing rules send each one to the right warehouse, instantly.",
    img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80&auto=format&fit=crop",
  },
  {
    n: "03",
    title: "Decide with signal",
    body: "Margins, velocity, low-stock alerts — turned into one calm screen instead of seven tabs.",
    img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&q=80&auto=format&fit=crop",
  },
];

const stats: { value: number; suffix: string; label: string }[] = [
  { value: 12000, suffix: "+", label: "Operators on board" },
  { value: 4.2, suffix: "M", label: "Orders processed monthly" },
  { value: 99.99, suffix: "%", label: "Sync uptime" },
  { value: 38, suffix: "%", label: "Avg. fulfillment time saved" },
];

const testimonials = [
  {
    quote:
      "Replaced a 7-tab workflow with one screen. Our ops team got their evenings back.",
    name: "Maya Sundaram",
    role: "Head of Operations, Loop Logistics",
    avatar: "https://i.pravatar.cc/120?u=ioms-maya",
  },
  {
    quote:
      "The fastest stock-to-shipped flow we've seen. Setup took an afternoon, not a quarter.",
    name: "Daniel Okafor",
    role: "COO, Vertex Goods",
    avatar: "https://i.pravatar.cc/120?u=ioms-daniel",
  },
  {
    quote:
      "Finally an inventory tool that thinks like an operator, not an accountant.",
    name: "Sofia Linde",
    role: "Founder, Hexa Retail",
    avatar: "https://i.pravatar.cc/120?u=ioms-sofia",
  },
];

function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const v = useCountUp(value, 1400, inView);
  const display =
    value % 1 === 0
      ? Math.round(v).toLocaleString()
      : v.toFixed(2);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-semibold text-gradient sm:text-5xl">
        {display}
        {suffix}
      </div>
      <p className="mt-2 text-sm text-slate-300/80">{label}</p>
    </div>
  );
}

function TopNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2 text-slate-100 transition-transform hover:scale-[1.02]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient shadow-glow-violet">
            <Boxes className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-lg font-semibold tracking-wide">
            IOMS
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a className="transition-colors hover:text-white" href="#features">
            Features
          </a>
          <a className="transition-colors hover:text-white" href="#how">
            How it works
          </a>
          <a className="transition-colors hover:text-white" href="#stats">
            Numbers
          </a>
          <a className="transition-colors hover:text-white" href="#reviews">
            Reviews
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-slate-200 hover:bg-white/10 hover:text-white" />
          <Link
            to="/login"
            className="hidden text-sm text-slate-200 transition-colors hover:text-white sm:inline-block"
          >
            Sign in
          </Link>
          <Button
            asChild
            className="btn-gradient h-9 gap-1 px-4 text-sm text-white shadow-glow-violet"
          >
            <Link to="/register">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-ink-gradient pt-32 sm:pt-36 lg:pt-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute -top-32 left-1/3 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl animate-aurora-slow" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[34rem] w-[34rem] translate-x-1/4 rounded-full bg-cyan-400/20 blur-3xl animate-aurora-fast" />

      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-32"
      >
        <motion.div
          variants={stagger(0.1, 0.05)}
          initial="hidden"
          animate="show"
          className="relative z-10"
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Now in public preview
            </span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Inventory and orders, <br />
            <span className="text-gradient">in perfect motion.</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300/85"
          >
            IOMS is the operations cockpit for growing brands — real-time stock,
            fluid orders, and analytics that finally tell you what to do next.
            Built for teams that ship every day.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="btn-gradient h-12 w-full gap-2 px-6 text-white shadow-glow-violet sm:w-auto"
            >
              <Link to="/register">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full gap-2 border-white/15 bg-white/[0.04] px-6 text-slate-100 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10 sm:w-auto"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center gap-4 text-sm text-slate-400"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  alt=""
                  loading="lazy"
                  src={`https://i.pravatar.cc/64?u=ioms-hero-${i}`}
                  className="h-8 w-8 rounded-full border-2 border-ink-900 object-cover"
                />
              ))}
            </div>
            <span>
              Trusted by{" "}
              <span className="font-semibold text-slate-200">12,000+</span>{" "}
              operators worldwide
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={slideInRight}
          initial="hidden"
          animate="show"
          className="relative h-[420px] w-full sm:h-[520px] lg:h-[600px]"
        >
          <div className="absolute inset-0 rounded-3xl border border-white/10 bg-white/[0.02] shadow-glow-indigo">
            <HeroSceneLazy className="!absolute inset-0 rounded-3xl" />
          </div>
          <div className="pointer-events-none absolute inset-x-8 -bottom-6 h-12 rounded-full bg-violet-500/40 blur-3xl" />
        </motion.div>
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.32em] text-slate-500">
          Operators choosing IOMS
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {trustedLogos.map((name) => (
            <span
              key={name}
              className="font-display text-sm font-semibold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-200"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section
      id="features"
      className="relative isolate overflow-hidden bg-ink-900 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-slate-300"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-300" /> Everything you need
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            A control room for{" "}
            <span className="text-gradient">modern operations.</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-5 text-lg text-slate-300/80"
          >
            Six tightly built primitives that replace the patchwork of tools
            slowing your team down.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-gradient opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-cyan-200 ring-1 ring-inset ring-white/10">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300/80">
                {body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how"
      className="relative isolate overflow-hidden bg-ink-700 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute -top-40 right-0 h-[36rem] w-[36rem] translate-x-1/4 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Three steps. <span className="text-gradient">Zero drama.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-300/80">
            Onboarding measured in hours, not quarters.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              variants={i === 0 ? slideInLeft : i === 2 ? slideInRight : fadeInUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={s.img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
                <span className="absolute left-5 top-5 font-display text-sm font-semibold tracking-[0.32em] text-cyan-300">
                  {s.n}
                </span>
              </div>
              <div className="space-y-2 p-7">
                <h3 className="font-display text-xl font-semibold text-white">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-300/80">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section
      id="stats"
      className="relative isolate overflow-hidden bg-ink-900 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-y-10 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeInUp}>
              <Stat {...s} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section
      id="reviews"
      className="relative isolate overflow-hidden bg-ink-700 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Loved by the{" "}
            <span className="text-gradient">people who actually ship.</span>
          </h2>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors hover:border-white/20"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
              <BarChart3 className="h-6 w-6 text-cyan-300" />
              <blockquote className="mt-4 text-base leading-relaxed text-slate-100/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur sm:p-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-20" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/40 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Ready to put your ops <br />
              <span className="text-gradient">in perfect motion?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-200/85">
              Two-minute setup. Free forever for solo operators. No credit card.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="btn-gradient h-12 gap-2 px-7 text-white shadow-glow-violet"
              >
                <Link to="/register">
                  Create your workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 gap-2 border-white/15 bg-white/[0.04] px-7 text-slate-100 backdrop-blur hover:border-white/30 hover:bg-white/10"
              >
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-300/80">
              {[
                "Free for solo operators",
                "Cancel anytime",
                "SOC2-ready primitives",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-ink-900 pb-10 pt-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-4 pt-8 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-gradient">
            <Boxes className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-display font-semibold text-slate-200">IOMS</span>
          <span className="ml-2">© {new Date().getFullYear()} Inventory & Order Management</span>
        </div>
        <div className="flex items-center gap-5">
          <a className="transition-colors hover:text-white" href="#features">
            Features
          </a>
          <a className="transition-colors hover:text-white" href="#reviews">
            Reviews
          </a>
          <a
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            href="https://github.com/iabhishek18/inventory-order-management"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="min-h-screen scroll-elegant bg-ink-900 text-slate-100"
    >
      <TopNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </motion.div>
  );
}
