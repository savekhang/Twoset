import React, { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import { FaUsers, FaHeart, FaFlag, FaCheck } from "react-icons/fa";
import axios from "axios";

import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from "chart.js";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement
);

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalMatches: 0,
    totalLikes: 0,
    totalReports: 0,
    revenueByMonth: [],
    topLikedUsers: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${process.env.REACT_APP_ADMIN_BE}/dashboard-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats({
        ...res.data,
        revenueByMonth: res.data.revenueByMonth || [],
        topLikedUsers: res.data.topLikedUsers || []
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  // ===================== CHART DATA =====================
  // Doughnut Chart
  const doughnutData = {
    labels: ["Normal Users", "Premium Users"],
    datasets: [{
      data: [stats.totalUsers - stats.premiumUsers, stats.premiumUsers],
      backgroundColor: ["#60A5FA", "#FBBF24"],
    }],
  };

  // Likes vs Matches
  const likeMatchData = {
    labels: ["Likes", "Matches"],
    datasets: [{
      label: "Total",
      data: [stats.totalLikes, stats.totalMatches],
      backgroundColor: ["#F87171", "#60A5FA"]
    }]
  };

  // Revenue By Month – đảm bảo hiển thị từ tháng 1 tới tháng hiện tại
  const getMonthsOfYear = () => {
    const now = new Date();
    const months = [];
    for (let m = 0; m <= now.getMonth(); m++) {
      const monthStr = `${now.getFullYear()}-${(m + 1).toString().padStart(2, '0')}`;
      months.push(monthStr);
    }
    return months;
  };
  const allMonths = getMonthsOfYear();

  const revenueByMonthFull = allMonths.map(month => {
    const found = stats.revenueByMonth.find(r => r.month === month);
    return { month, total: found ? parseFloat(found.total) : 0 };
  });

  const revenueData = {
    labels: revenueByMonthFull.map(r => r.month),
    datasets: [{
      label: "Revenue ($)",
      data: revenueByMonthFull.map(r => r.total),
      borderColor: "#10B981",
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      tension: 0.3,
      fill: true,
    }]
  };

  const revenueOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: context => `$${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      },
      legend: { display: false }
    },
    scales: {
      y: {
        ticks: {
          callback: value => `$${value.toLocaleString()}`
        }
      },
      x: { ticks: { autoSkip: false } }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={<FaUsers />} />
        <StatsCard title="Matches" value={stats.totalMatches} icon={<FaHeart />} />
        <StatsCard title="Reports" value={stats.totalReports} icon={<FaFlag />} />
        <StatsCard title="Premium Users" value={stats.premiumUsers} icon={<FaCheck />} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">User Type Distribution</h2>
          <Doughnut data={doughnutData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Likes vs Matches</h2>
          <Bar data={likeMatchData} />
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <h2 className="text-lg font-semibold mb-4">Revenue By Month</h2>
        <Line data={revenueData} options={revenueOptions} />
      </div>

      {/* Top 5 Liked Users */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Top 5 Users With Most Likes</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">User</th>
              <th className="p-3">Likes</th>
            </tr>
          </thead>
          <tbody>
            {stats.topLikedUsers.map((u, idx) => (
              <tr key={u.id} className="border-b">
                <td className="p-3 flex items-center gap-3">
                  <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <span>{idx + 1}. {u.name}</span>
                </td>
                <td className="p-3 font-semibold">{u.likeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardHome;
