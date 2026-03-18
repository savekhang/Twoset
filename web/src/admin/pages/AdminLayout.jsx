// src/admin/AdminLayout.jsx (PHIÊN BẢN HOÀN CHỈNH - KHÔNG LỖI HI� doesplay)
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useEffect } from "react";

export default function AdminLayout() {
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) nav("/admin/login");
  }, [nav]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - cố định */}
      <Sidebar />

      {/* Right Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - cố định */}
        <Topbar />

        {/* Nội dung chính - cuộn được, padding hợp lý */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 pb-10 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}