import React, { useState } from "react";
import { FileText, Search, CreditCard, Loader2, AlertCircle, ExternalLink, User, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface DealData {
  dealname?: string; current_course__t_?: string; dealstage?: string;
  closedate?: string; amount?: string; currency?: string;
  parent_email__c?: string; parent_name?: string; class_timings?: string;
  jetlearner_id?: string; learner_health?: string;
}

export default function Invoices() {
  const navigate = useNavigate();
  const [jlid, setJlid] = useState("");
  const [loading, setLoading] = useState(false);
  const [deal, setDeal] = useState<DealData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!jlid.trim()) return;
    setLoading(true); setError(null); setDeal(null);
    try {
      const res = await axios.get(`/api/hubspot/deal/${jlid.trim()}`);
      setDeal(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Learner not found. Check the JLID and try again.");
    } finally { setLoading(false); }
  }

  function goToInvoiceGenerator() {
    navigate(`/financial-communications?jlid=${jlid.trim()}`);
  }

  const currencySymbol = (c?: string) => c === "GBP" ? "£" : c === "USD" ? "$" : "€";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            Invoice Lookup
          </h1>
          <p className="text-slate-500 mt-1">Search by JLID to fetch learner deal data and generate invoices.</p>
        </div>
        <button onClick={() => navigate("/financial-communications")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
          <CreditCard className="w-4 h-4" /> New Invoice
        </button>
      </motion.div>

      {/* Search */}
      <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Search by JLID</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={jlid} onChange={(e) => setJlid(e.target.value)} placeholder="Enter learner JLID e.g. JL52767973402C"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all" />
          </div>
          <button type="submit" disabled={loading || !jlid.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </motion.form>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Deal result */}
      <AnimatePresence>
        {deal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Deal header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white">{deal.dealname || "Unknown Learner"}</h2>
                  <p className="text-indigo-200 text-sm mt-0.5 font-medium">{jlid}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${deal.learner_health === "Critical" ? "bg-rose-500 text-white" : "bg-white/20 text-white"}`}>
                    {deal.learner_health || "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Deal details */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoRow icon={BookOpen} label="Current Course" value={deal.current_course__t_ || "—"} />
              <InfoRow icon={CreditCard} label="Deal Amount" value={deal.amount ? `${currencySymbol(deal.currency)}${deal.amount}` : "—"} />
              <InfoRow icon={User} label="Parent Name" value={deal.parent_name || "—"} />
              <InfoRow icon={User} label="Parent Email" value={deal.parent_email__c || "—"} />
              <InfoRow icon={Calendar} label="Close Date" value={deal.closedate ? new Date(deal.closedate).toLocaleDateString() : "—"} />
              <InfoRow icon={Calendar} label="Class Timings" value={deal.class_timings || "—"} />
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-wrap gap-3">
              <button onClick={goToInvoiceGenerator}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                <FileText className="w-4 h-4" /> Generate Invoice <ArrowRight className="w-4 h-4" />
              </button>
              <a href={`https://app.hubspot.com/contacts/7729491/record/0-3/${deal.jetlearner_id || ""}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                <ExternalLink className="w-4 h-4" /> View in HubSpot
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!deal && !loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm p-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <h3 className="text-base font-bold text-slate-500 mb-1">No learner selected</h3>
          <p className="text-sm text-slate-400">Enter a JLID above to fetch learner data and generate an invoice.</p>
        </motion.div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
      <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-indigo-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
