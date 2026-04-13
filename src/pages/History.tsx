import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, History as HistoryIcon, User, Calendar, 
  Shield, AlertTriangle, ExternalLink, ChevronRight,
  Zap, Brain, ShieldCheck, Clock, ArrowRightLeft,
  ArrowRight, Info, MessageSquare, Mail, Phone, X
} from "lucide-react";
import axios from "axios";

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/hubspot/history/comprehensive/${searchTerm}`);
      if (response.data.success) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Learner Journey Timeline
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Comprehensive audit of migrations, escalations, and milestones.</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter JLID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchTerm}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </form>
      </header>

      {historyData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <ProfileCard profile={historyData.learnerProfile} />
            <RiskCard analysis={historyData.journeyAnalysis} />
            
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" /> AI Strategic Note
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {historyData.journeyAnalysis.riskLevel === 'Stable' 
                  ? "Learner shows high engagement. Recommended for advanced track transition in next 3 months."
                  : "Frequent migrations detected. Prioritize teacher stability and schedule a parent check-in."}
              </p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <Timeline events={historyData.migrationTimeline} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-24 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-50 mb-6">
            <HistoryIcon className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-800">No Learner Selected</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
            Enter a JetLearner ID or name in the search bar above to visualize their complete educational journey.
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile }: { profile: any }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-5 border-b border-slate-50 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/20">
          {profile.learnerName.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">{profile.learnerName}</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{profile.jlid}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <InfoItem label="Age" value={profile.age} />
        <InfoItem label="Course" value={profile.course} />
        <InfoItem label="Current Teacher" value={profile.currentTeacher} />
        <InfoItem label="JetGuide" value={profile.jetGuide} />
      </div>
      {profile.hubspotLink && (
        <a
          href={profile.hubspotLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
        >
          View in HubSpot <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

function RiskCard({ analysis }: { analysis: any }) {
  const colors: Record<string, string> = {
    Critical: "border-rose-200 bg-rose-50 text-rose-700",
    High: "border-amber-200 bg-amber-50 text-amber-700",
    Medium: "border-indigo-200 bg-indigo-50 text-indigo-700",
    Stable: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div className={`p-8 rounded-[32px] border-2 ${colors[analysis.riskLevel] || "border-slate-100 bg-white"}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Stability Index
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/50 rounded-full">{analysis.riskLevel}</span>
      </div>
      <p className="text-xs font-bold leading-relaxed mb-6">{analysis.riskMessage}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/40 p-4 rounded-2xl text-center border border-white/20">
          <div className="text-xl font-black">{analysis.inbound}</div>
          <div className="text-[9px] uppercase font-black opacity-60 tracking-widest">Inbound</div>
        </div>
        <div className="bg-white/40 p-4 rounded-2xl text-center border border-white/20">
          <div className="text-xl font-black">{analysis.outbound}</div>
          <div className="text-[9px] uppercase font-black opacity-60 tracking-widest">Outbound</div>
        </div>
      </div>
    </div>
  );
}

function Timeline({ events }: { events: any[] }) {
  return (
    <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-3">
        <HistoryIcon className="w-5 h-5 text-indigo-600" />
        Migration History Timeline
      </h3>
      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-100 before:via-slate-100 before:to-transparent">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex items-start gap-8">
            <div className={`absolute left-0 w-12 h-12 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center z-10 transition-transform hover:scale-110 ${event.type === 'inbound' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 ml-16 bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                    {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${event.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {event.stage}
                  </span>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {event.id}</div>
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{event.subject}</h4>
              <p className="text-xs text-slate-500 mb-6 italic font-medium leading-relaxed">"{event.reason}"</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="text-[9px] text-slate-400 mb-1 uppercase font-black tracking-widest">From</div>
                  <div className="text-xs font-bold text-slate-700 truncate">{event.fromTeacher}</div>
                </div>
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="text-[9px] text-slate-400 mb-1 uppercase font-black tracking-widest">To</div>
                  <div className="text-xs font-bold text-indigo-600 truncate">{event.toTeacher}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xs font-bold text-slate-800 truncate">{value || "N/A"}</div>
    </div>
  );
}

function RefreshCw(props: any) {
  return <RefreshCwIcon {...props} />;
}

function RefreshCwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
