"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import EditDealModal from "./edit-deal-modal";

const STATUS_COLORS: Record<string, string> = {
  NEGOTIATING: "bg-amber-100 text-amber-700",
  ACTIVE:      "bg-emerald-100 text-emerald-700",
  COMPLETED:   "bg-blue-100 text-blue-700",
  CANCELLED:   "bg-red-100 text-red-700",
};

const PLATFORM_ICONS: Record<string, string> = {
  YOUTUBE: "🎬", INSTAGRAM: "📸", TIKTOK: "🎵",
  TWITTER: "🐦", PODCAST: "🎙️", BLOG: "✍️",
  TWITCH: "🟣", LINKEDIN: "💼", OTHER: "🌐",
};

export default function DealCard({ deal, onUpdate }: { deal: any; onUpdate: () => void }) {
  const [editOpen, setEditOpen] = useState(false);

  async function deleteDeal() {
    if (!confirm("Delete this deal?")) return;
    await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
    onUpdate();
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{PLATFORM_ICONS[deal.platform] || "🌐"}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{deal.brandName}</h3>
              <p className="text-xs text-gray-400">{deal.platform}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditOpen(true)} className="text-gray-300 hover:text-violet-500 transition-colors">
              <Pencil size={15} />
            </button>
            <button onClick={deleteDeal} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-900">
            ${deal.dealValue.toLocaleString()}
            <span className="text-xs font-normal text-gray-400 ml-1">{deal.currency}</span>
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[deal.status]}`}>
            {deal.status}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
          <span>{deal.deliverables?.length || 0} deliverables</span>
          <span>{deal.invoices?.length || 0} invoices</span>
          <span>{formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}</span>
        </div>

        <Link href={`/dashboard/deals/${deal.id}`}
          className="mt-3 block text-center text-xs text-violet-600 hover:text-violet-800 font-medium">
          View Details →
        </Link>
      </div>

      <EditDealModal
        deal={deal}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={onUpdate}
      />
    </>
  );
}