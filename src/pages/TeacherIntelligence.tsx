import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Brain, User, BookOpen, Clock, Shield, AlertTriangle, 
  CheckCircle, ChevronRight, Info, LayoutDashboard, UserPlus, 
  Bot, Users, RefreshCw, Plus, Trash2, Calendar, Mail,
  TrendingUp, BarChart3, Activity, X, Star, Zap, Filter, Eye,
  ArrowRight, Download, MessageSquare, AlertCircle, ArrowRightLeft
} from "lucide-react";
import axios from "axios";

export default function TeacherIntelligence() {
  const [activeTab, setActiveTab] = useState("load");
  const [searchParams, setSearchParams] = useSearchParams();
  const [teacherName, setTeacherName] = useState(searchParams.get("name") || "");
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState<any | null>(null);
  const [teachers, setTeachers] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeacherNames = async () => {
      try {
        const response = await axios.get("/api/teachers/names");
        setTeachers(response.data);
      } catch (error) {
        console.error("Failed to fetch teacher names:", error);
      }
    };
    fetchTeacherNames();
  }, []);

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
    <div className="space-y-6 pb-12">
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
                        <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                      </div>
                      <div className="p-6 space-y-6">
                        {teacherData.profile.courses?.map((course: any, i: number) => (
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">Replacement Engine</h3>
                  <p className="text-xs text-slate-500 font-medium">Find the perfect match based on teaching persona and expertise.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search by name or expertise..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl border border-slate-100 transition-all">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Minha Khan", match: 98, style: "Engaging & Playful", load: "65%", status: "Available", color: "emerald" },
                  { name: "Rahul Sharma", match: 94, style: "Structured & Technical", load: "42%", status: "Available", color: "emerald" },
                  { name: "Siddharth V.", match: 88, style: "Patient Mentor", load: "92%", status: "Limited", color: "amber" },
                ].map((t, i) => (
                  <div key={i} className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 hover:border-indigo-500/30 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 text-xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {t.name.charAt(0)}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-indigo-600">{t.match}%</div>
                        <div className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Match Score</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-800">{t.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 bg-${t.color}-100 text-${t.color}-700 rounded text-[8px] font-black uppercase tracking-widest`}>
                            {t.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.load} Load</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Persona Style</span>
                          <span className="text-xs font-bold text-slate-600">{t.style}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expertise</span>
                          <span className="text-xs font-bold text-slate-600">Python, Scratch</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                          Profile
                        </button>
                        <button className="py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10">
                          Replace
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <button className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-black/10 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Run New Analysis
                  </button>
                  <button className="bg-indigo-500/30 text-white border border-white/10 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-sm">
                    View Model Specs
                  </button>
                </div>
              </div>
              <Bot className="absolute -right-20 -bottom-20 w-[500px] h-[500px] text-white/5 rotate-12" />
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
                  {[45, 60, 85, 95, 75, 40, 30, 55, 80, 98, 70, 50, 65, 88, 42].map((h, i) => (
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
                <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 w-48">
                  <option>All Managers</option>
                  <option>Oorja M Srivastava</option>
                  <option>Ashita Sethi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
                <input type="date" defaultValue="2026-03-01" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 w-40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
                <input type="date" defaultValue="2026-04-11" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 w-40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grades</label>
                <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 w-32">
                  <option>All Grades</option>
                  <option>Grade A</option>
                  <option>Grade B</option>
                  <option>Grade C</option>
                  <option>Grade D</option>
                </select>
              </div>
              <button className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                Load Data
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total Teachers" value="482" color="indigo" />
              <StatCard label="EWS Teachers" value="12" color="rose" />
              <StatCard label="Avg Audit Score" value="72.4" color="emerald" />
              <StatCard label="Red Flag Incidents" value="5" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Score Distribution</h3>
                  <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> A</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full" /> B</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-full" /> C</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded-full" /> D</div>
                  </div>
                </div>
                <div className="h-48 flex items-end gap-2">
                  {[15, 25, 40, 65, 80, 95, 85, 70, 55, 45, 30, 20].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-50 rounded-t-lg relative group">
                      <div 
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${h > 74 ? 'bg-emerald-500' : h > 64 ? 'bg-blue-500' : h > 54 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Manager Performance</h3>
                <div className="space-y-4">
                  {[
                    { name: "Oorja M Srivastava", score: 76.4, count: 124 },
                    { name: "Ashita Sethi", score: 71.2, count: 98 },
                    { name: "Rahul K.", score: 68.5, count: 86 },
                  ].map((m, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{m.name}</span>
                        <span className="text-xs font-black text-indigo-600">{m.score}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${m.score}%` }} />
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.count} Teachers Managed</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Teacher Audit Logs</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                  <Download className="w-3.5 h-3.5" /> Export Logs
                </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Red Flags</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hidden</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "Aditi Chauhan", score: 78, grade: "A", flags: 0, hidden: "No", color: "emerald" },
                    { name: "Minha Khan", score: 72, grade: "B", flags: 1, hidden: "No", color: "blue" },
                    { name: "Rahul Sharma", score: 75, grade: "A", flags: 0, hidden: "No", color: "emerald" },
                    { name: "Siddharth V.", score: 52, grade: "D", flags: 3, hidden: "Yes", color: "rose" },
                  ].map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800">{t.name}</div>
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-slate-700">{t.score}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 bg-${t.color}-50 text-${t.color}-600 rounded-full text-[10px] font-black`}>
                          {t.grade}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${t.flags > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                          {t.flags}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">{t.hidden}</td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                          <ChevronRight className="w-5 h-5" />
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
