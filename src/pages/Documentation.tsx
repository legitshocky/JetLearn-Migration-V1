import React from "react";
import { 
  Book, 
  Search, 
  ChevronRight, 
  FileText, 
  Code, 
  Database, 
  Zap, 
  Shield, 
  ArrowRight,
  Layout,
  Layers,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notification, setNotification] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const sections = [
    {
      title: "Getting Started",
      icon: Layout,
      items: ["System Overview", "Dashboard Navigation", "User Roles & Permissions", "Quick Start Guide"]
    },
    {
      title: "Operational Workflows",
      icon: Layers,
      items: ["New Learner Onboarding", "Learner Migration Wizard", "Teacher Matching Logic", "Audit Log Management"]
    },
    {
      title: "Integrations",
      icon: Cpu,
      items: ["HubSpot Sync API", "WATI WhatsApp Integration", "Email Service Configuration", "Google Sheets Backup"]
    }
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(section => section.items.length > 0);

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Book className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Documentation</h1>
          </div>
          <p className="text-slate-500 font-medium">Everything you need to master the JetLearn Operational Intelligence system.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredSections.map((section, i) => (
          <div key={i} className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <section.icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{section.title}</h3>
            </div>
            <div className="space-y-2">
              {section.items.map((item, j) => (
                <button 
                  key={j} 
                  onClick={() => showNotification(`Opening guide: ${item}`)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-500/30 hover:bg-indigo-50/30 transition-all group"
                >
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black leading-tight">Developer API Reference</h2>
            <p className="text-indigo-100 font-medium leading-relaxed">
              Access raw data and automate your workflows using our robust REST API. Complete documentation for HubSpot webhooks, teacher matching endpoints, and audit logging.
            </p>
            <div className="flex gap-4 pt-4">
              <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2">
                <Code className="w-4 h-4" /> View API Docs
              </button>
              <button className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all flex items-center gap-2">
                <Database className="w-4 h-4" /> Data Schema
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">API Explorer</span>
              </div>
              <div className="space-y-4 font-mono text-xs text-indigo-200">
                <div className="flex gap-4">
                  <span className="text-emerald-400">GET</span>
                  <span>/api/hubspot/deal/JL12345</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-amber-400">POST</span>
                  <span>/api/teachers/search</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-indigo-400">PATCH</span>
                  <span>/api/audit/tasks/:id</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -left-20 -bottom-20 opacity-10">
          <Zap className="w-96 h-96" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-start gap-6 group hover:border-indigo-500/30 transition-all cursor-pointer">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Security & Compliance</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Learn about our data encryption, GDPR compliance, and security protocols for learner information.</p>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 pt-2">
              Read Security Whitepaper <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-start gap-6 group hover:border-indigo-500/30 transition-all cursor-pointer">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Release Notes</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Stay updated with the latest features, bug fixes, and system improvements in JetLearn Intelligence.</p>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 pt-2">
              View Version History <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
