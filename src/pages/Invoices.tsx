import React, { useState } from "react";
import { FileText, Download, Search, Filter, CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const mockInvoices = [
    { id: "INV-2026-001", learner: "Yam Meridor", amount: "€149.00", status: "Paid", date: "2026-04-01" },
    { id: "INV-2026-002", learner: "Aarav Gupta", amount: "€199.00", status: "Pending", date: "2026-04-05" },
    { id: "INV-2026-003", learner: "Sarah Jenkins", amount: "€149.00", status: "Overdue", date: "2026-03-25" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage learner payments and generate professional invoices.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> New Payment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue (MTD)</p>
          <h3 className="text-2xl font-bold text-slate-900">€12,450.00</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Invoices</p>
          <h3 className="text-2xl font-bold text-indigo-600">14</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue Amount</p>
          <h3 className="text-2xl font-bold text-rose-600">€1,240.00</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by learner or invoice ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learner</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{inv.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.learner}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{inv.amount}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                      inv.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {inv.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : 
                       inv.status === 'Pending' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
