// src/admin/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUsers, FaChartPie, FaFlag, FaHandshake, FaHome } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { path: "/admin", name: "Dashboard", icon: <FaHome /> },
    { path: "/admin/users", name: "Users", icon: <FaUsers /> },
    { path: "/admin/interactions", name: "Interactions", icon: <FaHandshake /> },
    { path: "/admin/reports", name: "Reports", icon: <FaFlag /> },
    { path: "/admin/system-stats", name: "System Stats", icon: <FaChartPie /> },
  ];

  return (
    <div className="w-64 bg-white shadow-md h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-pink-500">Admin Panel</h1>
      </div>

      <nav className="flex-1 p-6 overflow-y-auto">
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-pink-100 text-pink-700 font-semibold shadow-sm"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;