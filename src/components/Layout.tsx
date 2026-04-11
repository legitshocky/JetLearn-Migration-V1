import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Send, 
  Layers, 
  ClipboardCheck, 
  Clock, 
  FileText, 
  History, 
  Mail, 
  CheckSquare, 
  Users, 
  Brain, 
  Book, 
  PieChart, 
  HeartPulse, 
  UserCircle, 
  Settings,
  LogOut,
  Rocket,
  ArrowRightLeft,
  Gamepad2,
  Gamepad
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "communication", label: "New Communication", icon: Send, path: "/communication" },
  { id: "learner-migration", label: "Learner Migration", icon: ArrowRightLeft, path: "/learner-migration" },
  { id: "minecraft-email", label: "Minecraft Email", icon: Gamepad2, path: "/minecraft-email" },
  { id: "roblox-email", label: "Roblox Email", icon: Gamepad, path: "/roblox-email" },
  { id: "batch", label: "Batch Processing", icon: Layers, path: "/batch" },
  { id: "audit-center", label: "Audit Center", icon: ClipboardCheck, path: "/audit-center" },
  { id: "history", label: "Learner History", icon: Clock, path: "/history" },
  { id: "financial", label: "Financial Communications", icon: FileText, path: "/financial-communications" },
  { id: "audit-log", label: "Audit Log", icon: History, path: "/audit-log" },
  { id: "email-activities", label: "Email Activities", icon: Mail, path: "/email-activities" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/tasks" },
  { id: "teachers", label: "Teachers", icon: Users, path: "/teachers" },
  { id: "intelligence", label: "Teacher Intelligence", icon: Brain, path: "/teachers/intelligence" },
  { id: "courses", label: "Courses", icon: Book, path: "/courses" },
  { id: "reports", label: "Reports", icon: PieChart, path: "/reports" },
  { id: "health", label: "System Health", icon: HeartPulse, path: "/system-health" },
  { id: "persona", label: "Teacher Persona", icon: UserCircle, path: "/teacher-persona" },
  { id: "ai-pm", label: "AI PM", icon: Brain, path: "/ai-pm" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-700">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-3">
            <Rocket className="w-6 h-6 text-indigo-400" />
            <span>JetLearn</span>
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? "bg-indigo-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-white/30"}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
            <Link to="/my-profile" className="flex items-center gap-3 flex-1 min-width-0 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                {profile?.username?.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div className="flex-1 min-width-0">
                <p className="text-sm font-semibold truncate">{profile?.username || "Loading..."}</p>
                <p className="text-xs text-white/40 truncate">{profile?.role || "User"}</p>
              </div>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <div className="flex-1 p-8">
          {children}
        </div>
        <footer className="px-8 py-4 bg-white border-t border-slate-200 flex justify-center items-center gap-6 text-xs text-slate-400 font-medium">
          <span>2026 © JetLearn</span>
          <span className="flex items-center gap-1.5"><Rocket className="w-3 h-3 text-indigo-400" /> Version 1.0.0</span>
          <span className="flex items-center gap-1.5">Made by Sourav Pal</span>
        </footer>
      </main>
    </div>
  );
};
