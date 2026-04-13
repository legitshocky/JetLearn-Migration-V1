import React from "react";
import { 
  LifeBuoy, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronRight, 
  ExternalLink,
  Search,
  HelpCircle,
  FileText,
  MessageSquare,
  Zap,
  Shield
} from "lucide-react";
import { motion } from "motion/react";

export default function Support() {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const categories = [
    { title: "Technical Support", desc: "Issues with HubSpot sync, email delivery, or system errors.", icon: Zap, color: "indigo" },
    { title: "Operational Help", desc: "Guidance on migration workflows and teacher matching.", icon: LifeBuoy, color: "emerald" },
    { title: "Account & Access", desc: "Permissions, role management, and profile settings.", icon: Shield, color: "blue" },
  ];

  const faqs = [
    { q: "How do I sync a new deal from HubSpot?", a: "Deals are automatically synced every 15 minutes. You can also manually fetch a deal using the JLID in the Communication center." },
    { q: "What happens if an email fails to send?", a: "Failed emails are logged in the Email Activities page. You can retry sending them after checking the error details." },
    { q: "How is the teacher match score calculated?", a: "Our AI model evaluates teacher load, course expertise, and timezone compatibility to provide a percentage score." },
    { q: "Can I revert a migration?", a: "Yes, you can use the 'Revert' action in the Audit Log within 24 hours of the migration." },
    { q: "How do I update teacher availability?", a: "Availability is synced from the Teacher Master Sheet. Updates there will reflect here within 10 minutes." }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
          <HelpCircle className="w-3 h-3" /> Support Center
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">How can we help you today?</h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          Get expert assistance for your operational workflows. Our team is here to ensure your transitions are seamless.
        </p>
        
        <div className="max-w-2xl mx-auto relative mt-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help articles, FAQs, or guides..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[32px] text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${cat.color}-50 text-${cat.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">{cat.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{cat.desc}</p>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
              Contact Team <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <h2 className="text-2xl font-black">Direct Channels</h2>
            <div className="space-y-4">
              <a href="mailto:support@jetlearn.com" className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Email Support</div>
                    <div className="text-[10px] text-white/50 font-medium">Response within 2 hours</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
              </a>
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Live Chat</div>
                    <div className="text-[10px] text-white/50 font-medium">Available 9 AM - 6 PM GMT</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest">Online</div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 opacity-10">
            <HelpCircle className="w-64 h-64" />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 px-2">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px]">Q</div>
                    {faq.q}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed pl-9">
                    {faq.a}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">No FAQs found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
