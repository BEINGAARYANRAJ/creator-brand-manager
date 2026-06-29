"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const PLATFORMS = ["YOUTUBE","INSTAGRAM","TIKTOK","TWITTER","PODCAST","BLOG","TWITCH","LINKEDIN","OTHER"];
const STATUSES  = ["NEGOTIATING","ACTIVE","COMPLETED","CANCELLED"];

export default function EditDealModal({ deal, open, onClose, onUpdated }: {
  deal: any; open: boolean; onClose: () => void; onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    brandName: "", platform: "YOUTUBE", dealValue: "",
    currency: "USD", status: "NEGOTIATING",
    startDate: "", endDate: "", notes: "",
  });

  useEffect(() => {
    if (deal) {
      setForm({
        brandName: deal.brandName || "",
        platform: deal.platform || "YOUTUBE",
        dealValue: deal.dealValue?.toString() || "",
        currency: deal.currency || "USD",
        status: deal.status || "NEGOTIATING",
        startDate: deal.startDate ? new Date(deal.startDate).toISOString().split("T")[0] : "",
        endDate: deal.endDate ? new Date(deal.endDate).toISOString().split("T")[0] : "",
        notes: deal.notes || "",
      });
    }
  }, [deal]);

  if (!open) return null;

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    onClose();
    onUpdated();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Deal</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Brand Name *</label>
              <input name="brandName" value={form.brandName} onChange={update} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Platform</label>
              <select name="platform" value={form.platform} onChange={update}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select name="status" value={form.status} onChange={update}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Deal Value *</label>
              <input name="dealValue" value={form.dealValue} onChange={update} required type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Currency</label>
              <select name="currency" value={form.currency} onChange={update}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Start Date</label>
              <input name="startDate" value={form.startDate} onChange={update} type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">End Date</label>
              <input name="endDate" value={form.endDate} onChange={update} type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
              <textarea name="notes" value={form.notes} onChange={update} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}