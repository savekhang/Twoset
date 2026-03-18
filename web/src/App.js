import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLayout from "./admin/pages/AdminLayout.jsx";
import DashboardHome from "./admin/pages/DashboardHome";
import Users from "./admin/pages/Users";
import UserDetail from "./admin/pages/UserDetail";
import Reports from "./admin/pages/Reports";
import Interactions from "./admin/pages/Interactions";
import SystemStats from "./admin/pages/SystemStats";
import AdminLogin from "./admin/pages/AdminLogin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="interactions" element={<Interactions />} />
          <Route path="system-stats" element={<SystemStats />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
