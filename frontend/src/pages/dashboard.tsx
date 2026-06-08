import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Boxes,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { dashboardApi } from "@/api/endpoints";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTransition, staggerContainer, staggerItem } from "@/components/page-transition";
import { useCountUp } from "@/hooks/use-count-up";
import { formatCurrency } from "@/lib/errors";
import { cn } from "@/lib/utils";

type StatTone = "primary" | "info" | "success" | "warn";

const TONE_STYLES: Record<StatTone, { icon: string; ring: string }> = {
  primary: {
    icon: "from-indigo-500/20 via-violet-500/20 to-blue-500/20 text-primary",
    ring: "ring-primary/20",
  },
  info: {
    icon: "from-sky-500/20 via-cyan-500/20 to-blue-500/20 text-sky-500 dark:text-sky-400",
    ring: "ring-sky-500/20",
  },
  success: {
    icon: "from-emerald-500/20 via-teal-500/20 to-green-500/20 text-emerald-500 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  warn: {
    icon: "from-amber-500/20 via-orange-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
};

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.summary,
  });

  const lowStockTone: StatTone = data && data.low_stock_count > 0 ? "warn" : "success";

  return (
    <PageTransition>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={staggerItem} className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Overview
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            A live snapshot of inventory, customers, and order activity.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            label="Total Products"
            value={data?.total_products}
            icon={<Package className="h-5 w-5" />}
            loading={isLoading}
            tone="primary"
            hint="Items in catalog"
          />
          <StatCard
            label="Total Customers"
            value={data?.total_customers}
            icon={<Users className="h-5 w-5" />}
            loading={isLoading}
            tone="info"
            hint="Active records"
          />
          <StatCard
            label="Total Orders"
            value={data?.total_orders}
            icon={<ShoppingCart className="h-5 w-5" />}
            loading={isLoading}
            tone="success"
            hint="Placed all-time"
          />
          <StatCard
            label="Low Stock"
            value={data?.low_stock_count}
            icon={<AlertTriangle className="h-5 w-5" />}
            loading={isLoading}
            tone={lowStockTone}
            hint={data ? `Threshold ≤ ${data.low_stock_threshold}` : "Threshold —"}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Low stock products
                </CardTitle>
                <CardDescription>
                  Items running low — restock to avoid out-of-stock orders.
                </CardDescription>
              </div>
              {data ? (
                <Badge variant={data.low_stock_count > 0 ? "warning" : "secondary"}>
                  {data.low_stock_count} item{data.low_stock_count === 1 ? "" : "s"}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="p-0">
              {isError ? (
                <div className="p-6 text-sm text-destructive">Failed to load dashboard.</div>
              ) : isLoading ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : data && data.low_stock_products.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">In stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.low_stock_products.map((p) => (
                        <TableRow key={p.id} className="group transition-colors">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {p.sku}
                          </TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(p.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={p.quantity_in_stock === 0 ? "destructive" : "warning"}
                            >
                              {p.quantity_in_stock}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All products well-stocked</p>
                  <p className="text-xs text-muted-foreground">
                    Inventory is healthy above the low-stock threshold.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" />
                System health
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 pt-0">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <p className="text-sm">
                <span className="font-medium text-foreground">Operational</span>
                <span className="ml-2 text-muted-foreground">All services healthy</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Boxes className="h-4 w-4 text-primary" />
                Quick tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0 text-sm text-muted-foreground">
              <p>· Use the search bar in Products to filter by SKU or name.</p>
              <p>· Cancelling an order automatically returns items to stock.</p>
              <p>· Toggle the theme from the top-right toolbar.</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}

function StatCard({
  label,
  value,
  icon,
  loading,
  tone,
  hint,
}: {
  label: string;
  value: number | undefined;
  icon: ReactNode;
  loading: boolean;
  tone: StatTone;
  hint?: string;
}) {
  const animated = useCountUp(value ?? 0, { enabled: !loading && value != null });
  const display = loading || value == null ? null : Math.round(animated).toLocaleString();
  const styles = TONE_STYLES[tone];

  return (
    <motion.div variants={staggerItem}>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 ease-smooth",
          "hover:-translate-y-0.5 hover:shadow-floating hover:ring-1",
          styles.ring,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent",
          )}
        />
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <div className="flex items-baseline gap-2">
                {display == null ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                    {display}
                  </p>
                )}
              </div>
              {hint && (
                <p className="text-[11px] text-muted-foreground/80">{hint}</p>
              )}
            </div>
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-soft transition-transform duration-300 group-hover:scale-110",
                styles.icon,
              )}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
