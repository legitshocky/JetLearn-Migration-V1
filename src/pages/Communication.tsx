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
  AlertCircle,
  Mail,
  RefreshCw,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAuth } from "../lib/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type TabType = "onboarding" | "migration" | "parent-email" | "minecraft" | "roblox";

const TIMEZONES = [
  "(GMT+00:00) London",
  "(GMT+01:00) Central European Time",
  "(GMT+02:00) Eastern European Time",
  "(GMT+03:00) Moscow Standard Time",
  "(GMT+04:00) Gulf Standard Time",
  "(GMT+05:30) India Standard Time",
  "(GMT+08:00) Singapore Standard Time",
  "(GMT+09:00) Japan Standard Time",
  "(GMT+10:00) Australian Eastern Time",
  "(GMT-05:00) Eastern Time",
  "(GMT-06:00) Central Time",
  "(GMT-07:00) Mountain Time",
  "(GMT-08:00) Pacific Time",
];

export const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("onboarding");
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [jlid, setJlid] = useState("");
  const [formData, setFormData] = useState<any>({
    sessions: [{ day: "Monday", hr: "12", min: "00", ampm: "PM" }],
    channels: { email: true, whatsapp: true },
    migrationType: "Mid-Course",
    intervenedBy: [],
    dealname: "",
    age: "",
    parentName: "",
    parentEmail: "",
    whatsappNumber: "",
    current_course: "",
    teacher: "",
    clsManager: "",
    tpManager: "",
    startDate: "",
    endDate: "",
    timezone: "(GMT+00:00) London",
    zoomLink: "",
    practiceDocLink: "",
    jetGuide: "",
    planName: "Monthly",
    tenure: 0,
    sessionsPerWeek: "0 Sessions/week",
    currency: "EUR",
    freeClasses: 0,
    discount: 0,
    partialPayment: "",
    paymentType: "Upfront",
    totalPayable: "€0.00",
    amountPaid: "€0.00",
    balanceDue: "€0.00",
    specialNeeds: "",
    additionalComments: "",
    generateInvoice: false,
    sendWhatsApp: false,
    gameUsername: "",
    serverRegion: "Europe",
    template: "",
    customMessage: ""
  });

  const [teachers, setTeachers] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [tpManagers, setTpManagers] = useState<string[]>([]);
  const [clsManagers, setClsManagers] = useState<string[]>([]);
  const [jetGuides, setJetGuides] = useState<string[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [tRes, cRes, tpRes, clsRes, jgRes] = await Promise.all([
          axios.get("/api/teachers/names"),
          axios.get("/api/courses"),
          axios.get("/api/managers/tp"),
          axios.get("/api/managers/cls"),
          axios.get("/api/managers/jetguides")
        ]);
        setTeachers(tRes.data);
        setCourses(cRes.data);
        setTpManagers(tpRes.data);
        setClsManagers(clsRes.data);
        setJetGuides(jgRes.data);
      } catch (e) {
        console.error("Failed to fetch metadata", e);
      }
    };
    fetchMetadata();
  }, []);

  const addSession = () => {
    setFormData({
      ...formData,
      sessions: [...formData.sessions, { day: "Monday", hr: "12", min: "00", ampm: "PM" }]
    });
  };

  const tabs = [
    { id: "onboarding", label: "New Learner Onboarding", icon: Send },
    { id: "migration", label: "Learner Migration", icon: ArrowRightLeft },
    { id: "parent-email", label: "Onboarding Email & Invoice Generator", icon: FileText },
    { id: "minecraft", label: "Minecraft Email", icon: Box },
    { id: "roblox", label: "Roblox Email", icon: Gamepad2 },
  ];

  useEffect(() => {
    const symbol = formData.currency === 'GBP' ? '£' : formData.currency === 'USD' ? '$' : '€';
    const amount = formData.dealAmount || 0;
    setFormData(prev => ({
      ...prev,
      totalPayable: `${symbol}${amount}`,
      amountPaid: `${symbol}${amount}`,
      balanceDue: `${symbol}0.00`
    }));
  }, [formData.dealAmount, formData.currency]);

  const handleFetchHubSpot = async () => {
    if (!jlid) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/hubspot/deal/${jlid}`);
      if (response.data.success) {
        const d = response.data.data;
        setFormData({ 
          ...formData, 
          ...d,
          dealname: d.learnerName,
          age: d.age,
          current_course: d.course,
          parentEmail: d.parentEmail,
          parentName: d.parentName,
          whatsappNumber: d.parentContact,
          teacher: d.currentTeacher,
          clsManager: d.clsManagerName,
          tpManager: d.tpManagerName,
          jetGuide: d.jetGuideName,
          currency: d.currency,
          dealAmount: d.dealAmount,
          paymentType: d.paymentType,
          startDate: d.startingDate,
          endDate: d.endDate,
          timezone: d.timezone || "(GMT+00:00) London",
          zoomLink: d.zoomLink,
          practiceDocLink: d.practiceDocumentLink,
          planName: d.planName || "Monthly",
          tenure: d.subscriptionTenureMonths || 0,
          sessionsPerWeek: d.sessionsPerWeek || "0 Sessions/week",
          totalPayable: `${d.currency === 'GBP' ? '£' : d.currency === 'USD' ? '$' : '€'}${d.dealAmount || 0}`,
          amountPaid: `${d.currency === 'GBP' ? '£' : d.currency === 'USD' ? '$' : '€'}${d.dealAmount || 0}`,
          balanceDue: `${d.currency === 'GBP' ? '£' : d.currency === 'USD' ? '$' : '€'}0.00`,
          sessions: d.classSessions && d.classSessions.length > 0 ? d.classSessions.map((s: any) => {
            const [hr, minPart] = (s.time || "12:00 PM").split(":");
            const [min, ampm] = (minPart || "00 PM").split(" ");
            return { day: s.day, hr: hr || "12", min: min || "00", ampm: ampm || "PM" };
          }) : [{ day: "Monday", hr: "12", min: "00", ampm: "PM" }]
        });
        setSuccess("Data fetched from HubSpot successfully!");
      }
 else {
        setError("Failed to fetch data from HubSpot");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch data from HubSpot");
    } finally {
      setLoading(false);
    }
  };

  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Call backend to send email/whatsapp
      const response = await axios.post("/api/communication/send", {
        type: activeTab,
        data: {
          ...formData,
          jlid
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send communication");
      }

      // 2. Log to Firestore
      await addDoc(collection(db, "migrations"), {
        ...formData,
        jlid,
        type: activeTab,
        status: "Success",
        timestamp: new Date().toISOString(),
        intervenedBy: profile?.username
      });

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
        {/* Global JLID Fetch */}
        <div className="p-8 pb-0">
          <div className="max-w-md">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Fetch from HubSpot</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={jlid}
                  onChange={(e) => setJlid(e.target.value)}
                  placeholder="Enter JLID (e.g. JL12345)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <button 
                type="button"
                onClick={handleFetchHubSpot}
                disabled={loading || !jlid}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
              {(activeTab === "onboarding" || activeTab === "migration") && (
                <>
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
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      value={formData.teacher || ""}
                      onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                    <input
                      type="number"
                      placeholder="Enter learner's age"
                      value={formData.age || ""}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course Enrolled</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      value={formData.courseEnrolled || ""}
                      onChange={(e) => setFormData({ ...formData, courseEnrolled: e.target.value })}
                    >
                      <option value="">Select a course</option>
                      {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Special Needs (if any)</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all h-24"
                      placeholder="Enter any special needs or notes"
                      value={formData.specialNeeds || ""}
                      onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                    />
                  </div>

                  <div className="col-span-full space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Class Schedule</label>
                    {formData.sessions.map((session: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <select 
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.day}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].day = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                          className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.hr}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].hr = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <select 
                          className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.min}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].min = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.ampm}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].ampm = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <select 
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.timezone || "(GMT+00:00) London"}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].timezone = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={addSession}
                      className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Another Session
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CLS Manager</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.clsManager || ""}
                      onChange={(e) => setFormData({ ...formData, clsManager: e.target.value })}
                    >
                      <option value="">Select CLS</option>
                      <option value="Ashita Sethi">Ashita Sethi</option>
                      <option value="Namrata">Namrata</option>
                      <option value="Saloni Sharma">Saloni Sharma</option>
                      <option value="Surabhi L">Surabhi L</option>
                      <option value="Zainab T">Zainab T</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">TP Manager</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.tpManager || ""}
                      onChange={(e) => setFormData({ ...formData, tpManager: e.target.value })}
                    >
                      <option value="">Select TP Manager</option>
                      {tpManagers.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">JetGuide</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.jetGuide || ""}
                      onChange={(e) => setFormData({ ...formData, jetGuide: e.target.value })}
                    >
                      <option value="">Select JetGuide</option>
                      <option value="Abhishek Nayak">Abhishek Nayak</option>
                      <option value="Aishwarya Jain">Aishwarya Jain</option>
                      <option value="Anamika Parmar">Anamika Parmar</option>
                      <option value="Molishka Rai">Molishka Rai</option>
                      <option value="Spreha Jain">Spreha Jain</option>
                      <option value="Satyam Mehra">Satyam Mehra</option>
                      <option value="Sunil Amarnath">Sunil Amarnath</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.timezone || "(GMT+00:00) London"}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "migration" && (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="Leave empty to auto-fetch"
                      value={formData.whatsappNumber || ""}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Old Teacher (Optional)</label>
                    <input
                      type="text"
                      value={formData.oldTeacher || ""}
                      onChange={(e) => setFormData({ ...formData, oldTeacher: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Teacher</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      value={formData.newTeacher || ""}
                      onChange={(e) => setFormData({ ...formData, newTeacher: e.target.value })}
                      required
                    >
                      <option value="">Select new teacher</option>
                      {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason of Migration</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.migrationReason || ""}
                      onChange={(e) => setFormData({ ...formData, migrationReason: e.target.value })}
                    >
                      <option value="">Select a reason...</option>
                      <option value="Attrition">Attrition</option>
                      <option value="Boomerang">Boomerang</option>
                      <option value="Course Change Teacher Change">Course Change Teacher Change</option>
                      <option value="Course change after PRM">Course change after PRM</option>
                      <option value="Escalation on Teacher">Escalation on Teacher</option>
                      <option value="Escalation on Teacher Post Migration">Escalation on Teacher Post Migration</option>
                      <option value="GCSE Optimization">GCSE Optimization</option>
                      <option value="Math Optimization">Math Optimization</option>
                      <option value="Paid BnR Optimization">Paid BnR Optimization</option>
                      <option value="Pause Request">Pause Request</option>
                      <option value="PSW">PSW</option>
                      <option value="Releasing Vintage teacher bandwidth">Releasing Vintage teacher bandwidth</option>
                      <option value="Slot change - Learner request">Slot change - Learner request</option>
                      <option value="Slot change - Teacher request">Slot change - Teacher request</option>
                      <option value="Special Learning Needs">Special Learning Needs</option>
                      <option value="Teacher Affinity">Teacher Affinity</option>
                      <option value="Teacher change after PRM">Teacher change after PRM</option>
                      <option value="Teacher on Leaves">Teacher on Leaves</option>
                      <option value="Teacher Performance Issue">Teacher Performance Issue</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.timezone || "(GMT+00:00) London"}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>

                  <div className="col-span-full space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Migration Intervened By</label>
                    <div className="flex gap-6">
                      {["CLS Intervention", "TP Intervention", "Ops Intervention"].map(role => (
                        <label key={role} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.intervenedBy?.includes(role)}
                            onChange={(e) => {
                              const newIntervened = e.target.checked 
                                ? [...(formData.intervenedBy || []), role]
                                : (formData.intervenedBy || []).filter((r: string) => r !== role);
                              setFormData({ ...formData, intervenedBy: newIntervened });
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                          />
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Link (Zoom / Google Meet)</label>
                    <input
                      type="text"
                      placeholder="Will auto-generate based on JLID if left empty"
                      value={formData.classLink || ""}
                      onChange={(e) => setFormData({ ...formData, classLink: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="col-span-full space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Class Schedule</label>
                    {formData.sessions.map((session: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <select 
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.day}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].day = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                          className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.hr}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].hr = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <select 
                          className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.min}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].min = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.ampm}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].ampm = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <select 
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                          value={session.timezone || "(GMT+00:00) London"}
                          onChange={(e) => {
                            const newSessions = [...formData.sessions];
                            newSessions[idx].timezone = e.target.value;
                            setFormData({ ...formData, sessions: newSessions });
                          }}
                        >
                          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CLS Manager</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.clsManager || ""}
                      onChange={(e) => setFormData({ ...formData, clsManager: e.target.value })}
                    >
                      <option value="">Select CLS</option>
                      <option value="Ashita Sethi">Ashita Sethi</option>
                      <option value="Namrata">Namrata</option>
                      <option value="Saloni Sharma">Saloni Sharma</option>
                      <option value="Surabhi L">Surabhi L</option>
                      <option value="Zainab T">Zainab T</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">JetGuide</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      value={formData.jetGuide || ""}
                      onChange={(e) => setFormData({ ...formData, jetGuide: e.target.value })}
                    >
                      <option value="">Select JetGuide</option>
                      <option value="Abhishek Nayak">Abhishek Nayak</option>
                      <option value="Aishwarya Jain">Aishwarya Jain</option>
                      <option value="Anamika Parmar">Anamika Parmar</option>
                      <option value="Molishka Rai">Molishka Rai</option>
                      <option value="Spreha Jain">Spreha Jain</option>
                      <option value="Satyam Mehra">Satyam Mehra</option>
                      <option value="Sunil Amarnath">Sunil Amarnath</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Migration Type</label>
                    <div className="flex gap-4 mt-2">
                      {["Mid-Course", "New Assignment"].map(type => (
                        <label key={type} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                          <input 
                            type="radio" 
                            name="migrationType" 
                            checked={formData.migrationType === type}
                            onChange={() => setFormData({...formData, migrationType: type})}
                            className="text-indigo-600 focus:ring-indigo-500" 
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-full p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Communication Channels
                    </h4>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.channels?.email} 
                          onChange={(e) => setFormData({ ...formData, channels: { ...formData.channels, email: e.target.checked } })}
                          className="rounded border-slate-300 text-indigo-600" 
                        />
                        Email Teacher
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.channels?.whatsapp} 
                          onChange={(e) => setFormData({ ...formData, channels: { ...formData.channels, whatsapp: e.target.checked } })}
                          className="rounded border-slate-300 text-indigo-600" 
                        />
                        WhatsApp Parent (WATI)
                      </label>
                    </div>
                    </div>
                  </div>
                )}
              </>
            )}

              {activeTab === "parent-email" && (
                <div className="col-span-full space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Core Onboarding Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learner Name</label>
                        <input
                          type="text"
                          value={formData.dealname || ""}
                          onChange={(e) => setFormData({ ...formData, dealname: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                        <input
                          type="text"
                          placeholder="Enter learner's age"
                          value={formData.age || ""}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Name</label>
                        <input
                          type="text"
                          value={formData.parentName || ""}
                          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Email</label>
                        <input
                          type="email"
                          value={formData.parentEmail || ""}
                          onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Contact</label>
                        <input
                          type="text"
                          placeholder="+44..."
                          value={formData.whatsappNumber || ""}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course</label>
                        <input
                          type="text"
                          value={formData.current_course || ""}
                          onChange={(e) => setFormData({ ...formData, current_course: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</label>
                        <input
                          type="text"
                          value={formData.teacher || ""}
                          onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CLS Manager</label>
                        <input
                          type="text"
                          value={formData.clsManager || ""}
                          onChange={(e) => setFormData({ ...formData, clsManager: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">TP Manager</label>
                        <input
                          type="text"
                          value={formData.tpManager || ""}
                          onChange={(e) => setFormData({ ...formData, tpManager: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                          value={formData.timezone || "(GMT+00:00) London"}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        >
                          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Schedule & Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                        <input
                          type="date"
                          value={formData.startDate || ""}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                        <input
                          type="date"
                          value={formData.endDate || ""}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="col-span-full space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                        <select
                          value={formData.timezone || "(GMT+00:00) London"}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>
                      <div className="col-span-full space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Class Schedule</label>
                        {formData.sessions.map((session: any, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <select 
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                              value={session.day}
                              onChange={(e) => {
                                const newSessions = [...formData.sessions];
                                newSessions[idx].day = e.target.value;
                                setFormData({ ...formData, sessions: newSessions });
                              }}
                            >
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select 
                              className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                              value={session.hr}
                              onChange={(e) => {
                                const newSessions = [...formData.sessions];
                                newSessions[idx].hr = e.target.value;
                                setFormData({ ...formData, sessions: newSessions });
                              }}
                            >
                              {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select 
                              className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                              value={session.min}
                              onChange={(e) => {
                                const newSessions = [...formData.sessions];
                                newSessions[idx].min = e.target.value;
                                setFormData({ ...formData, sessions: newSessions });
                              }}
                            >
                              {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select 
                              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                              value={session.ampm}
                              onChange={(e) => {
                                const newSessions = [...formData.sessions];
                                newSessions[idx].ampm = e.target.value;
                                setFormData({ ...formData, sessions: newSessions });
                              }}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={addSession}
                          className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Add Session
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zoom Link</label>
                        <input
                          type="text"
                          value={formData.zoomLink || ""}
                          onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Practice Doc Link (Optional)</label>
                        <input
                          type="text"
                          value={formData.practiceDocLink || ""}
                          onChange={(e) => setFormData({ ...formData, practiceDocLink: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CLS Manager</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                            value={formData.clsManager || ""}
                            onChange={(e) => setFormData({ ...formData, clsManager: e.target.value })}
                          >
                            <option value="">Select CLS</option>
                            {clsManagers.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">TP Manager</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                            value={formData.tpManager || ""}
                            onChange={(e) => setFormData({ ...formData, tpManager: e.target.value })}
                          >
                            <option value="">Select TP Manager</option>
                            {tpManagers.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">JetGuide</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                            value={formData.jetGuide || ""}
                            onChange={(e) => setFormData({ ...formData, jetGuide: e.target.value })}
                          >
                            <option value="">Select JetGuide</option>
                            {jetGuides.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Financial & Invoice Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Name</label>
                        <input
                          type="text"
                          value={formData.planName || "Monthly"}
                          onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subscription Tenure (Months)</label>
                        <input
                          type="number"
                          value={formData.tenure || 0}
                          onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sessions per Week</label>
                        <input
                          type="text"
                          value={formData.sessionsPerWeek || "0 Sessions/week"}
                          onChange={(e) => setFormData({ ...formData, sessionsPerWeek: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currency</label>
                        <input
                          type="text"
                          value={formData.currency || "EUR"}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Classes</label>
                        <input
                          type="number"
                          value={formData.freeClasses || 0}
                          onChange={(e) => setFormData({ ...formData, freeClasses: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount</label>
                        <input
                          type="number"
                          value={formData.discount || 0}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="col-span-full space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partial Payment Received (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., 250.50"
                          value={formData.partialPayment || ""}
                          onChange={(e) => setFormData({ ...formData, partialPayment: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="col-span-full space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Payment Type</label>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                            <input 
                              type="radio" 
                              name="paymentType" 
                              checked={formData.paymentType === "Upfront"}
                              onChange={() => setFormData({...formData, paymentType: "Upfront"})}
                              className="text-indigo-600 focus:ring-indigo-500" 
                            />
                            Upfront
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                            <input 
                              type="radio" 
                              name="paymentType" 
                              checked={formData.paymentType === "Installment"}
                              onChange={() => setFormData({...formData, paymentType: "Installment"})}
                              className="text-indigo-600 focus:ring-indigo-500" 
                            />
                            Installment
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Payable</label>
                        <input
                          type="text"
                          value={formData.totalPayable || "€0.00"}
                          onChange={(e) => setFormData({ ...formData, totalPayable: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-indigo-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid</label>
                        <input
                          type="text"
                          value={formData.amountPaid || "€0.00"}
                          onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-emerald-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance Due</label>
                        <input
                          type="text"
                          value={formData.balanceDue || "€0.00"}
                          onChange={(e) => setFormData({ ...formData, balanceDue: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-emerald-600 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Attachments & Final Touches</h3>
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Special Needs (if any)</label>
                        <textarea 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all h-24"
                          placeholder="Enter any special needs or notes for the teacher"
                          value={formData.specialNeeds || ""}
                          onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Other Attachments (Optional)</label>
                        <input type="file" multiple className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Comments for Email</label>
                        <textarea 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all h-24"
                          value={formData.additionalComments || ""}
                          onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
                        />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.generateInvoice || false}
                            onChange={(e) => setFormData({...formData, generateInvoice: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                          />
                          <span className="text-xs font-bold text-slate-700">Generate and Attach Invoice to this Email</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.sendWhatsApp || false}
                            onChange={(e) => setFormData({...formData, sendWhatsApp: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-700">Send Welcome WhatsApp Sequence</span>
                            <p className="text-[10px] text-slate-500">Sends "Jet, Set, Go!" + "Reminder" messages to Parent Contact immediately.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setFormData({ sessions: [{ day: "Monday", hr: "12", min: "00", ampm: "PM" }], channels: { email: true, whatsapp: true } })}
                      className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                    <button 
                      type="button"
                      className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> Review
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Send Email
                    </button>
                  </div>
                </div>
              )}

              {(activeTab === "minecraft" || activeTab === "roblox") && (
                <div className="col-span-full space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2 uppercase tracking-widest text-[10px]">Fetch from HubSpot</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">JLID</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={jlid}
                            onChange={(e) => setJlid(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                            placeholder="Enter JLID"
                          />
                          <button 
                            type="button"
                            onClick={handleFetchHubSpot}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">LEARNER NAME</label>
                      <input
                        type="text"
                        value={formData.dealname || ""}
                        onChange={(e) => setFormData({ ...formData, dealname: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">COURSE</label>
                      <input
                        type="text"
                        value={formData.current_course || ""}
                        onChange={(e) => setFormData({ ...formData, current_course: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PARENT NAME</label>
                      <input
                        type="text"
                        value={formData.parentName || ""}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PARENT EMAIL</label>
                      <input
                        type="email"
                        value={formData.parentEmail || ""}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">GAME USERNAME</label>
                      <input
                        type="text"
                        value={formData.gameUsername || ""}
                        onChange={(e) => setFormData({ ...formData, gameUsername: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SERVER REGION</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        value={formData.serverRegion || "Europe"}
                        onChange={(e) => setFormData({ ...formData, serverRegion: e.target.value })}
                      >
                        <option value="Europe">Europe</option>
                        <option value="North America">North America</option>
                        <option value="Asia">Asia</option>
                      </select>
                    </div>
                    <div className="col-span-full space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SELECT TEMPLATE</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        value={formData.template || ""}
                        onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                      >
                        <option value="">Select a template...</option>
                        <option value="onboarding">Welcome to {activeTab === "minecraft" ? "Minecraft" : "Roblox"} Coding!</option>
                        <option value="migration">Your {activeTab === "minecraft" ? "Minecraft" : "Roblox"} Class Update</option>
                        <option value="completion">Congratulations on Finishing Level 1!</option>
                      </select>
                    </div>
                    <div className="col-span-full space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CUSTOM MESSAGE (OPTIONAL)</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all h-24"
                        placeholder="Add a personal note to the email..."
                        value={formData.customMessage || ""}
                        onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowPreview(true)}
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
                </div>
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
              onClick={() => setShowPreview(true)}
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

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Communication Preview</h3>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-slate-400 w-16">To:</span>
                    <span className="text-slate-700">{formData.parentEmail || "parent@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-slate-400 w-16">Subject:</span>
                    <span className="text-slate-700 font-bold">
                      {activeTab === "onboarding" ? `Welcome to JetLearn, ${formData.dealname}!` : 
                       activeTab === "migration" ? `Important Update: Teacher Migration for ${formData.dealname}` :
                       activeTab === "minecraft" ? `Welcome to Minecraft Coding, ${formData.dealname}!` :
                       activeTab === "roblox" ? `Welcome to Roblox Coding, ${formData.dealname}!` :
                       `Onboarding Details & Invoice for ${formData.dealname}`}
                    </span>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-600 space-y-4 font-serif">
                  <p>Dear {formData.parentName || "Parent"},</p>
                  <p>
                    {activeTab === "onboarding" ? `We are thrilled to welcome ${formData.dealname} to the JetLearn family! Your journey into the world of coding starts on ${formData.startDate}.` :
                     activeTab === "migration" ? `We are writing to inform you about a teacher update for ${formData.dealname}. Your new teacher will be ${formData.newTeacher}.` :
                     `Please find the onboarding details and invoice for ${formData.dealname} attached to this email.`}
                  </p>
                  <div className="py-4 space-y-2">
                    <p><strong>Course:</strong> {formData.current_course}</p>
                    <p><strong>Schedule:</strong> {formData.sessions?.map((s: any) => `${s.day} at ${s.hr}:${s.min} ${s.ampm}`).join(", ")}</p>
                    {formData.zoomLink && <p><strong>Class Link:</strong> <a href={formData.zoomLink} className="text-indigo-600 underline">{formData.zoomLink}</a></p>}
                  </div>
                  <p>Best regards,<br />Team JetLearn</p>
                </div>
                {formData.generateInvoice && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <div className="text-xs font-bold text-indigo-900">Invoice_Generated.pdf</div>
                        <div className="text-[10px] text-indigo-500">Total: {formData.totalPayable}</div>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Edit Details
                </button>
                <button 
                  onClick={(e) => {
                    setShowPreview(false);
                    handleSubmit(e as any);
                  }}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Confirm & Send
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
