import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Mail, Shield, Calendar, BookOpen, AlertTriangle, ChevronLeft, ExternalLink, Star } from "lucide-react";
import axios from "axios";

export default function Profile() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/teachers/profile/${encodeURIComponent(name || "")}`);
        if (response.data.success) {
          setData(response.data.profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [name]);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading teacher profile...</div>;
  if (!data) return <div className="p-12 text-center text-red-500">Teacher not found.</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-4xl mx-auto mb-4">
              {data.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            <p className="text-gray-500 mb-6">{data.email}</p>
            <div className="flex items-center justify-center gap-2">
              <StatusBadge status={data.status} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-3">Management</h3>
            <div className="space-y-4">
              <InfoRow label="TP Manager" value={data.manager} icon={<User className="w-4 h-4" />} />
              <InfoRow label="CLS Manager" value={data.clsManager} icon={<Shield className="w-4 h-4" />} />
              <InfoRow label="Join Date" value={data.joinDate} icon={<Calendar className="w-4 h-4" />} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Course Proficiencies
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase">{data.totalCourses} Courses</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.courses.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">{c.course}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.proficiency === '100%' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {c.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Escalation History
            </h3>
            <div className="space-y-4">
              {data.escalation.tickets.length > 0 ? (
                data.escalation.tickets.map((ticket: any) => (
                  <div key={ticket.ticketId} className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{ticket.reason}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Learner: {ticket.learnerName} • {ticket.triggeredDate}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-red-600">{ticket.status}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No escalation history found for this teacher.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">{icon}</div>
      <div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</div>
        <div className="text-sm font-bold text-gray-700">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    EWS: "bg-red-100 text-red-700",
    Friendly: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
