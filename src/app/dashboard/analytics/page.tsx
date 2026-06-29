"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const empty = !data.revenueByMonth.length && !data.dealsByStatus.length;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>

      {empty ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 font-medium">No data yet</p>
          <p className="text-gray-400 text-sm mt-1">Add deals and mark invoices as paid to see analytics</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Revenue by Month */}
          {data.revenueByMonth.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Month</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.revenueByMonth}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Deals by Status */}
            {data.dealsByStatus.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Deals by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.dealsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {data.dealsByStatus.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Revenue by Platform */}
            {data.revenueByPlatform.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Platform</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.revenueByPlatform} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="platform" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Brands */}
          {data.topBrands.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Brands by Revenue</h3>
              <div className="space-y-3">
                {data.topBrands.map((b: any, i: number) => (
                  <div key={b.brand} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{b.brand}</span>
                        <span className="text-sm font-bold text-gray-900">${b.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-violet-500 rounded-full"
                          style={{ width: `${(b.revenue / data.topBrands[0].revenue) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}