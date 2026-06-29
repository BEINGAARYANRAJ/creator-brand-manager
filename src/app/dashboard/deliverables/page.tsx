"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const STATUS_ICONS: Record<string, any> = {
  PENDING: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  OVERDUE: AlertCircle,
};

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  async function fetchDeliverables() {
    const res = await fetch("/api/deliverables");
    const data = await res.json();
    setDeliverables(data.deliverables || []);
    setLoading(false);
  }

  useEffect(() => { fetchDeliverables(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/deliverables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchDeliverables();
  }

  const filtered = filter === "ALL" ? deliverables : deliverables.filter(d => d.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Deliverables</h2>
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filter === s ? "bg-violet-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}>
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <CheckCircle2 size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No deliverables found</p>
          <p className="text-gray-400 text-sm mt-1">Add deliverables from inside a deal</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Deal</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d: any) => {
                const Icon = STATUS_ICONS[d.status] || Circle;
                return (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className={
                          d.status === "COMPLETED" ? "text-emerald-500" :
                          d.status === "OVERDUE" ? "text-red-500" :
                          d.status === "IN_PROGRESS" ? "text-amber-500" : "text-gray-400"
                        } />
                        <span className="text-sm font-medium text-gray-800">{d.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{d.type}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{d.deal?.brandName || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[d.status]}`}>
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="OVERDUE">OVERDUE</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}