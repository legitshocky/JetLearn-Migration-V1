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
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs } from "firebase/firestore";
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
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Audit Log</h1>
          <p className="text-slate-500 mt-1">Complete history of learner migrations and onboardings.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by learner, JLID, or teacher..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <input 
            type="date"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learner</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teachers</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intervened By</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{log.learnerName}</p>
                    <p className="text-xs text-slate-500 font-mono">{log.jlid}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">{log.oldTeacher || "N/A"}</span>
                      <ArrowRightLeft className="w-3 h-3 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-900">{log.newTeacher}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.course}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {log.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {log.intervenedBy?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-600">{log.intervenedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-widest"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No audit records found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="text-slate-900">{filteredLogs.length}</span> entries
          </p>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">Migration Details</h2>
                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{selectedLog.learnerName}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{selectedLog.jlid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <DetailItem icon={<ArrowRightLeft />} label="Migration Type" value={selectedLog.type} />
                  <DetailItem icon={<BookOpen />} label="Course" value={selectedLog.course} />
                  <DetailItem icon={<User />} label="Old Teacher" value={selectedLog.oldTeacher || "N/A"} />
                  <DetailItem icon={<User />} label="New Teacher" value={selectedLog.newTeacher} />
                  <DetailItem icon={<Calendar />} label="Date" value={new Date(selectedLog.timestamp).toLocaleString()} />
                  <DetailItem icon={<Info />} label="Intervened By" value={selectedLog.intervenedBy} />
                </div>

                {selectedLog.reason && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Migration</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLog.reason}</p>
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
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
