"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Paperclip, Download } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  NEGOTIATING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const DELIVERABLE_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const INVOICE_COLORS: Record<string, string> = {
  UNPAID: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [dForm, setDForm] = useState({ title: "", type: "VIDEO", dueDate: "", notes: "" });
  const [dLoading, setDLoading] = useState(false);
  const [iForm, setIForm] = useState({ amount: "", currency: "USD", dueDate: "", notes: "" });
  const [iLoading, setILoading] = useState(false);

  async function fetchDeal() {
    const res = await fetch(`/api/deals/${id}`);
    const data = await res.json();
    setDeal(data.deal);
    setLoading(false);
  }

  async function fetchAttachments() {
    const res = await fetch(`/api/attachments?dealId=${id}`);
    const data = await res.json();
    setAttachments(data.attachments || []);
  }

  useEffect(() => {
    fetchDeal();
    fetchAttachments();
  }, [id]);

  async function addDeliverable(e: React.FormEvent) {
    e.preventDefault();
    setDLoading(true);
    await fetch("/api/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dForm, dealId: id }),
    });
    setDForm({ title: "", type: "VIDEO", dueDate: "", notes: "" });
    setDLoading(false);
    fetchDeal();
  }

  async function addInvoice(e: React.FormEvent) {
    e.preventDefault();
    setILoading(true);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...iForm, dealId: id }),
    });
    setIForm({ amount: "", currency: "USD", dueDate: "", notes: "" });
    setILoading(false);
    fetchDeal();
  }

  async function markDeliverable(dId: string, status: string) {
    await fetch("/api/deliverables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dId, status }),
    });
    fetchDeal();
  }

  async function markInvoicePaid(iId: string) {
    await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: iId, status: "PAID" }),
    });
    fetchDeal();
  }

  async function deleteDeliverable(dId: string) {
    await fetch(`/api/deliverables?id=${dId}`, { method: "DELETE" });
    fetchDeal();
  }

  async function deleteInvoice(iId: string) {
    await fetch(`/api/invoices?id=${iId}`, { method: "DELETE" });
    fetchDeal();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dealId", id as string);
    await fetch("/api/attachments", { method: "POST", body: formData });
    setUploading(false);
    fetchAttachments();
    e.target.value = "";
  }

  async function deleteAttachment(attId: string, fileUrl: string) {
    await fetch(`/api/attachments?id=${attId}&fileUrl=${encodeURIComponent(fileUrl)}`, { method: "DELETE" });
    fetchAttachments();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!deal) return <div className="text-center py-20 text-gray-400">Deal not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{deal.brandName}</h2>
          <p className="text-sm text-gray-400">{deal.platform}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[deal.status]}`}>
          {deal.status}
        </span>
        <span className="text-xl font-bold text-gray-900">
          ${deal.dealValue.toLocaleString()} {deal.currency}
        </span>
      </div>

      {deal.notes && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 text-sm text-gray-600">
          {deal.notes}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deliverables */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Deliverables</h3>
          </div>
          <div className="p-5 space-y-3">
            {deal.deliverables.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No deliverables yet</p>
            )}
            {deal.deliverables.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{d.title}</p>
                  <p className="text-xs text-gray-400">{d.type} · Due {d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "—"}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <select value={d.status} onChange={(e) => markDeliverable(d.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${DELIVERABLE_COLORS[d.status]}`}>
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                  <button onClick={() => deleteDeliverable(d.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <form onSubmit={addDeliverable} className="pt-3 border-t border-gray-100 space-y-2">
              <input value={dForm.title} onChange={(e) => setDForm(f => ({ ...f, title: e.target.value }))}
                required placeholder="Deliverable title"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <div className="grid grid-cols-2 gap-2">
                <select value={dForm.type} onChange={(e) => setDForm(f => ({ ...f, type: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  {["VIDEO","REEL","STORY","POST","PODCAST","BLOG","OTHER"].map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="date" value={dForm.dueDate} onChange={(e) => setDForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <button type="submit" disabled={dLoading}
                className="w-full flex items-center justify-center gap-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg py-2 text-sm font-medium transition-colors">
                <Plus size={14} /> {dLoading ? "Adding..." : "Add Deliverable"}
              </button>
            </form>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Invoices</h3>
          </div>
          <div className="p-5 space-y-3">
            {deal.invoices.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No invoices yet</p>
            )}
            {deal.invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">${inv.amount.toLocaleString()} {inv.currency}</p>
                  <p className="text-xs text-gray-400">Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${INVOICE_COLORS[inv.status]}`}>
                    {inv.status}
                  </span>
                  {inv.status !== "PAID" && (
                    <button onClick={() => markInvoicePaid(inv.id)}
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                      Mark Paid
                    </button>
                  )}
                  <button onClick={() => deleteInvoice(inv.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <form onSubmit={addInvoice} className="pt-3 border-t border-gray-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={iForm.amount} onChange={(e) => setIForm(f => ({ ...f, amount: e.target.value }))}
                  required placeholder="Amount"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <select value={iForm.currency} onChange={(e) => setIForm(f => ({ ...f, currency: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
                </select>
              </div>
              <input type="date" value={iForm.dueDate} onChange={(e) => setIForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <button type="submit" disabled={iLoading}
                className="w-full flex items-center justify-center gap-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg py-2 text-sm font-medium transition-colors">
                <Plus size={14} /> {iLoading ? "Adding..." : "Add Invoice"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Attachments</h3>
          <label className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
            <Paperclip size={14} />
            {uploading ? "Uploading..." : "Upload File"}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
        <div className="p-5">
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No attachments yet</p>
          ) : (
            <div className="space-y-2">
              {attachments.map((att: any) => (
                <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <Paperclip size={14} className="text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{att.fileName}</p>
                      <p className="text-xs text-gray-400">{formatSize(att.fileSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-violet-500 hover:text-violet-700">
                      <Download size={14} />
                    </a>
                    <button onClick={() => deleteAttachment(att.id, att.fileUrl)}
                      className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}