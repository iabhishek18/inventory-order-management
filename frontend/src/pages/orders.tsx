import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Eye,
  Loader2,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { customersApi, ordersApi, productsApi } from "@/api/endpoints";
import type { OrderInput } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageTransition,
  staggerContainer,
  staggerItem,
} from "@/components/page-transition";
import { extractApiError, formatCurrency, formatDate } from "@/lib/errors";
import { cn } from "@/lib/utils";

type DraftItem = { product_id: number | ""; quantity: number };

const selectClass = cn(
  "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm shadow-soft transition-all duration-200 ease-smooth",
  "hover:border-foreground/20",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function statusBadgeVariant(status: string): "destructive" | "secondary" | "success" {
  if (status === "cancelled") return "destructive";
  if (status === "completed" || status === "paid") return "success";
  return "secondary";
}

export function OrdersPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.list,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.list,
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.list,
  });

  const createMut = useMutation({
    mutationFn: (data: OrderInput) => ordersApi.create(data),
    onSuccess: () => {
      toast.success("Order created");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setCreateOpen(false);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const cancelMut = useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: () => {
      toast.success("Order cancelled");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const newOrderDisabled = customers.length === 0 || products.length === 0;

  return (
    <PageTransition>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div
          variants={staggerItem}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <ShoppingCart className="h-3.5 w-3.5 text-primary" />
              Sales
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="gradient-text">Orders</span>
            </h1>
            <p className="text-sm text-muted-foreground">Place and review customer orders.</p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setCreateOpen(true)}
            disabled={newOrderDisabled}
          >
            <Plus className="h-4 w-4" />
            New order
          </Button>
        </motion.div>

        {newOrderDisabled ? (
          <motion.div variants={staggerItem}>
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="flex items-center gap-3 pt-6 text-sm text-foreground">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/15 text-warning">
                  <Receipt className="h-4 w-4" />
                </div>
                <p>
                  Add at least one <span className="font-medium">customer</span> and one{" "}
                  <span className="font-medium">product</span> before creating orders.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        <motion.div variants={staggerItem}>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Placed</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <Receipt className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium text-foreground">No orders yet</p>
                            <p className="text-xs text-muted-foreground">
                              Place your first order to see it appear here.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((o) => (
                        <TableRow key={o.id} className="group transition-colors">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{o.id}
                          </TableCell>
                          <TableCell className="font-medium">{o.customer_name}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(o.status)} className="capitalize">
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{o.item_count}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatCurrency(o.total_amount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(o.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDetailId(o.id)}
                                aria-label={`View order ${o.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {o.status !== "cancelled" ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm(`Cancel order #${o.id}?`)) cancelMut.mutate(o.id);
                                  }}
                                  aria-label={`Cancel order ${o.id}`}
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <CreateOrderDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={(data) => createMut.mutate(data)}
          submitting={createMut.isPending}
        />
        <OrderDetailDialog
          id={detailId}
          onOpenChange={(o) => {
            if (!o) setDetailId(null);
          }}
        />
      </motion.div>
    </PageTransition>
  );
}

function CreateOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OrderInput) => void;
  submitting: boolean;
}) {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.list,
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.list,
  });

  const [customerId, setCustomerId] = useState<number | "">("");
  const [items, setItems] = useState<DraftItem[]>([{ product_id: "", quantity: 1 }]);

  const productMap = useMemo(() => {
    const m = new Map<number, (typeof products)[number]>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const estimatedTotal = items.reduce((sum, it) => {
    if (it.product_id === "" || !it.quantity) return sum;
    const product = productMap.get(it.product_id);
    if (!product) return sum;
    return sum + Number(product.price) * it.quantity;
  }, 0);

  const reset = () => {
    setCustomerId("");
    setItems([{ product_id: "", quantity: 1 }]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (customerId === "") {
      toast.error("Select a customer");
      return;
    }
    const cleanItems = items
      .filter((it) => it.product_id !== "" && it.quantity > 0)
      .map((it) => ({ product_id: Number(it.product_id), quantity: it.quantity }));
    if (cleanItems.length === 0) {
      toast.error("Add at least one item with quantity");
      return;
    }
    onSubmit({ customer_id: Number(customerId), items: cleanItems });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
          <DialogDescription>
            The total is calculated automatically by the server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="o_customer">Customer</Label>
            <SelectWrapper>
              <select
                id="o_customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
                className={selectClass}
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const product =
                  item.product_id !== "" ? productMap.get(item.product_id) : undefined;
                return (
                  <div key={idx} className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
                    <SelectWrapper>
                      <select
                        value={item.product_id}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx] = {
                            ...next[idx],
                            product_id: e.target.value ? Number(e.target.value) : "",
                          };
                          setItems(next);
                        }}
                        className={selectClass}
                      >
                        <option value="">Select a product…</option>
                        {products.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={p.quantity_in_stock <= 0}
                          >
                            {p.name} — {formatCurrency(p.price)} (stock: {p.quantity_in_stock})
                          </option>
                        ))}
                      </select>
                    </SelectWrapper>
                    <Input
                      type="number"
                      min={1}
                      max={product?.quantity_in_stock ?? undefined}
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = {
                          ...next[idx],
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        };
                        setItems(next);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      disabled={items.length === 1}
                      aria-label="Remove item"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItems([...items, { product_id: "", quantity: 1 }])}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 surface-1 px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">Estimated total</span>
            <span className="text-xl font-bold tabular-nums gradient-text">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailDialog({
  id,
  onOpenChange,
}: {
  id: number | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.get(id!),
    enabled: id !== null,
  });

  return (
    <Dialog open={id !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order #{id}</DialogTitle>
          <DialogDescription>
            {data ? `Placed ${formatDate(data.created_at)}` : ""}
          </DialogDescription>
        </DialogHeader>
        {isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Customer</p>
                <p className="font-medium text-foreground">{data.customer_name}</p>
                <p className="text-muted-foreground">{data.customer_email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
                <Badge variant={statusBadgeVariant(data.status)} className="capitalize">
                  {data.status}
                </Badge>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {it.product_sku}
                      </TableCell>
                      <TableCell>{it.product_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{it.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(it.unit_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(it.line_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 surface-1 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-xl font-bold tabular-nums gradient-text">
                {formatCurrency(data.total_amount)}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
