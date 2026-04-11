import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, Send, Search, Filter, Eye, Download, 
  CheckCircle, Clock, AlertCircle, Plus, Trash2,
  Gamepad2, User, BookOpen, Calendar, Activity
} from "lucide-react";

export default function MinecraftEmail() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const templates = [
    { id: 1, name: "Minecraft Onboarding", subject: "Welcome to Minecraft Coding!", type: "Onboarding" },
    { id: 2, name: "Minecraft Migration", subject: "Your Minecraft Class Update", type: "Migration" },
    { id: 3, name: "Minecraft Course Completion", subject: "Congratulations on Finishing Minecraft L1!", type: "Completion" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-indigo-600" />
            Minecraft Email Center
          </h1>
          <p className="text-slate-500 mt-1">Manage specialized communications for Minecraft courses.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Template
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Email Templates</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search templates..."
                  className="pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48"
                />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {templates.map((template) => (
                <div key={template.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{template.name}</h4>
                      <p className="text-xs text-slate-400">{template.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest">
                      {template.type}
                    </span>
                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Send Quick Minecraft Email</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Learner Name</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Learner Email</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" placeholder="Enter email" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500">Select Template</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                  {templates.map(t => <option key={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500">Custom Message (Optional)</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 min-h-[100px]" placeholder="Add a personal note..." />
              </div>
            </div>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Minecraft Email
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Email Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-indigo-100">Sent Today</span>
                <span className="text-2xl font-black">24</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-indigo-100">Open Rate</span>
                <span className="text-2xl font-black">68%</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-indigo-100">Click Rate</span>
                <span className="text-2xl font-black">12%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-800">Sent to Aarav M.</div>
                    <div className="text-[8px] text-slate-400">2 hours ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
