import { useEffect, useState } from "react";
import axios from "axios";
import { endpoints, authHeader } from "../api";
import { FaUsers, FaHeart, FaExclamationTriangle } from "react-icons/fa";

export default function SystemStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(endpoints.stats, authHeader())
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FaUsers className="text-blue-500 text-3xl" />,
      bg: "bg-white"
    },
    {
      title: "Interactions",
      value: stats.totalInteractions,
      icon: <FaHeart className="text-pink-500 text-3xl" />,
      bg: "bg-white"
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: <FaExclamationTriangle className={`text-3xl ${stats.pendingReports > 0 ? 'text-red-500' : 'text-gray-400'}`} />,
      bg: "bg-white"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((c, idx) => (
        <div key={idx} className={`p-5 rounded shadow flex items-center justify-between ${c.bg}`}>
          <div>
            <p className="text-gray-500">{c.title}</p>
            <h2 className="text-3xl font-bold">{c.value}</h2>
          </div>
          <div>
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
