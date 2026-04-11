import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, PieChart, TrendingUp, Download, Calendar, 
  Search, ExternalLink, Send, Filter, AlertCircle,
  ArrowRightLeft, Users, Activity, CheckCircle2, Mail,
  Gamepad2, Box
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorStyles: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
    slate: "text-slate-600",
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      <div className={`text-2xl font-black ${colorStyles[color]}`}>{value}</div>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("migration");
  const [dateRange, setDateRange] = useState({ from: "2026-03-31", to: "2026-04-11" });
  const [perspective, setPerspective] = useState("All");
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "migration", label: "Migration Intelligence", icon: ArrowRightLeft },
    { id: "learner", label: "Learner Migration", icon: Users },
    { id: "emails", label: "Parent Email & Invoice", icon: Mail },
    { id: "games", label: "Game-Specific Emails", icon: Activity },
  ];

  const stats = [
    { label: "Total Migrations", value: "76", change: "0.0%", trend: "up", color: "indigo" },
    { label: "Avg. Migrations / Day", value: "5.8", change: null, trend: null, color: "slate" },
    { label: "CLS Involvement Rate", value: "0.0%", change: "0.0 pts", trend: "up", color: "emerald" },
    { label: "TP Involvement Rate", value: "0.0%", change: "0.0 pts", trend: "up", color: "amber" },
  ];

  const migrationDrivers = [
    { name: "Attrition", value: 50, color: "#4F46E5" },
    { name: "Teacher on Leaves", value: 15, color: "#6366F1" },
    { name: "Course Change Teacher Change", value: 12, color: "#F97316" },
    { name: "Escalation on Teacher", value: 8, color: "#F59E0B" },
    { name: "Slot change - Learner request", value: 10, color: "#10B981" },
    { name: "Other", value: 5, color: "#94A3B8" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence & Reports</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
              <Send className="w-3.5 h-3.5" /> Send Report Now
            </button>
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
        {activeTab === "migration" && (
          <motion.div
            key="migration"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 w-48"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 w-48"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perspective</label>
                <select 
                  value={perspective}
                  onChange={(e) => setPerspective(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option>All</option>
                  <option>Teacher Specific</option>
                  <option>Course Specific</option>
                </select>
              </div>
              <button className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                Generate Report
              </button>
            </div>

            {/* Executive Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Executive Overview</h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                      {stat.change && (
                        <div className={`text-[10px] font-bold ${stat.trend === 'up' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Executive Summary */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <AlertCircle className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">AI Executive Summary</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  March saw a total of 76 migrations, averaging 5.85 migrations per day. The primary driver for these migrations was 'Attrition', accounting for 50% (38) of all cases. 'Teacher on Leaves' and 'Course Change Teacher Change' were the next most significant reasons, contributing 10 and 8 migrations respectively. Notably, key performance indicators such as 'clsRate' and 'tpRate' were at 0, suggesting either a lack of data capture for these metrics or no successful re-engagement outcomes were tracked. Several teachers experienced significant student outflow, with Manharan Kaur, Abhiruchi Pillai, and Simran Sharma facing the largest net negative impact.
                </p>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Root Cause Analysis</h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-end gap-2">
                  <button className="p-1.5 bg-indigo-600 text-white rounded-lg"><BarChart3 className="w-4 h-4" /></button>
                  <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg"><TrendingUp className="w-4 h-4" /></button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 h-[400px]">
                  <div className="space-y-6 flex flex-col">
                    <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Migration Drivers</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={migrationDrivers}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {migrationDrivers.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {migrationDrivers.map((driver, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: driver.color }} />
                          <span className="text-[8px] font-bold text-slate-500 truncate">{driver.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6 flex flex-col">
                    <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Involvement by Top Reasons</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Attrition', CLS: 12, TP: 8, Ops: 5 },
                          { name: 'Leaves', CLS: 5, TP: 15, Ops: 2 },
                          { name: 'Course', CLS: 8, TP: 4, Ops: 6 },
                          { name: 'Escalation', CLS: 15, TP: 2, Ops: 1 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} />
                          <YAxis fontSize={8} axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="CLS" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="TP" fill="#F97316" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Ops" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Root Cause Analysis */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Search className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">AI Root Cause Analysis</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The dominant root cause for migrations in March was 'Attrition', responsible for 38 out of 76 total migrations (50%). This highlights a critical challenge in teacher retention and continuity. The second leading cause, 'Teacher on Leaves' (10 migrations), indicates a need for robust substitute or interim teaching solutions to minimize disruption during teacher absences. 'Course Change Teacher Change' (8 migrations) suggests potential mismatches in initial teacher assignments or evolving learner needs. Furthermore, reasons like 'Escalation on Teacher' (5 migrations), 'Teacher Performance Issue' (2 migrations), and 'Escalation on Teacher Post Migration' (1 migration) cumulatively point to underlying quality, satisfaction, or matching issues that warrant deeper investigation. The absence of specific team involvement (CLS, TP, OPS) data for any of the migration reasons makes it difficult to assess operational efficiency or pinpoint where interventions are occurring.
                </p>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Impact Analysis</h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-end gap-2">
                  <button className="p-1.5 bg-indigo-600 text-white rounded-lg"><BarChart3 className="w-4 h-4" /></button>
                  <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg"><TrendingUp className="w-4 h-4" /></button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 5 Teachers by Migrations From</h3>
                    <div className="space-y-4">
                      {[
                        { name: "Manharan Kaur", value: 14 },
                        { name: "Abhiruchi Pillai", value: 9 },
                        { name: "Simran Sharma", value: 9 },
                        { name: "Rohit", value: 6 },
                        { name: "Simleen Kaur", value: 3 },
                      ].map((t, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>{t.name}</span>
                            <span>{t.value}</span>
                          </div>
                          <div className="h-8 bg-slate-50 rounded-sm overflow-hidden">
                            <div className="h-full bg-rose-500 transition-all" style={{ width: `${(t.value / 14) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 5 Courses by Migration Count</h3>
                    <div className="h-64 border-l border-b border-slate-200 relative">
                      {/* Placeholder for Course Chart */}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Impact Analysis */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Users className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">AI Impact Analysis</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The migrations had a concentrated negative impact on specific teachers. Manharan Kaur experienced the highest net outflow of 14 students, followed by Abhiruchi Pillai and Simran Sharma, both with a net outflow of 9 students. Rohit also saw a significant outflow of 6 students. These teachers, and others with substantial negative net flows, should be prioritized for a performance review, feedback session, or investigation into the specific reasons for student migration away from their classes. While most teachers had negative or neutral net flows, Momina saw a positive net flow of 1 student, which, though small, could be an area to understand best practices. The 'courseImpact' data is currently empty, limiting our ability to analyze migration patterns at a course level, which is a critical gap for future insights. The lack of recorded team involvement in managing these migrations (all zero values) implies a potential gap in tracking intervention and resolution efforts by the CLS, TP, or Operations teams, hindering performance analysis and process improvement.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "learner" && (
          <motion.div
            key="learner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Migrations" value="1,240" color="indigo" />
              <StatCard label="Success Rate" value="98.4%" color="emerald" />
              <StatCard label="Avg. Time to Complete" value="4.2h" color="blue" />
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Migration Velocity</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Live Data</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: '1', value: 30 }, { day: '2', value: 45 }, { day: '3', value: 25 },
                    { day: '4', value: 60 }, { day: '5', value: 80 }, { day: '6', value: 55 },
                    { day: '7', value: 40 }, { day: '8', value: 70 }, { day: '9', value: 90 },
                    { day: '10', value: 65 }, { day: '11', value: 50 }, { day: '12', value: 85 }
                  ]}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#4F46E5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Top Migration Destinations</h3>
                <div className="space-y-4">
                  {[
                    { name: "Aditi Chauhan", count: 45, trend: "+12%" },
                    { name: "Minha Khan", count: 38, trend: "+8%" },
                    { name: "Rahul Sharma", count: 32, trend: "-5%" },
                    { name: "Siddharth V.", count: 28, trend: "+15%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                          {item.name.charAt(0)}
                        </div>
                        <div className="text-sm font-bold text-slate-800">{item.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-800">{item.count}</div>
                        <div className={`text-[10px] font-bold ${item.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{item.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Migration Reasons Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: "Teacher Availability", value: 45, color: "bg-indigo-600" },
                    { label: "Course Change", value: 25, color: "bg-purple-600" },
                    { label: "Student Request", value: 20, color: "bg-blue-600" },
                    { label: "Performance Issue", value: 10, color: "bg-rose-600" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "emails" && (
          <motion.div
            key="emails"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Emails Sent" value="2,840" color="indigo" />
              <StatCard label="Open Rate" value="72.4%" color="emerald" />
              <StatCard label="Invoices Generated" value="450" color="blue" />
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Communication Funnel</h3>
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="space-y-6">
                {[
                  { label: "Emails Delivered", value: 2840, total: 2840, color: "bg-indigo-600" },
                  { label: "Emails Opened", value: 2056, total: 2840, color: "bg-purple-600" },
                  { label: "Links Clicked", value: 842, total: 2840, color: "bg-blue-600" },
                  { label: "Invoices Paid", value: 312, total: 2840, color: "bg-emerald-600" },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{item.label}</span>
                      <span>{item.value} ({Math.round((item.value / item.total) * 100)}%)</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-xl overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / item.total) * 100}%` }}
                        className={`h-full ${item.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Recent Financial Communications</h3>
              <div className="space-y-4">
                {[
                  { type: "Invoice Sent", learner: "Iyobosa Ediae", amount: "€120", status: "Success", date: "2h ago" },
                  { type: "Payment Reminder", learner: "Aarav Mehta", amount: "€180", status: "Pending", date: "4h ago" },
                  { type: "Renewal Email", learner: "Zoya Khan", amount: "€240", status: "Success", date: "6h ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{item.type} - {item.learner}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.amount} • {item.date}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "games" && (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Minecraft Intelligence</h3>
                  </div>
                  <Gamepad2 className="w-6 h-6 text-indigo-600" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emails Sent</div>
                    <div className="text-xl font-black text-slate-800">842</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Rate</div>
                    <div className="text-xl font-black text-indigo-600">88%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performing Templates</h4>
                  {[
                    { name: "Server Invite", rate: 92 },
                    { name: "Modding Guide", rate: 84 },
                    { name: "Weekly Challenge", rate: 76 },
                  ].map((t, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{t.name}</span>
                        <span>{t.rate}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${t.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Roblox Intelligence</h3>
                  </div>
                  <Gamepad2 className="w-6 h-6 text-rose-600" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emails Sent</div>
                    <div className="text-xl font-black text-slate-800">654</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Rate</div>
                    <div className="text-xl font-black text-rose-600">82%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performing Templates</h4>
                  {[
                    { name: "Studio Setup", rate: 88 },
                    { name: "Game Publishing", rate: 81 },
                    { name: "Scripting Basics", rate: 74 },
                  ].map((t, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{t.name}</span>
                        <span>{t.rate}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-600" style={{ width: `${t.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
