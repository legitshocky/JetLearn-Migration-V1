import React, { useState } from "react";
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
  Gamepad,
  Search,
  Bell,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Award,
  Receipt
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/", category: "Core" },
  { id: "communication", label: "New Communication", icon: Send, path: "/communication", category: "Operations" },
  { id: "learner-migration", label: "Learner Migration", icon: ArrowRightLeft, path: "/learner-migration", category: "Operations" },
  { id: "minecraft-email", label: "Minecraft Email", icon: Gamepad2, path: "/minecraft-email", category: "Games" },
  { id: "roblox-email", label: "Roblox Email", icon: Gamepad, path: "/roblox-email", category: "Games" },
  { id: "batch", label: "Batch Processing", icon: Layers, path: "/batch", category: "Operations" },
  { id: "audit-center", label: "Audit Center", icon: ClipboardCheck, path: "/audit-center", category: "Compliance" },
  { id: "history", label: "Learner History", icon: Clock, path: "/history", category: "Intelligence" },
  { id: "financial", label: "Financial Communications", icon: FileText, path: "/financial-communications", category: "Operations" },
  { id: "invoices", label: "Invoices", icon: Receipt, path: "/invoices", category: "Operations" },
  { id: "certificates", label: "Certificates", icon: Award, path: "/certificates", category: "Operations" },
  { id: "audit-log", label: "Audit Log", icon: History, path: "/audit-log", category: "Compliance" },
  { id: "email-activities", label: "Email Activities", icon: Mail, path: "/email-activities", category: "Operations" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/tasks", category: "Core" },
  { id: "teachers", label: "Teachers", icon: Users, path: "/teachers", category: "Teachers" },
  { id: "intelligence", label: "Teacher Intelligence", icon: Brain, path: "/teachers/intelligence", category: "Intelligence" },
  { id: "courses", label: "Courses", icon: Book, path: "/courses", category: "Core" },
  { id: "reports", label: "Reports", icon: PieChart, path: "/reports", category: "Intelligence" },
  { id: "health", label: "System Health", icon: HeartPulse, path: "/system-health", category: "System" },
  { id: "persona", label: "Teacher Persona", icon: UserCircle, path: "/teacher-persona", category: "Teachers" },
  { id: "ai-pm", label: "AI PM", icon: Sparkles, path: "/ai-pm", category: "Intelligence" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings", category: "System" },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-700 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-white flex flex-col shadow-2xl z-30 relative"
      >
        <div className="p-6 h-20 flex items-center justify-between border-b border-white/5">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-xl font-black tracking-tighter flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span>JETLEARN</span>
              </motion.h2>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              {isSidebarOpen && (
                <h3 className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">
                  {category}
                </h3>
              )}
              <div className="space-y-1">
                {menuItems.filter(item => item.category === category).map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                        isActive 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-white/30"}`} />
                      {isSidebarOpen && (
                        <span className="text-xs font-bold tracking-tight">{item.label}</span>
                      )}
                      {isActive && isSidebarOpen && (
                        <motion.div 
                          layoutId="active-pill"
                          className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <Link to="/my-profile" className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20 shrink-0">
                {profile?.username?.substring(0, 2).toUpperCase() || "??"}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate uppercase tracking-wider">{profile?.username || "Loading..."}</p>
                  <p className="text-[10px] text-white/40 truncate font-bold uppercase tracking-widest">{profile?.role || "User"}</p>
                </div>
              )}
            </Link>
            {isSidebarOpen && (
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search learners, teachers, or actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery) {
                  showNotification(`Searching for "${searchQuery}"...`);
                  setSearchQuery("");
                }
              }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => showNotification("No new notifications.")}
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{profile?.username}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{profile?.role}</p>
              </div>
              <Link to="/my-profile" className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-indigo-50 transition-colors">
                <UserCircle className="w-6 h-6 text-slate-400" />
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>

        <footer className="px-8 py-4 bg-white border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span>2026 © JetLearn Operational Intelligence</span>
            <span className="flex items-center gap-1.5"><Rocket className="w-3 h-3 text-indigo-400" /> V1.2.4</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/support" className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition-colors">
              Support <ChevronRight className="w-3 h-3" />
            </Link>
            <Link to="/documentation" className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition-colors">
              Documentation <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </footer>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 right-8 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
            >
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold tracking-tight">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
