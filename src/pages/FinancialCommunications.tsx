import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CreditCard, 
  RefreshCw, 
  Download, 
  Send, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  Eye,
  Mail,
  Calendar,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAuth } from "../lib/AuthContext";

type TabType = "new-invoice" | "renewal";

export default function FinancialCommunications() {
  const [activeTab, setActiveTab] = useState<TabType>("new-invoice");
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [jlid, setJlid] = useState("");
  const [formData, setFormData] = useState<any>({
    paymentType: "Upfront",
    currency: "EUR",
    sessionsPerWeek: "1",
    freeClasses: 0,
    discount: 0,
    partialPayment: 0,
    tenure: "12",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    amountPaid: 0,
  });

  const handleFetchHubSpot = async () => {
    if (!jlid) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === "new-invoice" ? `/api/hubspot/deal/${jlid}` : `/api/hubspot/renewal/${jlid}`;
      const response = await axios.get(endpoint);
      
      if (response.data.success) {
        if (activeTab === "new-invoice") {
          setFormData({ ...formData, ...response.data.data });
        } else {
          // Renewal data structure is different
          const { deal, lineItems } = response.data.data;
          const latestItem = lineItems[0] || {};
          setFormData({
            ...formData,
            learnerName: deal.learnerName,
            parentName: deal.parentName,
            parentEmail: deal.parentEmail,
            currency: deal.currency,
            planName: latestItem.name,
            unitPrice: latestItem.unitPrice,
            discount: latestItem.discount,
            netPrice: latestItem.netPrice,
            paymentReceivedDate: latestItem.paymentDate,
            paymentType: latestItem.paymentType || "Upfront",
          });
        }
        setSuccess("Data fetched from HubSpot successfully!");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch data from HubSpot");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const total = parseFloat(formData.dealAmount || formData.netPrice || 0);
    const discount = parseFloat(formData.discount || 0);
    const paid = parseFloat(formData.amountPaid || formData.partialPayment || 0);
    const payable = total - discount;
    const balance = payable - paid;
    return { payable, paid, balance };
  };

  const { payable, paid, balance } = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Financial Communications</h1>
        <div className="flex gap-4 mt-4 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab("new-invoice")}
            className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === "new-invoice" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            New Invoice
          </button>
          <button 
            onClick={() => setActiveTab("renewal")}
            className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === "renewal" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            Renewal Communication
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "new-invoice" ? (
              <motion.div
                key="new-invoice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
                </div>

                {/* AI Agent Section */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                  <div className="relative z-10 flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">AI Invoicing Agent</h3>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter JLID to activate AI"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                          value={jlid}
                          onChange={(e) => setJlid(e.target.value)}
                        />
                        <button 
                          onClick={handleFetchHubSpot}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          Generate with AI
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 italic">
                        Let the AI read the HubSpot deal and sales note to create the invoice plan for you. It handles complex discounts and uneven installments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">JLID (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={jlid}
                        onChange={(e) => setJlid(e.target.value)}
                        placeholder="Enter JLID"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        onClick={handleFetchHubSpot}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learner Name</label>
                    <input
                      type="text"
                      value={formData.learnerName || ""}
                      onChange={(e) => setFormData({ ...formData, learnerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Name</label>
                    <input
                      type="text"
                      value={formData.parentName || ""}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Email</label>
                    <input
                      type="email"
                      value={formData.parentEmail || ""}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Contact</label>
                    <input
                      type="text"
                      value={formData.parentContact || ""}
                      onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                      placeholder="+4477..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Name</label>
                    <select 
                      value={formData.planName || ""}
                      onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select a plan</option>
                      <option value="Coding - 12 Months">Coding - 12 Months</option>
                      <option value="Math - 12 Months">Math - 12 Months</option>
                      <option value="Combo - 12 Months">Combo - 12 Months</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currency</label>
                    <select 
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sessions per Week</label>
                    <select 
                      value={formData.sessionsPerWeek}
                      onChange={(e) => setFormData({ ...formData, sessionsPerWeek: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">1 Session</option>
                      <option value="2">2 Sessions</option>
                      <option value="3">3 Sessions</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Classes</label>
                    <input
                      type="number"
                      value={formData.freeClasses}
                      onChange={(e) => setFormData({ ...formData, freeClasses: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partial Payment Received (Optional)</label>
                    <input
                      type="number"
                      value={formData.partialPayment}
                      onChange={(e) => setFormData({ ...formData, partialPayment: e.target.value })}
                      placeholder="e.g., 250"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subscription Tenure (Months)</label>
                    <select 
                      value={formData.tenure}
                      onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="24">24 Months</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Payment Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentType" 
                        checked={formData.paymentType === "Upfront"}
                        onChange={() => setFormData({ ...formData, paymentType: "Upfront" })}
                        className="text-indigo-600 focus:ring-indigo-500" 
                      />
                      Upfront
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentType" 
                        checked={formData.paymentType === "Installment"}
                        onChange={() => setFormData({ ...formData, paymentType: "Installment" })}
                        className="text-indigo-600 focus:ring-indigo-500" 
                      />
                      Installment
                    </label>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Total Payable</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 bg-white rounded-lg px-3 py-1 border border-blue-100">
                      {formData.currency} {payable.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Amount Paid</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 bg-white rounded-lg px-3 py-1 border border-emerald-100">
                      {formData.currency} {paid.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Balance Due</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 bg-white rounded-lg px-3 py-1 border border-rose-100">
                      {formData.currency} {balance.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-8 border-t border-slate-100">
                  <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Preview Invoice
                  </button>
                  <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Generate PDF & Email
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="renewal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-bold text-slate-900">Renewal Communication & Invoice</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">JLID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={jlid}
                        onChange={(e) => setJlid(e.target.value)}
                        placeholder="Enter JLID"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        onClick={handleFetchHubSpot}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Fetch
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learner Name</label>
                    <input
                      type="text"
                      value={formData.learnerName || ""}
                      onChange={(e) => setFormData({ ...formData, learnerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Name</label>
                    <input
                      type="text"
                      value={formData.parentName || ""}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Email</label>
                    <input
                      type="email"
                      value={formData.parentEmail || ""}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subscription Plan (Product)</label>
                    <select 
                      value={formData.planName || ""}
                      onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Renewal Plan</option>
                      <option value="Coding - 12 Months">Coding - 12 Months</option>
                      <option value="Math - 12 Months">Math - 12 Months</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currency</label>
                    <input
                      type="text"
                      value={formData.currency || ""}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Financial Details (Auto-Calculated)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Price (Total)</label>
                      <input
                        type="text"
                        value={formData.unitPrice || ""}
                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount Offered</label>
                      <input
                        type="text"
                        value={formData.discount || ""}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Price (Payable)</label>
                      <input
                        type="text"
                        value={formData.netPrice || ""}
                        onChange={(e) => setFormData({ ...formData, netPrice: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Payment Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Received Date</label>
                      <input
                        type="date"
                        value={formData.paymentReceivedDate || ""}
                        onChange={(e) => setFormData({ ...formData, paymentReceivedDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Payment Type</label>
                      <div className="flex gap-6 mt-3">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input 
                            type="radio" 
                            name="renewalPaymentType" 
                            checked={formData.paymentType === "Upfront"}
                            onChange={() => setFormData({ ...formData, paymentType: "Upfront" })}
                            className="text-indigo-600 focus:ring-indigo-500" 
                          />
                          Upfront
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input 
                            type="radio" 
                            name="renewalPaymentType" 
                            checked={formData.paymentType === "Installment"}
                            onChange={() => setFormData({ ...formData, paymentType: "Installment" })}
                            className="text-indigo-600 focus:ring-indigo-500" 
                          />
                          Installment
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-8 border-t border-slate-100">
                  <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Preview Email & PDF
                  </button>
                  <button className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Send className="w-4 h-4" /> Send Renewal Communication
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
