import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';

// New Smart Cafe Pages
import Login from './components/auth/Login';
import AdminDashboard from './components/dashboard/AdminDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import FastOrderCashier from './components/billing/FastOrderCashier';
import CustomerMenu from './components/customer/CustomerMenu';
import MenuQRCode from './components/customer/MenuQRCode';
import ManageOrders from './components/orders/ManageOrders';
import ProductManagement from './components/products/ProductManagement';
import ViewBills from './components/billing/ViewBills';

// Legacy Pages (Kept for backward compatibility)
import MainCodeMaster from './components/masters/MainCodeMaster';
import SubCodeMaster from './components/masters/SubCodeMaster';
import SupplierMaster from './components/masters/SupplierMaster';
import UserMaster from './components/masters/UserMaster';
import TakeOrder from './components/billing/TakeOrder';
import AddPurchase from './components/purchase/AddPurchase';
import ViewPurchases from './components/purchase/ViewPurchases';
import ReadyItems from './components/purchase/ReadyItems';
import StockView from './components/stock/StockView';
import SalesReport from './components/reports/SalesReport';
import ItemwiseSales from './components/reports/ItemwiseSales';
import UserwiseSales from './components/reports/UserwiseSales';
import DailyCollection from './components/reports/DailyCollection';
import PurchaseSummary from './components/reports/PurchaseSummary';
import StockReport from './components/reports/StockReport';
import ProfitReport from './components/reports/ProfitReport';
import SupplierReport from './components/reports/SupplierReport';
import ShowWiseCollection from './components/reports/ShowWiseCollection';
import BusinessSettings from './components/settings/BusinessSettings';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

      {/* Public Routes - Customer Menu & QR Code */}
      <Route path="/menu" element={<CustomerMenu />} />
      <Route path="/menu-qr" element={<MenuQRCode />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
          </ProtectedRoute>
        }
      />

      {/* NEW SMART CAFE ROUTES */}
      {/* Fast Order - Cashier */}
      <Route
        path="/cashier/fast-order"
        element={
          <ProtectedRoute>
            <FastOrderCashier />
          </ProtectedRoute>
        }
      />

      {/* Manage Customer Orders */}
      <Route
        path="/orders/manage"
        element={
          <ProtectedRoute>
            <ManageOrders />
          </ProtectedRoute>
        }
      />

      {/* Product Management - Admin Only */}
      <Route
        path="/products/manage"
        element={
          <ProtectedRoute adminOnly>
            <ProductManagement />
          </ProtectedRoute>
        }
      />

      {/* View Bills */}
      <Route
        path="/billing/view-bills"
        element={
          <ProtectedRoute>
            <ViewBills />
          </ProtectedRoute>
        }
      />

      {/* LEGACY ROUTES - Kept for backward compatibility */}
      {/* Masters - Admin Only */}
      <Route
        path="/masters/maincodes"
        element={
          <ProtectedRoute adminOnly>
            <MainCodeMaster />
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/subcodes"
        element={
          <ProtectedRoute adminOnly>
            <SubCodeMaster />
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/suppliers"
        element={
          <ProtectedRoute adminOnly>
            <SupplierMaster />
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/users"
        element={
          <ProtectedRoute adminOnly>
            <UserMaster />
          </ProtectedRoute>
        }
      />

      {/* Legacy Billing */}
      <Route
        path="/billing/take-order"
        element={
          <ProtectedRoute>
            <TakeOrder />
          </ProtectedRoute>
        }
      />

      {/* Purchase - Admin Only */}
      <Route
        path="/purchase/add"
        element={
          <ProtectedRoute adminOnly>
            <AddPurchase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase/view"
        element={
          <ProtectedRoute adminOnly>
            <ViewPurchases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase/ready-items"
        element={
          <ProtectedRoute adminOnly>
            <ReadyItems />
          </ProtectedRoute>
        }
      />

      {/* Stock - Admin Only */}
      <Route
        path="/stock"
        element={
          <ProtectedRoute adminOnly>
            <StockView />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports/sales"
        element={
          <ProtectedRoute>
            <SalesReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/itemwise"
        element={
          <ProtectedRoute>
            <ItemwiseSales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/userwise"
        element={
          <ProtectedRoute adminOnly>
            <UserwiseSales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/daily-collection"
        element={
          <ProtectedRoute>
            <DailyCollection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/show-wise-collection"
        element={
          <ProtectedRoute adminOnly>
            <ShowWiseCollection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/purchases"
        element={
          <ProtectedRoute adminOnly>
            <PurchaseSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/stock"
        element={
          <ProtectedRoute adminOnly>
            <StockReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/profit"
        element={
          <ProtectedRoute adminOnly>
            <ProfitReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/suppliers"
        element={
          <ProtectedRoute adminOnly>
            <SupplierReport />
          </ProtectedRoute>
        }
      />

      {/* Settings - Admin Only */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute adminOnly>
            <BusinessSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
