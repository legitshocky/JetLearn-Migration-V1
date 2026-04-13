import React, { useState } from "react";
import { 
  Settings as SettingsIcon, Shield, Bell, User, Database, 
  Globe, Key, Mail, ChevronRight, Save, RefreshCw, 
  Lock, Smartphone, CreditCard, Users, History,
  Webhook, FileJson, Layers, MessageSquare, Calendar,
  MoreVertical, Trash2, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Account & Profile", icon: User },
    { id: "integrations", label: "System Integrations", icon: Database },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "organization", label: "Organization", icon: Globe },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your workspace and manage system integrations.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
            >
              {activeTab === "account" && <AccountSettings />}
              {activeTab === "integrations" && <IntegrationSettings />}
              {activeTab === "notifications" && <NotificationSettings />}
              {activeTab === "organization" && <OrganizationSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="divide-y divide-slate-100">
      <div className="p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input type="text" defaultValue="Sourav Pal" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input type="email" defaultValue="sourav.pal@jet-learn.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Two-Factor Authentication</div>
                <div className="text-xs text-slate-500">Add an extra layer of security to your account.</div>
              </div>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:underline">Enable</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Active Sessions</div>
                <div className="text-xs text-slate-500">Manage your logged in devices.</div>
              </div>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationSettings() {
  const [sheetsHealth, setSheetsHealth] = useState<any[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);

  const fetchSheetsHealth = async () => {
    setLoadingSheets(true);
    try {
      const response = await axios.get("/api/system/health/sheets");
      setSheetsHealth(response.data);
    } catch (error) {
      console.error("Failed to fetch sheets health", error);
    } finally {
      setLoadingSheets(false);
    }
  };

  React.useEffect(() => {
    fetchSheetsHealth();
  }, []);

  return (
    <div className="divide-y divide-slate-100">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">CRM & Messaging</h3>
          <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Test Connections
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "HubSpot CRM", icon: Database, status: "Connected", color: "emerald", detail: "Portal: 7729491" },
            { name: "WATI WhatsApp", icon: MessageSquare, status: "Connected", color: "emerald", detail: "Official API" },
            { name: "Google Calendar", icon: Calendar, status: "Connected", color: "emerald", detail: "Class Schedule" },
            { name: "ExchangeRate API", icon: RefreshCw, status: "Disconnected", color: "rose", detail: "Invalid Key" },
          ].map((item) => (
            <div key={item.name} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{item.detail}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.status}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>API Health</span>
                  <span className={item.status === 'Connected' ? 'text-emerald-600' : 'text-rose-600'}>
                    {item.status === 'Connected' ? '99.9%' : '0%'}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.status === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: item.status === 'Connected' ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Google Sheets Connectivity</h3>
          <button 
            onClick={fetchSheetsHealth}
            disabled={loadingSheets}
            className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSheets ? 'animate-spin' : ''}`} /> Refresh Status
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {sheetsHealth.length > 0 ? (
            sheetsHealth.map((sheet) => (
              <div key={sheet.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{sheet.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">ID: {sheet.id} • {sheet.rows} rows found</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sheet.error && (
                    <span className="text-[10px] text-rose-500 font-medium max-w-[200px] truncate">{sheet.error}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${sheet.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {sheet.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              {loadingSheets ? "Checking connections..." : "No sheets configured or error fetching status."}
            </div>
          )}
        </div>
      </div>

      <div className="p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Developer Tools</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-widest">API Key</span>
              </div>
              <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Regenerate</button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-indigo-200 break-all">
              sk_live_51MzS...29491
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="p-8 space-y-8">
      <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
      <div className="space-y-6">
        {[
          { title: "Migration Alerts", desc: "Get notified when a migration is triggered or completed.", email: true, whatsapp: true },
          { title: "System Health", desc: "Alerts for API failures or synchronization issues.", email: true, whatsapp: false },
          { title: "Audit Reports", desc: "Weekly summary of onboarding and course audits.", email: true, whatsapp: false },
          { title: "Security Alerts", desc: "Notifications for new logins or password changes.", email: true, whatsapp: true },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">{item.title}</div>
              <div className="text-xs text-slate-500 max-w-md">{item.desc}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-4 rounded-full relative transition-all cursor-pointer ${item.email ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.email ? 'left-4.5' : 'left-0.5'}`} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-4 rounded-full relative transition-all cursor-pointer ${item.whatsapp ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.whatsapp ? 'left-4.5' : 'left-0.5'}`} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganizationSettings() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const isAdmin = profile?.role === "Admin" || profile?.role === "Super Admin";

  return (
    <div className="divide-y divide-slate-100">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
            <p className="text-xs text-slate-500">Manage user roles and system access permissions.</p>
          </div>
          {isAdmin && (
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Invite Member
            </button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-500 font-medium">Loading team members...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold">
                    {member.username?.charAt(0) || member.email?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{member.username}</div>
                    <div className="text-xs text-slate-500">{member.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <select
                      value={member.role}
                      disabled={updatingId === member.id}
                      onChange={(e) => updateRole(member.id, e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                      <option value="Guest">Guest</option>
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {member.role}
                    </span>
                  )}
                  {updatingId === member.id && (
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              No users found in the system.
            </div>
          )}
        </div>
      </div>

      <div className="p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">System Logs</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Audit Logs</div>
                <div className="text-xs text-slate-500">View all administrative actions and system changes.</div>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-400">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
