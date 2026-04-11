import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRightLeft, Search, Filter, Plus, Trash2, 
  User, BookOpen, Calendar, Clock, AlertTriangle,
  CheckCircle, RefreshCw, Send
} from "lucide-react";

export default function LearnerMigration() {
  const [loading, setLoading] = useState(false);
  const [jlid, setJlid] = useState("");
  const navigate = useNavigate();

  const migrations = [
    { id: "MIG-001", learner: "Iyobosa Ediae", jlid: "JL29744127049C", from: "Minha Khan", to: "Aditi Chauhan", status: "Completed", date: "2026-04-10" },
    { id: "MIG-002", learner: "Aarav Mehta", jlid: "JL29744127050D", from: "Rahul Sharma", to: "Minha Khan", status: "Pending", date: "2026-04-11" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-indigo-600" />
            Learner Migration Center
          </h1>
          <p className="text-slate-500 mt-1">Manage and track learner transitions between teachers.</p>
        </div>
        <button 
          onClick={() => navigate("/communication")}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Migration Request
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatCard label="Total Migrations" value="156" color="indigo" />
        <StatCard label="Pending" value="12" color="amber" />
        <StatCard label="Completed" value="144" color="emerald" />
        <StatCard label="Success Rate" value="98%" color="blue" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Migrations</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by JLID..."
                className="pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">From {"->"} To</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {migrations.map((mig) => (
              <tr key={mig.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="font-bold text-slate-800">{mig.learner}</div>
                  <div className="text-[10px] text-slate-400">{mig.jlid}</div>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span>{mig.from}</span>
                    <ArrowRightLeft className="w-3 h-3 text-slate-300" />
                    <span>{mig.to}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${mig.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {mig.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-xs font-bold text-slate-500">{mig.date}</td>
                <td className="px-8 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-widest">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorStyles: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      <div className={`text-2xl font-black ${colorStyles[color]}`}>{value}</div>
    </div>
  );
}
