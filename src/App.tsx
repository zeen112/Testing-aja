
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "./context/InventoryContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ProductList from "./components/ProductList";
import CategoryList from "./components/CategoryList";
import SupplierList from "./components/SupplierList";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import NotFound from "./pages/NotFound";
import StockAlerts from "./components/StockAlerts";
import POS from "./components/POS";
import TransactionHistory from "./components/TransactionHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <InventoryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/suppliers" element={<SupplierList />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/stock-alerts" element={<StockAlerts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/transactions" element={<TransactionHistory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </InventoryProvider>
  </QueryClientProvider>
);

export default App;
