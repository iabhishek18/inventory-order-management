import { api } from "@/lib/api";
import type {
  AuthToken,
  Customer,
  CustomerInput,
  DashboardSummary,
  Order,
  OrderInput,
  OrderListItem,
  Product,
  ProductInput,
  User,
} from "./types";

export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post<User>("/auth/register", data).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<AuthToken>("/auth/login/json", { email, password }).then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
};

export const productsApi = {
  list: () => api.get<Product[]>("/products").then((r) => r.data),
  get: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (data: ProductInput) => api.post<Product>("/products", data).then((r) => r.data),
  update: (id: number, data: Partial<ProductInput>) =>
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/products/${id}`).then(() => undefined),
};

export const customersApi = {
  list: () => api.get<Customer[]>("/customers").then((r) => r.data),
  get: (id: number) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
  create: (data: CustomerInput) =>
    api.post<Customer>("/customers", data).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/customers/${id}`).then(() => undefined),
};

export const ordersApi = {
  list: () => api.get<OrderListItem[]>("/orders").then((r) => r.data),
  get: (id: number) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  create: (data: OrderInput) => api.post<Order>("/orders", data).then((r) => r.data),
  cancel: (id: number) => api.delete<void>(`/orders/${id}`).then(() => undefined),
};

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard").then((r) => r.data),
};
