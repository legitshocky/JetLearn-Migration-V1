import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Book, Search, Filter, ChevronRight, Users, Star } from "lucide-react";
import axios from "axios";

export default function Courses() {
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-500">Browse all available courses and teacher proficiencies</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white h-32 rounded-xl border border-gray-100 animate-pulse"></div>
          ))
        ) : (
          filteredCourses.map((course, idx) => (
            <motion.div
              key={course}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Book className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{course}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Proficiency Tracking</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
