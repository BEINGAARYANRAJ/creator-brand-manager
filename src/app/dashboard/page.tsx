"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Briefcase, Clock, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overview")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const { stats, upcomingDeadlines } = data;

  const cards = [
    { label: "Total Deals", value: stats.totalDeals, icon: Briefcase, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Active Deals", value: stats.activeDeals, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
   { label: "Revenue Collected", value: stats.totalRevenue, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Pending Payment", value: stats.pendingRevenue, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed Deals", value: stats.completedDeals, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Deliverables", value: stats.pendingDeliverables, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <Icon size={15} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
             <h3 className="text-sm font-semibold text-gray-700 mb-4">Upcoming Deadlines</h3>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No upcoming deadlines</p>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((d: any) => {
              const due = new Date(d.dueDate);
              const daysLeft = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{d.title}</p>
                    <p className="text-xs text-gray-400">{d.deal?.brandName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{due.toLocaleDateString()}</p>
                    <p className={`text-xs font-medium ${daysLeft <= 3 ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : "text-gray-400"}`}>
                      {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}