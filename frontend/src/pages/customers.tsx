import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { customersApi } from "@/api/endpoints";
import type { CustomerInput } from "@/api/types";
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
import { extractApiError, formatDate } from "@/lib/errors";

const schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(3, "Phone is required"),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CustomersPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.list,
  });

  const createMut = useMutation({
    mutationFn: (data: CustomerInput) => customersApi.create(data),
    onSuccess: () => {
      toast.success("Customer created");
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => customersApi.remove(id),
    onSuccess: () => {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer records.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add customer
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search by name, email, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.full_name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell className="max-w-sm truncate text-slate-600">
                        {c.address ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(c.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Delete "${c.full_name}"?`)) deleteMut.mutate(c.id);
                          }}
                          aria-label={`Delete ${c.full_name}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CustomerDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(values) =>
          createMut.mutate({
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            address: values.address || null,
          })
        }
        submitting={createMut.isPending}
      />
    </div>
  );
}

function CustomerDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  submitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", phone: "", address: "" },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>Fill out the form to add a new customer.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            onSubmit(values);
            reset();
          })}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="c_name">Full name</Label>
            <Input id="c_name" {...register("full_name")} />
            {errors.full_name ? (
              <p className="text-sm text-red-600">{errors.full_name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c_email">Email</Label>
            <Input id="c_email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c_phone">Phone</Label>
            <Input id="c_phone" {...register("phone")} />
            {errors.phone ? (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c_addr">Address</Label>
            <Input id="c_addr" {...register("address")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
