import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, Sparkles, Search, User, BookOpen, AlertCircle, 
  CheckCircle, MessageSquare, Send, LayoutDashboard, 
  Target, ShieldAlert, Zap, Activity, RefreshCw,
  TrendingUp, ShieldCheck, Cpu, Lightbulb, ArrowRight
} from "lucide-react";
import axios from "axios";

export default function AIPM() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [jlid, setJlid] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const tabs = [
    { id: "analysis", label: "Journey Analysis", icon: LayoutDashboard },
    { id: "strategy", label: "Strategy Builder", icon: Target },
    { id: "risk", label: "Risk Monitoring", icon: ShieldAlert },
  ];

  const runAIAnalysis = async () => {
    if (!jlid) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/hubspot/history/comprehensive/${jlid}`);
      if (response.data.success) {
        const aiResponse = await axios.post("/api/ai/analyze", {
          data: response.data,
          context: "Analyze this learner's migration history and provide a strategy for their next teacher assignment to minimize churn risk."
        });
        setAnalysis({
          ...response.data,
          aiVerdict: aiResponse.data.result
        });
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Project Manager
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Intelligent migration strategy and learner journey optimization.</p>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "analysis" ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Cpu className="w-64 h-64" />
              </div>
              <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    <Brain className="w-3.5 h-3.5" /> Neural Engine Active
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    Deep Journey Analysis
                  </h3>
                  <p className="text-slate-500 font-medium">Enter a learner's JLID to decode their educational DNA and generate strategic retention pathways.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Learner JLID (e.g. JL12345)..."
                      value={jlid}
                      onChange={(e) => setJlid(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner"
                    />
                  </div>
                  <button
                    onClick={runAIAnalysis}
                    disabled={loading || !jlid}
                    className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-[24px] hover:bg-indigo-700 disabled:opacity-50 transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-3"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Analyze Journey
                  </button>
                </div>
              </div>
            </div>

            {analysis && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                      <Brain className="w-64 h-64" />
                    </div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-indigo-600" />
                        AI Strategic Verdict
                      </h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Strategy
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm font-medium bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                        {analysis.aiVerdict}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" /> Learner Snapshot
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
                          {analysis.learnerProfile.learnerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-lg">{analysis.learnerProfile.learnerName}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{analysis.learnerProfile.jlid}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm">
                          <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Migrations</div>
                          <div className="text-2xl font-black text-slate-800">{analysis.journeyAnalysis.totalMigrations}</div>
                        </div>
                        <div className="p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm">
                          <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Risk Level</div>
                          <div className="text-2xl font-black text-rose-600">{analysis.journeyAnalysis.riskLevel}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
                      <Zap className="w-48 h-48 text-indigo-400" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-indigo-400">
                        <Lightbulb className="w-5 h-5" />
                        Critical Insight
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed font-bold italic">
                        "{analysis.aiSummary || "Based on the migration velocity, this learner requires a teacher with high stability scores (90+) to prevent churn."}"
                      </p>
                      <div className="pt-4">
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2">
                          View Full Analysis <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : activeTab === "strategy" ? (
          <motion.div
            key="strategy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <Target className="w-6 h-6 text-indigo-600" /> Retention Strategy Builder
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Objective</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 shadow-inner appearance-none">
                    <option>Prevent Churn</option>
                    <option>Upsell Advanced Course</option>
                    <option>Improve Engagement</option>
                    <option>Stabilize Migration</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Learner Persona</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Fast Learner", "Needs Support", "Tech Savvy", "Creative"].map(p => (
                      <button key={p} className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3">
                    <Brain className="w-5 h-5" /> Generate Strategy
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[40px] text-white space-y-8 relative overflow-hidden shadow-2xl shadow-slate-900/40">
              <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                <Sparkles className="w-64 h-64" />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <Brain className="w-6 h-6 text-indigo-400" /> AI Recommendations
                  </h3>
                  <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                    Neural Output
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-3 hover:bg-white/10 transition-colors">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Teacher Type</div>
                    <div className="text-sm font-bold leading-relaxed">"Structured & Technical" - Matches learner's logical approach. Prioritize teachers with CS background.</div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-3 hover:bg-white/10 transition-colors">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Communication Strategy</div>
                    <div className="text-sm font-bold leading-relaxed">Weekly progress reports via WhatsApp to build parent trust. Focus on project milestones.</div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-3 hover:bg-white/10 transition-colors">
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Engagement Hook</div>
                    <div className="text-sm font-bold leading-relaxed">Introduce "Game Jam" participation to leverage competitive nature.</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="risk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "High Risk Learners", value: "24", icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
                { label: "Stability Index", value: "92%", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                { label: "AI Interventions", value: "156", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 hover:shadow-md transition-all">
                  <div className={`p-5 ${stat.bg} ${stat.color} rounded-[24px] border ${stat.border} shadow-sm`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Real-time Risk Alerts</h3>
                  <div className="h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                </div>
                <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-200">
                  4 Critical Alerts
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { id: "JL10234", name: "Aarav Mehta", risk: "High", reason: "3 migrations in 2 months", action: "Assign Senior Mentor" },
                  { id: "JL10567", name: "Isha Singh", risk: "Medium", reason: "Teacher resignation", action: "Match Persona" },
                  { id: "JL10890", name: "Zoya Khan", risk: "High", reason: "Declining class score", action: "Audit Required" },
                  { id: "JL11234", name: "Liam O'Connor", risk: "High", reason: "Parent escalation", action: "JetGuide Intervention" },
                ].map((alert) => (
                  <div key={alert.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-all gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
                        {alert.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg flex items-center gap-3">
                          {alert.name} 
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                            {alert.id}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 font-medium mt-1">{alert.reason}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        alert.risk === "High" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {alert.risk} Risk
                      </span>
                      <button className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm">
                        {alert.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                  View All Risk Alerts
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
