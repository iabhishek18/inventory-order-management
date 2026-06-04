import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Package, ShoppingCart, Users } from "lucide-react";
import { dashboardApi } from "@/api/endpoints";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/errors";

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.summary,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Operational overview of your inventory.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={data?.total_products}
          icon={<Package className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Total Customers"
          value={data?.total_customers}
          icon={<Users className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Total Orders"
          value={data?.total_orders}
          icon={<ShoppingCart className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          label="Low Stock"
          value={data?.low_stock_count}
          icon={<AlertTriangle className="h-5 w-5" />}
          loading={isLoading}
          accent={data && data.low_stock_count > 0 ? "warn" : undefined}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low stock products
            {data ? (
              <span className="text-sm font-normal text-slate-500">
                (threshold &le; {data.low_stock_threshold})
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-sm text-red-600">Failed to load dashboard.</p>
          ) : isLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
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
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.price)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={p.quantity_in_stock === 0 ? "destructive" : "warning"}>
                          {p.quantity_in_stock}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">All products are sufficiently stocked.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  loading,
  accent,
}: {
  label: string;
  value: number | undefined;
  icon: ReactNode;
  loading: boolean;
  accent?: "warn";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p
              className={
                "mt-2 text-3xl font-semibold " +
                (accent === "warn" ? "text-amber-600" : "text-slate-900")
              }
            >
              {loading ? "—" : (value ?? 0)}
            </p>
          </div>
          <div
            className={
              "rounded-lg p-2 " +
              (accent === "warn"
                ? "bg-amber-100 text-amber-600"
                : "bg-slate-100 text-slate-600")
            }
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
