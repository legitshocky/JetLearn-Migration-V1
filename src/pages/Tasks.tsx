import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle, Clock, AlertCircle, User, Calendar, MoreVertical, Plus, Search } from "lucide-react";
import axios from "axios";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/audit/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (taskId: string, status: string) => {
    try {
      await axios.patch(`/api/audit/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const filteredTasks = tasks.filter(t => filter === "all" || t.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Tasks</h1>
          <p className="text-gray-500">Manage migration approvals and upskilling follow-ups</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-300 rounded-lg p-1 flex items-center">
            {['All', 'Pending', 'In Progress', 'Completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f.toLowerCase())}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  filter === f.toLowerCase() ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white h-48 rounded-xl border border-gray-100 animate-pulse"></div>
          ))
        ) : (
          filteredTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <StatusBadge status={task.status} />
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{task.description}</h3>
              <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.learner} ({task.learnerJlid})
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.created).toLocaleDateString('en-GB')}
                </div>
                <div className="flex items-center gap-1">
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => updateStatus(task.id, 'Completed')}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as Completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {task.status === 'Pending' && (
                    <button
                      onClick={() => updateStatus(task.id, 'In Progress')}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Start Task"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
        {filteredTasks.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No tasks found matching the current filter.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}
