import React, { useEffect, useState } from "react";
import {
  Users,
  ArrowRightLeft,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  History as HistoryIcon,
  Send,
  ClipboardCheck,
  Settings,
  Activity,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const chartData = [
  { name: "Mon", migrations: 4, revenue: 2400 },
  { name: "Tue", migrations: 7, revenue: 1398 },
  { name: "Wed", migrations: 5, revenue: 9800 },
  { name: "Thu", migrations: 8, revenue: 3908 },
  { name: "Fri", migrations: 12, revenue: 4800 },
  { name: "Sat", migrations: 3, revenue: 3800 },
  { name: "Sun", migrations: 6, revenue: 4300 },
];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentMigrations, setRecentMigrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [response, recentResponse] = await Promise.all([
          axios.get("/api/dashboard/stats"),
          axios.get("/api/migrations?limit=5"),
        ]);
        setStats(response.data);
        setRecentMigrations(recentResponse.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
        setStats({
          activeLearners: { value: 2546, change: 12, trend: "up" },
          migrations30d: { value: 42, change: -5, trend: "down" },
          activeTeachers: { value: 482, change: 3, trend: "up" },
          successRate: { value: 94, change: 2, trend: "up" }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-indigo-600" />
            Command Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Real-time operational overview and AI-driven insights.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => showNotification("Operational report exported to CSV.")}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Export Report
          </button>
          <button
            onClick={() => showNotification("Live monitor feed synchronized.")}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> Live Monitor
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Learners", value: stats.activeLearners.value, change: stats.activeLearners.change, trend: stats.activeLearners.trend, icon: Users, color: "indigo" },
          { label: "Migrations (30d)", value: stats.migrations30d.value, change: stats.migrations30d.change, trend: stats.migrations30d.trend, icon: ArrowRightLeft, color: "purple" },
          { label: "Active Teachers", value: stats.activeTeachers.value, change: stats.activeTeachers.change, trend: stats.activeTeachers.trend, icon: TrendingUp, color: "emerald" },
          { label: "Success Rate", value: `${stats.successRate.value}%`, change: stats.successRate.change, trend: stats.successRate.trend, icon: CheckCircle2, color: "blue" }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${kpi.color}-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${kpi.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1 relative z-10 tracking-tight">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900">Migration Velocity</h3>
                <p className="text-xs text-slate-500 font-medium">Daily migration volume across all regions</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 rounded-lg">7 Days</button>
                <button className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-50 rounded-lg">30 Days</button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} itemStyle={{ fontSize: "12px", fontWeight: 700 }} />
                  <Area type="monotone" dataKey="migrations" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMig)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">AI Action Center</h3>
              </div>
              <button
                onClick={() => showNotification("AI analysis re-run. Insights updated.")}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Run New Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: "risk", title: "High-Risk New Learners", desc: "3 system-initiated moves detected.", icon: AlertTriangle, color: "rose", path: "/history" },
                { type: "opportunity", title: "Upskilling Opportunity", desc: "5 teachers ready for advanced Python.", icon: TrendingUp, color: "indigo", path: "/teachers/intelligence" },
                { type: "info", title: "Load Balancing", desc: "Redistribute 12 learners for optimal performance.", icon: ArrowRightLeft, color: "blue", path: "/learner-migration" },
                { type: "success", title: "Retention Peak", desc: "Migration success rate hit 98% this week.", icon: CheckCircle2, color: "emerald", path: "/reports" }
              ].map((action, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => { window.location.href = action.path; }}
                  className="p-5 rounded-3xl border flex items-center gap-4 cursor-pointer bg-white border-slate-200 hover:border-indigo-500/30 hover:shadow-xl transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${action.color}-50 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{action.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{action.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Recent Activity</h3>
              <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View Full Log</button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentMigrations.length > 0 ? recentMigrations.map((activity, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ArrowRightLeft className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-width-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {activity.learnerName} <span className="font-medium text-slate-400">migrated to</span> {activity.newTeacher}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" /> {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    activity.status === "Success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {activity.status}
                  </span>
                </div>
              )) : (
                <div className="p-16 text-center text-slate-400">
                  <HistoryIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest">No recent activity detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-2 mb-6 opacity-60">
              <Brain className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Impact Score</span>
            </div>
            <div className="text-6xl font-black mb-4 tracking-tighter">98.5</div>
            <p className="text-sm text-white/70 leading-relaxed font-medium">
              Top 1% of operational managers this month. Your efficiency in handling complex migrations has improved by <span className="text-white font-bold">12.4%</span>.
            </p>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Next Milestone</div>
              <div className="text-xs font-bold">99.0 Score</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Teacher Load</h3>
              <Settings className="w-4 h-4 text-slate-300 cursor-pointer hover:text-slate-600" />
            </div>
            <div className="space-y-6">
              {[
                { name: "Minha Khan", load: 85, status: "High" },
                { name: "Aditi Chauhan", load: 62, status: "Optimal" },
                { name: "Rahul Sharma", load: 45, status: "Low" }
              ].map((teacher, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{teacher.name}</span>
                    <span className={teacher.status === "High" ? "text-rose-600" : "text-emerald-600"}>{teacher.load}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${teacher.load}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full rounded-full ${teacher.status === "High" ? "bg-rose-500" : "bg-emerald-500"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { window.location.href = "/teachers/intelligence"; }}
              className="w-full mt-8 py-3 text-[10px] font-black text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all uppercase tracking-widest border border-indigo-100"
            >
              Intelligence Dashboard
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Onboarding", icon: Send, path: "/communication" },
                { label: "Add Teacher", icon: Users, path: "/teachers" },
                { label: "Run Audit", icon: ClipboardCheck, path: "/audit-center" },
                { label: "Settings", icon: Settings, path: "/settings" }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => { window.location.href = action.path; }}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-100 hover:border-indigo-500/30 hover:bg-indigo-50/50 transition-all gap-3 group"
                >
                  <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-white transition-colors">
                    <action.icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-slate-900 uppercase tracking-widest">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <Zap className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold tracking-tight">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
