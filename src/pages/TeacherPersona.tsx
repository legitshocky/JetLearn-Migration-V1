import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserSearch, Search, Filter, Star, Shield, AlertCircle, 
  ChevronRight, Brain, Users, Target, Zap, TrendingUp,
  X, CheckCircle2, BarChart3, Activity, ArrowRightLeft,
  Book, Clock, Globe
} from "lucide-react";
import axios from "axios";

const TIMEZONES = [
  "(GMT+00:00) London",
  "(GMT+01:00) Central European Time",
  "(GMT+02:00) Eastern European Time",
  "(GMT+03:00) Moscow Standard Time",
  "(GMT+04:00) Gulf Standard Time",
  "(GMT+05:30) India Standard Time",
  "(GMT+08:00) Singapore Standard Time",
  "(GMT+09:00) Japan Standard Time",
  "(GMT+10:00) Australian Eastern Time",
  "(GMT-05:00) Eastern Time",
  "(GMT-06:00) Central Time",
  "(GMT-07:00) Mountain Time",
  "(GMT-08:00) Pacific Time",
];

export default function TeacherPersona() {
  const [activeTab, setActiveTab] = useState("search");
  const [teacherName, setTeacherName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("(GMT+01:00) Central European Time");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("17:00");
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    fetchCourses();
  }, []);

  const tabs = [
    { id: "search", label: "Persona Search", icon: Search },
    { id: "comparison", label: "Persona Comparison", icon: Users },
    { id: "analytics", label: "Persona Analytics", icon: TrendingUp },
  ];

  const findSimilar = async () => {
    setLoading(true);
    try {
      // If teacher name is provided, use similar endpoint
      if (teacherName) {
        const response = await axios.get(`/api/teachers/similar/${encodeURIComponent(teacherName)}`);
        if (response.data.success) {
          setResults(response.data.data);
        } else {
          setResults([]);
        }
      } else {
        // Otherwise use search endpoint with filters
        const response = await axios.post("/api/teachers/search", {
          currentCourse: selectedCourse,
          timezone: selectedTimezone,
          slotDate: selectedDate,
          slotTime: selectedTime
        });
        if (response.data.success) {
          setResults(response.data.results || []);
        } else {
          setResults([]);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <UserSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Persona Matching</h1>
            <p className="text-sm text-gray-500 font-medium">Find teachers with similar traits, expertise, and teaching styles</p>
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
        {activeTab === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="relative md:col-span-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by Name..."
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Course</label>
                    <div className="relative">
                      <Book className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-500 appearance-none transition-all"
                      >
                        <option value="">Select Course...</option>
                        {courses.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-500 appearance-none transition-all"
                      >
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slot Date</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slot Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={findSimilar}
                    disabled={loading || (!teacherName && !selectedCourse)}
                    className="bg-indigo-600 text-white px-12 py-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                  >
                    {loading ? "Analyzing Network..." : "Find Persona Matches"}
                    <Target className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((teacher, idx) => (
                <motion.div
                  key={teacher.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-600">{teacher.matchScore}%</div>
                      <div className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Match Score</div>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg mb-1">{teacher.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                      {teacher.upskillCount} Courses
                    </div>
                    {teacher.slotMatch && teacher.slotMatch !== "—" && (
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        teacher.slotFullMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {teacher.slotMatch}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-bold">Top Tier</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Grade</span>
                      <span className="text-xs font-bold text-slate-700">{teacher.avgClassScoreDisplay || (teacher.avgClassScore ? `${teacher.avgClassScore}/80` : 'N/A')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(Number(teacher.avgClassScore) / 80) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stability</span>
                      <span className="text-xs font-bold" style={{ color: teacher.escalationColor }}>{teacher.escalationRisk}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedTeacher(teacher)}
                    className="mt-auto w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    View Full Profile <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
              {results.length === 0 && !loading && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-medium">Search for a teacher to find their best persona matches.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "comparison" && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 pt-20 space-y-12">
                  {[
                    "Teaching Style",
                    "Course Expertise",
                    "Audit Performance",
                    "Learner Retention",
                    "Stability Index"
                  ].map((label) => (
                    <div key={label} className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-12 flex items-center">
                      {label}
                    </div>
                  ))}
                </div>
                
                {[
                  { name: "Aditi Chauhan", style: "Engaging & Playful", expertise: "Python, Scratch", score: "78/80", retention: "94%", stability: "High" },
                  { name: "Minha Khan", style: "Structured & Technical", expertise: "Math, Python", score: "72/80", retention: "88%", stability: "Medium" }
                ].map((teacher, i) => (
                  <div key={i} className="col-span-1 space-y-8 text-center p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="space-y-2">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center text-indigo-600 text-xl font-black">
                        {teacher.name.charAt(0)}
                      </div>
                      <h4 className="font-bold text-slate-800">{teacher.name}</h4>
                    </div>
                    
                    <div className="space-y-12 pt-4">
                      <div className="text-xs font-bold text-slate-600 h-12 flex items-center justify-center">{teacher.style}</div>
                      <div className="text-xs font-bold text-slate-600 h-12 flex items-center justify-center">{teacher.expertise}</div>
                      <div className="text-xs font-bold text-slate-600 h-12 flex items-center justify-center">{teacher.score}</div>
                      <div className="text-xs font-bold text-slate-600 h-12 flex items-center justify-center">{teacher.retention}</div>
                      <div className="text-xs font-bold text-emerald-600 h-12 flex items-center justify-center uppercase tracking-widest">{teacher.stability}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Persona Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Technical Expert", value: 45, color: "bg-indigo-500" },
                  { label: "Engaging Storyteller", value: 30, color: "bg-emerald-500" },
                  { label: "Patient Mentor", value: 25, color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Success Correlation
              </h3>
              <div className="h-48 flex items-end gap-3 px-2">
                {[30, 45, 60, 85, 70, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-50 rounded-t-lg relative group">
                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium italic">Higher matching scores correlate with 24% better retention.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" /> Network Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Top Trait</div>
                  <div className="text-lg font-black text-slate-800">Focused Communicator</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Best Match Rate</div>
                  <div className="text-lg font-black text-slate-800">Python L1 {"->"} L2</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeacherProfileModal 
        isOpen={!!selectedTeacher} 
        onClose={() => setSelectedTeacher(null)} 
        teacher={selectedTeacher} 
        showNotification={showNotification}
      />
    </div>
  );
}

function TeacherProfileModal({ isOpen, onClose, teacher, showNotification }: { isOpen: boolean; onClose: () => void; teacher: any; showNotification: (msg: string) => void }) {
  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 text-3xl font-black">
              {teacher.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">{teacher.name}</h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Top Match</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-black text-slate-700">4.9 / 5.0</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-8 h-8 text-slate-300" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" /> Persona Analysis
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {teacher.name} demonstrates a highly engaging teaching style, particularly effective with younger learners (ages 8-12). Their ability to simplify complex Python concepts through storytelling has resulted in a 94% retention rate for Level 1 to Level 2 transitions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Performance</div>
                <div className="text-2xl font-black text-slate-800">{teacher.avgClassScore}/80</div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${(teacher.avgClassScore/80)*100}%` }} />
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stability Index</div>
                <div className="text-2xl font-black text-emerald-600">{teacher.escalationRisk}</div>
                <div className="text-[10px] font-bold text-slate-400">0 Escalations in 90 days</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" /> Expertise & Availability
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {teacher.courses?.split(",").map((tag: string) => (
                    <span key={tag} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-bold border border-indigo-100">
                      {tag.trim()}
                    </span>
                  )) || ["Python L1-L3", "Scratch Advanced", "Math Logic"].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-bold border border-indigo-100">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Weekly Availability
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600">{teacher.timezone || "GMT+5:30"}</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                      <div key={i} className="space-y-2 text-center">
                        <div className="text-[8px] font-black text-slate-400">{day}</div>
                        <div className={`h-12 rounded-lg ${i < 5 ? "bg-indigo-100 border border-indigo-200" : "bg-slate-100"} flex flex-col items-center justify-center gap-1`}>
                          {i < 5 && <div className="w-1 h-1 bg-indigo-400 rounded-full" />}
                          {i < 5 && <div className="w-1 h-1 bg-indigo-400 rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic text-center">Available for 12 more slots this week.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-600 rounded-[32px] p-8 text-white space-y-6">
              <h4 className="text-lg font-black leading-tight">Match Recommendation</h4>
              <div className="text-4xl font-black">{teacher.matchScore}%</div>
              <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                {teacher.matchReason || `Highly recommended for learners interested in ${teacher.courses?.split(",")[0] || "Python"} due to exceptional engagement scores.`}
              </p>
              <button 
                onClick={() => {
                  showNotification(`Teacher ${teacher.name} selected for migration workflow.`);
                  onClose();
                }}
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all"
              >
                Select Teacher
              </button>
            </div>

            <div className="p-6 border border-slate-100 rounded-[32px] space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Feedback</h4>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-800">Parent of Aarav</div>
                      <p className="text-[10px] text-slate-500 italic leading-relaxed">"Excellent at explaining difficult concepts..."</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
