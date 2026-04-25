import React, { useState, useEffect, useCallback } from "react";
import {
  Award, Search, Plus, X, Send, RefreshCw, CheckCircle2,
  AlertCircle, ExternalLink, Loader2, User, Mail, BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

const JETLEARN_COURSES = [
  "Introduction to Coding (Code.org)", "Animation with Scratch Jr",
  "Introduction to Coding II (Code.org)", "Science Adventures with Sprite Lab",
  "Robotics with Microbit (Jr)", "Building Blocks of AI with Google",
  "Tynker AI Animation Lab", "Learn with Minecraft",
  "Python Edublocks", "Python Game Developer",
  "Python 2.0: Beyond the Basics", "App It Up",
  "Web Dev with AI", "Advanced App Development",
  "Fundamentals of Python with AI", "Robotics with Microbit",
  "Advanced Microbit", "Minecraft Education", "Advanced Minecraft",
  "Roblox Studio", "Advanced Roblox",
  "Mathematics - Foundation", "Mathematics - Intermediate", "Mathematics - Advanced",
  "AI & Machine Learning", "Cybersecurity Basics",
  "3D Design with Tinkercad", "Electronics with Arduino",
];

interface CertLogEntry {
  timestamp: string; jlid: string; learnerName: string; course: string;
  year: string; parentEmail: string; sentBy: string; status: string; driveUrl: string; notes: string;
}
interface BulkResult { course: string; success: boolean; driveUrl: string | null; message: string; }

export default function Certificates() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  // Single
  const [sjlid, setSJlid] = useState(""); const [sLearner, setSLearner] = useState("");
  const [sCourse, setSCourse] = useState(""); const [sEmail, setSEmail] = useState("");
  const [sParent, setSParent] = useState(""); const [sFetching, setSFetching] = useState(false);
  const [sSending, setSSending] = useState(false);
  const [sResult, setSResult] = useState<{ success: boolean; driveUrl: string | null; message: string } | null>(null);

  // Bulk
  const [bjlid, setBJlid] = useState(""); const [bLearner, setBLearner] = useState("");
  const [bEmail, setBEmail] = useState(""); const [bParent, setBParent] = useState("");
  const [bFetching, setBFetching] = useState(false);
  const [bCourses, setBCourses] = useState<string[]>([""]);
  const [bSending, setBSending] = useState(false); const [bResults, setBResults] = useState<BulkResult[]>([]);

  // Log
  const [log, setLog] = useState<CertLogEntry[]>([]); const [logLoading, setLogLoading] = useState(true);

  const fetchLog = useCallback(async () => {
    setLogLoading(true);
    try { const res = await axios.get("/api/certificates/log?limit=20"); setLog(res.data || []); }
    catch { setLog([]); } finally { setLogLoading(false); }
  }, []);
  useEffect(() => { fetchLog(); }, [fetchLog]);

  async function fetchLearner(jlid: string, set: (d: any) => void, setFetching: (v: boolean) => void) {
    if (!jlid.trim()) return;
    setFetching(true);
    try { const res = await axios.get(`/api/hubspot/deal/${jlid.trim()}`); set(res.data); }
    catch { /* no-op */ } finally { setFetching(false); }
  }

  async function handleSingleSend(e: React.FormEvent) {
    e.preventDefault(); setSSending(true); setSResult(null);
    try {
      const res = await axios.post("/api/certificates/send", {
        jlid: sjlid, learnerName: sLearner, courseName: sCourse,
        parentEmail: sEmail, parentName: sParent, sentBy: "CLS",
      });
      setSResult(res.data); fetchLog();
    } catch (err: any) {
      setSResult({ success: false, driveUrl: null, message: err.response?.data?.error || "Failed to send." });
    } finally { setSSending(false); }
  }

  async function handleBulkSend(e: React.FormEvent) {
    e.preventDefault();
    const valid = bCourses.filter((c) => c.trim());
    if (!valid.length) return;
    setBSending(true); setBResults([]);
    try {
      const res = await axios.post("/api/certificates/bulk", {
        jlid: bjlid, learnerName: bLearner, courses: valid,
        parentEmail: bEmail, parentName: bParent, sentBy: "CLS",
      });
      setBResults(res.data.results || []); fetchLog();
    } catch {
      setBResults(valid.map((c) => ({ course: c, success: false, driveUrl: null, message: "Request failed" })));
    } finally { setBSending(false); }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            Certificate Generator
          </h1>
          <p className="text-slate-500 mt-1">Generate and send course completion certificates to learners.</p>
        </div>
        <button onClick={fetchLog} disabled={logLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${logLoading ? "animate-spin" : ""}`} /> Refresh Log
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["single", "bulk"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "single" ? "Single Certificate" : "Bulk Certificates"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "single" && (
          <motion.form key="single" onSubmit={handleSingleSend}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Single Certificate</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Learner JLID</label>
              <div className="flex gap-2">
                <input value={sjlid} onChange={(e) => setSJlid(e.target.value)} placeholder="e.g. JL52767973402C"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                <button type="button" disabled={sFetching || !sjlid.trim()}
                  onClick={() => fetchLearner(sjlid, (d) => { setSLearner(d.dealname||""); setSEmail(d.parent_email__c||d.email||""); setSParent(d.parent_name||""); setSCourse(d.current_course__t_||""); }, setSFetching)}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {sFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Fetch
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Learner Name", val: sLearner, set: setSLearner, icon: User, ph: "Full name", req: true },
                { label: "Parent Email", val: sEmail, set: setSEmail, icon: Mail, ph: "parent@email.com", req: true, type: "email" },
                { label: "Parent Name", val: sParent, set: setSParent, icon: User, ph: "Guardian name", req: false },
              ].map(({ label, val, set, icon: Icon, ph, req, type }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</label>
                  <input type={type || "text"} value={val} onChange={(e) => set(e.target.value)} required={req} placeholder={ph}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><BookOpen className="w-3 h-3" /> Course</label>
                <input list="s-course-list" value={sCourse} onChange={(e) => setSCourse(e.target.value)} required placeholder="Select or type course"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                <datalist id="s-course-list">{JETLEARN_COURSES.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
            </div>
            {sResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${sResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                {sResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                <div>
                  <p className="font-bold">{sResult.message}</p>
                  {sResult.driveUrl && (
                    <a href={sResult.driveUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700 hover:underline">
                      View in Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
            <button type="submit" disabled={sSending || !sLearner || !sCourse || !sEmail}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2">
              {sSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating & Sending...</> : <><Send className="w-4 h-4" /> Send Certificate</>}
            </button>
          </motion.form>
        )}

        {activeTab === "bulk" && (
          <motion.form key="bulk" onSubmit={handleBulkSend}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Bulk Certificates</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Learner JLID</label>
              <div className="flex gap-2">
                <input value={bjlid} onChange={(e) => setBJlid(e.target.value)} placeholder="e.g. JL52767973402C"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                <button type="button" disabled={bFetching || !bjlid.trim()}
                  onClick={() => fetchLearner(bjlid, (d) => { setBLearner(d.dealname||""); setBEmail(d.parent_email__c||d.email||""); setBParent(d.parent_name||""); }, setBFetching)}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {bFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Fetch
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Learner Name", val: bLearner, set: setBLearner, ph: "Full name", req: true },
                { label: "Parent Email", val: bEmail, set: setBEmail, ph: "parent@email.com", req: true, type: "email" },
                { label: "Parent Name", val: bParent, set: setBParent, ph: "Guardian name", req: false },
              ].map(({ label, val, set, ph, req, type }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
                  <input type={type||"text"} value={val} onChange={(e) => set(e.target.value)} required={req} placeholder={ph}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Courses to Certify</label>
              {bCourses.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input list="b-course-list" value={c} onChange={(e) => { const n = [...bCourses]; n[i] = e.target.value; setBCourses(n); }}
                    placeholder={`Course ${i + 1}`}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                  {bCourses.length > 1 && (
                    <button type="button" onClick={() => setBCourses(bCourses.filter((_, j) => j !== i))}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <datalist id="b-course-list">{JETLEARN_COURSES.map((c) => <option key={c} value={c} />)}</datalist>
              <button type="button" onClick={() => setBCourses([...bCourses, ""])}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors pt-1">
                <Plus className="w-3.5 h-3.5" /> Add Another Course
              </button>
            </div>
            {bResults.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {bResults.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border text-sm ${r.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                    <div className="flex items-center gap-2">
                      {r.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                      <span className="font-semibold text-slate-700">{r.course}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${r.success ? "text-emerald-600" : "text-rose-600"}`}>{r.success ? "Sent" : r.message}</span>
                      {r.driveUrl && <a href={r.driveUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700"><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            <button type="submit" disabled={bSending || !bLearner || !bEmail || !bCourses.some((c) => c.trim())}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2">
              {bSending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending {bCourses.filter((c) => c.trim()).length} Certificates...</>
                : <><Send className="w-4 h-4" /> Send All Certificates</>}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Recent Certificates</h2>
          <span className="text-xs text-slate-400 font-medium">Last 20 entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-slate-50/50 border-b border-slate-100">
              {["Timestamp","JLID","Learner","Course","Parent Email","Status","Drive"].map((h) => (
                <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {logLoading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Loading…</p>
                </td></tr>
              ) : log.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <Award className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm text-slate-400">No certificates sent yet.</p>
                </td></tr>
              ) : log.map((entry, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500">{entry.jlid || "—"}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">{entry.learnerName || "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 max-w-[160px] truncate">{entry.course || "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{entry.parentEmail || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${entry.status === "Sent" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {entry.status === "Sent" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {entry.status || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {entry.driveUrl
                      ? <a href={entry.driveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-indigo-400 hover:text-indigo-600 inline-flex"><ExternalLink className="w-3.5 h-3.5" /></a>
                      : <span className="text-slate-300">—</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
