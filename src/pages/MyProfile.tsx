import React from "react";
import { User, Mail, Shield, Calendar, MapPin, Phone, Globe, Edit3, Camera } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function MyProfile() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="relative">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-lg" />
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[40px] bg-white p-1.5 shadow-xl">
              <div className="w-full h-full rounded-[34px] bg-slate-100 flex items-center justify-center text-indigo-600 text-4xl font-black">
                {profile?.username?.charAt(0).toUpperCase() || "J"}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="pb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.username || "User Name"}</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{profile?.role || "Operations Manager"}</p>
          </div>
        </div>
        <div className="absolute bottom-4 right-8">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </header>

      <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Contact Information</h3>
            <div className="space-y-4">
              <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={profile?.email || "user@jetlearn.com"} />
              <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value="+91 98765 43210" />
              <InfoItem icon={<Globe className="w-4 h-4" />} label="Timezone" value="Asia/Kolkata (GMT+5:30)" />
              <InfoItem icon={<MapPin className="w-4 h-4" />} label="Location" value="Gurugram, India" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">System Access</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">Admin Panel</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">Audit Rights</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { action: "Approved Migration", target: "JL29744127049C", time: "2 hours ago" },
                { action: "Updated Teacher Profile", target: "Aditi Chauhan", time: "5 hours ago" },
                { action: "Generated Weekly Report", target: "Migration Intelligence", time: "Yesterday" },
                { action: "Resolved Escalation", target: "Ticket #8821", time: "2 days ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">
                      {activity.action} <span className="text-indigo-600">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-indigo-600 text-xs font-bold uppercase tracking-widest hover:text-indigo-800 transition-all">View All Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
