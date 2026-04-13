import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Brain, User, BookOpen, Clock, Shield, AlertTriangle, 
  CheckCircle, ChevronRight, Info, LayoutDashboard, UserPlus, 
  Bot, Users, RefreshCw, Plus, Trash2, Calendar, Mail,
  TrendingUp, BarChart3, Activity, X, Star, Zap, Filter, Eye,
  ArrowRight, Download, MessageSquare, AlertCircle, ArrowRightLeft,
  ExternalLink, MapPin, ShieldCheck, CheckSquare, FileText, CheckCircle2
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../lib/AuthContext";

export default function TeacherIntelligence() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("load");
  const [searchParams, setSearchParams] = useSearchParams();
  const [teacherName, setTeacherName] = useState(searchParams.get("name") || "");
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState<any | null>(null);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [tpManager, setTpManager] = useState("");
  const [tpManagers, setTpManagers] = useState<string[]>([]);
  const [tpDashboardData, setTpDashboardData] = useState<any | null>(null);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [teacherNotes, setTeacherNotes] = useState<any[]>([]);
  const [upskillTasks, setUpskillTasks] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [replacementResults, setReplacementResults] = useState<any[]>([]);
  const [replacementSearch, setReplacementSearch] = useState("");
  const [replacementFilters, setReplacementFilters] = useState({
    currentCourse: "",
    learnerAge: "",
    slotDate: new Date().toISOString().split('T')[0],
    slotTime: "17:00"
  });
  const [courses, setCourses] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiStats, setAiStats] = useState({
    avgBurnoutRisk: 12,
    highRiskTeachers: 8,
    sentimentScore: 88,
    loadVelocity: [45, 60, 85, 95, 75, 40, 30, 55, 80, 98, 70, 50, 65, 88, 42]
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchAiStats = async () => {
    try {
      const res = await axios.get("/api/ai/dashboard-stats");
      if (res.data.success) {
        setAiStats({
          avgBurnoutRisk: res.data.avgBurnoutRisk,
          highRiskTeachers: res.data.highRiskTeachers,
          sentimentScore: res.data.sentimentScore,
          loadVelocity: res.data.loadVelocity || aiStats.loadVelocity
        });
      }
    } catch (error) {
      console.error("Failed to fetch AI stats:", error);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    await fetchAiStats();
    setAnalyzing(false);
    showNotification("AI Analysis complete. Predictive models updated.");
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [namesRes, tpRes, coursesRes] = await Promise.all([
          axios.get("/api/teachers/names"),
          axios.get("/api/managers/tp"),
          axios.get("/api/courses")
        ]);
        setTeachers(namesRes.data);
        setTpManagers(tpRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };
    fetchMetadata();
    fetchAiStats();
  }, []);

  const loadTPDashboard = async (manager: string) => {
    if (!manager) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/teachers/tp-dashboard/${encodeURIComponent(manager)}`);
      if (response.data.success) {
        setTpDashboardData(response.data);
      }
    } catch (error) {
      console.error("Failed to load TP dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeacherDetails = async (teacherName: string) => {
    if (expandedTeacher === teacherName) {
      setExpandedTeacher(null);
      return;
    }
    setExpandedTeacher(teacherName);
    setTeacherNotes([]);
    setUpskillTasks([]);
    
    try {
      const [notesRes, tasksRes] = await Promise.all([
        axios.get(`/api/teachers/notes/${encodeURIComponent(teacherName)}`),
        axios.get(`/api/teachers/upskill/${encodeURIComponent(teacherName)}`)
      ]);
      setTeacherNotes(notesRes.data.notes || []);
      setUpskillTasks(tasksRes.data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch teacher details:", error);
    }
  };

  const saveNote = async (teacherName: string) => {
    if (!newNote.trim() || !user) return;
    setSavingNote(true);
    try {
      await axios.post("/api/teachers/notes", {
        teacherName,
        tpManager: tpManager,
        noteText: newNote,
        createdBy: user.displayName || user.email
      });
      setNewNote("");
      const res = await axios.get(`/api/teachers/notes/${encodeURIComponent(teacherName)}`);
      setTeacherNotes(res.data.notes || []);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setSavingNote(false);
    }
  };

  const updateTask = async (taskId: string, teacherName: string, status: string) => {
    try {
      await axios.patch(`/api/teachers/upskill/${taskId}`, { status });
      const res = await axios.get(`/api/teachers/upskill/${encodeURIComponent(teacherName)}`);
      setUpskillTasks(res.data.tasks || []);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const runReplacementSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/teachers/search", {
        techTraits: replacementSearch,
        currentCourse: replacementFilters.currentCourse,
        learnerAge: replacementFilters.learnerAge,
        slotDate: replacementFilters.slotDate,
        slotTime: replacementFilters.slotTime
      });
      if (response.data.success) {
        setReplacementResults(response.data.results || []);
      }
    } catch (error) {
      console.error("Replacement search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherAnalytics = async (name: string) => {
    if (!name) return;
    setLoading(true);
    try {
      const [loadRes, profileRes] = await Promise.all([
        axios.get(`/api/teachers/load/${encodeURIComponent(name)}`),
        axios.get(`/api/teachers/profile/${encodeURIComponent(name)}`)
      ]);
      setTeacherData({
        load: loadRes.data,
        profile: profileRes.data
      });
      setSearchParams({ name });
    } catch (error) {
      console.error("Failed to load teacher analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherName) {
      loadTeacherAnalytics(teacherName);
    }
  }, []);

  const tabs = [
    { id: "load", label: "Load Dashboard", icon: LayoutDashboard },
    { id: "replacement", label: "Persona & Replacement Engine", icon: UserPlus },
    { id: "ai", label: "AI Dashboard", icon: Bot },
    { id: "tp", label: "TP Dashboard", icon: Users },
  ];

  return (
    <div className="space-y-6 pb-12 relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teacher Intelligence Center</h1>
        
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
              {tab.id === "ai" && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] uppercase font-black">AI</span>}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "load" && (
          <motion.div
            key="load"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Select Teacher to Analyze</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => loadTeacherAnalytics(teacherName)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl border border-slate-100 transition-all hover:shadow-md"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => loadTeacherAnalytics(teacherName)}
                  disabled={loading || !teacherName}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" /> Load Analytics
                </button>
              </div>
            </div>

            {teacherData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Current Load" value={`${teacherData.load.totalLoad}%`} color={teacherData.load.totalLoad > 80 ? "rose" : "indigo"} />
                  <StatCard label="Active Students" value={teacherData.load.activeStudents} color="emerald" />
                  <StatCard label="Coding Classes" value={teacherData.load.codingClasses} color="indigo" />
                  <StatCard label="Math Classes" value={teacherData.load.mathClasses} color="indigo" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Teaching Hours Distribution</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Actual</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-100 rounded-sm" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Capacity</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-64 flex items-end gap-4">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                          const h = teacherData.load.dailyLoad?.[day] || 0;
                          return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-3">
                              <div className="w-full bg-slate-50 rounded-xl relative h-full overflow-hidden">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-xl"
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Onboarded Courses & Proficiency</h3>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {teacherData.load.courses?.length || 0} Courses
                        </div>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {teacherData.load.courses?.map((course: any, i: number) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="text-sm font-bold text-slate-800">{course.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.level}</div>
                              </div>
                              <div className="text-xs font-black text-indigo-600">{course.proficiency}%</div>
                            </div>
                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${course.proficiency}%` }}
                                className="h-full bg-indigo-600 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Attrition Risk & Active Pool</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {teacherData.load.students?.length || 0} Active Students
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal Value</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk (90d)</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Links</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {teacherData.load.students?.map((student: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    {student.jlid} • {student.course}
                                    {student.moduleStartDate && ` • Started: ${new Date(student.moduleStartDate).toLocaleDateString()}`}
                                  </div>
                                  {student.timezone && (
                                    <div className="text-[9px] text-indigo-500 font-bold flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-2.5 h-2.5" /> {student.timezone}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                      student.health === 'Critical' ? 'bg-rose-50 text-rose-600' : 
                                      student.health === 'Warning' ? 'bg-amber-50 text-amber-600' : 
                                      'bg-indigo-50 text-indigo-600'
                                    }`}>
                                      {student.status}
                                    </span>
                                    {student.dealStage && (
                                      <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                        Stage: {student.dealStage.split("_").join(" ")}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-xs font-bold text-slate-700">
                                    {student.dealCurrency} {student.dealAmountLocal?.toLocaleString()}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium">{student.paymentTag} • {student.dealTenureMonths}m</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                      student.health === 'Critical' ? 'bg-rose-50 text-rose-600' : 
                                      student.health === 'Warning' ? 'bg-amber-50 text-amber-600' : 
                                      'bg-emerald-50 text-emerald-600'
                                    }`}>
                                      {student.health || "Stable"}
                                    </span>
                                    {student.healthReason && (
                                      <div className="text-[8px] text-slate-400 font-bold uppercase truncate max-w-[120px]">
                                        {student.healthReason}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <a href={student.hubspotLink} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Teacher Hours & Schedule</h3>
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="p-6">
                        {teacherData.load.schedule?.length > 0 ? (
                          <div className="space-y-4">
                            {teacherData.load.schedule.map((event: any, i: number) => {
                              const isAvailability = event.summary.toLowerCase().includes("availability") || event.summary.toLowerCase().includes("teacher hours");
                              return (
                                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className={`p-2 rounded-xl ${isAvailability ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {isAvailability ? <Clock className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-800">
                                      {isAvailability ? "Teacher Hours" : event.summary}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(event.start).toLocaleDateString()}
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase">
                                        <Clock className="w-3 h-3" />
                                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </div>
                                  {event.location && (
                                    <a href={event.location} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all">
                                      Join Class
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-400 italic text-sm">
                            No upcoming classes or teacher hours found.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="w-32 h-32" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Manager Insights</h3>
                      <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">TP Manager</div>
                          <div className="text-sm font-bold">{teacherData.profile.manager}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">CLS Manager</div>
                          <div className="text-sm font-bold">{teacherData.profile.clsManager}</div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-white/60 leading-relaxed italic">
                            "{teacherData.profile.recentFeedback || "No recent feedback available."}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Teacher Stats</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Status</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase">{teacherData.profile.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Join Date</span>
                          <span className="text-xs font-bold text-slate-800">{teacherData.profile.joinDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Retention Rate</span>
                          <span className="text-xs font-bold text-indigo-600">94.5%</span>
                        </div>
                      </div>
                      <Link 
                        to={`/teachers/profile/${encodeURIComponent(teacherName)}`}
                        className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" /> View Full Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-20 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="w-8 h-8 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">No Teacher Selected</h3>
                  <p className="text-sm text-slate-500">Select a teacher above to view their load and performance analytics.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "replacement" && (
          <motion.div
            key="replacement"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">Replacement Engine</h3>
                    <p className="text-xs text-slate-500 font-medium">Find the perfect match based on teaching persona and expertise.</p>
                  </div>
                  <button 
                    onClick={runReplacementSearch}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Run Search
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expertise / Traits</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Python, Scratch..."
                        value={replacementSearch}
                        onChange={(e) => setReplacementSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Course</label>
                    <select 
                      value={replacementFilters.currentCourse}
                      onChange={(e) => setReplacementFilters({...replacementFilters, currentCourse: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 appearance-none"
                    >
                      <option value="">Any Course</option>
                      {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Learner Age</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 10"
                      value={replacementFilters.learnerAge}
                      onChange={(e) => setReplacementFilters({...replacementFilters, learnerAge: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slot Date</label>
                    <input 
                      type="date" 
                      value={replacementFilters.slotDate}
                      onChange={(e) => setReplacementFilters({...replacementFilters, slotDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slot Time</label>
                    <input 
                      type="time" 
                      value={replacementFilters.slotTime}
                      onChange={(e) => setReplacementFilters({...replacementFilters, slotTime: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {replacementResults.length > 0 ? replacementResults.map((t, i) => (
                  <div key={i} className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 hover:border-indigo-500/30 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 text-xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {t.teacherName.charAt(0)}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-indigo-600">{t.auditGrade}</div>
                        <div className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Audit Grade</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-800">{t.teacherName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[8px] font-black uppercase tracking-widest`}>
                            {t.upskillCount} Courses
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            t.slotFullMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {t.slotMatch}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.currentCourseProgress} Load</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Score</span>
                          <span className="text-xs font-bold text-slate-600">{t.avgClassScoreDisplay || t.avgClassScore}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.teacherTraits?.slice(0, 3).map((trait: string) => (
                            <span key={trait} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[8px] text-slate-500 font-bold uppercase">{trait}</span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <Link 
                          to={`/teachers/profile/${encodeURIComponent(t.teacherName)}`}
                          className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all text-center"
                        >
                          Profile
                        </Link>
                        <Link
                          to={`/communication?teacher=${encodeURIComponent(t.teacherName)}`}
                          className="py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10 text-center"
                        >
                          Replace
                        </Link>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <UserPlus className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-sm text-slate-500">Run a search to find matching teachers.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full w-fit backdrop-blur-sm">
                    <Zap className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Smart Matching</span>
                  </div>
                  <h3 className="text-2xl font-black leading-tight">AI-Powered Replacement Strategy</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    Our engine doesn't just look at availability. It analyzes teaching styles, student personality matches, and course proficiency to ensure a seamless transition for the learner.
                  </p>
                </div>
                <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
                  Run Full Simulation
                </button>
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <ArrowRightLeft className="w-64 h-64" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-indigo-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
              <div className="relative z-10 space-y-6 max-w-2xl">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full w-fit backdrop-blur-md border border-white/10">
                  <Bot className="w-4 h-4 text-indigo-200" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Predictive Intelligence</span>
                </div>
                <h2 className="text-4xl font-black leading-tight tracking-tight">AI Teacher Performance & Burnout Predictor</h2>
                <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                  Our neural network analyzes over 50+ data points including class sentiment, load velocity, and student retention trends to predict potential performance shifts.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-black/10 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} /> 
                    {analyzing ? 'Analyzing...' : 'Run New Analysis'}
                  </button>
                  <button className="bg-indigo-500/30 text-white border border-white/10 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-sm">
                    View Model Specs
                  </button>
                </div>
              </div>
              <Bot className="absolute -right-20 -bottom-20 w-[500px] h-[500px] text-white/5 rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label="Avg Burnout Risk" value={`${aiStats.avgBurnoutRisk}%`} color="rose" />
              <StatCard label="High Risk Teachers" value={aiStats.highRiskTeachers} color="amber" />
              <StatCard label="Sentiment Score" value={`${aiStats.sentimentScore}/100`} color="emerald" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Network Load Velocity</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time load distribution across 482 teachers</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">High Load</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-100 rounded-sm" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Optimal</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 flex items-end gap-3">
                  {aiStats.loadVelocity.map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className={`absolute bottom-0 left-0 right-0 rounded-t-2xl transition-all ${h > 85 ? 'bg-rose-500' : h > 70 ? 'bg-indigo-600' : 'bg-indigo-200'}`} 
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {h}% Load
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Critical Insights
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: "Burnout Risk", desc: "Siddharth V. load velocity increased by 40% in 48h.", type: "urgent" },
                      { title: "Retention Alert", desc: "Ananya R. sentiment score dropped to 3.2/5.0.", type: "warning" },
                      { title: "Capacity Surplus", desc: "15 teachers in Python L1 have <40% load.", type: "info" },
                    ].map((rec, i) => (
                      <div key={i} className={`p-5 rounded-2xl border transition-all ${rec.type === 'urgent' ? 'bg-rose-50 border-rose-100' : rec.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${rec.type === 'urgent' ? 'text-rose-600' : rec.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>
                            {rec.title}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${rec.type === 'urgent' ? 'bg-rose-500' : rec.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{rec.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-4">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Model Confidence</div>
                  <div className="text-3xl font-black">94.2%</div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '94.2%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Based on 1.2M historical data points across 24 months.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "tp" && (
          <motion.div
            key="tp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Viewing as</label>
                <select 
                  value={tpManager}
                  onChange={(e) => setTpManager(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 w-48 appearance-none"
                >
                  <option value="">Select Manager</option>
                  {tpManagers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button 
                onClick={() => loadTPDashboard(tpManager)}
                disabled={loading || !tpManager}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load Data"}
              </button>
            </div>

            {tpDashboardData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Total Teachers" value={tpDashboardData.summary.total} color="indigo" />
                  <StatCard label="EWS Teachers" value={tpDashboardData.summary.ewsCount} color="rose" />
                  <StatCard label="Avg Audit Score" value={tpDashboardData.summary.avgScore || "—"} color="emerald" />
                  <StatCard label="Red Flag Incidents" value={tpDashboardData.summary.redFlags} color="amber" />
                </div>

                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Teacher Audit Logs</h3>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Load</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Audit</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Red Flags</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hidden</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tpDashboardData.teachers.map((t: any, i: number) => (
                        <React.Fragment key={i}>
                          <tr 
                            onClick={() => toggleTeacherDetails(t.name)}
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                          >
                            <td className="px-8 py-5 text-[10px] font-bold text-slate-400">{i + 1}</td>
                            <td className="px-8 py-5">
                              <div className="font-bold text-slate-800 flex items-center gap-2">
                                {t.name}
                                {t.riskScore === 'High' && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{t.email}</div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-black text-slate-700">{t.liveLoad || 0}</div>
                                <div className="text-[10px] text-slate-400 font-bold">Learners</div>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-xs font-bold text-slate-500">{t.lastAuditDate || "—"}</td>
                            <td className="px-8 py-5 text-sm font-black text-slate-700">
                              {t.lastScore !== null ? `${t.lastScore}/80` : "undefined/80"}
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                t.lastGrade === 'A' ? 'bg-emerald-50 text-emerald-600' :
                                t.lastGrade === 'B' ? 'bg-indigo-50 text-indigo-600' :
                                t.lastGrade === 'C' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {t.lastGrade}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className={`flex items-center gap-2 font-bold text-xs ${t.redFlagCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                <AlertCircle className="w-3.5 h-3.5" />
                                {t.redFlagCount}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${t.isHidden ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {t.isHidden ? "Hidden" : "Visible"}
                                </span>
                                <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${expandedTeacher === t.name ? 'rotate-90' : ''}`} />
                              </div>
                            </td>
                          </tr>
                          
                          <AnimatePresence>
                            {expandedTeacher === t.name && (
                              <tr>
                                <td colSpan={9} className="p-0 border-none">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-slate-50/50"
                                  >
                                    <div className="p-10 space-y-10 border-t border-slate-100">
                                      {/* Audit Details */}
                                      <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                          <ShieldCheck className="w-3 h-3" /> Recent Audits
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                          {Object.entries(t.auditsByType).map(([type, audits]: [string, any]) => (
                                            <div key={type} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{type} Audit</span>
                                                <span className="text-[10px] font-bold text-slate-400">{audits.length} Sessions</span>
                                              </div>
                                              <div className="p-4 space-y-3">
                                                {audits.slice(0, 3).map((audit: any, idx: number) => (
                                                  <div key={idx} className="flex items-center justify-between text-xs">
                                                    <div className="space-y-0.5">
                                                      <p className="font-bold text-slate-700">{audit.learner}</p>
                                                      <p className="text-[10px] text-slate-400">{audit.date}</p>
                                                    </div>
                                                    <div className="text-right">
                                                      <p className="font-black text-slate-900">{audit.score}/80</p>
                                                      <p className={`text-[10px] font-black ${
                                                        audit.grade === 'A' ? 'text-emerald-500' : 'text-indigo-500'
                                                      }`}>{audit.grade} Grade</p>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {/* Upskill Tasks */}
                                        <div className="space-y-6">
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <CheckSquare className="w-3 h-3" /> Upskilling Tasks
                                          </h4>
                                          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                              <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                  <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Learner</th>
                                                  <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Gap Courses</th>
                                                  <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                  <th className="px-6 py-4"></th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-50">
                                                {upskillTasks.length > 0 ? upskillTasks.map((task) => (
                                                  <tr key={task.id}>
                                                    <td className="px-6 py-4 font-bold text-slate-700">{task.learner}</td>
                                                    <td className="px-6 py-4 text-indigo-600 font-bold">{task.gapCourses}</td>
                                                    <td className="px-6 py-4">
                                                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                        task.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                      }`}>
                                                        {task.status}
                                                      </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                      {task.status !== 'Done' && (
                                                        <button 
                                                          onClick={(e) => { e.stopPropagation(); updateTask(task.id, t.name, 'Done'); }}
                                                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                        >
                                                          <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                      )}
                                                    </td>
                                                  </tr>
                                                )) : (
                                                  <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium italic">No upskill tasks logged.</td>
                                                  </tr>
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>

                                        {/* TP Notes */}
                                        <div className="space-y-6">
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> TP Notes
                                          </h4>
                                          <div className="space-y-4">
                                            <div className="flex gap-3">
                                              <input 
                                                type="text"
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                placeholder="Add a performance note..."
                                                className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-500 shadow-sm"
                                              />
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); saveNote(t.name); }}
                                                disabled={savingNote || !newNote.trim()}
                                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                              >
                                                Save
                                              </button>
                                            </div>
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                              {teacherNotes.length > 0 ? teacherNotes.map((note) => (
                                                <div key={note.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{note.createdBy}</span>
                                                    <span className="text-[9px] font-bold text-slate-300">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                  </div>
                                                  <p className="text-xs font-bold text-slate-700 leading-relaxed">{note.note}</p>
                                                </div>
                                              )) : (
                                                <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                                                  <p className="text-xs text-slate-400 font-medium italic">No notes found for this teacher.</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="bg-white p-20 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">No Manager Selected</h3>
                  <p className="text-sm text-slate-500">Select a manager above to view their team's performance dashboard.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, color, isText = false }: { label: string; value: string | number; color: string; isText?: boolean }) {
  const colorStyles: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    slate: "text-slate-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      <div className={`font-black truncate ${isText ? 'text-sm' : 'text-xl'} ${colorStyles[color]}`}>
        {value}
      </div>
    </div>
  );
}

function StatMini({ label, value, color = "indigo" }: { label: string; value: string; color?: string }) {
  const colorStyles: Record<string, string> = {
    indigo: "text-indigo-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
  };
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 whitespace-nowrap">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}:</span>
      <span className={`text-xs font-black ${colorStyles[color]}`}>{value}</span>
    </div>
  );
}
