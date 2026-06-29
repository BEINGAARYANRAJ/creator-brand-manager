"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  UNPAID: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  async function fetchInvoices() {
    const res = await fetch("/api/invoices");
    const data = await res.json();
    setInvoices(data.invoices || []);
    setLoading(false);
  }

  useEffect(() => { fetchInvoices(); }, []);

  async function markPaid(id: string) {
    await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "PAID" }),
    });
    fetchInvoices();
  }

  const filtered = filter === "ALL" ? invoices : invoices.filter(i => i.status === filter);

  const totalUnpaid = invoices
    .filter(i => i.status === "UNPAID")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalPaid = invoices
    .filter(i => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
        <div className="flex gap-2">
          {["ALL", "UNPAID", "PAID", "OVERDUE"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filter === s ? "bg-violet-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">Unpaid</p>
          <p className="text-2xl font-bold text-amber-600">${totalUnpaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">Collected</p>
          <p className="text-2xl font-bold text-emerald-600">${totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No invoices found</p>
          <p className="text-gray-400 text-sm mt-1">Add invoices from inside a deal</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Deal</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv: any) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{inv.deal?.brandName || "—"}</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-900">
                    ${Number(inv.amount).toLocaleString()} <span className="text-xs font-normal text-gray-400">{inv.currency}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {inv.status !== "PAID" && (
                      <button onClick={() => markPaid(inv.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}