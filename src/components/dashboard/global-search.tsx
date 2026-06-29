"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Handshake, CheckSquare, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const TYPE_ICONS: Record<string, any> = {
  deal: Handshake,
  deliverable: CheckSquare,
  invoice: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  deal: "text-violet-500",
  deliverable: "text-blue-500",
  invoice: "text-emerald-500",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deals, deliverables..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
        />
      </div>

      {open && (
        <div className="absolute top-10 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-4">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">No results found</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {results.map((r) => {
                const Icon = TYPE_ICONS[r.type] || Search;
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleSelect(r.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon size={15} className={TYPE_COLORS[r.type]} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}