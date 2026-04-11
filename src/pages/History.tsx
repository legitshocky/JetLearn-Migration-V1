import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, History as HistoryIcon, User, Calendar, Shield, AlertTriangle, ExternalLink, ChevronRight } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learner Journey Timeline</h1>
          <p className="text-gray-500">Track all migrations and escalations for a specific learner</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter JLID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {historyData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard profile={historyData.learnerProfile} />
            <RiskCard analysis={historyData.journeyAnalysis} />
          </div>
          <div className="lg:col-span-2">
            <Timeline events={historyData.migrationTimeline} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <HistoryIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Learner Selected</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Enter a JetLearner ID or name in the search bar above to view their complete journey history.
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile }: { profile: any }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
          {profile.learnerName.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{profile.learnerName}</h3>
          <p className="text-xs text-gray-500 font-mono uppercase">{profile.jlid}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <InfoItem label="Age" value={profile.age} />
        <InfoItem label="Course" value={profile.course} />
        <InfoItem label="Teacher" value={profile.currentTeacher} />
        <InfoItem label="JetGuide" value={profile.jetGuide} />
      </div>
      {profile.hubspotLink && (
        <a
          href={profile.hubspotLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          View in HubSpot <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function RiskCard({ analysis }: { analysis: any }) {
  const colors: Record<string, string> = {
    Critical: "border-red-200 bg-red-50 text-red-700",
    High: "border-orange-200 bg-orange-50 text-orange-700",
    Medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
    Watch: "border-blue-200 bg-blue-50 text-blue-700",
    Stable: "border-green-200 bg-green-50 text-green-700",
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[analysis.riskLevel] || "border-gray-100 bg-white"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Journey Stability
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest">{analysis.riskLevel}</span>
      </div>
      <p className="text-sm mb-4 leading-relaxed">{analysis.riskMessage}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/50 p-2 rounded-lg text-center">
          <div className="text-lg font-bold">{analysis.inbound}</div>
          <div className="text-[10px] uppercase font-semibold opacity-70">Inbound</div>
        </div>
        <div className="bg-white/50 p-2 rounded-lg text-center">
          <div className="text-lg font-bold">{analysis.outbound}</div>
          <div className="text-[10px] uppercase font-semibold opacity-70">Outbound</div>
        </div>
      </div>
    </div>
  );
}

function Timeline({ events }: { events: any[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
        <HistoryIcon className="w-4 h-4" />
        Migration History
      </h3>
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex items-start gap-6">
            <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${event.type === 'inbound' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 ml-12 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${event.isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {event.stage}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{event.subject}</h4>
              <p className="text-sm text-gray-600 mb-3 italic">"{event.reason}"</p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-1 p-2 bg-white rounded border border-gray-100">
                  <div className="text-gray-400 mb-1 uppercase font-semibold text-[9px]">From</div>
                  <div className="font-bold text-gray-700 truncate">{event.fromTeacher}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <div className="flex-1 p-2 bg-white rounded border border-gray-100">
                  <div className="text-gray-400 mb-1 uppercase font-semibold text-[9px]">To</div>
                  <div className="font-bold text-indigo-600 truncate">{event.toTeacher}</div>
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
      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</div>
      <div className="text-gray-700 font-medium truncate">{value || "N/A"}</div>
    </div>
  );
}
