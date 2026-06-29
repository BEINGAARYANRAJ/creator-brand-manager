"use client";

import { useEffect, useState } from "react";
import { Bell, X, AlertCircle, Clock } from "lucide-react";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    const [delRes, invRes] = await Promise.all([
      fetch("/api/deliverables"),
      fetch("/api/invoices"),
    ]);
    const delData = await delRes.json();
    const invData = await invRes.json();

    const today = new Date();
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);

    const overdueDeliverables = (delData.deliverables || [])
      .filter((d: any) => d.status !== "COMPLETED" && d.dueDate && new Date(d.dueDate) < today)
      .map((d: any) => ({
        id: d.id,
        type: "overdue_deliverable",
        message: `"${d.title}" for ${d.deal?.brandName} is overdue`,
        severity: "red",
      }));

    const dueSoonDeliverables = (delData.deliverables || [])
      .filter((d: any) => d.status !== "COMPLETED" && d.dueDate &&
        new Date(d.dueDate) >= today && new Date(d.dueDate) <= threeDays)
      .map((d: any) => ({
        id: d.id,
        type: "due_soon",
        message: `"${d.title}" for ${d.deal?.brandName} is due in 3 days`,
        severity: "amber",
      }));

    const overdueInvoices = (invData.invoices || [])
      .filter((i: any) => i.status === "UNPAID" && i.dueDate && new Date(i.dueDate) < today)
      .map((i: any) => ({
        id: i.id,
        type: "overdue_invoice",
        message: `Invoice of $${i.amount} from ${i.deal?.brandName} is overdue`,
        severity: "red",
      }));

    setAlerts([...overdueDeliverables, ...overdueInvoices, ...dueSoonDeliverables]);
    setLoading(false);
  }

  const count = alerts.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              <button onClick={() => setOpen(false)}>
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <p className="text-center text-gray-400 text-sm py-6">Loading...</p>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={30} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">No alerts — all good! 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {alerts.map((alert) => (
                    <div key={`${alert.type}-${alert.id}`} className="flex items-start gap-3 p-4">
                      {alert.severity === "red" ? (
                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Clock size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm text-gray-700">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}