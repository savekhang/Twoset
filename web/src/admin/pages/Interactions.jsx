import { useEffect, useState } from "react";
import axios from "axios";
import { endpoints, authHeader } from "../api";

export default function Interactions() {
  const [likes, setLikes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(endpoints.interactions, authHeader())
      .then((res) => {
        console.log("🔥 Interactions loaded:", res.data);

        const likeList = res.data.filter((i) => i.type === "like");
        const matchList = res.data.filter((i) => i.type === "match");

        setLikes(likeList);
        setMatches(matchList);
      })
      .catch((err) => {
        console.error("❌ Error loading interactions:", err.response?.data || err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading interactions...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Interactions</h2>

      {/* ================== LIKES ================== */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-3 text-blue-600">Likes</h3>

        <table className="bg-white w-full shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Super Like?</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>

          <tbody>
            {likes.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="p-3 font-medium">{i.from?.name}</td>
                <td className="p-3 font-medium">{i.to?.name}</td>
                <td className="p-3">
                  {i.is_super_like ? (
                    <span className="text-red-500 font-semibold">Yes ❤️</span>
                  ) : (
                    "No"
                  )}
                </td>
                <td className="p-3">{i.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================== MATCHES ================== */}
      <div>
        <h3 className="text-xl font-semibold mb-3 text-green-600">Matches</h3>

        <table className="bg-white w-full shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">User A</th>
              <th className="p-3">User B</th>
              <th className="p-3">Matched At</th>
            </tr>
          </thead>

          <tbody>
            {matches.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="p-3 font-medium">{i.from?.name}</td>
                <td className="p-3 font-medium">{i.to?.name}</td>
                <td className="p-3">{i.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
