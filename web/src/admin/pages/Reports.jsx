import { useState, useEffect } from "react";
import axios from "axios";
import { endpoints, authHeader } from "../api";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axios.get(endpoints.reports, authHeader())
      .then(res => setReports(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reports</h2>

      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3">Reporter</th>
            <th className="p-3">Target</th>
            <th className="p-3">Reason</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {reports.map(r => (
            <tr key={r.id} className="border-b">
              <td className="p-3">{r.reporterName}</td>
              <td className="p-3">{r.targetName}</td>
              <td className="p-3">{r.reason}</td>
              <td className="p-3">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
