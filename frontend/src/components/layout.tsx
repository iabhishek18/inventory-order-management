import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
] as const;

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-radial opacity-60"
      />

      <DesktopSidebar onLogout={logout} userLabel={user?.full_name ?? user?.email} userEmail={user?.email} />

      <AnimatePresence>
        {mobileOpen && (
          <MobileDrawer
            onClose={() => setMobileOpen(false)}
            onLogout={logout}
            userLabel={user?.full_name ?? user?.email}
            userEmail={user?.email}
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
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
