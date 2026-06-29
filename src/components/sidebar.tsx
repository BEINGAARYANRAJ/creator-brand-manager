"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Handshake,
  CheckSquare,
  FileText,
  Shield,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Deals", href: "/dashboard/deals", icon: Handshake },
  { label: "Deliverables", href: "/dashboard/deliverables", icon: CheckSquare },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Usage Rights", href: "/dashboard/usage-rights", icon: Shield },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <span className="text-white font-bold text-lg tracking-tight">BrandDesk</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">BrandDesk v1.0</p>
      </div>
    </aside>
  );
}