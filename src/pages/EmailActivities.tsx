import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";

type ActivityType = "all" | "onboarding" | "migration" | "minecraft" | "roblox" | "certificate";
type StatusType = "Delivered" | "Failed" | "Pending";

interface EmailActivity {
  id: string;
  timestamp: string;
  type: string;
  jlid: string;
  learnerName: string;
  parentEmail: string;
  course?: string;
  subject?: string;
  status: StatusType;
}

const TYPE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  migration: "Migration",
  minecraft: "Minecraft",
  roblox: "Roblox",
  certificate: "Certificate",
};

const TYPE_COLORS: Record<string, string> = {
  onboarding: "bg-indigo-50 text-indigo-600",
  migration: "bg-violet-50 text-violet-600",
  minecraft: "bg-green-50 text-green-700",
  roblox: "bg-rose-50 text-rose-600",
  certificate: "bg-amber-50 text-amber-600",
};

export default function EmailActivities() {
  const [activities, setActivities] = useState<EmailActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType>("all");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/email-activities?limit=50");
      const data: EmailActivity[] = res.data?.data || res.data || [];
      setActivities(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load email activities.");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filtered = activities.filter((a) => {
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (a.learnerName || "").toLowerCase().includes(q) ||
      (a.jlid || "").toLowerCase().includes(q) ||
      (a.parentEmail || "").toLowerCase().includes(q) ||
      (a.subject || "").toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const StatusBadge = ({ status }: { status: StatusType }) => {
    const cfg = {
      Delivered: { cls: "bg-emerald-50 text-emerald-600", icon: <CheckCircle2 className="w-3 h-3" /> },
      Failed: { cls: "bg-rose-50 text-rose-600", icon: <AlertCircle className="w-3 h-3" /> },
      Pending: { cls: "bg-amber-50 text-amber-600", icon: <Clock className="w-3 h-3" /> },
    }[status] ?? { cls: "bg-slate-50 text-slate-500", icon: null };

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${cfg.cls}`}>
        {cfg.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Email Activities</h1>
          <p className="text-slate-500 mt-1">Track and monitor all outgoing communications.</p>
        </div>
        <button
          onClick={fetchActivities}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by learner name, JLID or email…"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1.5">
              {(["all", "onboarding", "migration", "minecraft", "roblox", "certificate"] as ActivityType[]).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                      typeFilter === t
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {t === "all" ? "All" : TYPE_LABELS[t]}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="flex items-center gap-3 p-4 mx-6 mt-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {["Timestamp", "Type", "JLID", "Learner", "Parent Email", "Course", "Subject", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-400">Loading activities…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                    <p className="text-sm font-medium text-slate-400">
                      {search || typeFilter !== "all"
                        ? "No activities match your filters."
                        : "No email activities found."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((a, i) => (
                  <motion.tr
                    key={a.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {a.timestamp ? new Date(a.timestamp).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {a.type ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            TYPE_COLORS[a.type] || "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {TYPE_LABELS[a.type] || a.type}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{a.jlid || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {a.learnerName || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {a.parentEmail || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[160px] truncate">
                      {a.course || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[200px] truncate">
                      {a.subject || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={a.status || "Pending"} />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {activities.length} activities
          </div>
        )}
      </div>
    </div>
  );
}
