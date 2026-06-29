"use client";

import { useEffect, useState } from "react";
import { Handshake, Download } from "lucide-react";
import DealCard from "@/components/dashboard/deal-card";
import CreateDealModal from "@/components/dashboard/create-deal-modal";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function fetchDeals() {
    const res = await fetch("/api/deals");
    const data = await res.json();
    setDeals(data.deals || []);
    setLoading(false);
  }

  useEffect(() => { fetchDeals(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Deals</h2>
        <div className="flex items-center gap-2">
          <a href="/api/export" download
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Download size={15} /> Export CSV
          </a>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + New Deal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Handshake size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No deals yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Deal" to add your first sponsorship</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onUpdate={fetchDeals} />
          ))}
        </div>
      )}

      <CreateDealModal open={open} onClose={() => setOpen(false)} onCreated={fetchDeals} />
    </div>
  );
}