export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  quantity_in_stock: number;
  created_at: string;
  updated_at: string;
}

export type ProductInput = {
  name: string;
  sku: string;
  description?: string | null;
  price: string;
  quantity_in_stock: number;
};

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  created_at: string;
}

export type CustomerInput = {
  full_name: string;
  email: string;
  phone: string;
  address?: string | null;
};

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  status: string;
  total_amount: string;
  items: OrderItem[];
  created_at: string;
}

export interface OrderListItem {
  id: number;
  customer_id: number;
  customer_name: string;
  status: string;
  total_amount: string;
  item_count: number;
  created_at: string;
}

export type OrderInput = {
  customer_id: number;
  items: Array<{ product_id: number; quantity: number }>;
};

export interface DashboardSummary {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_count: number;
  low_stock_threshold: number;
  low_stock_products: Product[];
}
