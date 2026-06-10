import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { routeFade } from "@/lib/motion";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
] as const;

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavList = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ to, label, icon: Icon }, i) => (
        <motion.div
          key={to}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * i + 0.1, duration: 0.3 }}
        >
          <NavLink
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-brand-500/15 via-violet-500/10 to-cyan-400/10 text-slate-900 shadow-sm ring-1 ring-inset ring-brand-500/15"
                  : "text-slate-600 hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="nav-active-bar"
                    className="absolute -left-0.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-gradient"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-700",
                  )}
                />
                {label}
              </>
            )}
          </NavLink>
        </motion.div>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <motion.aside
        initial={{ x: -32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex"
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient shadow-glow-violet">
            <Boxes className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-lg font-semibold text-slate-900">
            IOMS
          </span>
        </div>
        {NavList}
        <div className="mt-auto border-t border-slate-200 p-3">
          <div className="px-2 pb-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {user?.full_name}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 text-slate-600 transition-colors hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex md:hidden"
          >
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="relative z-50 flex w-64 flex-col bg-white shadow-2xl"
            >
              <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient">
                    <Boxes className="h-4 w-4 text-white" />
                  </span>
                  <span className="font-display text-lg font-semibold text-slate-900">
                    IOMS
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {NavList}
              <div className="mt-auto border-t border-slate-200 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm text-slate-500 md:hidden">
            Signed in as{" "}
            <span className="font-medium text-slate-900">{user?.email}</span>
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={routeFade}
              initial="hidden"
              animate="show"
              exit="exit"
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-mesh bg-[length:200%_200%] animate-gradient-x shadow-glow">
        <Boxes className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">IOMS</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Inventory · Orders
        </span>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="absolute inset-0 -z-10 rounded-md bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isActive ? "" : "group-hover:scale-110",
                )}
              />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserPanel({
  userLabel,
  userEmail,
  onLogout,
}: {
  userLabel?: string | null;
  userEmail?: string | null;
  onLogout: () => void;
}) {
  const initials = (userLabel ?? userEmail ?? "?")
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="border-t border-border/60 p-3">
      <div className="flex items-center gap-3 rounded-md p-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-mesh text-xs font-semibold text-white">
          {initials || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {userLabel ?? "Account"}
          </p>
          {userEmail && (
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}

function DesktopSidebar({
  onLogout,
  userLabel,
  userEmail,
}: {
  onLogout: () => void;
  userLabel?: string | null;
  userEmail?: string | null;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/60 backdrop-blur-xl md:flex">
      <div className="flex h-16 items-center px-5">
        <BrandMark />
      </div>
      <div className="mt-2 flex flex-1 flex-col">
        <NavLinks />
      </div>
      <UserPanel userLabel={userLabel} userEmail={userEmail} onLogout={onLogout} />
    </aside>
  );
}

function MobileDrawer({
  onClose,
  onLogout,
  userLabel,
  userEmail,
}: {
  onClose: () => void;
  onLogout: () => void;
  userLabel?: string | null;
  userEmail?: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border/60 bg-card shadow-floating"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <BrandMark />
          <Button variant="ghost" size="icon" aria-label="Close menu" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-2 flex flex-1 flex-col">
          <NavLinks onNavigate={onClose} />
        </div>
        <UserPanel userLabel={userLabel} userEmail={userEmail} onLogout={onLogout} />
      </motion.aside>
    </div>
  );
}

function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={onOpenMobile}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="md:hidden">
        <BrandMark />
      </div>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
