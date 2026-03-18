import { useState, useEffect } from "react";
import axios from "axios";
import { endpoints } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  // Log khi component render
  useEffect(() => {
    console.log("🔄 AdminLogin component rendered");
    console.log("🌐 API LOGIN URL:", endpoints.login);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("👉 SUBMIT CLICKED");
    console.log("👉 SEND LOGIN TO:", endpoints.login);
    console.log("👉 FORM DATA:", form);

    try {
      const res = await axios.post(endpoints.login, form);

      console.log("✅ RESPONSE DATA:", res.data);

      localStorage.setItem("adminToken", res.data.token);
      nav("/admin");
    } catch (err) {
      console.log("❌ LOGIN FAILED RAW ERROR:", err);
      console.log("❌ LOGIN FAILED RESPONSE:", err.response?.data);

      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">

      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl mb-4 font-semibold">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Login
        </button>

      </form>

    </div>
  );
}
