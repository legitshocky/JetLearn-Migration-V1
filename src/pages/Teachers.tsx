import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, Users, Star, AlertCircle, ExternalLink, ChevronRight, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("/api/teachers");
        setTeachers(response.data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || t.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Directory</h1>
          <p className="text-gray-500">Manage and monitor teacher performance and load</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="ews">EWS</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Teachers" value={teachers.length} color="indigo" />
        <StatCard label="Active Load" value={teachers.reduce((s, t) => s + t.activeCourses, 0)} color="blue" />
        <StatCard label="EWS Status" value={teachers.filter(t => t.status === 'EWS').length} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Load (C/M)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : (
                filteredTeachers.map((teacher, idx) => (
                  <motion.tr
                    key={teacher.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{teacher.name}</div>
                          <div className="text-xs text-gray-500">{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={teacher.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">{teacher.activeCourses}</span>
                        <span className="text-[10px] text-gray-400 font-medium">({teacher.activeCoding}/{teacher.activeMath})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{teacher.manager}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">{teacher.clsManagerResponsible}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{teacher.joinDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/teachers/intelligence?name=${encodeURIComponent(teacher.name)}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Teacher Intelligence"
                        >
                          <Star className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/teachers/profile/${encodeURIComponent(teacher.name)}`}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-1"
                        >
                          View Profile <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50",
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    EWS: "bg-red-100 text-red-700",
    Friendly: "bg-blue-100 text-blue-700",
    Resigned: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[status] || styles.Resigned}`}>
      {status}
    </span>
  );
}
