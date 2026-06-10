import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { CustomersPage } from "@/pages/customers";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { OrdersPage } from "@/pages/orders";
import { ProductsPage } from "@/pages/products";
import { RegisterPage } from "@/pages/register";

const LandingPage = lazy(() =>
  import("@/pages/landing").then((m) => ({ default: m.LandingPage })),
);

function FullScreenAurora() {
  return (
    <div
      className="fixed inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.45), transparent 55%), radial-gradient(circle at 70% 60%, rgba(34,211,238,0.25), transparent 55%), radial-gradient(circle at 50% 90%, rgba(79,70,229,0.4), transparent 50%), linear-gradient(135deg, #0B1023 0%, #1A0B2E 100%)",
      }}
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<FullScreenAurora />}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
