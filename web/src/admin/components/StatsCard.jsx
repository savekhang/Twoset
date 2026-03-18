// src/admin/components/StatsCard.jsx
import React from "react";

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
      <div className="text-3xl text-pink-500">{icon}</div>

      <div>
        <h3 className="text-gray-600 text-sm">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
