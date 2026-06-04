import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { CustomersPage } from "@/pages/customers";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { OrdersPage } from "@/pages/orders";
import { ProductsPage } from "@/pages/products";
import { RegisterPage } from "@/pages/register";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
