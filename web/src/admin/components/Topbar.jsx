// src/admin/components/Topbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Avatar cố định đẹp cho admin (dùng một link ổn định)
const ADMIN_AVATAR = "https://ui-avatars.com/api/?name=Admin&background=ec4899&color=fff&bold=true&size=128";

const Topbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
        >
          <span className="text-gray-700 font-medium">Admin</span>
          <img
            src={ADMIN_AVATAR}
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full ring-2 ring-pink-500"
          />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Topbar;