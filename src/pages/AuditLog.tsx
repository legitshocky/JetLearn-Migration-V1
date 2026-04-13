import React, { useEffect, useState } from "react";
import { 
  History, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Info,
  User,
  BookOpen,
  Calendar,
  RefreshCw,
  FileText,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    const q = query(collection(db, "migrations"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.learnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.jlid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newTeacher?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || log.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <History className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              System Audit Log
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Complete history of learner migrations and system onboardings.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center bg-slate-50/30">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by learner, JLID, or teacher..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold focus:outline-none text-slate-600"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date"
              className="bg-transparent text-xs font-bold focus:outline-none text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transition</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervened By</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest">
                      {log.action || "Migration"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{log.learnerName}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.jlid}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500">{log.oldTeacher || "N/A"}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="text-xs font-bold text-indigo-600">{log.newTeacher}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {log.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-indigo-600/20">
                        {log.intervenedBy?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{log.intervenedBy}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <History className="w-10 h-10 text-slate-200" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">No records found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredLogs.length}</span> entries
          </p>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Audit Details</h2>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-indigo-600 text-3xl font-black border border-slate-100 shadow-sm">
                    {selectedLog.learnerName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedLog.learnerName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedLog.jlid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <DetailItem icon={<ArrowRightLeft />} label="Action Type" value={selectedLog.action || "Migration"} />
                  <DetailItem icon={<BookOpen />} label="Course" value={selectedLog.course} />
                  <DetailItem icon={<User />} label="Old Teacher" value={selectedLog.oldTeacher || "N/A"} />
                  <DetailItem icon={<User />} label="New Teacher" value={selectedLog.newTeacher} />
                  <DetailItem icon={<Calendar />} label="Timestamp" value={new Date(selectedLog.timestamp).toLocaleString()} />
                  <DetailItem icon={<ShieldCheck />} label="Intervened By" value={selectedLog.intervenedBy} />
                </div>

                {selectedLog.reason && (
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Migration</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{selectedLog.reason}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100 shadow-sm">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
