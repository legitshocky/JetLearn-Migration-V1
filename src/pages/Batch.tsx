import React, { useState } from "react";
import { 
  Layers, Play, Clock, CheckCircle, Upload, FileText, 
  AlertCircle, Trash2, Download, Search, Filter,
  RefreshCw, Zap, ShieldCheck, Brain, ArrowRight,
  ChevronRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Batch() {
  const [isUploading, setIsUploading] = useState(false);
  const [batchItems, setBatchItems] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate file processing
    setTimeout(() => {
      setBatchItems([
        { id: 1, learner: "Aarav Gupta", jlid: "JL1001", type: "Migration", status: "Ready", priority: "High" },
        { id: 2, learner: "Sarah Jenkins", jlid: "JL1002", type: "Onboarding", status: "Ready", priority: "Normal" },
        { id: 3, learner: "Liam Wilson", jlid: "JL1003", type: "Communication", status: "Ready", priority: "High" },
        { id: 4, learner: "Emma Thompson", jlid: "JL1004", type: "Migration", status: "Ready", priority: "Normal" },
        { id: 5, learner: "Noah Garcia", jlid: "JL1005", type: "Audit", status: "Ready", priority: "Low" },
      ]);
      setIsUploading(false);
    }, 1500);
  };

  const runBatch = () => {
    setStatus('processing');
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStatus('completed');
        setBatchItems(prev => prev.map(item => ({ ...item, status: 'Success' })));
      }
    }, 100);
  };

  const reset = () => {
    setBatchItems([]);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Batch Processing Engine
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">High-velocity bulk operations and automated workflows.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Template
          </button>
          {batchItems.length > 0 && (
            <button 
              onClick={reset}
              className="flex-1 md:flex-none bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Source Configuration</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Upload your dataset to begin</p>
            </div>

            <div 
              onClick={handleFileUpload}
              className="border-2 border-dashed border-slate-200 rounded-[32px] p-10 text-center hover:border-indigo-500/50 hover:bg-indigo-50/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform group-hover:bg-white shadow-sm">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-sm font-black text-slate-900">Drop CSV File</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Maximum 5,000 rows</p>
              </div>
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  System validates JLID, Teacher Names, and Course IDs automatically during the pre-run phase.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit backdrop-blur-sm border border-white/5">
                <Brain className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">Auto-Pilot</span>
              </div>
              <h3 className="text-xl font-black leading-tight">Batch Optimization</h3>
              <p className="text-indigo-200 text-xs leading-relaxed font-medium">
                Our engine can process up to <span className="text-white font-bold">250 communications per minute</span> with 99.9% delivery success.
              </p>
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                Configure Webhooks
              </button>
            </div>
            <div className="absolute -right-16 -bottom-16 opacity-10">
              <Zap className="w-48 h-48" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Processing Queue</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {batchItems.length} items identified
                </p>
              </div>
              {batchItems.length > 0 && status === 'idle' && (
                <button 
                  onClick={runBatch}
                  className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" /> Execute Batch
                </button>
              )}
              {status === 'processing' && (
                <div className="flex items-center gap-4 w-full md:w-64">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{progress}%</span>
                </div>
              )}
              {status === 'completed' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Batch Successful</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isUploading ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                          <p className="text-sm font-bold text-slate-500">Parsing dataset...</p>
                        </div>
                      </td>
                    </tr>
                  ) : batchItems.length > 0 ? (
                    batchItems.map((item, idx) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="font-bold text-slate-800">{item.learner}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.jlid}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-xs font-bold text-slate-600">{item.type}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            item.priority === 'High' ? 'text-rose-500' : 'text-slate-400'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            item.status === 'Success' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                            <Layers className="w-10 h-10 text-slate-200" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Queue is empty</p>
                            <p className="text-xs text-slate-400 mt-1">Upload a CSV file to begin processing.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
