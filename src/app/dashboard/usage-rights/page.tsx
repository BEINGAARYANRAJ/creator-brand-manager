"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, Trash2, Lock, Unlock } from "lucide-react";

export default function UsageRightsPage() {
  const [rights, setRights] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    dealId: "", platform: "", duration: "", exclusivity: false, expiresAt: "", notes: ""
  });

  async function fetchData() {
    const [rightsRes, dealsRes] = await Promise.all([
      fetch("/api/usage-rights"),
      fetch("/api/deals"),
    ]);
    const rightsData = await rightsRes.json();
    const dealsData = await dealsRes.json();
    setRights(rightsData.usageRights || []);
    setDeals(dealsData.deals || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSubmit() {
    if (!form.dealId || !form.platform || !form.duration) return;
    await fetch("/api/usage-rights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ dealId: "", platform: "", duration: "", exclusivity: false, expiresAt: "", notes: "" });
    setShowForm(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/usage-rights?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Usage Rights</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Add Usage Right
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Usage Right</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Deal</label>
              <select value={form.dealId} onChange={e => setForm({ ...form, dealId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select deal...</option>
                {deals.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.brandName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Platform</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select platform...</option>
                {["YouTube", "Instagram", "TikTok", "Twitter/X", "LinkedIn", "Podcast", "Blog", "All Platforms"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Duration</label>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select duration...</option>
                {["30 days", "60 days", "90 days", "6 months", "1 year", "2 years", "Perpetual"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="exclusivity" checked={form.exclusivity}
                onChange={e => setForm({ ...form, exclusivity: e.target.checked })}
                className="rounded" />
              <label htmlFor="exclusivity" className="text-sm text-gray-600">Exclusive rights</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Save
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : rights.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Shield size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No usage rights tracked</p>
          <p className="text-gray-400 text-sm mt-1">Add usage rights from your deals</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[550px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Deal</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Platform</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Duration</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Exclusivity</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Expires</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rights.map((r: any) => {
                const expired = r.expiresAt && new Date(r.expiresAt) < new Date();
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{r.deal?.brandName}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{r.platform}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{r.duration}</td>
                    <td className="px-5 py-3">
                      {r.exclusivity
                        ? <span className="flex items-center gap-1 text-xs text-violet-600 font-medium"><Lock size={12} /> Exclusive</span>
                        : <span className="flex items-center gap-1 text-xs text-gray-400"><Unlock size={12} /> Non-exclusive</span>}
                    </td>
                    <td className="px-5 py-3">
                      {r.expiresAt ? (
                        <span className={`text-xs font-medium ${expired ? "text-red-500" : "text-gray-500"}`}>
                          {expired ? "Expired " : ""}{new Date(r.expiresAt).toLocaleDateString()}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(r.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
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