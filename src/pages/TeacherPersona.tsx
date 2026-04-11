import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserSearch, Search, Filter, Star, Shield, AlertCircle, 
  ChevronRight, Brain, Users, Target, Zap, TrendingUp,
  X, CheckCircle2, BarChart3, Activity, ArrowRightLeft
} from "lucide-react";
import axios from "axios";

export default function TeacherPersona() {
  const [activeTab, setActiveTab] = useState("search");
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const tabs = [
    { id: "search", label: "Persona Search", icon: Search },
    { id: "comparison", label: "Persona Comparison", icon: Users },
    { id: "analytics", label: "Persona Analytics", icon: TrendingUp },
  ];

  const findSimilar = async () => {
    if (!teacherName) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/teachers/similar/${encodeURIComponent(teacherName)}`);
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        // Mock results for demo
        setResults([
          { name: "Aditi Chauhan", matchScore: 98, upskillCount: 12, avgClassScore: 78, escalationRisk: "Low", escalationColor: "#10b981" },
          { name: "Minha Khan", matchScore: 92, upskillCount: 8, avgClassScore: 72, escalationRisk: "Medium", escalationColor: "#f59e0b" },
          { name: "Rahul Sharma", matchScore: 88, upskillCount: 15, avgClassScore: 75, escalationRisk: "Low", escalationColor: "#10b981" },
          { name: "Siddharth V.", matchScore: 85, upskillCount: 6, avgClassScore: 68, escalationRisk: "High", escalationColor: "#ef4444" },
        ]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      // Mock results for demo
      setResults([
        { name: "Aditi Chauhan", matchScore: 98, upskillCount: 12, avgClassScore: 78, escalationRisk: "Low", escalationColor: "#10b981" },
        { name: "Minha Khan", matchScore: 92, upskillCount: 8, avgClassScore: 72, escalationRisk: "Medium", escalationColor: "#f59e0b" },
        { name: "Rahul Sharma", matchScore: 88, upskillCount: 15, avgClassScore: 75, escalationRisk: "Low", escalationColor: "#10b981" },
        { name: "Siddharth V.", matchScore: 85, upskillCount: 6, avgClassScore: 68, escalationRisk: "High", escalationColor: "#ef4444" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    Find Similar Teachers
                  </h3>
                  <p className="text-sm text-slate-500">Enter a teacher's name to find their best persona matches across the network.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Teacher Name (e.g. Aditi Chauhan)..."
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                  <button
                    onClick={findSimilar}
                    disabled={loading || !teacherName}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                  >
                    {loading ? "Searching..." : "Find Matches"}
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
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-bold">Top Tier</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Grade</span>
                      <span className="text-xs font-bold text-slate-700">{teacher.avgClassScore ? `${teacher.avgClassScore}/80` : 'N/A'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(teacher.avgClassScore / 80) * 100}%` }}
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
      />
    </div>
  );
}

function TeacherProfileModal({ isOpen, onClose, teacher }: { isOpen: boolean; onClose: () => void; teacher: any }) {
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
                <Zap className="w-5 h-5 text-indigo-600" /> Expertise & Traits
              </h3>
              <div className="flex flex-wrap gap-3">
                {["Python L1-L3", "Scratch Advanced", "Math Logic", "Focused Communicator", "Storyteller", "Patient Mentor", "Engaging"].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-bold border border-indigo-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-600 rounded-[32px] p-8 text-white space-y-6">
              <h4 className="text-lg font-black leading-tight">Match Recommendation</h4>
              <div className="text-4xl font-black">{teacher.matchScore}%</div>
              <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                Highly recommended for learners migrating from Minha Khan due to identical teaching personas and course expertise.
              </p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
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
