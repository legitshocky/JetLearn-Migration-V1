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
  Settings
} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentMigrations, setRecentMigrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for migrations
    const q = query(collection(db, "migrations"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentMigrations(data);
    });

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // In a real app, this would be a more complex aggregation
        // For now, we'll use some mock data with real structure
        setStats({
          activeLearners: { value: 2546, change: 12, trend: "up" },
          migrations30d: { value: 42, change: -5, trend: "down" },
          revenueMoM: { value: 18450, change: 8, trend: "up" },
          successRate: { value: 94, change: 2, trend: "up" }
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Command Center</h1>
          <p className="text-slate-500 mt-1">Real-time operational overview and AI insights.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
            Refresh Data
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Learners", value: stats.activeLearners.value, change: stats.activeLearners.change, trend: stats.activeLearners.trend, icon: Users, color: "indigo" },
          { label: "Migrations (30d)", value: stats.migrations30d.value, change: stats.migrations30d.change, trend: stats.migrations30d.trend, icon: ArrowRightLeft, color: "purple" },
          { label: "New Revenue (MoM)", value: `€${stats.revenueMoM.value.toLocaleString()}`, change: stats.revenueMoM.change, trend: stats.revenueMoM.trend, icon: TrendingUp, color: "emerald" },
          { label: "Success Rate", value: `${stats.successRate.value}%`, change: stats.successRate.change, trend: stats.successRate.trend, icon: CheckCircle2, color: "blue" }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Action Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">AI Action Center</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: "risk", title: "High-Risk New Learners", desc: "3 system-initiated moves detected.", icon: AlertTriangle, color: "rose" },
              { type: "opportunity", title: "Upskilling Opportunity", desc: "5 teachers ready for advanced Python.", icon: TrendingUp, color: "indigo" },
              { type: "info", title: "Load Balancing", desc: "Redistribute 12 learners for optimal performance.", icon: ArrowRightLeft, color: "blue" }
            ].map((action, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-2xl border flex items-center gap-4 cursor-pointer bg-white border-slate-200 hover:border-indigo-500/30 hover:shadow-lg transition-all`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${action.color}-50 text-${action.color}-600`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{action.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentMigrations.length > 0 ? recentMigrations.map((activity, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-width-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {activity.learnerName} <span className="font-normal text-slate-500">migrated to</span> {activity.newTeacher}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                    activity.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-400">
                  <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No recent activity found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <Brain className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Impact Score</span>
            </div>
            <div className="text-5xl font-black mb-2">98.5</div>
            <p className="text-sm text-white/70 leading-relaxed">
              Top 1% of managers this month. Your efficiency in handling migrations has improved by 12%.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "New Onboarding", icon: Send },
                { label: "Add Teacher", icon: Users },
                { label: "Run Audit", icon: ClipboardCheck },
                { label: "Settings", icon: Settings }
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-500/30 hover:bg-indigo-50/50 transition-all gap-2 group"
                >
                  <action.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
