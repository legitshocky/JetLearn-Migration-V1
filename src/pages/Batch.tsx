import React, { useState } from "react";
import { Layers, Play, Clock, CheckCircle, Upload, FileText, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export default function Batch() {
  const [isUploading, setIsUploading] = useState(false);
  const [batchItems, setBatchItems] = useState<any[]>([]);

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate file processing
    setTimeout(() => {
      setBatchItems([
        { id: 1, learner: "Aarav Gupta", jlid: "JL1001", type: "Migration", status: "Ready" },
        { id: 2, learner: "Sarah Jenkins", jlid: "JL1002", type: "Onboarding", status: "Ready" },
        { id: 3, learner: "Liam Wilson", jlid: "JL1003", type: "Migration", status: "Ready" },
      ]);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Batch Processing</h1>
          <p className="text-slate-500 mt-1">Process multiple communications or data updates simultaneously.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> Download Template
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              Upload Batch File
            </h3>
            <div 
              onClick={handleFileUpload}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-500/50 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">Click to upload CSV</p>
              <p className="text-xs text-slate-400 mt-1">or drag and drop file here</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Ensure your CSV follows the system template to avoid processing errors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Processing Queue</h3>
              {batchItems.length > 0 && (
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <Play className="w-3 h-3 fill-current" /> Run Batch
                </button>
              )}
            </div>
            
            <div className="divide-y divide-slate-50">
              {isUploading ? (
                <div className="p-20 text-center">
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-medium text-slate-500">Parsing CSV data...</p>
                </div>
              ) : batchItems.length > 0 ? (
                batchItems.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{item.learner}</p>
                      <p className="text-xs text-slate-500">{item.jlid} · {item.type}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md uppercase tracking-wider">
                      {item.status}
                    </span>
                    <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-slate-400">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium">Queue is empty. Upload a file to begin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
