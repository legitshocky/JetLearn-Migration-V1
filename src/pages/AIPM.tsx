import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, Sparkles, Search, User, BookOpen, AlertCircle, 
  CheckCircle, MessageSquare, Send, LayoutDashboard, 
  Target, ShieldAlert, Zap, Activity
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Project Manager</h1>
            <p className="text-sm text-gray-500 font-medium">Intelligent migration strategy and learner journey optimization</p>
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
        {activeTab === "analysis" ? (
          <motion.div
            key="analysis"
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
                    Deep Journey Analysis
                  </h3>
                  <p className="text-sm text-slate-500">Enter a learner's JLID to analyze their entire history and get AI-driven strategic recommendations.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Learner JLID (e.g. JL12345)..."
                      value={jlid}
                      onChange={(e) => setJlid(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                  <button
                    onClick={runAIAnalysis}
                    disabled={loading || !jlid}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                  >
                    {loading ? <Brain className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Analyze Journey
                  </button>
                </div>
              </div>
            </div>

            {analysis && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Brain className="w-48 h-48" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      AI Strategy & Recommendations
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm">
                        {analysis.aiVerdict}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Learner Snapshot</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {analysis.learnerProfile.learnerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{analysis.learnerProfile.learnerName}</div>
                          <div className="text-xs text-slate-400 font-medium">{analysis.learnerProfile.jlid}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 border border-slate-100 rounded-2xl">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Migrations</div>
                          <div className="text-xl font-black text-slate-800">{analysis.journeyAnalysis.totalMigrations}</div>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-2xl">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Risk Level</div>
                          <div className="text-xl font-black text-indigo-600">{analysis.journeyAnalysis.riskLevel}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Zap className="w-24 h-24" />
                    </div>
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Key Insight
                    </h3>
                    <p className="text-sm text-white/80 leading-relaxed font-medium">
                      {analysis.aiSummary || "Based on the migration velocity, this learner requires a teacher with high stability scores (90+) to prevent churn."}
                    </p>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Retention Strategy Builder
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Objective</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                    <option>Prevent Churn</option>
                    <option>Upsell Advanced Course</option>
                    <option>Improve Engagement</option>
                    <option>Stabilize Migration</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner Persona</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Fast Learner", "Needs Support", "Tech Savvy", "Creative"].map(p => (
                      <button key={p} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                  Generate Strategy
                </button>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" /> AI Recommendations
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Teacher Type</div>
                  <div className="text-sm font-bold">"Structured & Technical" - Matches learner's logical approach.</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Communication Strategy</div>
                  <div className="text-sm font-bold">Weekly progress reports via WhatsApp to build parent trust.</div>
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
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "High Risk Learners", value: "24", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
                { label: "Stability Index", value: "92%", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
                { label: "AI Interventions", value: "156", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Real-time Risk Alerts</h3>
                <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">4 Critical</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { id: "JL10234", name: "Aarav Mehta", risk: "High", reason: "3 migrations in 2 months", action: "Assign Senior Mentor" },
                  { id: "JL10567", name: "Isha Singh", risk: "Medium", reason: "Teacher resignation", action: "Match Persona" },
                  { id: "JL10890", name: "Zoya Khan", risk: "High", reason: "Declining class score", action: "Audit Required" },
                ].map((alert) => (
                  <div key={alert.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                        {alert.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{alert.name} <span className="text-xs text-slate-400 font-medium ml-2">{alert.id}</span></div>
                        <div className="text-xs text-slate-500">{alert.reason}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        alert.risk === "High" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                      }`}>
                        {alert.risk} Risk
                      </span>
                      <button className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">
                        {alert.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
