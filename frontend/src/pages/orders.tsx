import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Plus, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { extractApiError, formatCurrency, formatDate } from "@/lib/errors";

type DraftItem = { product_id: number | ""; quantity: number };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">Place and review customer orders.</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={customers.length === 0 || products.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          New order
        </Button>
      </div>

      {customers.length === 0 || products.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-600">
            Add at least one customer and one product before creating orders.
          </CardContent>
        </Card>
      ) : null}

      <Card>
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
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">#{o.id}</TableCell>
                      <TableCell className="font-medium">{o.customer_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={o.status === "cancelled" ? "destructive" : "secondary"}
                        >
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{o.item_count}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(o.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
    </div>
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
            Total is calculated automatically by the server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="o_customer">Customer</Label>
            <select
              id="o_customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const product =
                  item.product_id !== "" ? productMap.get(item.product_id) : undefined;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_120px_auto] items-end gap-2"
                  >
                    <div>
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
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="">Select a product...</option>
                        {products.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={p.quantity_in_stock <= 0}
                          >
                            {p.name} — {formatCurrency(p.price)} (stock: {p.quantity_in_stock}
                            )
                          </option>
                        ))}
                      </select>
                    </div>
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
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
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
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-600">Estimated total</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Placing..." : "Place order"}
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
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Customer</p>
                <p className="font-medium text-slate-900">{data.customer_name}</p>
                <p className="text-slate-600">{data.customer_email}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <Badge variant={data.status === "cancelled" ? "destructive" : "secondary"}>
                  {data.status}
                </Badge>
              </div>
            </div>
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
                    <TableCell className="font-mono text-xs">{it.product_sku}</TableCell>
                    <TableCell>{it.product_name}</TableCell>
                    <TableCell className="text-right">{it.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(it.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(it.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-semibold text-slate-900">
                {formatCurrency(data.total_amount)}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
