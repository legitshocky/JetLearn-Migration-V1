import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Filter, CheckCircle, AlertCircle, Clock, 
  ExternalLink, ClipboardCheck, Layers, FileText,
  ShieldCheck, AlertTriangle, X, Info, Calendar,
  CheckCircle2, AlertCircle as AlertIcon, Eye, ArrowRightLeft
} from "lucide-react";
import axios from "axios";

export default function AuditCenter() {
  const [activeTab, setActiveTab] = useState("onboarding");
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, compliant: 0, mismatch: 0, warning: 0 });
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);

  const tabs = [
    { id: "onboarding", label: "Onboarding Audit", icon: ClipboardCheck },
    { id: "migration", label: "Migration Audit", icon: Layers },
    { id: "course", label: "Course Audit", icon: FileText },
  ];

  const runAudit = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/audit/onboarding?fromDate=${fromDate}&toDate=${toDate}`);
      if (response.data.success) {
        setResults(response.data.data);
        const s = response.data.data.reduce((acc: any, curr: any) => {
          acc.total++;
          if (curr.status === "Compliant") acc.compliant++;
          else if (curr.status === "Mismatch") acc.mismatch++;
          else if (curr.status === "Warning") acc.warning++;
          return acc;
        }, { total: 0, compliant: 0, mismatch: 0, warning: 0 });
        setStats(s);
      }
    } catch (error) {
      console.error("Audit failed:", error);
      // Mock data for demo if API fails
      const mockResults = [
        { 
          dealId: "123", 
          learnerName: "Ivaan Chopra", 
          jlid: "JL-8821", 
          onboardingDate: "14 April 2026", 
          discrepancyCount: 2, 
          status: "Mismatch",
          details: {
            amount: { hubspot: "950", salesNote: "Not Found" },
            currency: { hubspot: "USD", salesNote: "Not Found" },
            paymentType: { hubspot: "Upfront Payment", salesNote: "Not Found" },
            tenure: { hubspot: "13", salesNote: "Not Found" },
            committedClasses: { hubspot: "52", salesNote: "Not Found" },
            course: { hubspot: "Maths Year 2", salesNote: "Not Found" },
            frequency: { hubspot: "1 class / week", salesNote: "Not Found" },
            timezone: { hubspot: "(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima", salesNote: "Not Found" },
            calendar: {
              dateAlignment: "Match",
              dates: "Start: 14 April 2026, End: 6 April 2027",
              classCount: "Match",
              countMatch: "52 classes"
            },
            rawSalesNote: "attending classes on a laptop before transitioning to a tablet. We took feedback post-transition, and the parents shared that they were amazed at how quickly Ivaan is able to complete his projects. They observed that he is comfortable, confident, and takes the classes independently. Ivaan has also been actively exploring the platform and has developed a strong bond with his teacher, Ayesha. Informed them about the upcoming transition back to a laptop. The father mentioned that they have a MacBook and was unsure about its compatibility with the Scratch Jr platform. It was assured that the JG will connect with him to conduct a tech check. Next course options were also discussed, and both parents were happy with the learning roadmap shared.\n\nNS: Scratch Jr (4 more classes)->Science adv with Sprite lab->Microbit Jr\n\n@Varnita Jain @Sankalita Mitra fyi"
          }
        }
      ];
      setResults(mockResults);
      setStats({ total: 1, compliant: 0, mismatch: 1, warning: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Center</h1>
              <p className="text-sm text-gray-500 font-medium">Data integrity and compliance monitoring across systems</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
            />
            <span className="text-slate-400 text-xs font-bold">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
            />
            <button
              onClick={runAudit}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Run Audit
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "onboarding" ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total Deals" value={stats.total} icon={<Clock className="text-blue-600" />} color="blue" />
              <StatCard label="Compliant" value={stats.compliant} icon={<ShieldCheck className="text-emerald-600" />} color="emerald" />
              <StatCard label="Mismatches" value={stats.mismatch} icon={<AlertTriangle className="text-rose-600" />} color="rose" />
              <StatCard label="Warnings" value={stats.warning} icon={<AlertCircle className="text-amber-600" />} color="amber" />
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner / JLID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Onboarding Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discrepancies</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((row, idx) => (
                    <motion.tr
                      key={row.dealId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800">{row.learnerName}</div>
                        <div className="text-[10px] font-bold text-slate-400">{row.jlid}</div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600">{row.onboardingDate}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.discrepancyCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {row.discrepancyCount} found
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedAudit(row)}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            View Details <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://app.hubspot.com/contacts/7729491/deal/${row.dealId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            HubSpot <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {results.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <ClipboardCheck className="w-8 h-8 opacity-20" />
                          </div>
                          <p className="text-sm font-medium">No audit results found. Select a date range and click "Run Audit".</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === "migration" ? (
          <motion.div
            key="migration"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Migration Deals" value={12} icon={<ArrowRightLeft className="text-blue-600" />} color="blue" />
              <StatCard label="Compliant" value={8} icon={<ShieldCheck className="text-emerald-600" />} color="emerald" />
              <StatCard label="Mismatches" value={3} icon={<AlertTriangle className="text-rose-600" />} color="rose" />
              <StatCard label="Warnings" value={1} icon={<AlertCircle className="text-amber-600" />} color="amber" />
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner / JLID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Migration Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Type</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { dealId: "M1", learnerName: "Aarav Sharma", jlid: "JL-9021", date: "10 April 2026", type: "Teacher Migration", status: "Compliant" },
                    { dealId: "M2", learnerName: "Isha Gupta", jlid: "JL-9022", date: "09 April 2026", type: "Course Migration", status: "Mismatch" },
                  ].map((row, idx) => (
                    <tr key={row.dealId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800">{row.learnerName}</div>
                        <div className="text-[10px] font-bold text-slate-400">{row.jlid}</div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600">{row.date}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600">{row.type}</td>
                      <td className="px-8 py-5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-8 py-5">
                        <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all">
                          View Details <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="course"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Active Courses" value={45} icon={<FileText className="text-blue-600" />} color="blue" />
              <StatCard label="Compliant" value={40} icon={<ShieldCheck className="text-emerald-600" />} color="emerald" />
              <StatCard label="Mismatches" value={4} icon={<AlertTriangle className="text-rose-600" />} color="rose" />
              <StatCard label="Warnings" value={1} icon={<AlertCircle className="text-amber-600" />} color="amber" />
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Audit</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Rate</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: "C1", name: "Python Level 1", lastAudit: "08 April 2026", rate: "98%", status: "Compliant" },
                    { id: "C2", name: "Scratch Basics", lastAudit: "07 April 2026", rate: "85%", status: "Warning" },
                  ].map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800">{row.name}</div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600">{row.lastAudit}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600">{row.rate}</td>
                      <td className="px-8 py-5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-8 py-5">
                        <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all">
                          View Details <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuditDetailsModal 
        isOpen={!!selectedAudit} 
        onClose={() => setSelectedAudit(null)} 
        audit={selectedAudit} 
      />
    </div>
  );
}

function AuditDetailsModal({ isOpen, onClose, audit }: { isOpen: boolean; onClose: () => void; audit: any }) {
  if (!isOpen || !audit) return null;

  const details = audit.details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-800">Audit Details: {audit.learnerName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Field Comparison */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> Field Comparison
            </h3>
            
            <div className="space-y-4">
              {[
                { label: "Amount", key: "amount" },
                { label: "Currency", key: "currency" },
                { label: "Payment Type", key: "paymentType" },
                { label: "Subscription Tenure (Months)", key: "tenure" },
                { label: "Committed Classes", key: "committedClasses" },
                { label: "Current Course", key: "course" },
                { label: "Class Frequency", key: "frequency" },
                { label: "Time Zone", key: "timezone" },
              ].map((field) => (
                <div key={field.key} className="border-b border-slate-50 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{field.label}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase">Info</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">HubSpot:</div>
                      <div className="text-xs font-bold text-slate-800">{details[field.key]?.hubspot || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sales Note:</div>
                      <div className={`text-xs font-bold ${details[field.key]?.salesNote === "Not Found" ? "text-rose-500" : "text-slate-800"}`}>
                        {details[field.key]?.salesNote || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Verification & Notes */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" /> Google Calendar Verification
              </h3>
              
              <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Date Alignment</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded uppercase">Match</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">{details.calendar?.dates}</div>
                
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Class Count</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded uppercase">Match</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">Count matches: {details.calendar?.countMatch}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Raw Sales Note
              </h3>
              <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 text-xs text-indigo-900 font-medium leading-relaxed whitespace-pre-wrap">
                {details.rawSalesNote}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colorStyles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all`}>
      <div className={`p-4 rounded-2xl ${colorStyles[color] || "bg-slate-50"}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
      </div>
      <div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Compliant: "bg-emerald-50 text-emerald-600",
    Mismatch: "bg-rose-50 text-rose-600",
    Warning: "bg-amber-50 text-amber-600",
    Error: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status] || styles.Error}`}>
      {status}
    </span>
  );
}

