import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
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
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
];

export function Layout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavList = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <Boxes className="h-6 w-6 text-slate-900" />
          <span className="text-lg font-semibold text-slate-900">IOMS</span>
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
            className="w-full justify-start gap-2 text-slate-600 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <div className="flex items-center gap-2">
                <Boxes className="h-6 w-6 text-slate-900" />
                <span className="text-lg font-semibold text-slate-900">IOMS</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
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
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 md:hidden"
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
