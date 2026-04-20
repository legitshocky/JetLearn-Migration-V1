import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, Clock, Search, Filter, Eye } from "lucide-react";
import axios from "axios";

export default function EmailActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const response = await axios.get("/api/email-activities?limit=20");
      setActivities(response.data);
      setLoading(false);
    };

    fetchActivities().catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Email Activities</h1>
          <p className="text-slate-500 mt-1">Track and monitor all outgoing communications.</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient or subject..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium text-slate-500">Loading activities...</p>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1 min-width-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {activity.subject || (activity.type === "onboarding" ? "Onboarding Email" : "Migration Update")}
                    </h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                      {activity.jlid}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Sent to {activity.parentEmail || activity.learnerName} - {activity.course}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle className="w-3 h-3" /> {activity.status || "Delivered"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-slate-400">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium">No email activities found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
