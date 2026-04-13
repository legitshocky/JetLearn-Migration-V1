import React, { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  FileText,
  X,
  ArrowRightLeft,
  BookOpen,
  User,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

export const AuditCenter: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const runAudit = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/audit/onboarding?fromDate=${fromDate}&toDate=${toDate}`);
      setResults(res.data.data || []);
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const showDetails = async (dealId: string, learnerName: string) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(`/api/audit/details/${dealId}`);
      setSelectedAudit({ ...res.data, learnerName });
    } catch (error) {
      console.error("Failed to fetch details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Onboarding Audit Center
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Verify HubSpot data against sales notes and calendar events.</p>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end bg-slate-50/30">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm min-w-[200px]">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-xs font-bold focus:outline-none text-slate-600 w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm min-w-[200px]">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-xs font-bold focus:outline-none text-slate-600 w-full"
            />
          </div>
        </div>

        <button 
          onClick={runAudit}
          disabled={loading || !fromDate || !toDate}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Search className="w-4 h-4" />}
          Run Audit
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">JLID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Onboarding Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discrepancies</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.map((audit, idx) => (
                  <motion.tr 
                    key={audit.dealId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">{audit.jlid}</td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{audit.learnerName}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{audit.onboardingDate}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        audit.status === 'Compliant' ? 'bg-emerald-50 text-emerald-600' : 
                        audit.status === 'Mismatch' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {audit.status === 'Compliant' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {audit.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-600">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${audit.discrepancyCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                          {audit.discrepancyCount}
                        </span>
                        Issues
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => showDetails(audit.dealId, audit.learnerName)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Audit Details</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedAudit.learnerName}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAudit(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Field Comparison */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ArrowRightLeft className="w-3 h-3" /> Field Comparison
                    </h4>
                    <div className="space-y-3">
                      {selectedAudit.details.map((detail: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{detail.field}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              detail.status === 'Match' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                            }`}>
                              {detail.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">HubSpot</p>
                              <p className="text-xs font-bold text-slate-700">{detail.hsValue || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales Note</p>
                              <p className="text-xs font-bold text-slate-700">{detail.noteValue || "—"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calendar & Notes */}
                  <div className="space-y-8">
                    {/* Calendar Verification */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Calendar Verification
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Alignment</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              selectedAudit.calendar.dateCheck.status === 'Match' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                            }`}>
                              {selectedAudit.calendar.dateCheck.status}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{selectedAudit.calendar.dateCheck.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Class Count</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              selectedAudit.calendar.countCheck.status === 'Match' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                            }`}>
                              {selectedAudit.calendar.countCheck.status}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{selectedAudit.calendar.countCheck.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Raw Note */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Raw Sales Note
                      </h4>
                      <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                        <pre className="text-[11px] font-medium text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {selectedAudit.rawNote}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
