import React, { useState, useEffect } from "react";
import { 
  Send, 
  ArrowRightLeft, 
  FileText, 
  Gamepad2, 
  Box, 
  Download, 
  Search,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAuth } from "../lib/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type TabType = "onboarding" | "migration" | "parent-email" | "minecraft" | "roblox";

export const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("onboarding");
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [jlid, setJlid] = useState("");
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    { id: "onboarding", label: "New Learner Onboarding", icon: Send },
    { id: "migration", label: "Learner Migration", icon: ArrowRightLeft },
    { id: "parent-email", label: "Parent Email & Invoice", icon: FileText },
    { id: "minecraft", label: "Minecraft Email", icon: Box },
    { id: "roblox", label: "Roblox Email", icon: Gamepad2 },
  ];

  const handleFetchHubSpot = async () => {
    if (!jlid) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hubspot/deal/${jlid}`);
      setFormData({ ...formData, ...response.data });
      setSuccess("Data fetched from HubSpot successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch data from HubSpot");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Log to Firestore
      await addDoc(collection(db, "migrations"), {
        ...formData,
        jlid,
        type: activeTab,
        status: "Success",
        timestamp: new Date().toISOString(),
        intervenedBy: profile?.username
      });

      // In a real app, you'd trigger the email/whatsapp here via backend
      setSuccess("Communication processed and logged successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-center">New Communication</h1>
        <p className="text-slate-500 mt-1 text-center text-sm">Select a communication type and fill in the details.</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="max-w-md mx-auto">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Fetch from HubSpot</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={jlid}
                  onChange={(e) => setJlid(e.target.value)}
                  placeholder="Enter JLID (e.g. JL12345)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
              <button 
                onClick={handleFetchHubSpot}
                disabled={loading || !jlid}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                {loading ? "..." : "Fetch"}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learner Name</label>
                <input
                  type="text"
                  value={formData.dealname || ""}
                  onChange={(e) => setFormData({ ...formData, dealname: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course</label>
                <input
                  type="text"
                  value={formData.current_course || ""}
                  onChange={(e) => setFormData({ ...formData, current_course: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              {activeTab === "onboarding" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === "migration" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Old Teacher</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Teacher</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </>
              )}
              
              {/* Add more fields for other tabs as needed */}
            </motion.div>
          </AnimatePresence>

          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <button 
              type="button"
              className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Preview
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Send Communication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
